import type { Payload } from 'payload'

/**
 * One-off, idempotent script that organizes existing flat Media docs into
 * `payload-folders` based on the galleries/relationships that already exist
 * in the DB (Offers.gallery, Rooms.images, Properties.heroImages, PhotoGallery
 * block instances on Pages), plus catch-all buckets for anything left over.
 *
 * Safe to re-run: media that's already assigned to a folder (by a previous
 * run of this script, or manually by an admin) is never reassigned.
 */

type MediaFolderMap = Map<number, number | null>

type Relationship = {
  mediaId: number
  pathSegments: string[]
  source: string
}

type OrganizeSummary = {
  assigned: number
  skippedAlreadyOrganized: number
  ambiguous: Array<{
    mediaId: number
    filename: string | null
    assignedTo: string
    alsoReferencedBy: string[]
  }>
  catchAll: Record<string, number>
}

const FOLDERS_COLLECTION = 'payload-folders'
const MEDIA_FOLDER_TYPE = ['media'] as const

async function findOrCreateFolder(
  payload: Payload,
  name: string,
  parentId: number | null,
  cache: Map<string, number>,
  cacheKey: string,
): Promise<number> {
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const where = parentId
    ? { name: { equals: name }, folder: { equals: parentId } }
    : { name: { equals: name }, folder: { exists: false } }

  const existing = await payload.find({
    collection: FOLDERS_COLLECTION,
    where,
    limit: 1,
    depth: 0,
  })

  const id =
    existing.docs.length > 0
      ? (existing.docs[0].id as number)
      : ((
          await payload.create({
            collection: FOLDERS_COLLECTION,
            data: { name, folder: parentId, folderType: [...MEDIA_FOLDER_TYPE] },
            depth: 0,
          })
        ).id as number)

  cache.set(cacheKey, id)
  return id
}

async function getOrCreateFolderPath(
  payload: Payload,
  segments: string[],
  cache: Map<string, number>,
): Promise<number> {
  let parentId: number | null = null
  let cacheKey = ''
  for (const segment of segments) {
    cacheKey = cacheKey ? `${cacheKey}/${segment}` : segment
    parentId = await findOrCreateFolder(payload, segment, parentId, cache, cacheKey)
  }
  if (parentId === null) {
    throw new Error('getOrCreateFolderPath called with no segments')
  }
  return parentId
}

function sanitizeSegment(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

export async function organizeMediaFolders({
  payload,
}: {
  payload: Payload
}): Promise<OrganizeSummary> {
  payload.logger.info('Organizing media into folders...')

  const folderCache = new Map<string, number>()
  const summary: OrganizeSummary = {
    assigned: 0,
    skippedAlreadyOrganized: 0,
    ambiguous: [],
    catchAll: {},
  }

  // ── 1. Snapshot current media state (id, existing folder, filename, mimeType) ──

  const allMedia = await payload.find({
    collection: 'media',
    limit: 0,
    depth: 0,
    locale: 'en',
  })

  const currentFolder: MediaFolderMap = new Map(
    allMedia.docs.map((doc) => [
      doc.id as number,
      typeof doc.folder === 'number' ? doc.folder : null,
    ]),
  )
  const mediaFilename = new Map<number, string | null>(
    allMedia.docs.map((doc) => [doc.id as number, (doc.filename as string | undefined) ?? null]),
  )
  const mediaMimeType = new Map<number, string | null>(
    allMedia.docs.map((doc) => [doc.id as number, (doc.mimeType as string | undefined) ?? null]),
  )

  // ── 2. Collect relationships in priority order (first match wins for shared media) ──

  const relationships: Relationship[] = []

  payload.logger.info('  — Scanning Offers.gallery...')
  const offers = await payload.find({
    collection: 'offers',
    limit: 0,
    depth: 0,
    locale: 'en',
    draft: true,
  })
  for (const offer of offers.docs) {
    const title = sanitizeSegment(offer.title as string, `Offer ${offer.id}`)
    for (const row of offer.gallery ?? []) {
      const mediaId = typeof row.image === 'number' ? row.image : (row.image as { id: number })?.id
      if (typeof mediaId === 'number') {
        relationships.push({
          mediaId,
          pathSegments: ['Offers', title],
          source: `Offer: ${title}`,
        })
      }
    }
  }

  payload.logger.info('  — Scanning Rooms.images...')
  const rooms = await payload.find({
    collection: 'rooms',
    limit: 0,
    depth: 0,
    locale: 'en',
    draft: true,
  })
  for (const room of rooms.docs) {
    const name = sanitizeSegment(room.name as string, `Room ${room.id}`)
    for (const image of room.images ?? []) {
      const mediaId = typeof image === 'number' ? image : (image as { id: number })?.id
      if (typeof mediaId === 'number') {
        relationships.push({
          mediaId,
          pathSegments: ['Rooms', name],
          source: `Room: ${name}`,
        })
      }
    }
  }

  payload.logger.info('  — Scanning Properties.heroImages...')
  const properties = await payload.find({
    collection: 'properties',
    limit: 0,
    depth: 0,
    locale: 'en',
  })
  for (const property of properties.docs) {
    const name = sanitizeSegment(property.name as string, `Property ${property.id}`)
    for (const image of property.heroImages ?? []) {
      const mediaId = typeof image === 'number' ? image : (image as { id: number })?.id
      if (typeof mediaId === 'number') {
        relationships.push({
          mediaId,
          pathSegments: ['Properties', name],
          source: `Property: ${name}`,
        })
      }
    }
  }

  payload.logger.info('  — Scanning Pages.layout photo-gallery blocks...')
  const pages = await payload.find({
    collection: 'pages',
    limit: 0,
    depth: 0,
    locale: 'en',
    draft: true,
  })
  for (const page of pages.docs) {
    const pageTitle = sanitizeSegment(page.title as string, `Page ${page.id}`)
    const layout = (page.layout ?? []) as Array<{
      blockType: string
      blockName?: string | null
      images?: Array<{ image: number | { id: number } }>
    }>
    let galleryIndex = 0
    for (const block of layout) {
      if (block.blockType !== 'photo-gallery') continue
      galleryIndex += 1
      const galleryLabel = sanitizeSegment(block.blockName, `Gallery ${galleryIndex}`)
      for (const row of block.images ?? []) {
        const mediaId =
          typeof row.image === 'number' ? row.image : (row.image as { id: number })?.id
        if (typeof mediaId === 'number') {
          relationships.push({
            mediaId,
            pathSegments: ['Photo Galleries', pageTitle, galleryLabel],
            source: `Page: ${pageTitle} / ${galleryLabel}`,
          })
        }
      }
    }
  }

  // ── 3. Apply relationships: first match wins, never move already-organized media ──

  const claimedThisRun = new Map<number, string>()

  for (const rel of relationships) {
    const alreadyClaimedSource = claimedThisRun.get(rel.mediaId)
    if (alreadyClaimedSource) {
      if (alreadyClaimedSource !== rel.source) {
        const existingAmbiguous = summary.ambiguous.find((a) => a.mediaId === rel.mediaId)
        if (existingAmbiguous) {
          existingAmbiguous.alsoReferencedBy.push(rel.source)
        } else {
          summary.ambiguous.push({
            mediaId: rel.mediaId,
            filename: mediaFilename.get(rel.mediaId) ?? null,
            assignedTo: alreadyClaimedSource,
            alsoReferencedBy: [rel.source],
          })
        }
      }
      continue
    }

    if (currentFolder.get(rel.mediaId)) {
      // Already organized (by a previous run or manually) — respect it, don't move it.
      summary.skippedAlreadyOrganized += 1
      claimedThisRun.set(rel.mediaId, rel.source)
      continue
    }

    const folderId = await getOrCreateFolderPath(payload, rel.pathSegments, folderCache)
    await payload.update({
      collection: 'media',
      id: rel.mediaId,
      data: { folder: folderId },
      depth: 0,
    })
    currentFolder.set(rel.mediaId, folderId)
    claimedThisRun.set(rel.mediaId, rel.source)
    summary.assigned += 1
  }

  // ── 4. Catch-all buckets for anything still unassigned ──

  payload.logger.info('  — Bucketing remaining unreferenced media...')
  for (const doc of allMedia.docs) {
    const mediaId = doc.id as number
    if (currentFolder.get(mediaId)) continue // already organized above (or pre-existing)

    const filename = (mediaFilename.get(mediaId) ?? '').toLowerCase()
    const mimeType = mediaMimeType.get(mediaId) ?? ''

    let bucket: string
    if (mimeType === 'application/pdf') {
      bucket = 'Documents'
    } else if (mimeType.startsWith('image/') && filename.includes('hero')) {
      bucket = 'Hero Images'
    } else if (mimeType.startsWith('image/') && filename.includes('icon')) {
      bucket = 'Icons'
    } else {
      bucket = 'Uncategorized'
    }

    const folderId = await getOrCreateFolderPath(payload, [bucket], folderCache)
    await payload.update({
      collection: 'media',
      id: mediaId,
      data: { folder: folderId },
      depth: 0,
    })
    currentFolder.set(mediaId, folderId)
    summary.catchAll[bucket] = (summary.catchAll[bucket] ?? 0) + 1
  }

  payload.logger.info(
    `Done. Assigned: ${summary.assigned}, already organized: ${summary.skippedAlreadyOrganized}, ` +
      `ambiguous: ${summary.ambiguous.length}, catch-all: ${JSON.stringify(summary.catchAll)}`,
  )

  return summary
}
