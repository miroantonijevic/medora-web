import type { useTranslations } from 'next-intl'

/**
 * Tells the guest, before the step where they pay or enter details, that card data is handled
 * securely. The wording and the "Secured by" names must match what the payment providers
 * actually deliver (see the production checklist in REPO_CONTEXT.md).
 */
export function SecurityNotice({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        marginTop: 14,
        padding: '10px 12px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 10,
        color: '#166534',
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: 1 }}
      >
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <div>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>{t('securityTitle')}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11.5, lineHeight: 1.45 }}>{t('securityText')}</p>
        <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 600 }}>{t('securedBy')}</p>
      </div>
    </div>
  )
}
