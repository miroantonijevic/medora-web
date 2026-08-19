'use client'

import React, { useState } from 'react'
import RichText from '@/components/RichText'

type Item = {
  question: string
  answer?: unknown
  id?: string | null
}

export function FaqAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between text-left px-6 py-5 bg-white hover:bg-gray-50 transition-colors"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-[#012B59] pr-4">{item.question}</span>
            <span className="text-[#009bdb] text-xl flex-shrink-0 leading-none">
              {open === i ? '−' : '+'}
            </span>
          </button>
          {open === i && item.answer && (
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
              <RichText
                data={item.answer as Parameters<typeof RichText>[0]['data']}
                className="text-gray-600 leading-relaxed prose max-w-none"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
