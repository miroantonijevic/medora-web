'use client'

import React, { useMemo, useState } from 'react'

import type { FolderDoc } from './api'

const baseClass = 'media-library-tree'

export type TreeNode = {
  id: number
  name: string
  children: TreeNode[]
}

export function buildTree(folders: FolderDoc[]): TreeNode[] {
  const byId = new Map<number, TreeNode>()
  folders.forEach((f) => byId.set(f.id, { id: f.id, name: f.name, children: [] }))

  const roots: TreeNode[] = []
  folders.forEach((f) => {
    const node = byId.get(f.id)
    if (!node) return
    const parentId = typeof f.folder === 'object' && f.folder !== null ? f.folder.id : f.folder
    const parent = typeof parentId === 'number' ? byId.get(parentId) : undefined
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)
  return roots
}

export function findNode(nodes: TreeNode[], id: number): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findNode(n.children, id)
    if (found) return found
  }
  return null
}

export function findPath(nodes: TreeNode[], id: number, path: TreeNode[] = []): TreeNode[] | null {
  for (const n of nodes) {
    const nextPath = [...path, n]
    if (n.id === id) return nextPath
    const found = findPath(n.children, id, nextPath)
    if (found) return found
  }
  return null
}

function subtreeIds(node: TreeNode): Set<number> {
  const set = new Set<number>([node.id])
  node.children.forEach((c) => subtreeIds(c).forEach((id) => set.add(id)))
  return set
}

function allParentIds(nodes: TreeNode[]): Set<number> {
  const set = new Set<number>()
  const walk = (list: TreeNode[]) => {
    list.forEach((n) => {
      if (n.children.length > 0) {
        set.add(n.id)
        walk(n.children)
      }
    })
  }
  walk(nodes)
  return set
}

type Props = {
  tree: TreeNode[]
  selectedId: number | 'all' | 'unfiled' | null
  onSelect: (id: number | 'all' | 'unfiled') => void
  onCreateFolder: (parentId: number | null, name: string) => void
  onRenameFolder: (id: number, name: string) => void
  onDeleteFolder: (id: number) => void
  onMoveFolder: (id: number, newParentId: number | null) => void
}

export const FolderTree: React.FC<Props> = ({
  tree,
  selectedId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
}) => {
  // Nodes default to expanded; only explicitly-collapsed ids are tracked here.
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [addingUnder, setAddingUnder] = useState<number | null>(null)
  const [showRootAdd, setShowRootAdd] = useState(false)
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [dragOverRoot, setDragOverRoot] = useState(false)

  const toggle = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDrop = (draggedId: number, targetParentId: number | null) => {
    if (draggedId === targetParentId) return
    const draggedNode = findNode(tree, draggedId)
    if (!draggedNode) return
    if (targetParentId !== null && subtreeIds(draggedNode).has(targetParentId)) {
      window.alert("Can't move a folder into itself or one of its own subfolders.")
      return
    }
    onMoveFolder(draggedId, targetParentId)
  }

  return (
    <div className={baseClass}>
      <button
        className={`${baseClass}__unfiled ${selectedId === 'all' ? `${baseClass}__unfiled--active` : ''}`}
        onClick={() => onSelect('all')}
        type="button"
      >
        <span className={`${baseClass}__caret ${baseClass}__caret--hidden`} />
        <span className={`${baseClass}__icon`}>🌐</span>
        All Media
      </button>
      <button
        className={`${baseClass}__unfiled ${selectedId === 'unfiled' ? `${baseClass}__unfiled--active` : ''}`}
        onClick={() => onSelect('unfiled')}
        type="button"
      >
        <span className={`${baseClass}__caret ${baseClass}__caret--hidden`} />
        <span className={`${baseClass}__icon`}>❓</span>
        Not in a Folder
      </button>

      <div
        className={`${baseClass}__root-row ${dragOverRoot ? `${baseClass}__root-row--over` : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOverRoot(true)
        }}
        onDragLeave={() => setDragOverRoot(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOverRoot(false)
          const draggedId = Number(e.dataTransfer.getData('text/plain'))
          if (!Number.isNaN(draggedId)) handleDrop(draggedId, null)
        }}
      >
        <span className={`${baseClass}__root-label`}>All Folders</span>
        <span className={`${baseClass}__root-actions`}>
          <button
            className={`${baseClass}__icon-btn`}
            onClick={() => setCollapsed(new Set())}
            title="Expand all folders"
            type="button"
          >
            ⤢
          </button>
          <button
            className={`${baseClass}__icon-btn`}
            onClick={() => setCollapsed(allParentIds(tree))}
            title="Collapse all folders"
            type="button"
          >
            ⤡
          </button>
          <button
            aria-label="New top-level folder"
            className={`${baseClass}__add-btn`}
            onClick={() => setShowRootAdd((v) => !v)}
            title="New top-level folder"
            type="button"
          >
            +
          </button>
        </span>
      </div>

      {showRootAdd && (
        <NewFolderInput
          onCancel={() => setShowRootAdd(false)}
          onSubmit={(name) => {
            onCreateFolder(null, name)
            setShowRootAdd(false)
          }}
        />
      )}

      <ul className={`${baseClass}__list`}>
        {tree.map((node) => (
          <FolderTreeNode
            addingUnder={addingUnder}
            depth={0}
            key={node.id}
            node={node}
            onCreateFolder={(parentId, name) => {
              onCreateFolder(parentId, name)
              setAddingUnder(null)
            }}
            onDeleteFolder={onDeleteFolder}
            onDrop={handleDrop}
            onRenameFolder={(id, name) => {
              onRenameFolder(id, name)
              setRenamingId(null)
            }}
            onSelect={onSelect}
            onSetAddingUnder={setAddingUnder}
            onSetRenamingId={setRenamingId}
            onToggle={toggle}
            renamingId={renamingId}
            selectedId={selectedId}
            collapsedIds={collapsed}
          />
        ))}
      </ul>
    </div>
  )
}

type NodeProps = {
  node: TreeNode
  depth: number
  collapsedIds: Set<number>
  selectedId: number | 'all' | 'unfiled' | null
  addingUnder: number | null
  renamingId: number | null
  onToggle: (id: number) => void
  onSelect: (id: number) => void
  onSetAddingUnder: (id: number | null) => void
  onSetRenamingId: (id: number | null) => void
  onCreateFolder: (parentId: number | null, name: string) => void
  onRenameFolder: (id: number, name: string) => void
  onDeleteFolder: (id: number) => void
  onDrop: (draggedId: number, targetParentId: number | null) => void
}

const FolderTreeNode: React.FC<NodeProps> = ({
  node,
  depth,
  collapsedIds,
  selectedId,
  addingUnder,
  renamingId,
  onToggle,
  onSelect,
  onSetAddingUnder,
  onSetRenamingId,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDrop,
}) => {
  const [dragOver, setDragOver] = useState(false)
  const hasChildren = node.children.length > 0
  const isExpanded = hasChildren && !collapsedIds.has(node.id)
  const isSelected = selectedId === node.id
  const isRenaming = renamingId === node.id

  return (
    <li className={`${baseClass}__node`}>
      <div
        className={`${baseClass}__row ${isSelected ? `${baseClass}__row--active` : ''} ${dragOver ? `${baseClass}__row--over` : ''}`}
        draggable
        onClick={() => onSelect(node.id)}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', String(node.id))
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
          const draggedId = Number(e.dataTransfer.getData('text/plain'))
          if (!Number.isNaN(draggedId)) onDrop(draggedId, node.id)
        }}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span
          className={`${baseClass}__caret ${hasChildren ? '' : `${baseClass}__caret--hidden`}`}
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) onToggle(node.id)
          }}
          title={hasChildren ? (isExpanded ? 'Collapse folder' : 'Expand folder') : undefined}
        >
          {hasChildren ? (isExpanded ? '▾' : '▸') : ''}
        </span>
        <span className={`${baseClass}__folder-icon`}>📁</span>

        {isRenaming ? (
          <RenameInput
            initialValue={node.name}
            onCancel={() => onSetRenamingId(null)}
            onSubmit={(name) => onRenameFolder(node.id, name)}
          />
        ) : (
          <span className={`${baseClass}__name`}>{node.name}</span>
        )}

        <span className={`${baseClass}__actions`}>
          <button
            aria-label="Add subfolder"
            className={`${baseClass}__icon-btn`}
            onClick={(e) => {
              e.stopPropagation()
              onSetAddingUnder(addingUnder === node.id ? null : node.id)
            }}
            title="Add subfolder"
            type="button"
          >
            +
          </button>
          <button
            aria-label="Rename folder"
            className={`${baseClass}__icon-btn`}
            onClick={(e) => {
              e.stopPropagation()
              onSetRenamingId(node.id)
            }}
            title="Rename folder"
            type="button"
          >
            ✎
          </button>
          <button
            aria-label="Delete folder"
            className={`${baseClass}__icon-btn`}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteFolder(node.id)
            }}
            title="Delete folder"
            type="button"
          >
            🗑
          </button>
        </span>
      </div>

      {addingUnder === node.id && (
        <div style={{ paddingLeft: `${(depth + 1) * 16}px` }}>
          <NewFolderInput
            onCancel={() => onSetAddingUnder(null)}
            onSubmit={(name) => onCreateFolder(node.id, name)}
          />
        </div>
      )}

      {hasChildren && isExpanded && (
        <ul className={`${baseClass}__list`}>
          {node.children.map((child) => (
            <FolderTreeNode
              addingUnder={addingUnder}
              depth={depth + 1}
              key={child.id}
              node={child}
              onCreateFolder={onCreateFolder}
              onDeleteFolder={onDeleteFolder}
              onDrop={onDrop}
              onRenameFolder={onRenameFolder}
              onSelect={onSelect}
              onSetAddingUnder={onSetAddingUnder}
              onSetRenamingId={onSetRenamingId}
              onToggle={onToggle}
              renamingId={renamingId}
              selectedId={selectedId}
              collapsedIds={collapsedIds}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const NewFolderInput: React.FC<{ onSubmit: (name: string) => void; onCancel: () => void }> = ({
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState('')
  return (
    <form
      className={`${baseClass}__inline-form`}
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value.trim())
      }}
    >
      <input
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        placeholder="New folder name…"
        value={value}
      />
      <button type="submit">Add</button>
      <button onClick={onCancel} type="button">
        Cancel
      </button>
    </form>
  )
}

const RenameInput: React.FC<{
  initialValue: string
  onSubmit: (name: string) => void
  onCancel: () => void
}> = ({ initialValue, onSubmit, onCancel }) => {
  const [value, setValue] = useState(initialValue)
  return (
    <form
      className={`${baseClass}__inline-form ${baseClass}__inline-form--rename`}
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value.trim())
      }}
    >
      <input
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
        value={value}
      />
      <button type="submit">Save</button>
      <button onClick={onCancel} type="button">
        Cancel
      </button>
    </form>
  )
}

export function useMemoTree(folders: FolderDoc[]): TreeNode[] {
  return useMemo(() => buildTree(folders), [folders])
}
