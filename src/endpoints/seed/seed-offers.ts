import type { Payload } from 'payload'

async function uploadImage(
  payload: Payload,
  filename: string,
  url: string,
  alt: string,
): Promise<number | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0]!.id as number
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const mimetype = res.headers.get('content-type') ?? 'image/jpeg'
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data: buffer, mimetype, name: filename, size: buffer.length },
    })
    payload.logger.info(`  Uploaded: ${filename} => id=${doc.id}`)
    return doc.id as number
  } catch (e) {
    payload.logger.warn(`  Failed to upload ${filename}: ${e}`)
    return null
  }
}

type Run = string | { text: string; bold?: boolean; italic?: boolean; underline?: boolean }
type ParaPart = Run | 'BR'

function textNode(run: Run) {
  const text = typeof run === 'string' ? run : run.text
  let format = 0
  if (typeof run !== 'string') {
    if (run.bold) format |= 1
    if (run.italic) format |= 2
    if (run.underline) format |= 8
  }
  return { detail: 0, format, mode: 'normal', style: '', text, type: 'text', version: 1 }
}

// Paragraph node; pass 'BR' between parts for a line break within the same paragraph.
function paragraph(...parts: ParaPart[]) {
  return {
    children: parts.map((part) =>
      part === 'BR' ? { type: 'linebreak', version: 1 } : textNode(part),
    ),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'paragraph',
    version: 1,
  }
}

// Real bullet list (ul/li), matching the shape used by lexBullets() in seed-pages.ts.
// Items are usually a single string, but can be an array of runs for mixed inline formatting.
function bulletList(items: (Run | Run[])[]) {
  return {
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    children: items.map((item, i) => ({
      type: 'listitem',
      value: i + 1,
      children: (Array.isArray(item) ? item : [item]).map(textNode),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function bold(text: string): Run {
  return { text, bold: true }
}
function boldUnderline(text: string): Run {
  return { text, bold: true, underline: true }
}

type Block = ReturnType<typeof paragraph> | ReturnType<typeof bulletList>

function buildRichText(blocks: Block[]) {
  return {
    root: {
      children: blocks,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

async function uploadGalleryImages(
  payload: Payload,
  folder: string,
  files: string[],
  filePrefix: string,
  alt: string,
): Promise<number[]> {
  const ids: number[] = []
  const encodedFolder = folder
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  for (let i = 0; i < files.length; i++) {
    const url = `https://medorahotels.com/UserDocsImages/${encodedFolder}/${encodeURIComponent(files[i]!)}`
    const filename = `${filePrefix}-${i + 1}.jpg`
    const id = await uploadImage(payload, filename, url, alt)
    if (id) ids.push(id)
  }
  return ids
}

type OfferLocale = { title: string; description: Block[] }

type OfferSeed = {
  slug: string
  imageUrl: string
  imageFile: string
  propertySlug: 'medora-auri' | 'luxury-camp-orbis'
  // An offer without dates is always valid; the offers list hides offers whose validUntil has passed.
  validFrom?: string
  validUntil?: string
  galleryFolder?: string
  galleryFiles?: string[]
  en: OfferLocale
  // Optional: a locale without text falls back to English (Payload localization fallback).
  hr?: OfferLocale
  de?: OfferLocale
}

const OFFERS: OfferSeed[] = [
  {
    slug: 'book-directly-and-feel-safe',
    imageUrl:
      'https://medorahotels.com/UserDocsImages//galerije/Desktop novo/book directly ponuda covid mobile.jpg',
    imageFile: 'offer-book-directly.jpg',
    propertySlug: 'medora-auri',
    validFrom: '2026-06-20',
    validUntil: '2026-09-01',
    en: {
      title: 'Book directly and feel safe with us!',
      description: [
        paragraph(
          'Congratulations, You have discovered your dream vacation place, a pearl of the adriatic coast on Makarska Riviera! 😊',
        ),
        paragraph('Booking directly with us will give you one of the following benefits:'),
        paragraph(
          '👉 ',
          bold('Excursion of your choice'),
          ' - Choose a boat trip and explore the Adriatic islands or a trip to the mountain Biokovo and enjoy the green landscapes and the enchanting view from the sky promenade Skywalk',
        ),
        paragraph(
          'Valid for reservations made for period: ',
          bold('20.06. - 01.09.2026'),
          'BR',
          'Valid for bookings of ',
          bold('8+ nights'),
        ),
        paragraph(
          'Of course this is not everything! Below are few more reasons to consider your stay:',
        ),
        paragraph(
          '👉 ',
          bold('free cancellation'),
          ' policy up to ',
          bold('7 days'),
          ' before arrival',
          'BR',
          '👉 provided ',
          bold('free parking'),
          ' and ',
          bold('deck chairs on the beach and swimming pools'),
          'BR',
          '👉 ',
          bold('free use'),
          ' of the ',
          bold('sauna, whirlpool'),
          ' and ',
          bold('outdoor heated pools'),
          'BR',
          '👉 if you are coming with ',
          bold('your four-legged friend'),
          ', we have prepared a ',
          bold('bowl, toy and biscuits for him'),
        ),
        paragraph(
          'When you sign in at the front desk of the object in which you have booked accommodation, our friendly staff will give you detailed instructions on how to use these benefits.',
        ),
        paragraph('Your vacation can begin!'),
        paragraph(
          bold(
            'Medora reservation team is available for any additional information and inquiries by phone +385 21 601 701 or email reservations@medorahotels.com. Feel free to call us or email us and we will give you the best possible offer.',
          ),
        ),
        paragraph('We are here for you! ❤'),
      ],
    },
    hr: {
      title: 'Rezervirajte direktno i osje\u0107ajte se sigurno!',
      description: [
        paragraph(
          '\u010cestitamo, otkrili ste mjesto svojih snova za odmor, biser jadranske obale na Makarskoj rivijeri! 😊',
        ),
        paragraph('Rezervacijom direktno kod nas dobivate jednu od sljede\u0107ih pogodnosti:'),
        paragraph(
          '👉 ',
          bold('Izlet po va\u0161em izboru'),
          ' - odaberite izlet brodom i istra\u017eite jadranske otoke ili izlet na planinu Biokovo i u\u017eivajte u zelenim krajolicima i \u010darobnom pogledu s nebeske \u0161etnice Skywalk',
        ),
        paragraph(
          'Vrijedi za rezervacije napravljene za period: ',
          bold('20.06. - 01.09.2026.'),
          'BR',
          'Vrijedi za rezervacije od ',
          bold('8+ no\u0107i'),
        ),
        paragraph(
          'Naravno, to nije sve! U nastavku slijedi jo\u0161 nekoliko razloga za va\u0161 boravak:',
        ),
        paragraph(
          '👉 ',
          bold('besplatna politika otkazivanja'),
          ' do ',
          bold('7 dana'),
          ' prije dolaska',
          'BR',
          '👉 osiguran ',
          bold('besplatan parking'),
          ' i ',
          bold('le\u017ealice na pla\u017ei i uz bazene'),
          'BR',
          '👉 ',
          bold('besplatno kori\u0161tenje'),
          ' saune, whirlpoola i vanjskih grijanih bazena',
          'BR',
          '👉 ako dolazite sa svojim \u010detveronono\u017enim prijateljem, pripremili smo mu ',
          bold('zdjelicu, igra\u010dku i keksi\u0107e'),
        ),
        paragraph(
          'Kada se prijavite na recepciji objekta u kojem ste rezervirali smje\u0161taj, na\u0161e ljubazno osoblje dat \u0107e vam detaljne upute za kori\u0161tenje ovih pogodnosti.',
        ),
        paragraph('Va\u0161 odmor mo\u017ee po\u010deti!'),
        paragraph(
          bold(
            'Medora rezervacijski tim dostupan je za sve dodatne informacije i upite na telefon +385 21 601 701 ili e-mail reservations@medorahotels.com. Slobodno nas nazovite ili nam po\u0161aljite e-mail i dat \u0107emo vam najbolju mogu\u0107u ponudu.',
          ),
        ),
        paragraph('Tu smo za vas! ❤'),
      ],
    },
    de: {
      title: 'Direkt buchen und sich sicher f\u00fchlen!',
      description: [
        paragraph(
          'Herzlichen Gl\u00fcckwunsch, Sie haben Ihren Traumurlaubsort entdeckt, eine Perle der Adriak\u00fcste an der Makarska Riviera! 😊',
        ),
        paragraph('Wenn Sie direkt bei uns buchen, erhalten Sie einen der folgenden Vorteile:'),
        paragraph(
          '👉 ',
          bold('Ausflug nach Wahl'),
          ' - W\u00e4hlen Sie eine Bootsfahrt und erkunden Sie die Adriainseln oder einen Ausflug zum Berg Biokovo und genie\u00dfen Sie die gr\u00fcne Landschaft und den zauberhaften Blick von der Himmelspromenade Skywalk',
        ),
        paragraph(
          'G\u00fcltig f\u00fcr Buchungen im Zeitraum: ',
          bold('20.06. - 01.09.2026'),
          'BR',
          'G\u00fcltig ab ',
          bold('8 N\u00e4chten'),
        ),
        paragraph(
          'Das ist nat\u00fcrlich noch nicht alles! Hier sind noch ein paar weitere Gr\u00fcnde f\u00fcr Ihren Aufenthalt:',
        ),
        paragraph(
          '👉 ',
          bold('kostenlose Stornierung'),
          ' bis ',
          bold('7 Tage'),
          ' vor Anreise',
          'BR',
          '👉 kostenloses ',
          bold('Parken'),
          ' und ',
          bold('Liegest\u00fchle am Strand und an den Pools'),
          'BR',
          '👉 kostenlose ',
          bold('Nutzung'),
          ' von Sauna, Whirlpool und beheizten Au\u00dfenpools',
          'BR',
          '👉 wenn Sie mit Ihrem vierbeinigen Freund kommen, haben wir ',
          bold('Napf, Spielzeug und Kekse'),
          ' f\u00fcr ihn vorbereitet',
        ),
        paragraph(
          'Wenn Sie sich an der Rezeption des gebuchten Objekts anmelden, gibt Ihnen unser freundliches Personal detaillierte Anweisungen zur Nutzung dieser Vorteile.',
        ),
        paragraph('Ihr Urlaub kann beginnen!'),
        paragraph(
          bold(
            'Unser Reservierungsteam erreichen Sie f\u00fcr weitere Informationen und Anfragen unter +385 21 601 701 oder per E-Mail an reservations@medorahotels.com. Rufen Sie uns gerne an oder schreiben Sie uns eine E-Mail, und wir machen Ihnen das bestm\u00f6gliche Angebot.',
          ),
        ),
        paragraph('Wir sind f\u00fcr Sie da! ❤'),
      ],
    },
  },
  {
    slug: 'family-holiday-at-medora',
    imageUrl:
      'https://medorahotels.com/UserDocsImages//galerije/Family superior/Superior family room mobile.jpg',
    imageFile: 'offer-family-holiday.jpg',
    propertySlug: 'medora-auri',
    galleryFolder: 'galerije/dje\u010dji sadr\u017eaj',
    galleryFiles: [
      'Family room.jpg',
      'Play II.jpg',
      'Kids pool.jpg',
      'Family room VI.jpg',
      'Playground.jpg',
      'Family room III.jpg',
      'Play.jpg',
      'Kids buffet.jpg',
      'Family room V.jpg',
      'Volleyball beach.jpg',
      'Playground II.jpg',
      'Family room IV.jpg',
      'Kids pool II.jpg',
      'Family room II.jpg',
    ],
    en: {
      title: 'Family holiday at Medora',
      description: [
        paragraph(bold('Family holidays at the sea?')),
        paragraph(
          'Say ',
          bold('YES'),
          ' for holidays with Medora Resort - ',
          boldUnderline('the only hotel with family rooms at the Makarska Riviera.'),
        ),
        paragraph(
          'Enjoy your apartment with 2 bedrooms, a bathroom and an additional toilet, and balconies with a view of the Riviera.',
          'BR',
          'We now offer standard family rooms in our Residences!',
        ),
        paragraph(bold('The price includes:')),
        bulletList([
          "children's playrooms, animators",
          'heated outdoor pools, wellness, sauna, whirlpool, gym',
          'parking',
          'sunbeds, umbrellas and towels on the beach and at the pool',
          'unlimited drink consumption with breakfast and dinner',
        ]),
        paragraph(bold('Free of charge in Medora, because we appreciate our guests! 💙')),
        paragraph(
          'Fill up our quick inquiry and let us make your stay enjoyable, for you and your children :)',
        ),
      ],
    },
    hr: {
      title: 'Obiteljski odmor u Medori',
      description: [
        paragraph(bold('Obiteljski odmor na moru?')),
        paragraph(
          'Recite ',
          bold('DA'),
          ' odmoru s Medora Resortom - ',
          boldUnderline('jedinim hotelom s obiteljskim sobama na Makarskoj rivijeri.'),
        ),
        paragraph(
          'U\u017eivajte u apartmanu s 2 spava\u0107e sobe, kupaonicom i dodatnim WC-om, te balkonima s pogledom na rivijeru.',
          'BR',
          'Sada nudimo i standardne obiteljske sobe u na\u0161im Rezidencijama!',
        ),
        paragraph(bold('Cijena uklju\u010duje:')),
        bulletList([
          'dje\u010dje igraonice, animatore',
          'grijane vanjske bazene, wellness, saunu, whirlpool, teretanu',
          'parking',
          'le\u017ealice, sunobrane i ru\u010dnike na pla\u017ei i uz bazen',
          'neograni\u010denu konzumaciju pi\u0107a uz doru\u010dak i ve\u010deru',
        ]),
        paragraph(bold('Besplatno u Medori, jer cijenimo svoje goste! 💙')),
        paragraph(
          'Ispunite na\u0161 brzi upit i prepustite nama da va\u0161 boravak u\u010dinimo ugodnim, za vas i va\u0161u djecu :)',
        ),
      ],
    },
    de: {
      title: 'Familienurlaub in Medora',
      description: [
        paragraph(bold('Familienurlaub am Meer?')),
        paragraph(
          'Sagen Sie ',
          bold('JA'),
          ' zum Urlaub im Medora Resort - ',
          boldUnderline('dem einzigen Hotel mit Familienzimmern an der Makarska Riviera.'),
        ),
        paragraph(
          'Genie\u00dfen Sie Ihr Apartment mit 2 Schlafzimmern, einem Bad und einem zus\u00e4tzlichen WC sowie Balkonen mit Blick auf die Riviera.',
          'BR',
          'Wir bieten jetzt auch Standard-Familienzimmer in unseren Residenzen an!',
        ),
        paragraph(bold('Der Preis beinhaltet:')),
        bulletList([
          'Kinderspielzimmer, Animateure',
          'beheizte Au\u00dfenpools, Wellness, Sauna, Whirlpool, Fitnessstudio',
          'Parken',
          'Liegest\u00fchle, Sonnenschirme und Handt\u00fccher am Strand und am Pool',
          'unbegrenzter Getr\u00e4nkekonsum bei Fr\u00fchst\u00fcck und Abendessen',
        ]),
        paragraph(bold('Kostenlos in Medora, weil wir unsere G\u00e4ste sch\u00e4tzen! 💙')),
        paragraph(
          'F\u00fcllen Sie unsere Schnellanfrage aus und lassen Sie uns Ihren Aufenthalt f\u00fcr Sie und Ihre Kinder angenehm gestalten :)',
        ),
      ],
    },
  },
  {
    slug: 'one-summer-in-orbis',
    imageUrl: 'https://medorahotels.com/UserDocsImages//slike za novi web/Mobitel Orbis.jpg',
    imageFile: 'offer-orbis-summer.jpg',
    propertySlug: 'luxury-camp-orbis',
    galleryFolder: 'slike za novi web',
    galleryFiles: [
      'Luxury Camp.jpg',
      'Camp beach.jpg',
      'Mobile Home.jpg',
      'Facilities.jpg',
      'Terrace view.jpg',
      'Terrace I.jpg',
      'Inside I.jpg',
      'Inside II.jpg',
      'Private pool.jpg',
      'Terrace III.jpg',
    ],
    en: {
      title: 'One summer in Orbis and everything will be clear to you! :)',
      description: [
        paragraph(
          bold('An unforgettable experience!'),
          'BR',
          bold('Best rated '),
          'small luxury camp in Croatia ',
          bold('(9.5/10)'),
        ),
        paragraph(
          '*Possibility of an additional option of breakfast and dinner with drinks included in the Medora Auri hotel (5 minutes from your accommodation).',
        ),
        paragraph(bold('The price includes:')),
        bulletList([
          'free parking',
          'animation program of the Medora Auri hotel',
          'sun loungers and beach towels in front of the Medora Auri hotel',
          'use of the fitness and wellness center of the Medora Auri hotel',
          'washing machine and dryer',
        ]),
        paragraph(
          'Click on the ',
          bold('quick inquiry'),
          ' and let us know ',
          bold('the dates'),
          ', and our team will contact you with ',
          bold('the best'),
          ' possible ',
          bold('offer'),
          ' 😊',
        ),
      ],
    },
    hr: {
      title: 'Jedno ljeto u Orbisu i sve \u0107e ti biti jasno! :)',
      description: [
        paragraph(
          bold('Nezaboravno iskustvo!'),
          'BR',
          bold('Najvi\u0161e ocijenjeni '),
          'mali luksuzni kamp u Hrvatskoj ',
          bold('(9,5/10)'),
        ),
        paragraph(
          '*Mogu\u0107nost dodatne opcije doru\u010dka i ve\u010dere s pi\u0107ima uklju\u010denim u hotelu Medora Auri (5 minuta od smje\u0161taja).',
        ),
        paragraph(bold('Cijena uklju\u010duje:')),
        bulletList([
          'besplatan parking',
          'animacijski program hotela Medora Auri',
          'le\u017ealice i ru\u010dnici na pla\u017ei ispred hotela Medora Auri',
          'kori\u0161tenje fitness i wellness centra hotela Medora Auri',
          'perilica i su\u0161ilica rublja',
        ]),
        paragraph(
          'Kliknite na ',
          bold('brzi upit'),
          ' i javite nam ',
          bold('datume'),
          ', a na\u0161 tim \u0107e vas kontaktirati s ',
          bold('najboljom'),
          ' mogu\u0107om ',
          bold('ponudom'),
          ' 😊',
        ),
      ],
    },
    de: {
      title: 'Ein Sommer in Orbis und alles wird klar! :)',
      description: [
        paragraph(
          bold('Ein unvergessliches Erlebnis!'),
          'BR',
          bold('Bestbewertetes '),
          'kleines Luxuscamp in Kroatien ',
          bold('(9,5/10)'),
        ),
        paragraph(
          '*M\u00f6glichkeit einer zus\u00e4tzlichen Option f\u00fcr Fr\u00fchst\u00fcck und Abendessen mit Getr\u00e4nken im Hotel Medora Auri (5 Minuten von Ihrer Unterkunft entfernt).',
        ),
        paragraph(bold('Der Preis beinhaltet:')),
        bulletList([
          'kostenloses Parken',
          'Animationsprogramm des Hotels Medora Auri',
          'Liegest\u00fchle und Strandt\u00fccher am Strand vor dem Hotel Medora Auri',
          'Nutzung des Fitness- und Wellnesscenters des Hotels Medora Auri',
          'Waschmaschine und Trockner',
        ]),
        paragraph(
          'Klicken Sie auf die ',
          bold('Schnellanfrage'),
          ' und teilen Sie uns ',
          bold('die Daten'),
          ' mit, und unser Team wird Sie mit dem ',
          bold('bestm\u00f6glichen'),
          ' Angebot kontaktieren 😊',
        ),
      ],
    },
  },
  {
    slug: 'secure-your-2027-holiday',
    imageUrl:
      'https://medorahotels.com/UserDocsImages//galerije/Medora Orbis/Orbis 2027 mobile.jpg',
    imageFile: 'offer-secure-2027.jpg',
    propertySlug: 'luxury-camp-orbis',
    en: {
      title: 'Secure Your 2027 Holiday Today! ☀️',
      description: [
        paragraph('Bookings for the 2027 season are opening soon!'),
        paragraph('Planning your holiday at Medora on the Makarska Riviera?'),
        paragraph(
          'If you already know when you’d like to visit us, join our waiting list. As soon as bookings for 2027 open, we’ll contact you with our best offer for your preferred dates.',
        ),
        paragraph('To join the waiting list, simply send us:'),
        bulletList([
          '📅 Your preferred stay dates',
          '👨‍👩‍👧‍👦 Number of guests',
          '📧 Your email address',
        ]),
        paragraph('Medora Orbis - sea, sunshine and a carefree holiday on the Makarska Riviera.'),
        paragraph('⭐ Guest rating: 9.5/10 on Booking.com'),
        paragraph('Be among the first! 💙'),
      ],
    },
  },
  {
    slug: '2027-holidays-at-medora-auri-coming-soon',
    imageUrl:
      'https://medorahotels.com/UserDocsImages//special-offers/Medora Auri beach mobile.png',
    imageFile: 'offer-auri-2027.png',
    propertySlug: 'medora-auri',
    en: {
      title: '2027 Holidays at Medora Auri — Coming Soon!',
      description: [
        paragraph('Your Adriatic Summer Starts Here'),
        paragraph(
          'The sea is calling, and your next unforgettable summer on the Adriatic is just around the corner. ☀️',
        ),
        paragraph(
          'Picture sun-soaked days by the beach, crystal-clear waters, breathtaking views of the Adriatic and precious moments with the people who matter most.',
        ),
        paragraph(
          "At Medora Auri Family Beach Resort, every summer brings something to remember. And now, it's time to start dreaming about summer 2027.",
        ),
        paragraph(
          'Be among the first to discover our 2027 offers! Sign up to our priority list and be the first to know when reservations open.',
        ),
        paragraph('To join the waiting list, simply send us:'),
        bulletList([
          '📅 Your preferred stay dates',
          '👨‍👩‍👧‍👦 Number of guests',
          '📧 Your email address',
        ]),
        paragraph('Your next summer story begins here. 💙'),
      ],
    },
  },
]

export async function seedOffers({ payload }: { payload: Payload }) {
  payload.logger.info('--- Seeding Offers ---')

  // Resolve property IDs
  const [auriResult, orbisResult] = await Promise.all([
    payload.find({
      collection: 'properties',
      where: { slug: { equals: 'medora-auri' } },
      limit: 1,
    }),
    payload.find({
      collection: 'properties',
      where: { slug: { equals: 'luxury-camp-orbis' } },
      limit: 1,
    }),
  ])
  const auriId = auriResult.docs[0]?.id
  const orbisId = orbisResult.docs[0]?.id

  if (!auriId || !orbisId) {
    payload.logger.error('  Properties not found — run seed-rooms first')
    return
  }

  for (const offer of OFFERS) {
    // Skip content creation if already exists, but still update the image
    const existing = await payload.find({
      collection: 'offers',
      where: { slug: { equals: offer.slug } },
      limit: 1,
    })

    const imageId = await uploadImage(payload, offer.imageFile, offer.imageUrl, offer.en.title)
    const propertyId = offer.propertySlug === 'medora-auri' ? auriId : orbisId

    let galleryIds: number[] = []
    if (offer.galleryFolder && offer.galleryFiles) {
      galleryIds = await uploadGalleryImages(
        payload,
        offer.galleryFolder,
        offer.galleryFiles,
        `offer-${offer.slug}-gallery`,
        offer.en.title,
      )
    }
    const galleryData = galleryIds.length
      ? { gallery: galleryIds.map((id) => ({ image: id })) }
      : {}

    if (existing.docs.length > 0) {
      const existingId = existing.docs[0]!.id

      await payload.update({
        collection: 'offers',
        id: existingId,
        locale: 'en',
        draft: false,
        data: {
          title: offer.en.title,
          validFrom: offer.validFrom ?? null,
          validUntil: offer.validUntil ?? null,
          description: buildRichText(offer.en.description),
          ...(imageId ? { heroImage: imageId } : {}),
          ...galleryData,
          _status: 'published',
        },
      })
      for (const locale of ['hr', 'de'] as const) {
        const text = offer[locale]
        if (!text) continue
        await payload.update({
          collection: 'offers',
          id: existingId,
          locale,
          draft: false,
          data: {
            title: text.title,
            description: buildRichText(text.description),
            _status: 'published',
          },
        })
      }
      payload.logger.info(`  Updated content: ${offer.slug}`)
      continue
    }

    // Create with EN locale
    const created = await payload.create({
      collection: 'offers',
      locale: 'en',
      data: {
        title: offer.en.title,
        slug: offer.slug,
        property: propertyId,
        validFrom: offer.validFrom,
        validUntil: offer.validUntil,
        description: buildRichText(offer.en.description),
        ...(imageId ? { heroImage: imageId } : {}),
        ...galleryData,
        _status: 'published',
      },
    })

    for (const locale of ['hr', 'de'] as const) {
      const text = offer[locale]
      if (!text) continue
      await payload.update({
        collection: 'offers',
        id: created.id,
        locale,
        data: {
          title: text.title,
          description: buildRichText(text.description),
        },
      })
    }

    payload.logger.info(`  Created offer: ${offer.slug} (id=${created.id})`)
  }

  payload.logger.info('--- Offers seed complete ---')
}
