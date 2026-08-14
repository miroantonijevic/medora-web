import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'
import { draftMode } from 'next/headers'
import { routing } from '@/i18n/routing'
import { AdminBar } from '@/components/AdminBar'
import { MedoraHeader } from '@/components/layout/MedoraHeader'
import { MedoraFooter } from '@/components/layout/MedoraFooter'
import { Providers } from '@/providers'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'hr' | 'de')) {
    notFound()
  }

  // Required by next-intl v4 to set locale context for getMessages() and nested server components
  setRequestLocale(locale)

  const messages = await getMessages()
  const { isEnabled } = await draftMode()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        <AdminBar adminBarProps={{ preview: isEnabled }} />
        <MedoraHeader />
        <div style={{ paddingTop: '72px' }}>{children}</div>
        <MedoraFooter />
      </Providers>
    </NextIntlClientProvider>
  )
}
