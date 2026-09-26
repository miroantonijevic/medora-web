'use client'

import { useConfig } from '@payloadcms/ui'
import React from 'react'

// Quick link back to the redesigned dashboard (BeforeDashboard), pinned above every other nav group.
const DashboardNavLink: React.FC = () => {
  const { config } = useConfig()
  const href = config.routes.admin

  return (
    <div className="nav-group" id="nav-group-dashboard">
      <div className="nav-group__content">
        <a className="nav__link" href={href}>
          <span className="nav__link-label">🏠 Dashboard</span>
        </a>
      </div>
    </div>
  )
}

export default DashboardNavLink
