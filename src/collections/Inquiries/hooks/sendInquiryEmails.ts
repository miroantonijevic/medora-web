import type { CollectionAfterChangeHook } from 'payload'

import nodemailer from 'nodemailer'

import type { Inquiry } from '../../../payload-types'
import { decrypt } from '../../../utilities/encryption'

export const sendInquiryEmails: CollectionAfterChangeHook<Inquiry> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create' || doc.status === 'spam') return doc

  try {
    const settings = await req.payload.findGlobal({ slug: 'email-settings' })

    if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPassword) {
      req.payload.logger.warn('Email settings are not fully configured; skipping inquiry emails')
      return doc
    }

    const transport = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort ?? 587,
      secure: Boolean(settings.smtpSecure),
      auth: {
        user: settings.smtpUser,
        pass: decrypt(settings.smtpPassword),
      },
    })

    const fromAddress = settings.fromEmail || settings.smtpUser
    const fromHeader = settings.fromName ? `"${settings.fromName}" <${fromAddress}>` : fromAddress

    const recipients = (settings.inquiryRecipients ?? '')
      .split(',')
      .map((address) => address.trim())
      .filter(Boolean)

    const summary = [
      `Name: ${doc.name}`,
      `Email: ${doc.email}`,
      doc.phone && `Phone: ${doc.phone}`,
      doc.arrival && `Arrival: ${doc.arrival}`,
      doc.departure && `Departure: ${doc.departure}`,
      `Adults: ${doc.adults ?? ''}`,
      `Children: ${doc.children ?? ''}`,
      doc.roomPreference && `Room/Unit: ${doc.roomPreference}`,
      doc.message && `Message: ${doc.message}`,
    ]
      .filter(Boolean)
      .join('\n')

    if (recipients.length > 0) {
      await transport.sendMail({
        from: fromHeader,
        to: recipients.join(','),
        subject: `New inquiry from ${doc.name}`,
        text: summary,
      })
    }

    await transport.sendMail({
      from: fromHeader,
      to: doc.email,
      subject: 'We received your inquiry — Medora Hotels',
      text: `Hi ${doc.name},\n\nThanks for reaching out to Medora Hotels. We received your inquiry and will get back to you shortly.\n\n${summary}`,
    })
  } catch (err) {
    req.payload.logger.error(
      `Failed to send inquiry emails: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return doc
}
