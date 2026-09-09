'use client'

import { useConfig } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/utilities/useDebounce'

type SearchResult = {
  id: string | number
  title: string
  slug?: string
  docCollection: string
  docId: string | number
}

const COLLECTION_LABELS: Record<string, string> = {
  rooms: 'Room',
  properties: 'Property',
  pages: 'Page',
  offers: 'Offer',
  media: 'Media',
  posts: 'Post',
  'faq-categories': 'FAQ Category',
  'room-groups': 'Room Group',
  inquiries: 'Inquiry',
}

const GlobalSearchNav: React.FC = () => {
  const { config } = useConfig()
  const router = useRouter()
  const [value, setValue] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedValue = useDebounce(value, 250)

  useEffect(() => {
    if (!debouncedValue) {
      setResults([])
      setOpen(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const params = new URLSearchParams()
    params.set('where[or][0][title][like]', debouncedValue)
    params.set('where[or][1][searchText][like]', debouncedValue)
    params.set('depth', '0')
    params.set('limit', '15')

    fetch(`${config.routes.api}/search-index?${params.toString()}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setResults(data?.docs ?? [])
        setOpen(true)
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedValue, config.routes.api])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, doc) => {
    const key = doc.docCollection ?? 'other'
    acc[key] = acc[key] ?? []
    acc[key].push(doc)
    return acc
  }, {})

  function goToResult(doc: SearchResult) {
    setOpen(false)
    setValue('')
    router.push(`${config.routes.admin}/collections/${doc.docCollection}/${doc.docId}`)
  }

  return (
    <div
      className="nav-group"
      id="nav-group-global-search"
      ref={containerRef}
      style={{ position: 'relative' }}
    >
      <div className="nav-group__content" style={{ padding: '0 8px 8px' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search everything…"
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            fontSize: 13,
          }}
        />
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 8,
            right: 8,
            zIndex: 10,
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            maxHeight: 320,
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {loading && <div style={{ padding: 8, fontSize: 12 }}>Searching…</div>}
          {!loading && results.length === 0 && (
            <div style={{ padding: 8, fontSize: 12 }}>No results</div>
          )}
          {!loading &&
            Object.entries(grouped).map(([relationTo, docs]) => (
              <div key={relationTo}>
                <div
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    opacity: 0.6,
                  }}
                >
                  {COLLECTION_LABELS[relationTo] ?? relationTo}
                </div>
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => goToResult(doc)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    <div>{doc.title || '(untitled)'}</div>
                    {doc.slug && <div style={{ fontSize: 11, opacity: 0.6 }}>{doc.slug}</div>}
                  </button>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default GlobalSearchNav
