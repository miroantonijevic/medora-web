import { DefaultListView } from '@payloadcms/ui'
import type { ListViewServerProps } from 'payload'
import React from 'react'

import { RedirectIfStandaloneList } from './RedirectIfStandaloneList'

// Standalone visits to /admin/collections/media should route through the
// custom Media Library grid instead (see NavLink.tsx / index.tsx).
//
// However, Payload also reuses this exact list view to render its built-in
// List Drawer (the "Choose from existing" picker on upload/relationship
// fields). That picker relies on the default, selectable list UI — so we
// must not redirect in that case, or "Choose from existing" breaks (it can
// only ever navigate away, never actually assign an image back to the
// field). The redirect is therefore deferred to the client, which can tell
// the two cases apart by checking the real browser pathname.
export const MediaListRedirectView: React.FC<ListViewServerProps> = (props) => {
  const {
    payload,
    beforeActions,
    collectionSlug,
    columnState,
    disableBulkDelete,
    disableBulkEdit,
    disableQueryPresets,
    enableRowSelections,
    hasCreatePermission,
    hasDeletePermission,
    hasTrashPermission,
    listPreferences,
    newDocumentURL,
    queryPreset,
    queryPresetPermissions,
    renderedFilters,
    resolvedFilterOptions,
    viewType,
    AfterList,
    AfterListTable,
    BeforeList,
    BeforeListTable,
    Description,
    listMenuItems,
    Table,
  } = props

  const adminRoute = payload.config.routes.admin

  return (
    <>
      <RedirectIfStandaloneList
        mediaLibraryPath={`${adminRoute}/media-library`}
        mediaListPath={`${adminRoute}/collections/media`}
      />
      {/*
        Only pass through the plain, serializable client-facing props — the
        rest of `props` (payload, i18n, data, permissions, user, ...) are
        server-only values that cannot cross into this client component.
      */}
      <DefaultListView
        beforeActions={beforeActions}
        collectionSlug={collectionSlug}
        columnState={columnState}
        disableBulkDelete={disableBulkDelete}
        disableBulkEdit={disableBulkEdit}
        disableQueryPresets={disableQueryPresets}
        enableRowSelections={enableRowSelections}
        hasCreatePermission={hasCreatePermission}
        hasDeletePermission={hasDeletePermission}
        hasTrashPermission={hasTrashPermission}
        listPreferences={listPreferences}
        newDocumentURL={newDocumentURL}
        queryPreset={queryPreset}
        queryPresetPermissions={queryPresetPermissions}
        renderedFilters={renderedFilters}
        resolvedFilterOptions={resolvedFilterOptions}
        viewType={viewType}
        AfterList={AfterList}
        AfterListTable={AfterListTable}
        BeforeList={BeforeList}
        BeforeListTable={BeforeListTable}
        Description={Description}
        listMenuItems={listMenuItems}
        Table={Table}
      />
    </>
  )
}
