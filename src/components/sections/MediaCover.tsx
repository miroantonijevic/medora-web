import Image from 'next/image'

type MediaCoverResource = {
  url?: string | null
  alt?: string | null
  mimeType?: string | null
} | null

type Props = {
  resource: MediaCoverResource | undefined
  alt?: string
  priority?: boolean
  sizes?: string
}

/** Renders a Payload media resource as an absolutely-positioned `object-cover` layer — image or muted looping video. */
export function MediaCover({ resource, alt, priority, sizes = '100vw' }: Props) {
  if (!resource?.url) return null

  const resolvedAlt = alt ?? resource.alt ?? ''

  if (resource.mimeType?.startsWith('video/')) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-label={resolvedAlt}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src={resource.url} />
      </video>
    )
  }

  return (
    <Image
      src={resource.url}
      alt={resolvedAlt}
      fill
      priority={priority}
      sizes={sizes}
      style={{ objectFit: 'cover' }}
    />
  )
}
