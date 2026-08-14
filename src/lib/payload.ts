import configPromise from '@payload-config'
import { getPayload } from 'payload'

let payloadPromise: ReturnType<typeof getPayload> | null = null

export const getPayloadClient = () => {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config: configPromise })
  }

  return payloadPromise
}
