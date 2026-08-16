import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      path: true,
    },
  })

  return pages.docs
    .filter((doc) => {
      const identifier = (doc.path || doc.slug) as string
      return identifier && identifier !== 'home'
    })
    .map((doc) => {
      const fullPath = (doc.path || doc.slug) as string
      return { slug: fullPath.split('/') }
    })
}

type Args = {
  params: Promise<{
    slug?: string[]
    locale?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug: slugArray = ['home'] } = await paramsPromise
  const path = slugArray.join('/')
  const url = '/' + path

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageByPath({ path })

  // Remove this code once your website is seeded
  if (!page && path === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug: slugArray = ['home'] } = await paramsPromise
  const path = slugArray.join('/')
  const page = await queryPageByPath({ path })

  return generateMeta({ doc: page })
}

// Queries by `path` field first, then falls back to `slug` — supports both
// nested paths (destination/beaches) and legacy flat slugs (home, about)
const queryPageByPath = cache(async ({ path }: { path: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      or: [{ path: { equals: path } }, { slug: { equals: path } }],
    },
  })

  return result.docs?.[0] || null
})
