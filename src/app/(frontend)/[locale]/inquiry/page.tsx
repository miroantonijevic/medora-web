import type { Metadata } from 'next'
import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { InquiryForm } from '@/components/sections/InquiryForm'

export const metadata: Metadata = {
  title: 'Quick Inquiry | Medora Hotels',
}

export default async function InquiryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    // Suspense required for useSearchParams() inside InquiryForm
    <Suspense>
      <InquiryForm />
    </Suspense>
  )
}