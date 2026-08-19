import React from 'react'

import { Link } from '@/i18n/navigation'
import { Media } from '@/components/Media'

type Card = {
  image?: Record<string, unknown> | null
  title: string
  excerpt?: string | null
  link?: string | null
}

type Props = {
  intro?: string | null
  cards?: Card[] | null
}

export const CardGridBlock: React.FC<Props> = ({ intro, cards }) => {
  if (!cards?.length) return null

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-10">
      {intro && <p className="text-gray-600 mb-8 text-base leading-relaxed max-w-2xl">{intro}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, i) => {
          const inner = (
            <div className="group flex flex-col h-full">
              {card.image && typeof card.image === 'object' && (
                <div className="relative h-52 mb-4 overflow-hidden rounded">
                  <Media
                    resource={card.image}
                    fill
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <h3 className="text-lg font-bold text-[#012B59] mb-2">{card.title}</h3>
              {card.excerpt && (
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{card.excerpt}</p>
              )}
              {card.link && (
                <span className="inline-block mt-3 text-sm font-semibold text-[#012B59] underline-offset-2 hover:underline">
                  Read more
                </span>
              )}
            </div>
          )

          return card.link ? (
            <Link key={i} href={card.link} className="no-underline text-inherit block">
              {inner}
            </Link>
          ) : (
            <div key={i}>{inner}</div>
          )
        })}
      </div>
    </section>
  )
}
