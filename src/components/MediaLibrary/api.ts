export type FolderDoc = {
  id: number
  name: string
  folder?: { id: number } | number | null
}

export type MediaItem = {
  id: number
  alt?: string | null
  filename?: string | null
  thumbnailURL?: string | null
  url?: string | null
  mimeType?: string | null
  folder?: { id: number } | number | null
}

export type MediaPage = {
  docs: MediaItem[]
  hasNextPage: boolean
  totalDocs: number
}

const json = async <T>(res: Response): Promise<T | null> =>
  res.ok ? ((await res.json()) as T) : null

export async function fetchAllFolders(apiRoute: string): Promise<FolderDoc[]> {
  const res = await fetch(`${apiRoute}/payload-folders?limit=0&depth=0&sort=name`, {
    credentials: 'include',
  })
  const data = await json<{ docs?: FolderDoc[] }>(res)
  return data?.docs ?? []
}

export async function fetchMediaInFolder(
  apiRoute: string,
  folderId: number | null,
  page = 1,
): Promise<MediaPage> {
  const params = new URLSearchParams()
  if (folderId === null) {
    params.set('where[folder][exists]', 'false')
  } else {
    params.set('where[folder][equals]', String(folderId))
  }
  params.set('limit', '60')
  params.set('depth', '0')
  params.set('sort', '-createdAt')
  params.set('page', String(page))

  const res = await fetch(`${apiRoute}/media?${params.toString()}`, { credentials: 'include' })
  const data = await json<{ docs?: MediaItem[]; hasNextPage?: boolean; totalDocs?: number }>(res)
  return {
    docs: data?.docs ?? [],
    hasNextPage: Boolean(data?.hasNextPage),
    totalDocs: data?.totalDocs ?? 0,
  }
}

export async function fetchAllMedia(apiRoute: string, page = 1): Promise<MediaPage> {
  const params = new URLSearchParams()
  params.set('limit', '60')
  params.set('depth', '0')
  params.set('sort', '-createdAt')
  params.set('page', String(page))

  const res = await fetch(`${apiRoute}/media?${params.toString()}`, { credentials: 'include' })
  const data = await json<{ docs?: MediaItem[]; hasNextPage?: boolean; totalDocs?: number }>(res)
  return {
    docs: data?.docs ?? [],
    hasNextPage: Boolean(data?.hasNextPage),
    totalDocs: data?.totalDocs ?? 0,
  }
}

export async function countMediaInFolder(apiRoute: string, folderId: number): Promise<number> {
  const params = new URLSearchParams()
  params.set('where[folder][equals]', String(folderId))
  params.set('limit', '1')
  params.set('depth', '0')
  const res = await fetch(`${apiRoute}/media?${params.toString()}`, { credentials: 'include' })
  const data = await json<{ totalDocs?: number }>(res)
  return data?.totalDocs ?? 0
}

export async function searchMedia(apiRoute: string, query: string): Promise<MediaItem[]> {
  const params = new URLSearchParams()
  if (query.trim()) params.set('where[filename][like]', query.trim())
  params.set('limit', '40')
  params.set('depth', '0')
  params.set('sort', '-createdAt')
  const res = await fetch(`${apiRoute}/media?${params.toString()}`, { credentials: 'include' })
  const data = await json<{ docs?: MediaItem[] }>(res)
  return data?.docs ?? []
}

export async function createFolder(
  apiRoute: string,
  name: string,
  parentId: number | null,
): Promise<FolderDoc | null> {
  const res = await fetch(`${apiRoute}/payload-folders`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, folder: parentId, folderType: ['media'] }),
  })
  const data = await json<{ doc?: FolderDoc }>(res)
  return data?.doc ?? null
}

export async function renameFolder(apiRoute: string, id: number, name: string): Promise<boolean> {
  const res = await fetch(`${apiRoute}/payload-folders/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  return res.ok
}

export async function moveFolder(
  apiRoute: string,
  id: number,
  parentId: number | null,
): Promise<boolean> {
  const res = await fetch(`${apiRoute}/payload-folders/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: parentId }),
  })
  return res.ok
}

export async function deleteFolder(apiRoute: string, id: number): Promise<boolean> {
  const res = await fetch(`${apiRoute}/payload-folders/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return res.ok
}

export async function assignMediaFolder(
  apiRoute: string,
  mediaId: number,
  folderId: number | null,
): Promise<boolean> {
  const res = await fetch(`${apiRoute}/media/${mediaId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: folderId }),
  })
  return res.ok
}

export async function uploadMediaToFolder(
  apiRoute: string,
  file: File,
  folderId: number | null,
): Promise<MediaItem | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append(
    '_payload',
    JSON.stringify({ folder: folderId, alt: file.name.replace(/\.[^.]+$/, '') }),
  )
  const res = await fetch(`${apiRoute}/media`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const data = await json<{ doc?: MediaItem }>(res)
  return data?.doc ?? null
}
