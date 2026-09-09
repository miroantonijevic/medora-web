import type { Field } from 'payload'

export const layoutSettings = (): Field => ({
  name: 'layoutSettings',
  type: 'group',
  label: 'Layout & Spacing',
  admin: {
    initCollapsed: true,
    description:
      'Optional visual presentation controls for this block. Leave as default for the standard look.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'width',
          type: 'select',
          defaultValue: 'standard',
          admin: { width: '50%' },
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Narrow', value: 'narrow' },
            { label: 'Full width', value: 'full' },
          ],
        },
        {
          name: 'spacing',
          type: 'select',
          defaultValue: 'standard',
          admin: { width: '50%' },
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'small' },
            { label: 'Standard', value: 'standard' },
            { label: 'Large', value: 'large' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'alignment',
          type: 'select',
          defaultValue: 'left',
          admin: { width: '50%' },
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
        },
        {
          name: 'background',
          type: 'select',
          defaultValue: 'none',
          admin: { width: '50%' },
          options: [
            { label: 'None', value: 'none' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
        },
      ],
    },
  ],
})
