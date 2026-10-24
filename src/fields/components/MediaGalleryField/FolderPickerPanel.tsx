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
  // null = not loaded yet
  const [folderOptions, setFolderOptions] = useState<FolderOption[] | null>(null)
  const [selected, setSelected] = useState<FolderOption | null>(null)
  const [fetchedMedia, setFetchedMedia] = useState<{ folder: string; docs: MediaDoc[] } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  // Loading flags are derived, so the effects below only set state when a response arrives.
  const loadingFolders = isOpen && folderOptions === null && !error
  const folderMedia = selected && fetchedMedia?.folder === selected.value ? fetchedMedia.docs : null
  const loadingMedia = Boolean(selected) && folderMedia === null && !error

  useEffect(() => {
    if (!isOpen || folderOptions !== null) return

    let cancelled = false
    fetchFolderOptions(apiRoute)
      .then((options) => {
        if (!cancelled) setFolderOptions(options)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load folders.')
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, folderOptions, apiRoute])

  useEffect(() => {
    if (!selected) return

    let cancelled = false
    fetchFolderMedia(apiRoute, selected.value)
      .then((docs) => {
        if (!cancelled) setFetchedMedia({ folder: selected.value, docs })
      })
      .catch(() => {
        if (!cancelled) setError('Could not load images in that folder.')
      })

    return () => {
      cancelled = true
    }
  }, [selected, apiRoute])

  const open = () => {
    setError(null)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setSelected(null)
  }

  const handleSelect = (option: FolderOption | null) => {
    setError(null)
    setSelected(option)
  }

  const handleConfirm = () => {
    if (!folderMedia || folderMedia.length === 0) return
    onConfirm(folderMedia)
    close()
  }

  if (!isOpen) {
    return (
      <button className={`${baseClass}__trigger`} disabled={disabled} onClick={open} type="button">
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
            onChange={(option) => handleSelect((option as FolderOption) ?? null)}
            options={folderOptions ?? []}
            placeholder="Choose a folder…"
            value={selected ?? undefined}
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
        <button className={`${baseClass}__cancel`} onClick={close} type="button">
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
