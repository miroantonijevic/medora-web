import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getFaqCategories } from '@/lib/queries'

type Args = { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: 'Help Center — Medora Hotels',
  description:
    'Find answers to frequently asked questions about your stay at Medora Hotels & Resorts.',
}

export default async function HelpCenterPage({ params }: Args) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'helpCenter' }),
    getFaqCategories(locale),
  ])

  type Media = { url?: string | null; alt?: string | null }

  return (
    <main>
      {/* Hero */}
      <div className="bg-[#012B59] text-white text-center py-16 px-6">
        <h1 className="text-4xl font-bold mb-3">{t('title')}</h1>
        <p className="text-lg opacity-80 max-w-xl mx-auto">{t('subtitle')}</p>
      </div>

      {/* Category grid */}
      <section className="max-w-[1100px] mx-auto px-6 py-14">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-20">{t('noCategories')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => {
              const img = cat.image as Media | null | undefined
              const itemCount = Array.isArray(cat.items) ? cat.items.length : 0
              return (
                <Link
                  key={cat.slug}
                  href={`/help-center/${cat.slug}`}
                  className="group block bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow no-underline"
                >
                  {img?.url ? (
                    <div className="flex items-center justify-center h-36 bg-gray-50">
                      <img
                        src={img.url}
                        alt={img.alt ?? cat.title ?? ''}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-[#012B59] to-[#009bdb] flex items-center justify-center">
                      <span className="text-white text-4xl">?</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#012B59] mb-1 group-hover:text-[#009bdb] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {itemCount} {itemCount === 1 ? t('question') : t('questions')}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-gray-50 border-t border-gray-100 py-14 text-center px-6">
        <h2 className="text-2xl font-bold text-[#012B59] mb-3">{t('notFound')}</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">{t('notFoundSub')}</p>
        <Link
          href="/contact"
          className="inline-block bg-[#012B59] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#009bdb] transition-colors no-underline"
        >
          {t('contactUs')}
        </Link>
      </section>
    </main>
  )
}
