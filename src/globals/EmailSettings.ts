import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { encrypt } from '../utilities/encryption'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'Email Settings',
  admin: {
    group: 'Website Settings',
    description: 'SMTP credentials and recipients used to send inquiry notification emails.',
  },
  access: {
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'smtpHost',
      type: 'text',
    },
    {
      name: 'smtpPort',
      type: 'number',
      defaultValue: 587,
    },
    {
      name: 'smtpSecure',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Enable for implicit TLS (typically port 465).',
      },
    },
    {
      name: 'smtpUser',
      type: 'text',
    },
    {
      name: 'smtpPassword',
      type: 'text',
      admin: {
        description:
          'Stored encrypted in the database. Once saved, this field shows ciphertext, not the plaintext password — enter a new value to change it.',
      },
      hooks: {
        beforeChange: [
          ({ value, originalDoc }) => {
            if (!value) return value
            // Unchanged from what's stored (already ciphertext) — don't re-encrypt.
            if (value === originalDoc?.smtpPassword) return value
            return encrypt(value)
          },
        ],
      },
    },
    {
      name: 'fromName',
      type: 'text',
      defaultValue: 'Medora Hotels',
    },
    {
      name: 'fromEmail',
      type: 'email',
    },
    {
      name: 'inquiryRecipients',
      type: 'text',
      admin: {
        description:
          'Comma-separated list of email addresses that receive new inquiry notifications, e.g. reservations@medorahotels.com, info@medorahotels.com',
      },
    },
  ],
}
