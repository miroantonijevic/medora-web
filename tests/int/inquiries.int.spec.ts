import { getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import config from '@/payload.config'
import { sendInquiryEmails } from '@/collections/Inquiries/hooks/sendInquiryEmails'
import type { Inquiry } from '@/payload-types'
import { decrypt, encrypt } from '@/utilities/encryption'

const sendMail = vi.fn()
const createTransport = vi.fn(() => ({ sendMail }))
vi.mock('nodemailer', () => ({
  default: { createTransport: (...args: unknown[]) => createTransport(...(args as [])) },
}))

const TEST_NAME_PREFIX = 'vitest-inquiry-'
let payload: Payload
const createdIds: number[] = []

const validInquiry = (overrides: Record<string, unknown> = {}) => ({
  name: `${TEST_NAME_PREFIX}${Math.random().toString(36).slice(2, 8)}`,
  email: 'guest@example.com',
  ...overrides,
})

// Public submission: no logged-in user, access control enforced.
async function submitAsVisitor(data: Record<string, unknown>) {
  const doc = await payload.create({
    collection: 'inquiries',
    data: data as never,
    overrideAccess: false,
  })
  createdIds.push(doc.id)
  return doc
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  if (createdIds.length > 0) {
    await payload.delete({ collection: 'inquiries', where: { id: { in: createdIds } } })
  }
})

describe('inquiry access control', () => {
  it('lets an anonymous visitor submit the form, with sensible defaults', async () => {
    const doc = await submitAsVisitor(validInquiry())

    expect(doc.status).toBe('new')
    expect(doc.adults).toBe(2)
    expect(doc.childrenYoung).toBe(0)
    expect(doc.childrenOld).toBe(0)
  })

  it('rejects a submission without name or email', async () => {
    await expect(
      payload.create({
        collection: 'inquiries',
        data: { email: 'guest@example.com' } as never,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'inquiries',
        data: { name: `${TEST_NAME_PREFIX}no-email` } as never,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'inquiries',
        data: validInquiry({ email: 'not-an-email' }) as never,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('does not let an anonymous visitor read inquiries', async () => {
    await submitAsVisitor(validInquiry())

    await expect(payload.find({ collection: 'inquiries', overrideAccess: false })).rejects.toThrow()
  })

  it('does not let a logged-in user create one by hand', async () => {
    const admin = { id: 1, collection: 'users', role: 'admin', email: 'a@example.com' }

    await expect(
      payload.create({
        collection: 'inquiries',
        data: validInquiry() as never,
        overrideAccess: false,
        user: admin as never,
      }),
    ).rejects.toThrow()
  })
})

describe('inquiry honeypot', () => {
  it('marks a submission as spam when the hidden field is filled in', async () => {
    const doc = await submitAsVisitor(validInquiry({ website: 'http://spam.example' }))

    expect(doc.status).toBe('spam')
  })

  it('does not let a visitor choose a non-spam status for a honeypot hit', async () => {
    const doc = await submitAsVisitor(validInquiry({ website: 'x', status: 'new' }))

    expect(doc.status).toBe('spam')
  })
})

describe('sendInquiryEmails', () => {
  const settings = {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: 'mailer@example.com',
    smtpPassword: encrypt('smtp-secret'),
    fromEmail: 'info@example.com',
    fromName: 'Medora',
    inquiryRecipients: 'reservations@example.com, sales@example.com ',
  }

  const doc = {
    id: 1,
    name: 'Ana Horvat',
    email: 'ana@example.com',
    adults: 2,
    status: 'new',
    message: 'Sea view please',
  } as unknown as Inquiry

  const makeReq = (globalValue: unknown) => {
    const logger = { warn: vi.fn(), error: vi.fn() }
    const req = {
      payload: { findGlobal: vi.fn(async () => globalValue), logger },
    } as unknown as PayloadRequest
    return { req, logger }
  }

  const run = (inquiry: Inquiry, operation: 'create' | 'update', req: PayloadRequest) =>
    sendInquiryEmails({ doc: inquiry, operation, req } as never)

  afterEach(() => {
    sendMail.mockReset()
    createTransport.mockClear()
  })

  it('emails the hotel recipients and the guest, using the decrypted SMTP password', async () => {
    const { req } = makeReq(settings)

    await run(doc, 'create', req)

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        auth: { user: 'mailer@example.com', pass: 'smtp-secret' },
      }),
    )
    expect(sendMail).toHaveBeenCalledTimes(2)
    expect(sendMail.mock.calls[0]![0]).toMatchObject({
      to: 'reservations@example.com,sales@example.com',
      subject: 'New inquiry from Ana Horvat',
    })
    expect(sendMail.mock.calls[1]![0]).toMatchObject({ to: 'ana@example.com' })
    expect(sendMail.mock.calls[1]![0].text).toContain('Sea view please')
  })

  it('sends nothing for spam', async () => {
    const { req } = makeReq(settings)

    await run({ ...doc, status: 'spam' } as Inquiry, 'create', req)

    expect(sendMail).not.toHaveBeenCalled()
  })

  it('sends nothing when an inquiry is edited later', async () => {
    const { req } = makeReq(settings)

    await run(doc, 'update', req)

    expect(sendMail).not.toHaveBeenCalled()
  })

  it('warns and skips when SMTP is not configured', async () => {
    const { req, logger } = makeReq({ smtpHost: 'smtp.example.com' })

    await run(doc, 'create', req)

    expect(sendMail).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalled()
  })

  it('logs and does not throw when sending fails, so the inquiry is still saved', async () => {
    sendMail.mockRejectedValue(new Error('SMTP down'))
    const { req, logger } = makeReq(settings)

    await expect(run(doc, 'create', req)).resolves.toBe(doc)

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('SMTP down'))
  })
})

describe('encryption', () => {
  it('round-trips a secret and rejects tampered data', () => {
    const cipherText = encrypt('smtp-secret')

    expect(cipherText).not.toContain('smtp-secret')
    expect(decrypt(cipherText)).toBe('smtp-secret')

    const [iv, tag, data] = cipherText.split('.')
    const tampered = [
      iv,
      tag,
      Buffer.from('x' + Buffer.from(data!, 'base64').toString('latin1')).toString('base64'),
    ].join('.')
    expect(() => decrypt(tampered)).toThrow()
  })
})
