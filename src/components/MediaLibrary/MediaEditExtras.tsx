import type { BeforeDocumentControlsServerProps } from 'payload'
import React from 'react'

import { MediaDeleteButton } from './MediaDeleteButton'

// Renders on the Media edit view only (registered via Media.admin.components.edit.beforeDocumentControls).
// This slot lives inside Payload's sticky document-controls toolbar, so it can only safely hold
// invisible/global styling here — visible content (the "Used in" list) lives in MediaDescription
// instead, which renders in the normal document flow under the title.
//
// `beforeDocumentControls` only forwards `serverProps` (which include `id`) to components that
// Payload detects as React Server Components. Since `MediaDeleteButton` is a client component, it
// would receive no props (and thus no `id`) if registered directly in that slot. Instead, this
// (server) component receives `id` itself and passes it down explicitly as a normal prop.
export const MediaEditExtras: React.FC<BeforeDocumentControlsServerProps> = ({ id }) => {
  return (
    <React.Fragment>
      <MediaDeleteButton id={id} />
      <style>{`
      .file-field__upload-actions { display: none; }
      .file-details__thumbnail.thumbnail {
        width: 100%;
        max-height: 480px;
      }
      .file-details header {
        flex-direction: column;
        align-items: stretch;
      }
      /* Restyle the Last Modified / Created row as a quieter, single-line caption. */
      .doc-controls__meta {
        gap: 0.75em;
        font-size: 0.8rem;
      }
      .doc-controls__meta .doc-controls__label {
        color: var(--theme-elevation-400);
      }
      .doc-controls__meta .doc-controls__value {
        color: var(--theme-elevation-600);
        font-weight: 500;
      }
    `}</style>
    </React.Fragment>
  )
}

export default MediaEditExtras
