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
 * Same as `AddFolderButtonArray`, but for array fields whose row upload
 * field is named `icon` instead of `image` (PropertyHomepage.inclusions).
 */
const AddFolderButtonArrayIcon: React.FC<Props> = ({ path, schemaPath }) => {
  const { addFieldRow } = useForm()

  const handleConfirm = (docs: MediaDoc[]) => {
    docs.forEach((doc) => {
      const subFieldState: FormState = {
        icon: { initialValue: doc.id, valid: true, value: doc.id },
      }
      addFieldRow({ path, schemaPath, subFieldState })
    })
  }

  return <FolderPickerPanel onConfirm={handleConfirm} />
}

export default AddFolderButtonArrayIcon
