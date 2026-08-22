export type FolderOption = {
  label: string
  value: string
}

export type MediaDoc = {
  id: string | number
  alt?: string | null
  filename?: string | null
  thumbnailURL?: string | null
  url?: string | null
}

type FolderDoc = {
  id: string | number
  folder?: { id: string | number } | string | number | null
  name: string
}

/**
 * Fetches every folder in the `payload-folders` collection and returns a flat,
 * alphabetically sorted list of options. Each label is a "breadcrumb" path
 * (e.g. "Rooms / Auri Double Balcony") so nested folders remain identifiable
 * in a simple flat picker without needing a full tree UI.
 */
export async function fetchFolderOptions(apiRoute: string): Promise<FolderOption[]> {
  const res = await fetch(`${apiRoute}/payload-folders?limit=1000&depth=0&sort=name`, {
    credentials: 'include',
  })

  if (!res.ok) return []

  const json = (await res.json()) as { docs?: FolderDoc[] }
  const docs = json.docs ?? []
  const byId = new Map(docs.map((doc) => [String(doc.id), doc]))

  const pathFor = (doc: FolderDoc): string => {
    const segments: string[] = [doc.name]
    const seen = new Set<string>([String(doc.id)])
    let current = doc

    while (current.folder) {
      const parentId =
        typeof current.folder === 'object' && current.folder !== null
          ? current.folder.id
          : current.folder
      const parentKey = String(parentId)

      if (!parentId || seen.has(parentKey)) break

      const parent = byId.get(parentKey)
      if (!parent) break

      segments.unshift(parent.name)
      seen.add(parentKey)
      current = parent
    }

    return segments.join(' / ')
  }

  return docs
    .map((doc) => ({ label: pathFor(doc), value: String(doc.id) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Fetches every Media document that lives directly inside a given folder.
 */
export async function fetchFolderMedia(apiRoute: string, folderId: string): Promise<MediaDoc[]> {
  const res = await fetch(
    `${apiRoute}/media?where[folder][equals]=${encodeURIComponent(folderId)}&limit=0&depth=0`,
    { credentials: 'include' },
  )

  if (!res.ok) return []

  const json = (await res.json()) as { docs?: MediaDoc[] }
  return json.docs ?? []
}
