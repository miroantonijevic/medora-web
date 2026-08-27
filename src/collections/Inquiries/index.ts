import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { sendInquiryEmails } from './hooks/sendInquiryEmails'

export const Inquiries: CollectionConfig<'inquiries'> = {
  slug: 'inquiries',
  labels: {
    singular: 'Inquiry',
    plural: 'Inquiries',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Guest Inquiries',
    defaultColumns: ['name', 'status', 'arrival', 'roomPreference', 'createdAt'],
    description: 'Quick Inquiry form submissions from the website.',
    defaultSort: '-createdAt',
    // No field here is localized and this isn't a REST-consumer-facing collection.
    hideAPIURL: true,
    disableCopyToLocale: true,
    components: {
      beforeListTable: ['@/collections/Inquiries/components/StatsBar'],
    },
  },
  access: {
    // Public form submissions are unauthenticated; logged-in admins can't manually create one.
    create: ({ req: { user } }) => !user,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'summary',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/Inquiries/components/InquiryHeaderBanner',
        },
      },
    },
    {
      name: 'guestDetailsHeading',
      type: 'ui',
      label: 'Guest Details',
      admin: {
        components: {
          Field: '@/collections/Inquiries/components/SectionHeading',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        className: 'inquiry-field',
        components: {
          Cell: '@/collections/Inquiries/components/GuestCell',
        },
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        className: 'inquiry-field',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        className: 'inquiry-field',
      },
    },
    {
      name: 'stayDetailsHeading',
      type: 'ui',
      label: 'Stay Details',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/collections/Inquiries/components/SectionHeading',
        },
      },
    },
    {
      name: 'arrival',
      type: 'date',
      admin: {
        position: 'sidebar',
        className: 'inquiry-field',
        components: {
          Cell: '@/collections/Inquiries/components/StayCell',
        },
      },
    },
    {
      name: 'departure',
      type: 'date',
      admin: {
        position: 'sidebar',
        className: 'inquiry-field',
      },
    },
    {
      name: 'adults',
      type: 'number',
      defaultValue: 2,
      admin: {
        position: 'sidebar',
        className: 'inquiry-field',
      },
    },
    {
      name: 'children',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        className: 'inquiry-field',
      },
    },
    {
      name: 'roomPreference',
      type: 'text',
      admin: {
        position: 'sidebar',
        className: 'inquiry-field',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      admin: {
        className: 'inquiry-field',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed', value: 'closed' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: {
        position: 'sidebar',
        components: {
          Cell: '@/collections/Inquiries/components/StatusCell',
          Field: '@/collections/Inquiries/components/StatusField',
        },
      },
    },
    {
      // Honeypot: real visitors never see or fill this in; bots often do.
      name: 'website',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      // Re-declared to override the auto-generated timestamp field's list Cell.
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
        components: {
          Cell: '@/collections/Inquiries/components/SubmittedCell',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.website) {
          return { ...data, status: 'spam' }
        }
        return data
      },
    ],
    afterChange: [sendInquiryEmails],
  },
}
