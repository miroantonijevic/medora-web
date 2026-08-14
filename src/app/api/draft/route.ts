import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const secret = searchParams.get('secret')
  const locale = searchParams.get('locale') ?? 'en'

  if (secret !== process.env.PAYLOAD_DRAFT_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  // Append locale as a query param so the page knows which locale to fetch
  const targetUrl = url
    ? `${url}${url.includes('?') ? '&' : '?'}locale=${locale}`
    : '/'

  redirect(targetUrl)
}
