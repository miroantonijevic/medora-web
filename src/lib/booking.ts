export type BookingInput = {
  propertySlug?: string
  roomSlug?: string
  locale: string
}

export type BookingLink = {
  href: string
  label: string
}

export interface BookingService {
  getBookingLink(input: BookingInput): BookingLink
}

export class ContactBookingService implements BookingService {
  getBookingLink(input: BookingInput): BookingLink {
    const params = new URLSearchParams()
    if (input.propertySlug) params.set('property', input.propertySlug)
    if (input.roomSlug) params.set('room', input.roomSlug)
    const query = params.toString()

    return {
      href: `/${input.locale}/inquiry${query ? `?${query}` : ''}`,
      label: 'Contact us to book',
    }
  }
}

export const bookingService: BookingService = new ContactBookingService()
