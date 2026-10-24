import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

/** Inquiries created by e2e tests carry this prefix in their name, so they can be found and removed. */
export const E2E_INQUIRY_PREFIX = 'e2e-inquiry-'

/**
 * A submitted inquiry emails the hotel and the guest when SMTP is configured. The e2e tests must
 * never do that, so the inquiry test skips itself when the email settings are filled in.
 */
export async function isSmtpConfigured(): Promise<boolean> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'email-settings' })

  return Boolean(settings?.smtpHost && settings?.smtpUser && settings?.smtpPassword)
}

export async function findE2eInquiries() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'inquiries',
    where: { name: { like: E2E_INQUIRY_PREFIX } },
    limit: 50,
    depth: 0,
  })

  return docs
}

export async function deleteE2eInquiries(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'inquiries',
    where: { name: { like: E2E_INQUIRY_PREFIX } },
  })
}
