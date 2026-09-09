import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { getWidthClassName } from '@/utilities/getBlockLayoutClasses'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText, layoutSettings }) => {
  return (
    <div className={getWidthClassName(layoutSettings?.width, 'container')}>
      <div className="bg-card rounded border-border border p-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="max-w-[48rem] flex items-center">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-8">
          {(links || []).map(({ link }, i) => {
            return (
              <CMSLink
                key={i}
                size="lg"
                {...link}
                className="rounded-full bg-[#012B59] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#009bdb]"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
