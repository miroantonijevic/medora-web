'use client'

import { Upload } from 'lucide-react'
import React, { useRef, useState } from 'react'

import type { MediaItem } from './api'
import type { TreeNode } from './FolderTree'
import { SubfolderTiles } from './SubfolderTiles'

const baseClass = 'media-library-grid'

export type Breadcrumb = { id: 'all' | 'unfiled' | number; label: string }

type Props = {
  media: MediaItem[]
  loading: boolean
  hasNextPage: boolean
  totalDocs: number
  folderLabel: string
  canAdd: boolean
  canRemove: boolean
  canUpload: boolean
  onLoadMore: () => void
  onRemove: (mediaId: number) => void
  onUpload: (files: FileList) => void
  onOpenAddModal: () => void
  uploading: boolean
  apiRoute: string
  breadcrumbs: Breadcrumb[]
  onBreadcrumbClick: (id: 'all' | 'unfiled' | number) => void
  subfolders: TreeNode[]
  onSelectSubfolder: (id: number) => void
}

export const MediaGrid: React.FC<Props> = ({
  media,
  loading,
  hasNextPage,
  totalDocs,
  folderLabel,
  canAdd,
  canRemove,
  canUpload,
  onLoadMore,
  onRemove,
  onUpload,
  onOpenAddModal,
  uploading,
  apiRoute,
  breadcrumbs,
  onBreadcrumbClick,
  subfolders,
  onSelectSubfolder,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      className={`${baseClass} ${dragOver ? `${baseClass}--drag-over` : ''}`}
      onDragLeave={() => setDragOver(false)}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          setDragOver(true)
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files?.length) onUpload(e.dataTransfer.files)
      }}
    >
      {breadcrumbs.length > 1 && (
        <div className={`${baseClass}__breadcrumbs`}>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id}>
              {i > 0 && <span className={`${baseClass}__breadcrumb-sep`}>/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span className={`${baseClass}__breadcrumb-current`}>{crumb.label}</span>
              ) : (
                <button
                  className={`${baseClass}__breadcrumb-link`}
                  onClick={() => onBreadcrumbClick(crumb.id)}
                  type="button"
                >
                  {crumb.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className={`${baseClass}__header`}>
        <h2 className={`${baseClass}__title`}>
          {folderLabel} <span className={`${baseClass}__count`}>({totalDocs})</span>
        </h2>
        <div className={`${baseClass}__toolbar`}>
          {canAdd && (
            <button className={`${baseClass}__btn`} onClick={onOpenAddModal} type="button">
              + Add existing media
            </button>
          )}
          {canUpload && (
            <>
              <button
                className={`${baseClass}__btn ${baseClass}__btn--primary`}
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload size={16} />
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <input
                hidden
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) onUpload(e.target.files)
                  e.target.value = ''
                }}
                ref={fileInputRef}
                type="file"
              />
            </>
          )}
        </div>
      </div>

      <SubfolderTiles apiRoute={apiRoute} folders={subfolders} onSelect={onSelectSubfolder} />

      {loading && media.length === 0 ? (
        <p className={`${baseClass}__empty`}>Loading…</p>
      ) : media.length === 0 ? (
        subfolders.length === 0 ? (
          <p className={`${baseClass}__empty`}>
            {canUpload
              ? `No images here yet. Drag & drop files, or use ${
                  canAdd ? 'Upload / Add existing media' : 'Upload'
                } above.`
              : 'No images here yet.'}
          </p>
        ) : null
      ) : (
        <div className={`${baseClass}__cards`}>
          {media.map((item) => (
            <div className={`${baseClass}__card`} key={item.id}>
              <a
                href={`/admin/collections/media/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.mimeType?.startsWith('image/') ? (
                  <img
                    alt={item.alt ?? item.filename ?? ''}
                    src={item.thumbnailURL ?? item.url ?? ''}
                  />
                ) : (
                  <div className={`${baseClass}__file-icon`}>📄</div>
                )}
              </a>
              <div className={`${baseClass}__card-name`} title={item.filename ?? ''}>
                {item.filename}
              </div>
              {canRemove && (
                <button
                  aria-label="Remove from folder"
                  className={`${baseClass}__remove-btn`}
                  onClick={() => onRemove(item.id)}
                  title="Remove from this folder"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <button className={`${baseClass}__load-more`} onClick={onLoadMore} type="button">
          Load more
        </button>
      )}
    </div>
  )
}
