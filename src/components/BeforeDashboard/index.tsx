import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import './index.scss'

type Tile = {
  href: string
  icon: string
  title: string
  subtitle: string
  badge?: number
}

type Section = {
  label: string
  tiles: Tile[]
}

const BeforeDashboard = async () => {
  const payload = await getPayload({ config })
  const { totalDocs: spamCount } = await payload.count({
    collection: 'inquiries',
    where: { status: { equals: 'spam' } },
  })

  // Mirrors the left-hand admin nav groups so every section is reachable from one screen.
  const sections: Section[] = [
    {
      label: 'Homepages',
      tiles: [
        {
          href: '/admin/globals/auri-homepage',
          icon: '🏨',
          title: 'Medora Auri',
          subtitle: 'Homepage sections & slides',
        },
        {
          href: '/admin/globals/orbis-homepage',
          icon: '🏕',
          title: 'Luxury Camp Orbis',
          subtitle: 'Homepage sections & slides',
        },
      ],
    },
    {
      label: 'Content',
      tiles: [
        {
          href: '/admin/collections/pages',
          icon: '📄',
          title: 'Pages',
          subtitle: 'Destination pages & landing pages',
        },
        {
          href: '/admin/media-library',
          icon: '🖼',
          title: 'Media Library',
          subtitle: 'Upload and organize images',
        },
      ],
    },
    {
      label: 'Hotel Content',
      tiles: [
        {
          href: '/admin/collections/properties',
          icon: '🏗',
          title: 'Properties',
          subtitle: 'Name, address, star rating',
        },
        {
          href: '/admin/collections/room-groups',
          icon: '🗂',
          title: 'Room Groups',
          subtitle: 'Hierarchical room categories',
        },
        {
          href: '/admin/collections/rooms',
          icon: '🛏',
          title: 'Rooms',
          subtitle: 'Room types per property',
        },
        {
          href: '/admin/collections/offers',
          icon: '🎁',
          title: 'Special Offers',
          subtitle: 'Deals with publish scheduling',
        },
      ],
    },
    {
      label: 'Help Center',
      tiles: [
        {
          href: '/admin/collections/faq-categories',
          icon: '❓',
          title: 'FAQ Categories',
          subtitle: 'Questions & answers by topic',
        },
      ],
    },
    {
      label: 'Guest Inquiries',
      tiles: [
        {
          href: '/admin/collections/inquiries',
          icon: '📩',
          title: 'Inquiries',
          subtitle: 'Quick Inquiry form submissions',
          badge: spamCount > 0 ? spamCount : undefined,
        },
      ],
    },
    {
      label: 'Website Settings',
      tiles: [
        {
          href: '/admin/globals/main-nav',
          icon: '🧭',
          title: 'Navigation Menu',
          subtitle: 'Header links shown on every page',
        },
        {
          href: '/admin/globals/site-settings',
          icon: '⚙️',
          title: 'Site Settings',
          subtitle: 'Contact info, favicon, Analytics',
        },
        {
          href: '/admin/globals/seo-defaults',
          icon: '🔍',
          title: 'SEO Defaults',
          subtitle: 'Fallback meta title & description',
        },
        {
          href: '/admin/globals/email-settings',
          icon: '✉️',
          title: 'Email Settings',
          subtitle: 'SMTP credentials & recipients',
        },
      ],
    },
    {
      label: 'System',
      tiles: [
        {
          href: '/admin/collections/users',
          icon: '👤',
          title: 'Users',
          subtitle: 'Admin accounts & roles',
        },
        {
          href: '/admin/collections/redirects',
          icon: '🔀',
          title: 'Redirects',
          subtitle: '301/302 URL redirects',
        },
      ],
    },
  ]

  return (
    <div className="medora-dashboard">
      {/* Hides Payload auto-generated ModularDashboard rendered below this component */}
      <style>{`.modular-dashboard{display:none!important}`}</style>

      <div className="medora-dashboard__header">
        <h2>Medora Hotels CMS</h2>
        <a href="/" target="_blank" rel="noopener noreferrer" className="medora-dashboard__live">
          View live website ↗
        </a>
      </div>

      {sections.map((section) => (
        <React.Fragment key={section.label}>
          <div className="medora-dashboard__label">{section.label}</div>
          <div className="medora-dashboard__row">
            {section.tiles.map((tile) => (
              <a className="medora-dashboard__tile" href={tile.href} key={tile.href}>
                {Boolean(tile.badge) && (
                  <span className="medora-dashboard__badge">{tile.badge}</span>
                )}
                <span className="medora-dashboard__tile-icon">{tile.icon}</span>
                <div>
                  <strong>{tile.title}</strong>
                  <small>{tile.subtitle}</small>
                </div>
              </a>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export default BeforeDashboard
