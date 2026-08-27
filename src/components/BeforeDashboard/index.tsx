import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import './index.scss'

const BeforeDashboard = async () => {
  const payload = await getPayload({ config })
  const { totalDocs: spamCount } = await payload.count({
    collection: 'inquiries',
    where: { status: { equals: 'spam' } },
  })

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

      <div className="medora-dashboard__label">Properties</div>
      <div className="medora-dashboard__row">
        <a className="medora-dashboard__prop" href="/admin/globals/auri-homepage">
          <span>🏨</span>
          <div>
            <strong>Medora Auri</strong>
            <small>Homepage</small>
          </div>
        </a>
        <a className="medora-dashboard__prop" href="/admin/globals/orbis-homepage">
          <span>🏕</span>
          <div>
            <strong>Luxury Camp Orbis</strong>
            <small>Homepage</small>
          </div>
        </a>
      </div>

      <div className="medora-dashboard__row" style={{ marginTop: '8px' }}>
        <a className="medora-dashboard__card" href="/admin/collections/rooms">
          🛏 Rooms
          <small>Room types per property</small>
        </a>
        <a className="medora-dashboard__card" href="/admin/collections/offers">
          🎁 Special Offers
          <small>Deals with publish scheduling</small>
        </a>
        <a className="medora-dashboard__card" href="/admin/collections/media">
          🖼 Media
          <small>Upload and manage images</small>
        </a>
        <a className="medora-dashboard__card" href="/admin/collections/properties">
          🏗 Property details
          <small>Name, address, star rating</small>
        </a>
      </div>

      <div className="medora-dashboard__label">Settings</div>
      <div className="medora-dashboard__row">
        <a className="medora-dashboard__card" href="/admin/collections/inquiries">
          📩 Inquiries
          <small>Quick Inquiry form submissions</small>
        </a>
        <a className="medora-dashboard__card" href="/admin/globals/site-settings">
          ⚙️ Site Settings
          <small>Contact info, favicon, Analytics</small>
        </a>
        <a className="medora-dashboard__card" href="/admin/globals/seo-defaults">
          🔍 SEO Defaults
          <small>Fallback meta title &amp; description</small>
        </a>
        <a className="medora-dashboard__card" href="/admin/globals/email-settings">
          ✉️ Email Settings
          <small>SMTP credentials &amp; inquiry recipients</small>
        </a>
      </div>

      {spamCount > 0 && (
        <div className="medora-dashboard__footer">
          🛡 {spamCount} spam inquir{spamCount === 1 ? 'y' : 'ies'} blocked
        </div>
      )}

      <div className="medora-dashboard__footer">
        <a href="/admin/globals/main-nav">Navigation menu</a>
        <span> · </span>
        <a href="/admin/collections/users">Users</a>
        <span> · </span>
        <a href="/admin/collections/redirects">Redirects</a>
      </div>
    </div>
  )
}

export default BeforeDashboard
