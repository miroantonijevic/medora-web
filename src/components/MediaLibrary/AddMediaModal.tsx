'use client'

import React, { useEffect, useState } from 'react'

import { searchMedia, type MediaItem } from './api'

const baseClass = 'media-library-add-modal'

type Props = {
  apiRoute: string
  currentFolderId: number | null
  onClose: () => void
  onConfirm: (mediaIds: number[]) => void
}

export const AddMediaModal: React.FC<Props> = ({
  apiRoute,
  currentFolderId,
  onClose,
  onConfirm,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    searchMedia(apiRoute, query)
      .then((docs) => {
        if (!cancelled) setResults(docs)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [apiRoute, query])

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={`${baseClass}__overlay`} onClick={onClose}>
      <div className={baseClass} onClick={(e) => e.stopPropagation()}>
        <div className={`${baseClass}__header`}>
          <h3>Add existing media</h3>
          <button onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <input
          autoFocus
          className={`${baseClass}__search`}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename…"
          value={query}
        />

        <div className={`${baseClass}__results`}>
          {loading && <p className={`${baseClass}__hint`}>Searching…</p>}
          {!loading && results.length === 0 && (
            <p className={`${baseClass}__hint`}>No media found.</p>
          )}
          {!loading &&
            results.map((item) => {
              const itemFolderId =
                typeof item.folder === 'object' && item.folder !== null
                  ? item.folder.id
                  : item.folder
              const alreadyHere = itemFolderId === currentFolderId
              const isSelected = selected.has(item.id)
              return (
                <button
                  className={`${baseClass}__result ${isSelected ? `${baseClass}__result--selected` : ''} ${alreadyHere ? `${baseClass}__result--disabled` : ''}`}
                  disabled={alreadyHere}
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  type="button"
                >
                  {item.mimeType?.startsWith('image/') ? (
                    <img alt={item.alt ?? ''} src={item.thumbnailURL ?? item.url ?? ''} />
                  ) : (
                    <div className={`${baseClass}__file-icon`}>📄</div>
                  )}
                  <span>{item.filename}</span>
                  {alreadyHere && <small>Already here</small>}
                </button>
              )
            })}
        </div>

        <div className={`${baseClass}__footer`}>
          <button onClick={onClose} type="button">
            Cancel
          </button>
          <button
            disabled={selected.size === 0}
            onClick={() => onConfirm(Array.from(selected))}
            type="button"
          >
            Add {selected.size > 0 ? selected.size : ''} image{selected.size === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  )
}
