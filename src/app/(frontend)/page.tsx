import { redirect } from 'next/navigation'

// With localePrefix: 'always', there is no page at /
// Redirect to the default locale so the middleware can take over.
export default function RootPage() {
  redirect('/en')
}
