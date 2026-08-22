'use client'

import { useForm } from '@payloadcms/ui'
import type { FormState } from 'payload'
import React from 'react'

import { FolderPickerPanel } from './FolderPickerPanel'
import type { MediaDoc } from './shared'

type Props = {
  path: string
  schemaPath: string
}

/**
 * Rendered via `admin.components.afterInput` on `array` fields whose rows
 * each contain a single `upload` field named `image` (e.g. Offers.gallery,
 * PhotoGallery.images, CardGrid.cards, PropertyHomepage.slides). Lets an
 * editor pick a Media folder and appends one new row per image inside it.
 */
const AddFolderButtonArray: React.FC<Props> = ({ path, schemaPath }) => {
  const { addFieldRow } = useForm()

  const handleConfirm = (docs: MediaDoc[]) => {
    docs.forEach((doc) => {
      const subFieldState: FormState = {
        image: { initialValue: doc.id, valid: true, value: doc.id },
      }
      addFieldRow({ path, schemaPath, subFieldState })
    })
  }

  return <FolderPickerPanel onConfirm={handleConfirm} />
}

export default AddFolderButtonArray
