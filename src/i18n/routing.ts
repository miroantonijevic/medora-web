import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'hr', 'de'],
  defaultLocale: 'en',
  localePrefix: 'always',
})
