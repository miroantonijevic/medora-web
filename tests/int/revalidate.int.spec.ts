import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
const revalidateTag = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

const { POST } = await import('@/app/(frontend)/next/revalidate/route')
const { revalidateCollectionHook, revalidateGlobalHook } =
  await import('@/hooks/revalidateCollection')

const call = (body: unknown, secret: string | null = 'right-secret') =>
  POST(
    new NextRequest('http://localhost/next/revalidate', {
      method: 'POST',
      headers: secret ? { 'x-revalidate-secret': secret } : {},
      body: JSON.stringify(body),
    }),
  )

describe('POST /next/revalidate', () => {
  beforeEach(() => {
    vi.stubEnv('REVALIDATE_SECRET', 'right-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    revalidatePath.mockReset()
    revalidateTag.mockReset()
  })

  it('rejects a wrong or missing secret without touching the cache', async () => {
    expect((await call({ collection: 'offers' }, 'wrong')).status).toBe(401)
    expect((await call({ collection: 'offers' }, null)).status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('drops every cached page, because the pages are not tagged', async () => {
    const res = await call({ collection: 'offers', id: 7 })

    expect(res.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(revalidateTag).toHaveBeenCalledWith('offers', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('offers-7', { expire: 0 })
  })

  it('does nothing and answers 400 when there is nothing to revalidate', async () => {
    const res = await call({})

    expect(res.status).toBe(400)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('revalidate hooks', () => {
  const fetchMock = vi.fn(async () => new Response('{}'))

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    fetchMock.mockClear()
  })

  it('a collection save posts the collection and id with the secret', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'right-secret')

    const doc = { id: 3 }
    const result = await revalidateCollectionHook('rooms')({ doc } as never)

    expect(result).toBe(doc)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/next/revalidate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-revalidate-secret': 'right-secret' }),
        body: JSON.stringify({ collection: 'rooms', id: 3 }),
      }),
    )
  })

  it('a global save posts only the global slug', async () => {
    vi.stubEnv('REVALIDATE_SECRET', 'right-secret')

    await revalidateGlobalHook('main-nav')({ doc: { id: 1 } } as never)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/next/revalidate',
      expect.objectContaining({ body: JSON.stringify({ collection: 'main-nav' }) }),
    )
  })

  it('does nothing without a secret, and never breaks the save when the request fails', async () => {
    vi.stubEnv('REVALIDATE_SECRET', '')
    await revalidateCollectionHook('rooms')({ doc: { id: 1 } } as never)
    expect(fetchMock).not.toHaveBeenCalled()

    vi.stubEnv('REVALIDATE_SECRET', 'right-secret')
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    await expect(revalidateCollectionHook('rooms')({ doc: { id: 1 } } as never)).resolves.toEqual({
      id: 1,
    })
  })
})
