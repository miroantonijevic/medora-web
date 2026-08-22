'use client'

import { useConfig } from '@payloadcms/ui'
import React, { useState } from 'react'

const NavLink: React.FC = () => {
  const { config } = useConfig()
  const href = `${config.routes.admin}/media-library`
  const [open, setOpen] = useState(true)

  return (
    <div className="nav-group" id="nav-group-media-library">
      <button
        className={`nav-group__toggle nav-group__toggle--${open ? 'open' : 'closed'}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <div className="nav-group__label">Media & Files</div>
        <div className="nav-group__indicator">
          <svg
            className="icon icon--chevron nav-group__indicator"
            height="100%"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 20 20"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path className="stroke" d="M14 8L10 12L6 8" strokeLinecap="square" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="nav-group__content">
          <a className="nav__link" href={href}>
            <span className="nav__link-label">Media Library</span>
          </a>
        </div>
      )}
    </div>
  )
}

export default NavLink
