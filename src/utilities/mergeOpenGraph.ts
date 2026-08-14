import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Medora Hotels & Camps — your gateway to the Makarska Riviera.',
  images: [
    {
      url: `${getServerSideURL()}/og-default.jpg`,
    },
  ],
  siteName: 'Medora Hotels',
  title: 'Medora Hotels',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
