import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

// Derives a stable 32-byte key from PAYLOAD_SECRET so no extra env var is required.
function getKey(): Buffer {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is required to encrypt/decrypt settings')
  }
  return crypto.scryptSync(secret, 'medora-email-settings', 32)
}

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv, authTag, encrypted].map((buf) => buf.toString('base64')).join('.')
}

export function decrypt(cipherText: string): string {
  const [ivB64, tagB64, dataB64] = cipherText.split('.')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid ciphertext format')
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
