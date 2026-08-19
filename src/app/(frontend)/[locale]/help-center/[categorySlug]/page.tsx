import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getFaqCategories, getFaqCategoryBySlug } from '@/lib/queries'
import { FaqAccordion } from './FaqAccordion'

type Args = { params: Promise<{ locale: string; categorySlug: string }> }

export async function generateStaticParams() {
  const cats = await getFaqCategories('en')
  return cats.map((c) => ({ categorySlug: c.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale, categorySlug } = await params
  const cat = await getFaqCategoryBySlug(categorySlug, locale)
  return {
    title: cat ? `${cat.title} — Help Center — Medora Hotels` : 'Help Center — Medora Hotels',
  }
}

export default async function FaqCategoryPage({ params }: Args) {
  const { locale, categorySlug } = await params
  setRequestLocale(locale)

  const [t, cat, allCats] = await Promise.all([
    getTranslations({ locale, namespace: 'helpCenter' }),
    getFaqCategoryBySlug(categorySlug, locale),
    getFaqCategories(locale),
  ])

  if (!cat) notFound()

  type Media = { url?: string | null; alt?: string | null }
  const heroImg = cat.image as Media | null | undefined

  return (
    <main>
      {/* Hero */}
      <div className="relative bg-[#012B59] text-white overflow-hidden" style={{ minHeight: 240 }}>
        {heroImg?.url && (
          <Image
            src={heroImg.url}
            alt={heroImg.alt ?? cat.title ?? ''}
            fill
            className="object-cover opacity-40"
          />
        )}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16">
          <nav className="text-sm opacity-70 mb-4 flex gap-2 flex-wrap justify-center">
            <Link href="/" className="text-white/70 hover:text-white no-underline">
              Home
            </Link>
            <span>/</span>
            <Link href="/help-center" className="text-white/70 hover:text-white no-underline">
              {t('title')}
            </Link>
            <span>/</span>
            <span className="text-white">{cat.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold">{cat.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        {/* Sidebar: other categories */}
        <aside className="lg:w-64 flex-shrink-0">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {t('allTopics')}
          </h3>
          <nav className="flex flex-col gap-1">
            {allCats.map((c) => (
              <Link
                key={c.slug}
                href={`/help-center/${c.slug}`}
                className={`block px-4 py-2 rounded text-sm font-medium no-underline transition-colors ${
                  c.slug === categorySlug
                    ? 'bg-[#012B59] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {c.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Accordion */}
        <div className="flex-1 min-w-0">
          {Array.isArray(cat.items) && cat.items.length > 0 ? (
            <FaqAccordion items={cat.items as { question: string; answer?: unknown }[]} />
          ) : (
            <p className="text-gray-500 py-8">{t('noQuestions')}</p>
          )}

          {/* Contact CTA */}
          <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <p className="text-gray-600 mb-4">{t('notFoundSub')}</p>
            <Link
              href="/contact"
              className="inline-block bg-[#012B59] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#009bdb] transition-colors no-underline text-sm"
            >
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
