import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <div className="max-w-[1100px] mx-auto px-6 pt-10 pb-2">
      {children ||
        (richText && (
          <RichText
            data={richText}
            enableGutter={false}
            className="[&_h1]:text-[2.25rem] [&_h1]:md:text-[2.75rem] [&_h1]:font-bold [&_h1]:text-[#012B59] [&_h1]:leading-tight [&_h1]:mb-0"
          />
        ))}
    </div>
  )
}
