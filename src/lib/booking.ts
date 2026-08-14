export type BookingInput = {
  propertySlug?: string
  roomSlug?: string
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
    const subject = [input.propertySlug, input.roomSlug].filter(Boolean).join(' / ')

    return {
      href: `mailto:reservations@medorahotels.com?subject=${encodeURIComponent(subject || 'Booking inquiry')}`,
      label: 'Contact us to book',
    }
  }
}

export const bookingService: BookingService = new ContactBookingService()
