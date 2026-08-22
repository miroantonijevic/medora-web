'use client'

import { useField } from '@payloadcms/ui'
import React from 'react'

import { FolderPickerPanel } from './FolderPickerPanel'
import type { MediaDoc } from './shared'

type Props = {
  path: string
}

/**
 * Rendered via `admin.components.afterInput` on `upload` fields with
 * `hasMany: true` (e.g. Rooms.images, Properties.heroImages). Lets an editor
 * pick a Media folder and appends every image inside it to the field's
 * existing list of selected media.
 */
const AddFolderButtonUpload: React.FC<Props> = ({ path }) => {
  const { setValue, value } = useField<Array<number | string>>({ path })

  const handleConfirm = (docs: MediaDoc[]) => {
    const existing = new Set((value ?? []).map((id) => String(id)))
    const additions = docs.map((doc) => doc.id).filter((id) => !existing.has(String(id)))

    if (additions.length === 0) return

    setValue([...(value ?? []), ...additions])
  }

  return <FolderPickerPanel onConfirm={handleConfirm} />
}

export default AddFolderButtonUpload
