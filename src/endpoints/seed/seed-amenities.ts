import type { Payload } from 'payload'

const GROUPS = [
  {
    slug: 'wellness',
    order: 1,
    en: { name: 'Wellness', description: 'Relax and recharge with our world-class spa and wellness facilities, all included free of charge.' },
    hr: { name: 'Wellness', description: 'Opustite se i napunite energijom u našim vrhunskim spa i wellness sadržajima, uključenim besplatno.' },
    de: { name: 'Wellness', description: 'Entspannen und erholen Sie sich in unseren erstklassigen Spa- und Wellnesseinrichtungen – kostenlos inklusive.' },
  },
  {
    slug: 'dining-bars',
    order: 2,
    en: { name: 'Dining & Bars', description: 'From Mediterranean fine dining to casual cocktail bars overlooking the Adriatic — every meal is an experience.' },
    hr: { name: 'Hrana i piće', description: 'Od mediteranske gastronomije do opuštenih koktel barova s pogledom na Jadran — svaki obrok je doživljaj.' },
    de: { name: 'Essen & Bars', description: 'Von mediterraner Gourmetküche bis zu entspannten Cocktailbars mit Blick auf die Adria — jedes Essen ist ein Erlebnis.' },
  },
  {
    slug: 'active-vacation',
    order: 3,
    en: { name: 'Active Vacation', description: 'Fill your holiday with activities — from Biokovo hikes and cycling trails to the Medora Fit programme.' },
    hr: { name: 'Aktivni odmor', description: 'Ispunite odmor aktivnostima — od pješačenja na Biokovu i biciklističkih staza do Medora Fit programa.' },
    de: { name: 'Aktiver Urlaub', description: 'Füllen Sie Ihren Urlaub mit Aktivitäten — von Biokovo-Wanderungen und Radwegen bis zum Medora Fit Programm.' },
  },
]

const AMENITIES = [
  // ── Wellness ──────────────────────────────────────────────────────────────
  {
    groupSlug: 'wellness',
    slug: 'spa',
    order: 1,
    en: { name: 'Spa (9th Floor)', tagline: "Stress doesn't live here anymore", openingHours: '09:00 – 21:00', location: '9th Floor', highlights: ['Finnish sauna', 'Infrared sauna', 'Whirlpool', 'Relax zone'] },
    hr: { name: 'Spa (9. kat)', tagline: 'Stres ovdje ne stanuje', openingHours: '09:00 – 21:00', location: '9. kat', highlights: ['Finska sauna', 'Infracrvena sauna', 'Jacuzzi', 'Zona opuštanja'] },
    de: { name: 'Spa (9. Etage)', tagline: 'Stress wohnt hier nicht', openingHours: '09:00 – 21:00', location: '9. Etage', highlights: ['Finnische Sauna', 'Infrarotsauna', 'Whirlpool', 'Ruheraum'] },
  },
  {
    groupSlug: 'wellness',
    slug: 'massages',
    order: 2,
    en: { name: 'Massages', tagline: 'Professional treatments for body and soul', openingHours: '08:30 – 18:30 (or on request)', location: 'Spa, 9th Floor', highlights: ['Relaxation massage', 'Sports massage', 'Aromatherapy'] },
    hr: { name: 'Masaže', tagline: 'Profesionalni tretmani za tijelo i dušu', openingHours: '08:30 – 18:30 (ili na zahtjev)', location: 'Spa, 9. kat', highlights: ['Masaža opuštanja', 'Sportska masaža', 'Aromaterapija'] },
    de: { name: 'Massagen', tagline: 'Professionelle Behandlungen für Körper und Seele', openingHours: '08:30 – 18:30 (oder auf Anfrage)', location: 'Spa, 9. Etage', highlights: ['Entspannungsmassage', 'Sportmassage', 'Aromatherapie'] },
  },
  {
    groupSlug: 'wellness',
    slug: 'pools-beaches',
    order: 3,
    en: { name: 'Pools & Beaches', tagline: 'Your slice of the Adriatic', openingHours: '08:00 – 20:00', highlights: ['Heated outdoor pools', 'Baby pool', 'Free beach chairs and umbrellas', 'Beach towels included'] },
    hr: { name: 'Bazeni i plaže', tagline: 'Vaš komadić Jadrana', openingHours: '08:00 – 20:00', highlights: ['Grijani vanjski bazeni', 'Bazen za bebe', 'Besplatne ležaljke i suncobrani', 'Ručnici uključeni'] },
    de: { name: 'Pools & Strände', tagline: 'Ihr Stück Adria', openingHours: '08:00 – 20:00', highlights: ['Beheizte Außenpools', 'Babypool', 'Kostenlose Liegestühle und Sonnenschirme', 'Handtücher inklusive'] },
  },
  {
    groupSlug: 'wellness',
    slug: 'fitness',
    order: 4,
    en: { name: 'Fitness', tagline: 'Top quality gear with a sea view', openingHours: '07:00 – 21:00', highlights: ['State-of-the-art equipment', 'Sea and island views', 'Personal trainer on request'] },
    hr: { name: 'Fitness', tagline: 'Vrhunska oprema s pogledom na more', openingHours: '07:00 – 21:00', highlights: ['Moderna oprema', 'Pogled na more i otoke', 'Osobni trener na zahtjev'] },
    de: { name: 'Fitness', tagline: 'Erstklassige Geräte mit Meerblick', openingHours: '07:00 – 21:00', highlights: ['Modernste Ausstattung', 'Meer- und Inselblick', 'Personal Trainer auf Anfrage'] },
  },
  // ── Dining & Bars ─────────────────────────────────────────────────────────
  {
    groupSlug: 'dining-bars',
    slug: 'taste-the-indigo',
    order: 1,
    en: { name: 'Taste the Indigo', tagline: 'Mediterranean flavours, Adriatic views', highlights: ['À la carte dinner', 'Fish, meat & vegetarian menus', 'Sea view terrace'] },
    hr: { name: 'Taste the Indigo', tagline: 'Mediteranski okusi, pogled na Jadran', highlights: ['À la carte večera', 'Ribni, mesni i vegetarijanski jelovnici', 'Terasa s pogledom na more'] },
    de: { name: 'Taste the Indigo', tagline: 'Mediterrane Aromen, Adriablick', highlights: ['À la carte Abendessen', 'Fisch-, Fleisch- und Vegetariermenüs', 'Terrasse mit Meerblick'] },
  },
  {
    groupSlug: 'dining-bars',
    slug: 'juice-cocktail-bar',
    order: 2,
    en: { name: 'Juice / Cocktail Bar', tagline: 'Sip the sunset', highlights: ['Fresh juices by day', 'Cocktails by night', 'Poolside location'] },
    hr: { name: 'Juice / Cocktail Bar', tagline: 'Popijte zalazak sunca', highlights: ['Svježi sokovi danju', 'Kokteli noću', 'Lokacija uz bazen'] },
    de: { name: 'Juice / Cocktail Bar', tagline: 'Den Sonnenuntergang genießen', highlights: ['Frische Säfte am Tag', 'Cocktails am Abend', 'Lage am Pool'] },
  },
  {
    groupSlug: 'dining-bars',
    slug: 'lobby-bar',
    order: 3,
    en: { name: 'Lobby Bar', tagline: 'Panoramic views over Podgora', highlights: ['360° coastal views', 'Morning coffee to evening drinks', 'Live music evenings'] },
    hr: { name: 'Lobby Bar', tagline: 'Panoramski pogled na Podgoru', highlights: ['360° pogled na obalu', 'Od jutarnje kave do večernjih pića', 'Večeri uz live glazbu'] },
    de: { name: 'Lobby Bar', tagline: 'Panoramablick über Podgora', highlights: ['360° Küstenblick', 'Vom Morgenkaffee bis zum Abenddrink', 'Live-Musik-Abende'] },
  },
  // ── Active Vacation ───────────────────────────────────────────────────────
  {
    groupSlug: 'active-vacation',
    slug: 'biokovo-excursions',
    order: 1,
    en: { name: 'Biokovo Excursions', tagline: 'Walk above the clouds on Skywalk Biokovo', highlights: ['Skywalk Biokovo glass platform', 'Guided mountain hikes', 'Included free for direct bookers'] },
    hr: { name: 'Izleti na Biokovo', tagline: 'Hodajte iznad oblaka na Skywalk Biokovu', highlights: ['Staklena platforma Skywalk Biokovo', 'Vođeni planinski pohodi', 'Besplatno za direktne rezervacije'] },
    de: { name: 'Biokovo-Ausflüge', tagline: 'Über den Wolken auf dem Skywalk Biokovo', highlights: ['Glasplattform Skywalk Biokovo', 'Geführte Bergwanderungen', 'Kostenlos für Direktbucher'] },
  },
  {
    groupSlug: 'active-vacation',
    slug: 'boat-trips',
    order: 2,
    en: { name: 'Boat Trips', tagline: 'Discover the islands of the Makarska Riviera', highlights: ['Island hopping tours', 'Included free for direct bookers', 'Private charter available'] },
    hr: { name: 'Izleti brodom', tagline: 'Otkrijte otoke Makarske rivijere', highlights: ['Obilazak otoka', 'Besplatno za direktne rezervacije', 'Privatni čarter dostupan'] },
    de: { name: 'Bootsausflüge', tagline: 'Entdecken Sie die Inseln der Makarska Riviera', highlights: ['Inseltour', 'Kostenlos für Direktbucher', 'Privater Charter verfügbar'] },
  },
  {
    groupSlug: 'active-vacation',
    slug: 'medora-fit',
    order: 3,
    en: { name: 'Medora Fit', tagline: 'Stay in shape while on holiday', highlights: ['Daily group classes', 'Aqua aerobics', 'Yoga sessions', 'Cycling & hiking trails nearby'] },
    hr: { name: 'Medora Fit', tagline: 'Ostanite u formi i na odmoru', highlights: ['Dnevne grupne lekcije', 'Aqua aerobik', 'Yoga sesije', 'Biciklističke i planinarske staze u blizini'] },
    de: { name: 'Medora Fit', tagline: 'Im Urlaub in Form bleiben', highlights: ['Tägliche Gruppenkurse', 'Wassergymnastik', 'Yoga-Sessions', 'Rad- und Wanderwege in der Nähe'] },
  },
]

type LocalisedAmenity = {
  name: string
  tagline?: string
  openingHours?: string
  location?: string
  highlights?: string[]
}

export async function seedAmenities({ payload }: { payload: Payload }) {
  payload.logger.info('Seeding amenity groups and amenities...')

  // Clear existing data
  const existingAmenities = await payload.find({ collection: 'amenities', limit: 200, depth: 0 })
  for (const a of existingAmenities.docs) {
    await payload.delete({ collection: 'amenities', id: a.id as number })
  }
  const existingGroups = await payload.find({ collection: 'amenity-groups', limit: 50, depth: 0 })
  for (const g of existingGroups.docs) {
    await payload.delete({ collection: 'amenity-groups', id: g.id as number })
  }
  payload.logger.info('  Cleared existing amenity data.')

  // Create groups
  const groupIdMap: Record<string, number> = {}
  for (const group of GROUPS) {
    const doc = await payload.create({
      collection: 'amenity-groups',
      locale: 'en',
      data: { name: group.en.name, slug: group.slug, description: group.en.description, order: group.order },
    })
    const id = doc.id as number
    groupIdMap[group.slug] = id
    await payload.update({ collection: 'amenity-groups', id, locale: 'hr', data: { name: group.hr.name, description: group.hr.description } })
    await payload.update({ collection: 'amenity-groups', id, locale: 'de', data: { name: group.de.name, description: group.de.description } })
    payload.logger.info(`  Created group: ${group.en.name}`)
  }

  // Create amenities
  for (const item of AMENITIES) {
    const groupId = groupIdMap[item.groupSlug]
    if (!groupId) continue

    const toHighlights = (loc: LocalisedAmenity) => (loc.highlights ?? []).map((text) => ({ text }))

    const doc = await payload.create({
      collection: 'amenities',
      locale: 'en',
      data: {
        name: item.en.name,
        slug: item.slug,
        group: groupId,
        order: item.order,
        tagline: item.en.tagline,
        openingHours: item.en.openingHours,
        location: item.en.location,
        highlights: toHighlights(item.en),
      },
    })
    const id = doc.id as number
    await payload.update({ collection: 'amenities', id, locale: 'hr', data: { name: item.hr.name, tagline: item.hr.tagline, openingHours: item.hr.openingHours, location: item.hr.location, highlights: toHighlights(item.hr) } })
    await payload.update({ collection: 'amenities', id, locale: 'de', data: { name: item.de.name, tagline: item.de.tagline, openingHours: item.de.openingHours, location: item.de.location, highlights: toHighlights(item.de) } })
    payload.logger.info(`  Created amenity: ${item.en.name}`)
  }

  payload.logger.info('Amenity groups and amenities seeded.')
}
