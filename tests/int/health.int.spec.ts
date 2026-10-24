import { afterEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/payload')
    vi.resetModules()
  })

  it('is ok when the database answers', async () => {
    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('reports 503 when the database cannot be reached, so the container is not marked healthy', async () => {
    vi.resetModules()
    vi.doMock('@/lib/payload', () => ({
      getPayloadClient: async () => ({
        count: async () => {
          throw new Error('connection refused')
        },
      }),
    }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { GET: unhealthyGET } = await import('@/app/api/health/route')

    const res = await unhealthyGET()

    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ status: 'unavailable' })
  })
})
