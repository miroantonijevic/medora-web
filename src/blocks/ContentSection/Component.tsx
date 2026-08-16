import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type Props = {
  heading?: string | null
  body?: Parameters<typeof RichText>[0]['data']
  image?: Record<string, unknown> | null
  imagePosition?: 'right' | 'below' | null
  ctaLink?: string | null
}

export const ContentSectionBlock: React.FC<Props> = ({
  heading,
  body,
  image,
  imagePosition = 'right',
  ctaLink,
}) => {
  const hasImage = image && typeof image === 'object'
  const isRight = hasImage && imagePosition !== 'below'

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-10 border-t border-gray-100 first:border-t-0">
      <div className={`flex gap-12 items-start ${isRight ? 'flex-row' : 'flex-col'}`}>
        <div className="flex-1 min-w-0">
          {heading && <h2 className="text-[22px] font-bold text-[#012B59] mb-4">{heading}</h2>}
          {body && (
            <RichText data={body} className="text-gray-600 leading-relaxed prose max-w-none" />
          )}
          {ctaLink && (
            <a
              href={ctaLink}
              className="inline-block mt-4 px-6 py-2 bg-[#012B59] text-white text-sm font-semibold rounded-full no-underline hover:bg-[#009bdb] transition-colors"
            >
              Read more
            </a>
          )}
        </div>
        {isRight && (
          <div className="flex-[0_0_42%] max-w-[480px]">
            <Media resource={image} imgClassName="rounded object-cover w-full" />
          </div>
        )}
      </div>
      {hasImage && !isRight && (
        <div className="mt-6">
          <Media resource={image} imgClassName="rounded object-cover w-full" />
        </div>
      )}
    </section>
  )
}
