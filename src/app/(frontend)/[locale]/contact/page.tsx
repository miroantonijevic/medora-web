import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'All contacts | Medora Hotels',
  description: 'Contact Medora Hotels — reservations, hotel reception, and campsite reception.',
}

type Department = {
  name: string
  address: string
  tel: string
  telHref: string
  email: string
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'contact' })
  const departments = t.raw('departments') as Department[]

  return (
    <main>
      <div className="bg-[#012B59] text-white text-center py-16 px-6">
        <h1 className="text-4xl font-bold mb-3">{t('title')}</h1>
        <p className="text-lg opacity-80 max-w-xl mx-auto">{t('subtitle')}</p>
      </div>

      <section className="max-w-[1100px] mx-auto px-6 py-14 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className="bg-white border border-gray-100 rounded-lg shadow-sm p-7 flex flex-col gap-4"
            >
              <h2 className="text-lg font-bold text-[#012B59] leading-snug">{dept.name}</h2>
              <address className="not-italic text-sm text-gray-500 whitespace-pre-line">
                {dept.address}
              </address>
              <div className="flex flex-col gap-2 text-sm mt-auto">
                <a
                  href={dept.telHref}
                  className="flex items-center gap-2 text-[#012B59] font-semibold hover:text-[#009bdb] transition-colors no-underline"
                >
                  <span className="text-[#009bdb] font-bold">T:</span>
                  {dept.tel}
                </a>
                <a
                  href={`mailto:${dept.email}`}
                  className="flex items-center gap-2 text-[#012B59] font-semibold hover:text-[#009bdb] transition-colors no-underline break-all"
                >
                  <span className="text-[#009bdb] font-bold">E:</span>
                  {dept.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
