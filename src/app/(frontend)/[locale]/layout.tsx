import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Montserrat } from 'next/font/google'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import React from 'react'
import { draftMode } from 'next/headers'
import { routing } from '@/i18n/routing'
import { AdminBar } from '@/components/AdminBar'
import { MedoraHeader } from '@/components/layout/MedoraHeader'
import { MedoraFooter } from '@/components/layout/MedoraFooter'
import { getSiteSettings } from '@/lib/queries'
import { Providers } from '@/providers'
import { cn } from '@/utilities/ui'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import '../globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
  display: 'swap',
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// This is the root layout of the site: <html> lives here, below the [locale] segment, so it can
// declare the page's language. (From a layout above [locale] the locale is not known without
// reading request headers, which would make every page dynamic.)
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'hr' | 'de')) {
    notFound()
  }

  // Required by next-intl v4 to set locale context for getMessages() and nested server components
  setRequestLocale(locale)

  const messages = await getMessages()
  const { isEnabled } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const navData = await payload.findGlobal({
    slug: 'main-nav',
    depth: 0,
    locale: locale as 'en' | 'hr' | 'de',
  })
  const siteSettings = await getSiteSettings().catch(() => null)
  const gaId = siteSettings?.googleAnalyticsId

  return (
    <html
      lang={locale}
      className={cn(montserrat.variable)}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <AdminBar adminBarProps={{ preview: isEnabled }} />
            <MedoraHeader navItems={(navData as any)?.items ?? []} />
            <div style={{ paddingTop: '124px' }}>{children}</div>
            <MedoraFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
