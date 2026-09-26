'use client'

import { Button, useConfig } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

// Renders a clearly-visible "Delete" button on the Media edit view (registered via
// Media.admin.components.edit.beforeDocumentControls). Payload already has a delete action,
// but it's tucked away inside the "..." menu next to Save, which isn't obvious.
export const MediaDeleteButton: React.FC<{ id?: number | string }> = ({ id }) => {
  const { config } = useConfig()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (!id) return
    if (!window.confirm('Delete this file permanently? This cannot be undone.')) return

    setDeleting(true)
    try {
      const res = await fetch(`${config.routes.api}/media/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        window.location.href = `${config.routes.admin}/media-library`
        return
      }
      window.alert('Could not delete this file. It may still be in use.')
    } catch {
      window.alert('Could not delete this file. Please try again.')
    } finally {
      setDeleting(false)
    }
  }, [id, config.routes.api, config.routes.admin])

  if (!id) return null

  return (
    <Button buttonStyle="error" disabled={deleting} onClick={handleDelete} size="medium">
      {deleting ? 'Deleting…' : 'Delete'}
    </Button>
  )
}

export default MediaDeleteButton
