export type RoomGroup = {
  slug: string
  categories: string[]
  names: { en: string; hr: string; de: string }
}

export const ROOM_GROUPS: RoomGroup[] = [
  {
    slug: 'rooms-suites',
    categories: ['room', 'suite'],
    names: { en: 'Rooms & Suites', hr: 'Sobe i suiteovi', de: 'Zimmer & Suiten' },
  },
  {
    slug: 'cabins',
    categories: ['cabin'],
    names: { en: 'Accommodation', hr: 'Smještajne jedinice', de: 'Unterkünfte' },
  },
  {
    slug: 'villas',
    categories: ['villa'],
    names: { en: 'Villas', hr: 'Vile', de: 'Villen' },
  },
  {
    slug: 'tents',
    categories: ['tent'],
    names: { en: 'Tents', hr: 'Šatori', de: 'Zelte' },
  },
]

export function groupNameForLocale(group: RoomGroup, locale: string): string {
  return group.names[locale as keyof typeof group.names] ?? group.names.en
}
