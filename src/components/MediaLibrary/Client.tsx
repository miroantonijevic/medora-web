'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  assignMediaFolder,
  countMediaInFolder,
  createFolder,
  deleteFolder,
  fetchAllFolders,
  fetchAllMedia,
  fetchMediaInFolder,
  moveFolder,
  renameFolder,
  uploadMediaToFolder,
  type FolderDoc,
  type MediaItem,
} from './api'
import { AddMediaModal } from './AddMediaModal'
import { findNode, findPath, FolderTree, useMemoTree } from './FolderTree'
import { MediaGrid, type Breadcrumb } from './MediaGrid'
import './index.scss'

const baseClass = 'media-library'
const MIN_SIDEBAR_WIDTH = 200
const MAX_SIDEBAR_WIDTH = 480
const DEFAULT_SIDEBAR_WIDTH = 280

type Selection = number | 'all' | 'unfiled'

export const MediaLibraryClient: React.FC = () => {
  const { config } = useConfig()
  const apiRoute = config.routes.api

  const [folders, setFolders] = useState<FolderDoc[]>([])
  const [selected, setSelected] = useState<Selection>('all')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [totalDocs, setTotalDocs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const resizingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const tree = useMemoTree(folders)

  const loadFolders = useCallback(async () => {
    const docs = await fetchAllFolders(apiRoute)
    setFolders(docs)
  }, [apiRoute])

  const loadMedia = useCallback(
    async (target: Selection, pageNum: number, append: boolean) => {
      setLoading(true)
      const result =
        target === 'all'
          ? await fetchAllMedia(apiRoute, pageNum)
          : await fetchMediaInFolder(apiRoute, target === 'unfiled' ? null : target, pageNum)
      setMedia((prev) => (append ? [...prev, ...result.docs] : result.docs))
      setHasNextPage(result.hasNextPage)
      setTotalDocs(result.totalDocs)
      setLoading(false)
    },
    [apiRoute],
  )

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  useEffect(() => {
    setPage(1)
    loadMedia(selected, 1, false)
  }, [selected, loadMedia])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return
      const containerLeft = containerRef.current?.getBoundingClientRect().left ?? 0
      const next = Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, e.clientX - containerLeft),
      )
      setSidebarWidth(next)
    }
    const handleMouseUp = () => {
      resizingRef.current = false
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const folderLabel =
    selected === 'all'
      ? 'All Media'
      : selected === 'unfiled'
        ? 'Not in a Folder'
        : (findNode(tree, selected)?.name ?? 'Folder')

  const breadcrumbs: Breadcrumb[] = useMemo(() => {
    if (selected === 'all') return [{ id: 'all', label: 'All Media' }]
    if (selected === 'unfiled')
      return [
        { id: 'all', label: 'All Media' },
        { id: 'unfiled', label: 'Not in a Folder' },
      ]
    const path = findPath(tree, selected) ?? []
    return [
      { id: 'all', label: 'All Media' },
      ...path.map((node) => ({ id: node.id, label: node.name })),
    ]
  }, [selected, tree])

  const subfolders = useMemo(() => {
    if (selected === 'all') return tree
    if (selected === 'unfiled') return []
    return findNode(tree, selected)?.children ?? []
  }, [selected, tree])

  const handleCreateFolder = async (parentId: number | null, name: string) => {
    const doc = await createFolder(apiRoute, name, parentId)
    if (doc) await loadFolders()
  }

  const handleRenameFolder = async (id: number, name: string) => {
    const ok = await renameFolder(apiRoute, id, name)
    if (ok) await loadFolders()
  }

  const handleDeleteFolder = async (id: number) => {
    const node = findNode(tree, id)
    if (node && node.children.length > 0) {
      window.alert('This folder still has subfolders. Move or delete them first.')
      return
    }
    const mediaCount = await countMediaInFolder(apiRoute, id)
    if (mediaCount > 0) {
      window.alert(
        `This folder still has ${mediaCount} image${mediaCount === 1 ? '' : 's'} in it. Remove or move them first.`,
      )
      return
    }
    if (!window.confirm(`Delete the empty folder "${node?.name ?? ''}"?`)) return
    const ok = await deleteFolder(apiRoute, id)
    if (ok) {
      if (selected === id) setSelected('all')
      await loadFolders()
    }
  }

  const handleMoveFolder = async (id: number, newParentId: number | null) => {
    const ok = await moveFolder(apiRoute, id, newParentId)
    if (ok) await loadFolders()
  }

  const handleRemoveMedia = async (mediaId: number) => {
    const ok = await assignMediaFolder(apiRoute, mediaId, null)
    if (ok) await loadMedia(selected, 1, false)
  }

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    const folderId = selected === 'all' || selected === 'unfiled' ? null : selected
    for (const file of Array.from(files)) {
      await uploadMediaToFolder(apiRoute, file, folderId)
    }
    setUploading(false)
    await loadMedia(selected, 1, false)
  }

  const handleAddExisting = async (mediaIds: number[]) => {
    const folderId = selected === 'all' || selected === 'unfiled' ? null : selected
    await Promise.all(mediaIds.map((id) => assignMediaFolder(apiRoute, id, folderId)))
    setAddModalOpen(false)
    await loadMedia(selected, 1, false)
  }

  return (
    <div className={baseClass} ref={containerRef}>
      <div className={`${baseClass}__sidebar`} style={{ flexBasis: sidebarWidth }}>
        <FolderTree
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onMoveFolder={handleMoveFolder}
          onRenameFolder={handleRenameFolder}
          onSelect={setSelected}
          selectedId={selected}
          tree={tree}
        />
      </div>
      <div
        className={`${baseClass}__resize-handle`}
        onMouseDown={() => {
          resizingRef.current = true
        }}
        role="separator"
        aria-orientation="vertical"
      />
      <div className={`${baseClass}__main`}>
        <MediaGrid
          apiRoute={apiRoute}
          breadcrumbs={breadcrumbs}
          canAdd={typeof selected === 'number'}
          canRemove={typeof selected === 'number'}
          canUpload={selected !== 'unfiled'}
          folderLabel={folderLabel}
          hasNextPage={hasNextPage}
          loading={loading}
          media={media}
          onBreadcrumbClick={setSelected}
          onLoadMore={() => {
            const next = page + 1
            setPage(next)
            loadMedia(selected, next, true)
          }}
          onOpenAddModal={() => setAddModalOpen(true)}
          onRemove={handleRemoveMedia}
          onSelectSubfolder={setSelected}
          onUpload={handleUpload}
          subfolders={subfolders}
          totalDocs={totalDocs}
          uploading={uploading}
        />
      </div>

      {addModalOpen && (
        <AddMediaModal
          apiRoute={apiRoute}
          currentFolderId={selected === 'all' || selected === 'unfiled' ? null : selected}
          onClose={() => setAddModalOpen(false)}
          onConfirm={handleAddExisting}
        />
      )}
    </div>
  )
}
