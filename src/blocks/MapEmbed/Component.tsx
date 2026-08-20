import React from 'react'

type Props = {
  lat: number
  lng: number
  zoom?: number | null
  directionsUrl: string
}

export const MapEmbedComponent: React.FC<Props> = ({ lat, lng, zoom, directionsUrl }) => {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom ?? 15}&output=embed`

  return (
    <div className="max-w-275 mx-auto px-6">
      <div className="w-full aspect-video rounded overflow-hidden">
        <iframe
          src={src}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 px-6 py-2 bg-[#012B59] text-white text-sm font-semibold rounded-full no-underline hover:bg-[#009bdb] transition-colors"
      >
        Driving directions
      </a>
    </div>
  )
}
