'use client'

import React, { useEffect, useState } from 'react'

import { countMediaInFolder } from './api'
import type { TreeNode } from './FolderTree'

const baseClass = 'media-library-subfolders'

type Props = {
  apiRoute: string
  folders: TreeNode[]
  onSelect: (id: number) => void
}

export const SubfolderTiles: React.FC<Props> = ({ apiRoute, folders, onSelect }) => {
  const [counts, setCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    let cancelled = false
    Promise.all(folders.map((f) => countMediaInFolder(apiRoute, f.id))).then((results) => {
      if (cancelled) return
      const next: Record<number, number> = {}
      folders.forEach((f, i) => {
        next[f.id] = results[i]
      })
      setCounts(next)
    })
    return () => {
      cancelled = true
    }
  }, [apiRoute, folders])

  if (folders.length === 0) return null

  return (
    <div className={baseClass}>
      {folders.map((folder) => (
        <button
          className={`${baseClass}__tile`}
          key={folder.id}
          onClick={() => onSelect(folder.id)}
          type="button"
        >
          <span className={`${baseClass}__icon`}>📁</span>
          <span className={`${baseClass}__name`}>{folder.name}</span>
          <span className={`${baseClass}__count`}>{counts[folder.id] ?? '…'} items</span>
        </button>
      ))}
    </div>
  )
}
