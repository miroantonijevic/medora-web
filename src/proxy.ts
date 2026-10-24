import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

// Next 16 calls this file convention "proxy" (it was "middleware"). It must sit next to the `app`
// directory, i.e. in src/; at the project root it is ignored by `next dev`.
export default createMiddleware(routing)

export const config = {
  matcher: ['/', '/(en|hr|de)/:path*', '/((?!api|admin|next|_next|_vercel|.*\\..*).*)'],
}
