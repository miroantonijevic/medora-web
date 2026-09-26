import type { Payload } from 'payload'
import React from 'react'

import { findMediaUsages } from '@/lib/findMediaUsages'

// Renders under the title on both the Media list (briefly, before the redirect to the
// custom Media Library) and edit views (registered via Media.admin.components.Description).
// Keeps the original collection description, and adds a "Used in" list on the edit view.
export const MediaDescription: React.FC<{ id?: number | string; payload: Payload }> = async ({
  id,
  payload,
}) => {
  const usages = id ? await findMediaUsages(payload, id) : []

  return (
    <div className="medora-media-description">
      <p className="medora-media-description__text">
        All uploaded images and files. Referenced by properties, rooms, offers and the homepage.
      </p>
      {id && (
        <div className="medora-media-description__used-in">
          <span
            className="medora-media-description__label"
            title="The pages/records that link to this file"
          >
            Appears on:
          </span>
          {usages.length === 0 ? (
            <span className="medora-media-description__empty">Nothing yet — safe to delete</span>
          ) : (
            <ul className="medora-media-description__list">
              {usages.map((usage) => (
                <li key={usage.href}>
                  <a href={usage.href}>{usage.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <style>{`
        .medora-media-description__used-in {
          margin-top: 0.6em;
          padding-top: 0.6em;
          border-top: 1px solid var(--theme-elevation-100);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.6em;
        }
        .medora-media-description__label {
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--theme-elevation-400);
        }
        .medora-media-description__empty {
          color: var(--theme-elevation-400);
          font-size: 0.9rem;
        }
        .medora-media-description__list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
        }
        .medora-media-description__list li {
          background: var(--theme-elevation-100);
          border-radius: var(--style-radius-s, 4px);
          padding: 0.2em 0.7em;
          font-size: 0.9rem;
        }
        .medora-media-description__list a {
          text-decoration: none;
        }
        .medora-media-description__list a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

export default MediaDescription
