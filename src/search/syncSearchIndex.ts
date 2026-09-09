import type { Payload, PayloadRequest } from 'payload'

type SyncableDoc = { id: string | number } & Record<string, unknown>

function extractLocaleValues(field: unknown): string[] {
  if (!field) return []
  if (typeof field === 'string') return field.length > 0 ? [field] : []
  if (typeof field === 'object') {
    return Object.values(field as Record<string, unknown>).filter(
      (v): v is string => typeof v === 'string' && v.length > 0,
    )
  }
  return []
}

/**
 * Reads every locale variant of a doc's title-ish/slug-ish fields so the index
 * matches searches regardless of which locale the admin is currently viewing.
 */
async function resolveTitleAndSearchText({
  payload,
  req,
  collection,
  id,
}: {
  payload: Payload
  req?: PayloadRequest
  collection: string
  id: string | number
}) {
  const fullDoc = await payload.findByID({
    collection,
    id,
    depth: 0,
    locale: 'all',
    overrideAccess: true,
    req,
  })

  const titleValues = [
    ...extractLocaleValues(fullDoc.title),
    ...extractLocaleValues(fullDoc.name),
    ...extractLocaleValues(fullDoc.alt),
    ...extractLocaleValues(fullDoc.filename),
  ]
  const slugValues = [...extractLocaleValues(fullDoc.slug), ...extractLocaleValues(fullDoc.path)]
  // Media has no slug, and its alt text is often reused across unrelated uploads
  // (same generic caption on many photos) - fall back to the filename, which is
  // always unique, so duplicate-looking titles can still be told apart in the UI.
  const subtitleValues = slugValues.length > 0 ? slugValues : extractLocaleValues(fullDoc.filename)

  const resolvedTitle = titleValues[0] ?? ''
  const resolvedSlug = subtitleValues[0] ?? ''
  const searchText = Array.from(new Set([...titleValues, ...slugValues])).join(' | ')

  return { resolvedTitle, resolvedSlug, searchText }
}

export async function syncSearchIndexForDoc({
  payload,
  req,
  collection,
  doc,
}: {
  payload: Payload
  req?: PayloadRequest
  collection: string
  doc: SyncableDoc
}) {
  const { resolvedTitle, resolvedSlug, searchText } = await resolveTitleAndSearchText({
    payload,
    req,
    collection,
    id: doc.id,
  })

  if (!resolvedTitle) return

  const existing = await payload.find({
    collection: 'search-index',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ docCollection: { equals: collection } }, { docId: { equals: String(doc.id) } }],
    },
    req,
  })

  const data = {
    title: resolvedTitle,
    slug: resolvedSlug,
    searchText,
    docCollection: collection,
    docId: String(doc.id),
  }

  const [found] = existing.docs

  if (found) {
    await payload.update({
      collection: 'search-index',
      id: found.id,
      data,
      depth: 0,
      overrideAccess: true,
      req,
    })
  } else {
    await payload.create({
      collection: 'search-index',
      data,
      depth: 0,
      overrideAccess: true,
      req,
    })
  }
}

export async function removeSearchIndexForDoc({
  payload,
  req,
  collection,
  id,
}: {
  payload: Payload
  req?: PayloadRequest
  collection: string
  id: string | number
}) {
  await payload.delete({
    collection: 'search-index',
    where: {
      and: [{ docCollection: { equals: collection } }, { docId: { equals: String(id) } }],
    },
    overrideAccess: true,
    req,
  })
}
