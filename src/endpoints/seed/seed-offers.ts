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

function lexicalParagraphs(lines: string[]) {
  return {
    root: {
      children: lines.map((line) => ({
        children: [
          { detail: 0, format: 0, mode: 'normal', style: '', text: line, type: 'text', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

const OFFERS = [
  {
    slug: 'last-minute-free-lunch',
    imageUrl: 'https://medorahotels.com/UserDocsImages//special-offers/Spring offer mobile.jpg',
    imageFile: 'offer-last-minute-free-lunch.jpg',
    propertySlug: 'medora-auri',
    validFrom: '2026-08-14',
    validUntil: '2026-08-31',
    en: {
      title: 'Last minute free lunch',
      description: [
        'Enjoy a completely carefree start to summer with all meals included in the price of your stay!',
        '\u2022 Free \u00e0 la carte lunch included in the half board price, with breakfast and dinner, even for 1 night stays!',
        'The price also includes:',
        '\u2022 Free parking',
        '\u2022 Access to outdoor heated pools',
        '\u2022 Wellness zone (saunas, jacuzzi)',
        '\u2022 Fitness with sea view',
        '\u2022 Breakfast and dinner throughout your stay',
        '\u2022 Drinks included with breakfast and dinner',
        '\u2022 Free sun loungers, parasols and beach towels',
        "\u2022 Children's playroom and animation program",
        'The offer is valid for the following dates: 14.\u201316.8., 21.\u201323.8. and 28.8.\u201331.8.',
        'Book early, the number of rooms in this offer is limited!',
      ],
    },
    hr: {
      title: 'Last minute besplatni ru\u010dak',
      description: [
        'U\u017eivajte u potpuno bezbrinom po\u010detku ljeta sa svim obrocima uklju\u010denima u cijenu smje\u0161taja!',
        '\u2022 Besplatni ru\u010dak \u00e0 la carte uklju\u010den u polupansionsku cijenu, uz doru\u010dak i ve\u010deru, \u010dak i za 1 no\u0107 boravka!',
        'Cijena tako\u0111er uklju\u010duje:',
        '\u2022 Besplatan parking',
        '\u2022 Pristup grijanim vanjskim bazenima',
        '\u2022 Wellness zona (saune, jacuzzi)',
        '\u2022 Fitness s pogledom na more',
        '\u2022 Doru\u010dak i ve\u010dera za cijelo vrijeme boravka',
        '\u2022 Pi\u0107a uz doru\u010dak i ve\u010deru',
        '\u2022 Besplatne le\u017ealice, sun\u010danici i ru\u010dnici za pla\u017eu',
        '\u2022 Dje\u010dja igraonica i animacijski program',
        'Ponuda vrijedi za sljede\u0107e datume: 14.\u201316.8., 21.\u201323.8. i 28.8.\u201331.8.',
        'Rezervirajte rano, broj soba u ovoj ponudi je ograni\u010den!',
      ],
    },
    de: {
      title: 'Last Minute kostenloses Mittagessen',
      description: [
        'Genie\u00dfen Sie einen unbeschwerten Sommeranfang mit allen Mahlzeiten im Preis Ihres Aufenthalts!',
        '\u2022 Kostenloses \u00e0-la-carte-Mittagessen im Halbpensionspreis inklusive, mit Fr\u00fchst\u00fcck und Abendessen, auch f\u00fcr 1 Nacht!',
        'Der Preis beinhaltet auch:',
        '\u2022 Kostenloses Parken',
        '\u2022 Zugang zu beheizten Au\u00dfenpools',
        '\u2022 Wellnesszone (Saunen, Jacuzzi)',
        '\u2022 Fitness mit Meerblick',
        '\u2022 Fr\u00fchst\u00fcck und Abendessen w\u00e4hrend des gesamten Aufenthalts',
        '\u2022 Getr\u00e4nke beim Fr\u00fchst\u00fcck und Abendessen',
        '\u2022 Kostenlose Liegest\u00fchle, Sonnenschirme und Strandtuch',
        '\u2022 Kinderspielzimmer und Animationsprogramm',
        'Das Angebot gilt f\u00fcr folgende Termine: 14.\u201316.8., 21.\u201323.8. und 28.8.\u201331.8.',
        'Fr\u00fchzeitig buchen \u2014 die Zimmeranzahl in diesem Angebot ist begrenzt!',
      ],
    },
  },
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
        'Booking directly with us gives you one of the following benefits:',
        '\u2022 Excursion of your choice \u2014 a boat trip to explore the Adriatic islands, or a trip to Biokovo and the Skywalk',
        'Valid for reservations for the period: 20.06.\u201301.09.2026, for bookings of 8+ nights.',
        'More reasons to book directly:',
        '\u2022 Free cancellation up to 7 days before arrival',
        '\u2022 Free parking and deck chairs on the beach',
        '\u2022 Free sauna, whirlpool and outdoor heated pools',
        '\u2022 Pet-friendly: bowl, toy and biscuits provided',
        'Our reservation team is available by phone +385 21 601 701 or email reservations@medorahotels.com.',
      ],
    },
    hr: {
      title: 'Rezervirajte direktno i osje\u0107ajte se sigurno!',
      description: [
        'Rezervacijom direktno s nama dobivate jednu od sljede\u0107ih pogodnosti:',
        '\u2022 Izlet po va\u0161em izboru \u2014 izlet brodom do jadranskih otoka ili izlet na Biokovo i Skywalk',
        'Vrijedi za rezervacije za period: 20.06.\u201301.09.2026., za rezervacije od 8+ no\u0107i.',
        'Jo\u0161 razloga za direktnu rezervaciju:',
        '\u2022 Besplatni otkaz do 7 dana prije dolaska',
        '\u2022 Besplatan parking i le\u017ealice na pla\u017ei',
        '\u2022 Besplatna sauna, whirlpool i grijani vanjski bazeni',
        '\u2022 Ljubimci dobrodo\u0161li: zdjela, igra\u010dka i keks\u0107i',
        'Na\u0161 tim je dostupan na telefonu +385 21 601 701 ili e-mailom reservations@medorahotels.com.',
      ],
    },
    de: {
      title: 'Direkt buchen und sich sicher f\u00fchlen!',
      description: [
        'Wenn Sie direkt bei uns buchen, erhalten Sie einen der folgenden Vorteile:',
        '\u2022 Ausflug nach Wahl \u2014 Bootsfahrt zu den Adriainseln oder Ausflug zum Biokovo und Skywalk',
        'G\u00fcltig f\u00fcr Buchungen im Zeitraum: 20.06.\u201301.09.2026, ab 8 N\u00e4chten.',
        'Weitere Gr\u00fcnde f\u00fcr eine Direktbuchung:',
        '\u2022 Kostenlose Stornierung bis 7 Tage vor Anreise',
        '\u2022 Kostenloses Parken und Liegest\u00fchle am Strand',
        '\u2022 Kostenlose Sauna, Whirlpool und beheizte Au\u00dfenpools',
        '\u2022 Tierfreundlich: Napf, Spielzeug und Leckerli',
        'Unser Reservierungsteam erreichen Sie unter +385 21 601 701 oder reservations@medorahotels.com.',
      ],
    },
  },
  {
    slug: 'family-holiday-at-medora',
    imageUrl:
      'https://medorahotels.com/UserDocsImages//galerije/Family superior/Superior family room mobile.jpg',
    imageFile: 'offer-family-holiday.jpg',
    propertySlug: 'medora-auri',
    validFrom: '2026-06-01',
    validUntil: '2026-09-15',
    en: {
      title: 'Family holiday at Medora',
      description: [
        'Family holidays at the sea? Say YES for holidays with Medora Resort \u2014 the only hotel with family rooms on the Makarska Riviera.',
        'Enjoy your apartment with 2 bedrooms, a bathroom, an additional toilet, and balconies with a view of the Riviera.',
        'The price includes:',
        "\u2022 Children's playrooms and animators",
        '\u2022 Heated outdoor pools, wellness, sauna, whirlpool, gym',
        '\u2022 Parking',
        '\u2022 Sunbeds, umbrellas and towels on the beach and at the pool',
        '\u2022 Unlimited drink consumption with breakfast and dinner',
        'Free of charge in Medora, because we appreciate our guests!',
      ],
    },
    hr: {
      title: 'Obiteljski odmor u Medori',
      description: [
        'Obiteljski odmor na moru? Ka\u017eite DA odmoru s Medora Resortom \u2014 jedinom hotelu s obiteljskim sobama na Makarskoj rivijeri.',
        'U\u017eivajte u apartmanu s 2 spava\u0107e sobe, kupaonicom, dodatnim WC-om i balkonima s pogledom na Rivijeru.',
        'Cijena uklju\u010duje:',
        '\u2022 Dje\u010dje igraonice i animatore',
        '\u2022 Grijane vanjske bazene, wellness, saunu, whirlpool, teretanu',
        '\u2022 Parking',
        '\u2022 Le\u017ealice, sun\u010danici i ru\u010dnici na pla\u017ei i bazenu',
        '\u2022 Neograni\u010dena konzumacija pi\u0107a uz doru\u010dak i ve\u010deru',
        'Besplatno u Medori, jer cijenimo svoje goste!',
      ],
    },
    de: {
      title: 'Familienurlaub in Medora',
      description: [
        'Familienurlaub am Meer? Sagen Sie JA zum Urlaub im Medora Resort \u2014 dem einzigen Hotel mit Familienzimmern an der Makarska Riviera.',
        'Genie\u00dfen Sie Ihr Apartment mit 2 Schlafzimmern, einem Bad, einem zus\u00e4tzlichen WC und Balkonen mit Blick auf die Riviera.',
        'Der Preis beinhaltet:',
        '\u2022 Kinderspielzimmer und Animateure',
        '\u2022 Beheizte Au\u00dfenpools, Wellness, Sauna, Whirlpool, Fitnessstudio',
        '\u2022 Parken',
        '\u2022 Liegest\u00fchle, Sonnenschirme und Handt\u00fccher am Strand und am Pool',
        '\u2022 Unbegrenzte Getr\u00e4nke beim Fr\u00fchst\u00fcck und Abendessen',
        'Kostenlos in Medora, weil wir unsere G\u00e4ste sch\u00e4tzen!',
      ],
    },
  },
  {
    slug: 'one-summer-in-orbis',
    imageUrl: 'https://medorahotels.com/UserDocsImages//slike za novi web/Mobitel Orbis.jpg',
    imageFile: 'offer-orbis-summer.jpg',
    propertySlug: 'luxury-camp-orbis',
    validFrom: '2026-06-01',
    validUntil: '2026-09-30',
    en: {
      title: 'One summer in Orbis and everything will be clear to you!',
      description: [
        'An unforgettable experience! Best rated small luxury camp in Croatia (9.5/10).',
        'Optional: breakfast and dinner with drinks at Medora Auri hotel (5 minutes from your accommodation).',
        'The price includes:',
        '\u2022 Free parking',
        '\u2022 Animation program of the Medora Auri hotel',
        '\u2022 Sun loungers and beach towels at the Medora Auri hotel beach',
        '\u2022 Use of the fitness and wellness centre',
        '\u2022 Washing machine and dryer',
        'Send us a quick inquiry with your dates and our team will provide the best possible offer!',
      ],
    },
    hr: {
      title: 'Jedno ljeto u Orbisu i sve \u0107e ti biti jasno!',
      description: [
        'Nezaboravno iskustvo! Najvi\u0161e ocijenjeni mali luksuzni kamp u Hrvatskoj (9,5/10).',
        'Opcija: doru\u010dak i ve\u010dera s pi\u0107ima u hotelu Medora Auri (5 minuta od smje\u0161taja).',
        'Cijena uklju\u010duje:',
        '\u2022 Besplatan parking',
        '\u2022 Animacijski program hotela Medora Auri',
        '\u2022 Le\u017ealice i ru\u010dnici na pla\u017ei hotela Medora Auri',
        '\u2022 Kori\u0161tenje fitness i wellness centra',
        '\u2022 Perilica i su\u0161ilica rublja',
        'Po\u0161aljite nam brzi upit s datumima i na\u0161 tim \u0107e vam ponuditi najbolju mogu\u0107u ponudu!',
      ],
    },
    de: {
      title: 'Ein Sommer in Orbis und alles wird klar!',
      description: [
        'Ein unvergessliches Erlebnis! Bestbewertetes kleines Luxuscamp in Kroatien (9,5/10).',
        'Option: Fr\u00fchst\u00fcck und Abendessen mit Getr\u00e4nken im Hotel Medora Auri (5 Minuten entfernt).',
        'Der Preis beinhaltet:',
        '\u2022 Kostenloses Parken',
        '\u2022 Animationsprogramm des Hotels Medora Auri',
        '\u2022 Liegest\u00fchle und Strandtuch am Strand des Hotels Medora Auri',
        '\u2022 Nutzung des Fitness- und Wellnesszentrums',
        '\u2022 Waschmaschine und Trockner',
        'Senden Sie uns eine Schnellanfrage mit Ihren Daten und unser Team wird Ihnen das beste Angebot machen!',
      ],
    },
  },
  {
    slug: 'luxury-camping-with-hotel-breakfast',
    imageUrl:
      'https://medorahotels.com/UserDocsImages//galerije/Premium%204/Premium%202%20spava%C4%87e%20pogled%20desktop.jpg',
    imageFile: 'offer-luxury-camping-hq.jpg',
    propertySlug: 'luxury-camp-orbis',
    validFrom: '2026-06-01',
    validUntil: '2026-09-30',
    en: {
      title: 'Luxury camping with hotel breakfast',
      description: [
        'Experience the best of luxury camping with a full hotel breakfast every morning.',
        'Stay in a premium glamping unit at Medora Orbis and enjoy breakfast at Medora Auri hotel just 5 minutes away.',
        'The price includes:',
        '• Free parking',
        '• Hotel breakfast at Medora Auri',
        '• Sun loungers and beach towels at the hotel beach',
        '• Use of fitness and wellness centre',
        'Send us a quick inquiry with your dates and our team will provide the best possible offer!',
      ],
    },
    hr: {
      title: 'Luksuzni kampiranje s hotelskim doručkom',
      description: [
        'Doživite najbolje luksuznog kampiranja uz puni hotelski doručak svako jutro.',
        'Odsjedi u premium glamping jedinici u Medori Orbis i uživaj u doručku u hotelu Medora Auri udaljenom samo 5 minuta.',
        'Cijena uključuje:',
        '• Besplatan parking',
        '• Hotelski doručak u Medora Auri',
        '• Ležaljke i ručnici na hotelskoj plaži',
        '• Korištenje fitness i wellness centra',
        'Pošaljite nam brzi upit s datumima i naš tim će vam ponuditi najbolju moguću ponudu!',
      ],
    },
    de: {
      title: 'Luxuscamping mit Hotelfrühstück',
      description: [
        'Erleben Sie das Beste des Luxus-Campings mit einem vollständigen Hotelfrühstück jeden Morgen.',
        'Übernachten Sie in einer Premium-Glamping-Einheit in Medora Orbis und genießen Sie das Frühstück im Hotel Medora Auri, nur 5 Minuten entfernt.',
        'Der Preis beinhaltet:',
        '• Kostenloses Parken',
        '• Hotelfrühstück im Medora Auri',
        '• Liegestühle und Strandtücher am Hotelstrand',
        '• Nutzung des Fitness- und Wellnesszentrums',
        'Senden Sie uns eine Schnellanfrage mit Ihren Daten und unser Team wird Ihnen das beste Angebot machen!',
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

    if (existing.docs.length > 0) {
      if (imageId) {
        await payload.update({
          collection: 'offers',
          id: existing.docs[0]!.id,
          data: { heroImage: imageId },
        })
        payload.logger.info(`  Updated image: ${offer.slug}`)
      } else {
        payload.logger.info(`  Skip (exists, no image to update): ${offer.slug}`)
      }
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
        description: lexicalParagraphs(offer.en.description),
        ...(imageId ? { heroImage: imageId } : {}),
        _status: 'published',
      },
    })

    // Update HR locale
    await payload.update({
      collection: 'offers',
      id: created.id,
      locale: 'hr',
      data: {
        title: offer.hr.title,
        description: lexicalParagraphs(offer.hr.description),
      },
    })

    // Update DE locale
    await payload.update({
      collection: 'offers',
      id: created.id,
      locale: 'de',
      data: {
        title: offer.de.title,
        description: lexicalParagraphs(offer.de.description),
      },
    })

    payload.logger.info(`  Created offer: ${offer.slug} (id=${created.id})`)
  }

  payload.logger.info('--- Offers seed complete ---')
}
