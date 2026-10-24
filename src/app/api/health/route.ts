import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

// Used by the docker-compose healthcheck: ready only once the app can actually reach the database.
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'users' })
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('Health check failed:', err)
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  }
}
