'use client'

import { ReactSelect, useConfig } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { fetchFolderMedia, fetchFolderOptions, type FolderOption, type MediaDoc } from './shared'
import './index.scss'

const baseClass = 'media-gallery-folder-picker'

type Props = {
  disabled?: boolean
  onConfirm: (docs: MediaDoc[]) => void
}

export const FolderPickerPanel: React.FC<Props> = ({ disabled, onConfirm }) => {
  const { config } = useConfig()
  const apiRoute = config.routes.api

  const [isOpen, setIsOpen] = useState(false)
  const [folderOptions, setFolderOptions] = useState<FolderOption[]>([])
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [selected, setSelected] = useState<FolderOption | null>(null)
  const [folderMedia, setFolderMedia] = useState<MediaDoc[] | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || folderOptions.length > 0) return

    setLoadingFolders(true)
    setError(null)

    fetchFolderOptions(apiRoute)
      .then(setFolderOptions)
      .catch(() => setError('Could not load folders.'))
      .finally(() => setLoadingFolders(false))
  }, [isOpen, apiRoute, folderOptions.length])

  useEffect(() => {
    if (!selected) {
      setFolderMedia(null)
      return
    }

    let cancelled = false
    setLoadingMedia(true)
    setError(null)

    fetchFolderMedia(apiRoute, selected.value)
      .then((docs) => {
        if (!cancelled) setFolderMedia(docs)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load images in that folder.')
      })
      .finally(() => {
        if (!cancelled) setLoadingMedia(false)
      })

    return () => {
      cancelled = true
    }
  }, [selected, apiRoute])

  const handleConfirm = () => {
    if (!folderMedia || folderMedia.length === 0) return
    onConfirm(folderMedia)
    setIsOpen(false)
    setSelected(null)
    setFolderMedia(null)
  }

  if (!isOpen) {
    return (
      <button
        className={`${baseClass}__trigger`}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className={`${baseClass}__trigger-icon`}>📁</span>
        Add images from folder
      </button>
    )
  }

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__row`}>
        <div className={`${baseClass}__select`}>
          <ReactSelect
            isClearable
            isLoading={loadingFolders}
            onChange={(option) => setSelected((option as FolderOption) ?? null)}
            options={folderOptions}
            placeholder="Choose a folder…"
            value={selected}
          />
        </div>
        <button
          className={`${baseClass}__confirm`}
          disabled={!selected || loadingMedia || !folderMedia?.length}
          onClick={handleConfirm}
          type="button"
        >
          {loadingMedia
            ? 'Loading…'
            : folderMedia
              ? `Add ${folderMedia.length} image${folderMedia.length === 1 ? '' : 's'}`
              : 'Add images'}
        </button>
        <button
          className={`${baseClass}__cancel`}
          onClick={() => {
            setIsOpen(false)
            setSelected(null)
            setFolderMedia(null)
          }}
          type="button"
        >
          Cancel
        </button>
      </div>
      {selected && !loadingMedia && folderMedia?.length === 0 && (
        <p className={`${baseClass}__hint`}>This folder has no images.</p>
      )}
      {error && <p className={`${baseClass}__error`}>{error}</p>}
    </div>
  )
}
