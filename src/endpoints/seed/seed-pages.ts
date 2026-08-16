import type { Payload } from 'payload'

const BASE = 'https://medorahotels.com/UserDocsImages'

// ── Media upload helper ───────────────────────────────────────────────────────

async function img(
  payload: Payload,
  url: string,
  filename: string,
  alt: string,
): Promise<number | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const mimeType = res.headers.get('content-type') ?? 'image/jpeg'
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data: buffer, mimetype: mimeType, name: filename, size: buffer.length },
    })
    return doc.id as number
  } catch (err) {
    payload.logger.warn(`  Failed to fetch ${url}: ${err}`)
    return null
  }
}

// ── Lexical richText helpers ──────────────────────────────────────────────────

function lexH1(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          tag: 'h1',
          children: [
            { type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function lexParas(...texts: string[]) {
  return {
    root: {
      type: 'root',
      children: texts.map((text) => ({
        type: 'paragraph',
        children: [
          { type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function lexBullets(items: string[]) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'list',
          listType: 'bullet',
          tag: 'ul',
          start: 1,
          children: items.map((text, i) => ({
            type: 'listitem',
            value: i + 1,
            children: [
              { type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          })),
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ── Block helpers ─────────────────────────────────────────────────────────────

function contentSection(
  heading: string | null,
  body: object,
  imageId: number | null,
  pos: 'right' | 'below' = 'right',
  ctaLink?: string,
) {
  return {
    blockType: 'contentSection' as const,
    heading,
    body,
    image: imageId,
    imagePosition: imageId ? pos : undefined,
    ctaLink: ctaLink ?? null,
  }
}

function cardGrid(
  intro: string | null,
  cards: { imageId: number | null; title: string; excerpt: string; link: string }[],
) {
  return {
    blockType: 'cardGrid' as const,
    intro,
    cards: cards.map((c) => ({
      image: c.imageId,
      title: c.title,
      excerpt: c.excerpt,
      link: c.link,
    })),
  }
}

// ── Upsert helper ─────────────────────────────────────────────────────────────

async function upsertPage(payload: Payload, path: string, data: object) {
  // Derive a unique slug from the full path so nested pages don't collide
  const derivedSlug = path.replace(/\//g, '-')
  const existing = await payload.find({
    collection: 'pages',
    where: { path: { equals: path } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data: { ...data, _status: 'published' },
    })
    payload.logger.info(`  Updated page: ${path}`)
  } else {
    await payload.create({
      collection: 'pages',
      data: { ...data, slug: derivedSlug, path, _status: 'published' },
    })
    payload.logger.info(`  Created page: ${path}`)
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function seedPages({ payload }: { payload: Payload }) {
  payload.logger.info('  — Seeding content pages...')

  // ── Upload hero images ────────────────────────────────────────────────────

  const [
    destinationHeroId,
    beachesHeroId,
    kidsHeroId,
    weatherHeroId,
    transfersHeroId,
    petsHeroId,
    greenHeroId,
    locationAuriImgId,
    locationOrbisImgId,
  ] = await Promise.all([
    img(
      payload,
      `${BASE}/kategorije/podgora-hero.jpg`,
      'destination-hub-hero.jpg',
      'Podgora, Makarska Riviera',
    ),
    img(
      payload,
      `${BASE}/kategorije/plaze-hero.jpg`,
      'beaches-hero.jpg',
      'Beaches of Makarska Riviera',
    ),
    img(
      payload,
      `${BASE}/kategorije/odmor-djeca-hero.jpg`,
      'kids-hero.jpg',
      'Vacation with children',
    ),
    img(payload, `${BASE}/kategorije/klima-hero.jpg`, 'weather-hero.jpg', 'Podgora climate'),
    img(
      payload,
      `${BASE}/kategorije/transferi-hero.jpg`,
      'transfers-hero.jpg',
      'Transfer services',
    ),
    img(
      payload,
      `${BASE}/kategorije/vacation-pets-hero.jpg`,
      'pets-hero.jpg',
      'Vacation with pets',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/Medora%20Auri%20sustainability%20new%202020%201.jpg`,
      'green-hero.jpg',
      'We think green sustainability',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/Medora%20Auri%20location%20mobile.jpg`,
      'location-auri.jpg',
      'Medora Auri Hotel location',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/Medora%20Orbis%20location%20mobile.jpg`,
      'location-orbis.jpg',
      'Medora Orbis location',
    ),
  ])

  // ── Upload beach section images ───────────────────────────────────────────

  const [
    beachPodgoraImgId,
    beachPlisivacImgId,
    beachDracevacImgId,
    beachGarmaImgId,
    beachSutiklaImgId,
    beachCakljeImgId,
    beachMakarskaImgId,
    beachPuntaRataImgId,
    beachNugalImgId,
    beachTucepiImgId,
    beachZlatniRatImgId,
  ] = await Promise.all([
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Podgora%20beach%20cover%20mobile.jpg`,
      'beach-podgora.jpg',
      'Beaches in the centre of Podgora',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Pli%C5%A1ivac%20beach%20small%20photo.jpg`,
      'beach-plisivac.jpg',
      'Plišivac Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Dra%C4%8Devac%20beach%20small%20photo.jpg`,
      'beach-dracevac.jpg',
      'Dračevac Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Garma%20beach%20small%20photo.jpg`,
      'beach-garma.jpg',
      'Garma Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Sutikla%20beach%20small%20photo.jpg`,
      'beach-sutikla.jpg',
      'Sutikla Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/%C4%8Caklje%20beach%20small%20photo.jpg`,
      'beach-caklje.jpg',
      'Čaklje Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/Brela%20beach%20cover%20mobile%20.jpg`,
      'beach-makarska-riviera.jpg',
      'Best known beaches of the Makarska Riviera',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Punta%20rata%20Brela%20small%20photo.jpg`,
      'beach-punta-rata.jpg',
      'Punta Rata Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Nugal%20beach%20small%20photo.jpg`,
      'beach-nugal.jpg',
      'Nugal Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Tu%C4%8Depi%20beach%20small%20photo.jpg`,
      'beach-tucepi.jpg',
      'Tučepi Beach',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Medora%20Auri%20Beach%20Bol%20Cover%20mobile.jpg`,
      'beach-zlatni-rat.jpg',
      'Zlatni Rat Beach, Bol',
    ),
  ])

  // ── Upload sustainability section images ──────────────────────────────────

  const [
    greenElectricImgId,
    greenReceptionImgId,
    greenRoomImgId,
    greenRestaurantImgId,
    greenPoolImgId,
    greenSolarImgId,
    greenChildImgId,
    greenAnimalImgId,
    greenEmployeesImgId,
    greenFitImgId,
  ] = await Promise.all([
    img(
      payload,
      `${BASE}/galerije/sustainability/electric%20vehicles%20small%20photo.jpg`,
      'green-electric.jpg',
      'Electric vehicles',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/reception%20desk%20small%20photo.jpg`,
      'green-reception.jpg',
      'Reception desk',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/rooms%20small%20photo.jpg`,
      'green-room.jpg',
      'Hotel room sustainability',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/restaurants%20and%20bars%20small%20photo.jpg`,
      'green-restaurant.jpg',
      'Restaurants and bars',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/pool%20and%20beach%20small%20photo.jpg`,
      'green-pool.jpg',
      'Pools and beach',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/solar%20pannels%20small%20photo.jpg`,
      'green-solar.jpg',
      'Solar panels communal areas',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/child%20protection%20small%20photo.jpg`,
      'green-child.jpg',
      'Protection and safety of children',
    ),
    img(payload, `${BASE}/slike/divokoza.jpg`, 'green-animal.jpg', 'Animal welfare'),
    img(
      payload,
      `${BASE}/galerije/sustainability/employees%20small%20photo.jpg`,
      'green-employees.jpg',
      'Employees',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/medora%20fit%20small%20photo.jpg`,
      'green-fit.jpg',
      'Medora fit programme',
    ),
  ])

  // ── Upload vacation with children images ──────────────────────────────────

  const [kidsPlayroomImgId, kidsPoolImgId, kidsEveningImgId, kidsAdultsImgId] = await Promise.all([
    img(
      payload,
      `${BASE}/animacija/Medora%20Auri%20Kidscorner.jpg`,
      'kids-kidscorner.jpg',
      'Kids corner playroom',
    ),
    img(
      payload,
      `${BASE}/animacija/Medora%20Auri%20kids%20pool%20I.jpg`,
      'kids-pool.jpg',
      'Kids pool',
    ),
    img(
      payload,
      `${BASE}/animacija/NIGHT%20KIDS%20PROGRAM%20MEDORA%20AURI.jpg`,
      'kids-evening.jpg',
      'Evening kids program',
    ),
    img(
      payload,
      `${BASE}/animacija/ADULTS%20PROGRAM%20MEDORA%20AURI.jpg`,
      'kids-adults.jpg',
      'Activities for the whole family',
    ),
  ])

  // ── Upload vacation with pets images ──────────────────────────────────────

  const [petsAuriImgId, petsOrbisImgId, petsCroatiaImgId] = await Promise.all([
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/dogs%20medora%20auri%20-%20mobile.jpg`,
      'pets-auri.jpg',
      'Dogs at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/dogs%20medora%20orbis%20-%20mobile.jpg`,
      'pets-orbis.jpg',
      'Dogs at Medora Orbis',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/rules%20for%20entering%20croatia%20mobile.jpg`,
      'pets-croatia.jpg',
      'Rules for entering Croatia with pets',
    ),
  ])

  // ── Destination hub page ──────────────────────────────────────────────────

  await upsertPage(payload, 'destination', {
    title: 'Destination',
    hero: {
      type: 'lowImpact',
      richText: lexH1('All is well in Podgora'),
    },
    layout: [
      contentSection(
        null,
        lexParas(
          'The Medora Auri hotel complex in Podgora, the jewel of the Makarska Riviera, is an ideal starting point for your exploration of Podgora and the Adriatic coast.',
          'Located between the mighty Biokovo and the clear blue sea, this place exudes beauty and simplicity.',
          'The inseparable bond between Podgora and the sea has shaped the life and customs of this place, and historical circumstances have formed the colourful content that every visitor can easily enjoy.',
          'Whether you are an explorer, sailor, merchant, gourmet or a pure hedonist — Podgora offers you content to which you will always return.',
        ),
        null,
      ),
      contentSection(
        'Location',
        lexParas(
          'Find your way to Medora Auri Hotel and Medora Orbis campsite with driving directions and maps.',
        ),
        locationAuriImgId,
        'right',
        '/destination/location',
      ),
      contentSection(
        'Vacation with children',
        lexParas(
          'In Podgora, we take special care of the little ones. A safe environment, kids club, and daily activities await your children.',
        ),
        kidsHeroId,
        'right',
        '/destination/vacation-with-children',
      ),
      contentSection(
        'Things to do',
        lexParas(
          'Discover our wellness facilities, dining & bars, and active vacation experiences included free of charge.',
        ),
        null,
        'right',
        '/amenities',
      ),
      contentSection(
        'Beaches',
        lexParas(
          'Find out more about some of the best beaches in Podgora and the Makarska Riviera.',
        ),
        beachesHeroId,
        'right',
        '/destination/beaches',
      ),
      contentSection(
        'Weather',
        lexParas(
          'Experience a true paradise with 2750 sunshine hours per year and a warm Mediterranean climate.',
        ),
        weatherHeroId,
        'right',
        '/destination/weather',
      ),
      contentSection(
        'Transfers',
        lexParas(
          'Choose one of our transfer services and relax in comfortable and modern cars on your way.',
        ),
        transfersHeroId,
        'right',
        '/destination/transfers',
      ),
      contentSection(
        'Vacation with pets',
        lexParas(
          'Medora Hotels welcome all guests who wish to bring their loyal family members on holiday.',
        ),
        petsHeroId,
        'right',
        '/destination/vacation-with-pets',
      ),
    ],
  })

  const locationHistoryHeroId = await img(
    payload,
    `${BASE}/kategorije/podgora-history-hero.jpg`,
    'location-history-hero.jpg',
    'History and culture of Podgora',
  )

  // ── Location page ─────────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/location', {
    title: 'About Podgora',
    hero: locationHistoryHeroId
      ? {
          type: 'highImpact',
          media: locationHistoryHeroId,
          richText: lexH1('All is well in Podgora'),
        }
      : { type: 'lowImpact', richText: lexH1('All is well in Podgora') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Medora Hotels & Resorts in Podgora is an ideal starting point for your exploration of Podgora and the Adriatic coast.',
          'Located between the mighty Biokovo and the clear blue sea, this place exudes beauty and simplicity, while numerous natural and historical elements make it even more attractive.',
          'Regardless of whether your inner self is a conqueror, sailor, trader, gourmand or pure hedonist, Podgora offers content that will make you crave more.',
        ),
        null,
      ),
      cardGrid(null, [
        {
          imageId: locationHistoryHeroId,
          title: 'History and culture of Podgora',
          excerpt:
            'Although Podgora is mentioned in Venetian documents in 1571, there have been traces of human activity there since the early Stone Age.',
          link: '/destination/location/history-and-culture',
        },
        {
          imageId: null,
          title: 'What you can visit',
          excerpt:
            'As soon as you arrive in Podgora, you will want to take 2 steps to the beach — and then explore its many sights and monuments.',
          link: '/destination/location/what-you-can-visit',
        },
        {
          imageId: null,
          title: 'Secrets of Podgora',
          excerpt:
            'Discover the legends, traditions, and fascinating stories that shaped Podgora across the centuries.',
          link: '/destination/location/secrets-of-podgora',
        },
        {
          imageId: null,
          title: 'Podgora climate',
          excerpt:
            'Experience a true paradise with 2750 sunshine hours per year and a warm Mediterranean climate.',
          link: '/destination/location/podgora-climate',
        },
      ]),
    ],
  })

  // ── About Podgora subpages ────────────────────────────────────────────────

  const whatToVisitHeroId = await img(
    payload,
    `${BASE}/kategorije/what-to-visit-hero.jpg`,
    'what-to-visit-hero.jpg',
    'What you can visit in Podgora',
  )
  const secretsHeroId = await img(
    payload,
    `${BASE}/kategorije/did-you-know-hero.jpg`,
    'secrets-podgora-hero.jpg',
    'Secrets of Podgora',
  )

  await upsertPage(payload, 'destination/location/history-and-culture', {
    title: 'History and culture of Podgora',
    hero: locationHistoryHeroId
      ? {
          type: 'highImpact',
          media: locationHistoryHeroId,
          richText: lexH1('History and culture of Podgora'),
        }
      : { type: 'lowImpact', richText: lexH1('History and culture of Podgora') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Although Podgora is mentioned in Venetian documents in 1571, there have been traces of human activity there since the early Stone Age. The evidence is the Neolithic impresso-type ceramics, found on the slopes of Biokovo.',
          'Podgora got its name from its position — under the hill/mountain (Croatian "pod gorom"). From the earliest times, Biokovo protected the place from enemies and severe weather from the north.',
          'After the great earthquake in 1962, a new chapter began in the life of Podgora. The inhabitants moved from Selo to Kraj (upper and lower Podgora) and turned completely to the sea and tourism.',
          'Since ancient times, Podgora has been facing the sea. Fishing was once the fundamental economic activity. In 1942, a navy was founded in Podgora. The monument "Galebova krila" (Seagull\'s wings) dominates the Podgora vistas as a memorial to the victory over fascism in the Adriatic Sea.',
        ),
        null,
      ),
      contentSection(
        'Historical highlights',
        lexBullets([
          "Prehistoric piles — Three piles next to Galebova krila, Mark's pile on Strupina and tumuli on Supin hill",
          'The remains of the antique tombstone of the married couple — stele',
          'Discovered Roman pottery and money — Bristica and other localities',
          'Numerous amphorae that bear witness of ship traffic in ancient times',
          'Remains of the tower from the Turkish period in Srida sela',
          'Tombstones (14th and 15th century) with depicted swords and shields at the Sutikla cemetery',
          'Copper coins with the inscription DALMA ET ALBA, painted in Venice in the 17th and 18th centuries',
        ]),
        null,
      ),
      contentSection(
        'Churches and faith',
        lexParas(
          'Today, about a dozen churches and several votive chapels attest to the tradition of the Christian faith and religious customs. The Church of St. Tekla from the 17th century was demolished in the earthquake of 1962 and restored in the late 20th century.',
          'There is a baroque Church of All Saints in Selo with a bell tower from 1764, which was the centre of spiritual life in Podgora until 1962. It is famous for its altar of St. Vicenco, patron of the Podgora municipality, celebrated in August, the first Sunday after Assumption Day.',
        ),
        null,
      ),
    ],
  })

  await upsertPage(payload, 'destination/location/what-you-can-visit', {
    title: 'What you can visit',
    hero: whatToVisitHeroId
      ? { type: 'highImpact', media: whatToVisitHeroId, richText: lexH1('What you can visit') }
      : { type: 'lowImpact', richText: lexH1('What you can visit') },
    layout: [
      contentSection(
        null,
        lexParas(
          'As soon as you arrive in Podgora, you will want to take 2 steps to the beach that you have been looking forward to for so long, and the soothing charm of the clean sea. After resting in the dense shade of olive trees and pines, you will have many places and sights to explore. This is what we suggest:',
        ),
        null,
      ),
      contentSection(
        null,
        lexBullets([
          'Attend concerts or take a photo next to the majestic "Galebova krila" monument above the harbour.',
          'Take a peak inside the baroque Church of St. Tekla (1626) and the tombstone cemetery on the Cape of St. Tekla.',
          'Swim next to the statue "Uzorita" on the cliff in front of the Medora Auri Hotel, erected in honour of the wives of seafarers and fishermen.',
          'Find the Chapel of the Holy Heart of Jesus by the Mrkušić family (1804), near the Podgorka Hotel.',
          'Take more demanding or less demanding trails to the Biokovo Nature Park.',
          'Climb up to Selo (upper Podgora) to the baroque Church of All Saints, which was the centre of spiritual life of the Podgora inhabitants until 1962.',
          'Find objects of traditional architecture at the Biokovo locality, Podglogovik — temporary dwellings used during the grazing seasons.',
          'Discover the splendour of typical Dalmatian houses from the 19th and 20th century with stone facades, in the old part of Podgora.',
          'While in Selo, relax and observe the drywalls that descend in platforms and encircle the olive, walnut, lemon, orange, tangerine, carob and fig groves.',
          'Visit the monastery of Don Mihovil Pavlinović, founder and leader of the Croatian national revival in Dalmatia.',
        ]),
        null,
      ),
    ],
  })

  await upsertPage(payload, 'destination/location/secrets-of-podgora', {
    title: 'Secrets of Podgora',
    hero: secretsHeroId
      ? { type: 'highImpact', media: secretsHeroId, richText: lexH1('Secrets of Podgora') }
      : { type: 'lowImpact', richText: lexH1('Secrets of Podgora') },
    layout: [
      contentSection(
        'How the sea and Biokovo formed the most beautiful beaches',
        lexParas(
          'Gravitational processes on the steep slope of Biokovo, with strong intermittent streams, influenced the fast transportation of the material and its deposition at the foot. Waves and sea currents destroyed the deposits, rounded their fragments, transmitted and deposited them on the shore. Thus, in cooperation with the mountain and the sea, were created the unique pebble beaches that the Makarska littoral is nowadays well-known for.',
        ),
        null,
      ),
      contentSection(
        '"Passage of Happiness" (Prolaz sriće)',
        lexParas(
          'There was once a recognisable symbol of Podgora at Sutikla — a rocky arch, covered with earth and trees, that the locals called the "Passage of Happiness". In the earthquake of 1962, the passage was demolished, but you can still walk the same happy road today.',
        ),
        null,
      ),
      contentSection(
        'Legend of Tekla',
        lexParas(
          'Legend says that the first grave on the Cape of St. Tekla belonged to a girl called Tekla, who died on a sailboat. Her grieving father refused to throw his only daughter into the sea. Sailing in the vicinity of Podgora, he found a spot where he buried his daughter — Punta of St. Tekla.',
        ),
        null,
      ),
      contentSection(
        'Copper coins and good fortune',
        lexParas(
          'By the mid-20th century, there was a custom to bury a few copper coins under the threshold when building a house. Many Venetian soldi and gazetas — copper coins with the inscription DALMA ET ALBA (17th and 18th century) — have been preserved thanks to this custom.',
        ),
        null,
      ),
      contentSection(
        'Drywalls',
        lexParas(
          'The quality of the drywall — stone walls that descend from the Biokovo peninsula towards the sea — is proven by the fact that they were preserved during the great earthquake in 1962. Drywalls enclosed manually processed groves of olives, grapes, almonds, walnuts, lemons, oranges, tangerines, carob and figs.',
        ),
        null,
      ),
      contentSection(
        'Water springs',
        lexParas(
          'Podgora has been inhabited from the earliest historical periods, thanks to the wealth of its waters. In the first half of the 20th century, they operated 24 mills in the area of Podgora.',
        ),
        null,
      ),
      contentSection(
        'Biokovo fairies',
        lexParas(
          'Legend says that in ancient times, people respected nature and lived in harmony with it, offering food sacrifices to the gods of nature. It is believed that fairies helped them in the fields and chased away evil spirits. Since Biokovo has been a protected natural park since 1981, some believe that the fairies can still be seen there during a quiet summer sunset.',
        ),
        null,
      ),
      contentSection(
        'St. Vicenco',
        lexParas(
          'St. Vicenco is the patron saint of Podgora. In 1831, his bones were donated to the Church of All Saints in Podgora. The townspeople soon accepted the saint as their patron and began to hold religious festivities on the first Sunday after Assumption Day. Since 1900, the celebration of St. Vicenco lasts for three days. Today, the Church of All Saints is one of the most monumental late baroque churches in Dalmatia.',
        ),
        null,
      ),
    ],
  })

  await upsertPage(payload, 'destination/location/podgora-climate', {
    title: 'Podgora climate',
    hero: { type: 'lowImpact', richText: lexH1('Podgora climate') },
    layout: [
      contentSection(
        "It's always sunny here",
        lexParas(
          'Experience a true paradise when it comes to year-round holidays and outdoor activities in one of the warmest parts of Croatia with a total of 2750 sunshine hours.',
          'The road to the sunniest parts of Croatia leads to Podgora. It is situated in the very south of the Makarska Littoral, which is one of the warmest areas in Croatia. Due to the Mediterranean climate, the summers here are hot and dry and the winters are mild.',
          'The average sea temperature exceeds 20°C and varies between 23 and 27°C in the summer. The average monthly temperature is never higher than 23.9°C in July and August.',
          'In the winter, unlike the northern regions of the Makarska Littoral, Podgora is often bereft of rain, which is suitable for growing citrus fruits, carob, vines, olives and other crops grown in the south. When ascending Biokovo, you will notice that the temperature drops by 1°C every 180 m — offering clean and fresh mountain air when the summer heat peaks at 40°C.',
        ),
        null,
      ),
    ],
  })

  // ── Vacation with children page ───────────────────────────────────────────

  await upsertPage(payload, 'destination/vacation-with-children', {
    title: 'Vacation with children',
    hero: { type: 'highImpact', media: kidsHeroId, richText: lexH1('Vacation with children') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Your children can freely enjoy a safe environment and create memories that are remembered and retold for a lifetime.',
          'Upon arrival, you will receive all the necessary information about the facilities and the weekly program of activities at the hotel reception.',
          'Children in clubs are divided by age groups — Mini (4–7 years) and Maxi (7–13 years). During working hours of the clubs, it is possible to leave the children in the care of professional animators/educators who will guide them through a fun educational program while parents enjoy their free time.',
        ),
        null,
      ),
      contentSection(
        'Kids club in Medora Auri Hotel',
        lexBullets([
          'KIDSCORNER — equipped with a climbing wall, ball pool, digital and didactic games, small cinema hall.',
          'HEATED POOLS — 1 pool for babies and young children, 1 for older children and adults.',
          "CHILDREN'S PLAYGROUND on the beach.",
        ]),
        kidsPlayroomImgId,
        'right',
      ),
      contentSection(
        'Daily kids program',
        lexParas(
          'Selection of creative workshops (little chefs, eco days, pirate days, facepainting, balloon modeling), various competitive games, treasure hunts, sports activities, outdoor games and more.',
          'For those a little older, in our kids corner there is a space equipped with game consoles and a small cinema hall. Various sports competitions and creative workshops are organised for them as well.',
        ),
        kidsPoolImgId,
        'right',
      ),
      contentSection(
        'Dinner with kids',
        lexParas(
          'For your children to enjoy dinner and Dalmatian specialties even more, we have designed a special program where all children can have dinner together with animators and other children.',
          'Through fun and storytelling, dinner will surely be even more interesting, and parents can relax for dinner with a glass of good domestic wine. Registrations are every day with the animation team.',
        ),
        null,
      ),
      contentSection(
        'Evening kids program',
        lexParas(
          "In the evening, children can have fun in various activities — a children's mini disco, a children's show where children dance and act, a talent show, and a Medora birthday party where our mascot Medi is a special guest.",
          'All evening programs are organised on the promenade, close to the Indigo cocktail bar, where the older ones can relax and enjoy a refreshing drink while our animators take care of the little ones.',
        ),
        kidsEveningImgId,
        'right',
      ),
      contentSection(
        'Activities for the whole family',
        lexParas(
          'To make the holiday complete for the whole family, but also for couples and groups without children, we have designed a series of activities that you can enjoy throughout the day.',
          'Some of the activities for adults include pilates, yoga, running, cycling, nordic walking, gym training, various workshops, pool and beach games, and photography competitions.',
          'Every evening you will be entertained by live music in the Taste the Indigo Cocktail Bar on the promenade in front of the hotel. On selected days you can also enjoy fire dance and Dalmatian performances.',
        ),
        kidsAdultsImgId,
        'right',
      ),
    ],
  })

  // ── Beaches page ──────────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/beaches', {
    title: 'Beaches',
    hero: { type: 'highImpact', media: beachesHeroId, richText: lexH1('Beaches') },
    layout: [
      contentSection(
        null,
        lexParas(
          'A large number of the most beautiful beaches on the Adriatic are located in Dalmatia, and the best of them are situated in the Makarska Riviera. This region is known for its perfect combination of warm Mediterranean climate, rich vegetation, crystal clear sea and indented coast.',
          'From sand to shingle, from hidden coves to arranged public beaches, from beaches bathed by the warm sun to those under the natural shade of pine trees — the beaches of the Makarska Riviera will satisfy all your desires.',
          'Explore and discover the beauty of the beaches in Podgora and the Makarska Riviera and select the one that best meets your needs.',
        ),
        null,
      ),
      contentSection(
        'Beaches in the centre of Podgora',
        lexParas(
          'The beaches in the centre of Podgora are situated in front of the local hotels, right next to the main promenade. The one kilometre long central beaches are the most visited beaches in Podgora.',
          'The beaches are bathed in the warm sun, and some parts are protected by the natural shade of pine trees looming over the promenade. The entrance into the beautiful bluish sea is easy and gradual, and the waters are ecologically healthy.',
          'The most famous and largest beach in the centre is the one in front of the Medora Auri hotel. This pebble beach is intended for hotel guests and other visitors to the town, and it is adapted for people with disabilities, featuring an access ramp and an elevator for entering the sea.',
        ),
        beachPodgoraImgId,
        'right',
      ),
      contentSection(
        'Plišivac Beach',
        lexParas(
          'Plišivac Beach is located north of the city centre and is rightly considered the most beautiful beach in Podgora. It is covered by pleasant small gravel, which turns into sand at the waterline, so entering the clear sea is as pleasant as walking on a sandy carpet.',
          'The Plišivac Bay is more than 1 km long. Although it is seemingly far removed from the Podgora bustle, do not look for peace and solitude on this popular beach in July and August. Along the hinterland are pine trees that provide natural shade.',
        ),
        beachPlisivacImgId,
        'right',
      ),
      contentSection(
        'Dračevac Beach',
        lexParas(
          'Dračevac Beach is located about 1 km to the north of the centre of Podgora, in the direction of Tučepi. It is about 400 meters long and covered with beautiful white rounded pebbles that create a visually impressive scene in combination with the turquoise sea.',
          'It is one of the most popular nudist beaches on the Makarska Riviera. It is surrounded by dense pine trees and other Mediterranean vegetation that create natural shade.',
        ),
        beachDracevacImgId,
        'right',
      ),
      contentSection(
        'Garma Beach',
        lexParas(
          'The coves of Garma attract nudists, romantic couples, families with children who want privacy and those who are not fans of large city beaches. The beach is covered with gravel and stones, surrounded by small rocks and pine trees.',
          'The colour of the sea is a beautiful turquoise and the entrance into the water is simple and gradual.',
        ),
        beachGarmaImgId,
        'right',
      ),
      contentSection(
        'Sutikla Beach',
        lexParas(
          'Sutikla Beach is located near the camp Orbis in the direction of the village of Čaklje. It is a pebble beach with natural pine tree shade. The beach is narrow and the access to the sea is pleasant.',
          'Nearby are bars and restaurants, which is why this beach is popular with younger people, but also with families for its easy entrance into the sea.',
        ),
        beachSutiklaImgId,
        'right',
      ),
      contentSection(
        'Čaklje Beach',
        lexParas(
          'The central beach in the village of Čaklje is a beautiful pebble beach with clear water, and a mild and gradual entrance into the water. It is partially covered with pine tree shade and close to many restaurants.',
        ),
        beachCakljeImgId,
        'right',
      ),
      contentSection(
        'Best known beaches of the Makarska Riviera',
        lexParas(
          'A great advantage of holidays in Podgora is the excellent connections between the towns and their proximity to each other, which contributes to the diversity and richness of the tourist offer and experience of the region.',
        ),
        beachMakarskaImgId,
        'right',
      ),
      contentSection(
        'Punta Rata Beach',
        lexParas(
          'Punta Rata Beach is located in Brela, 20 km from Podgora. In 2004, the American magazine Forbes included it in the 10 most beautiful beaches in the world. It has been awarded the Blue Flag for the highest level of cleanliness of the sea.',
          'The terrain is of tiny pleasant gravel with a sandy entrance into the sea, making the beach a favourite for families with children. Chairs and umbrellas are available for rent.',
        ),
        beachPuntaRataImgId,
        'right',
      ),
      contentSection(
        'Nugal Beach',
        lexParas(
          'Nugal Beach is located south of Makarska towards Tučepi, on the edge of the Osejava wooded park. The beach is a real hidden gem of the Makarska Riviera and very well known to nudists, adventurers and tourists interested in exploration.',
          'The beach is reached by a half-hour walk through the woods. The Nugal Beach is neither arranged nor organised and its appeal lies in its "wild" beauty, a high cliff in the hinterland, beautiful clear water, fine gravel and intact nature.',
        ),
        beachNugalImgId,
        'right',
      ),
      contentSection(
        'Tučepi Beach',
        lexParas(
          'Tučepi Beach is the longest beach on the Makarska Riviera — a 4-kilometre long area of pebbles. It is largely covered with pine trees, which provide natural shade. The sea is clear and turquoise, with a mild, gradual entrance into the water.',
        ),
        beachTucepiImgId,
        'right',
      ),
      contentSection(
        'Zlatni Rat Beach',
        lexParas(
          'Zlatni Rat beach is the most famous beach of the Adriatic located in Bol, on Brač island, about 50 km from Podgora. The beach changes its shape according to the currents and waves. It is covered with fine white sand, surrounded by crystal clear azure sea.',
          'Zlatni Rat is a winner of the international white flag for water quality and is listed among the 3 best European beaches.',
        ),
        beachZlatniRatImgId,
        'right',
      ),
    ],
  })

  // ── Weather page ──────────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/weather', {
    title: 'Podgora climate',
    hero: { type: 'highImpact', media: weatherHeroId, richText: lexH1('Podgora climate') },
    layout: [
      contentSection(
        "It's always sunny here",
        lexParas(
          'Experience a true paradise when it comes to year-round holidays and outdoor activities in one of the warmest parts of Croatia with a total of 2750 sunshine hours.',
          'The road to the sunniest parts of Croatia leads to Podgora. It is situated in the very south of the Makarska Littoral, which is one of the warmest areas in Croatia. Due to the Mediterranean climate, the summers here are hot and dry and the winters are mild.',
          'The average sea temperature exceeds 20°C and varies between 23 and 27°C in the summer. The average monthly temperature is never higher than 23.9°C in July and August.',
          'Did you know? In the winter, unlike the northern regions of the Makarska Littoral, Podgora is often bereft of rain, which is suitable for growing citrus fruits, carob, vines, olives and other crops. When ascending Biokovo, you will notice that the temperature drops by 1°C every 180 m — offering clean and fresh mountain air when the summer heat peaks at 40°C.',
        ),
        null,
      ),
    ],
  })

  // ── Transfers page ────────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/transfers', {
    title: 'Transfers',
    hero: { type: 'highImpact', media: transfersHeroId, richText: lexH1('Transfers') },
    layout: [
      contentSection(
        "It's the journey that matters",
        lexParas(
          'Choose one of our transfer services and relax in comfortable and modern cars on your way to your desired destination.',
          'The journey is no longer your concern. All you have to do is pick your destination and let us take care of the rest. Our fleet can satisfy the criteria of even the most demanding passengers and enable you to reach your destination feeling happy and content.',
          'Regardless of whether you need transportation from or to the Split or Dubrovnik airport, or if you wish to visit Makarska, Tučepi, Brela or Baška Voda — we are at your service.',
          'For more information on transportation services, please call +385 91 170 6444 or send us an inquiry via the Contact page.',
        ),
        null,
      ),
    ],
  })

  // ── Vacation with pets page ───────────────────────────────────────────────

  await upsertPage(payload, 'destination/vacation-with-pets', {
    title: 'Vacation with pets',
    hero: { type: 'highImpact', media: petsHeroId, richText: lexH1('Vacation with pets') },
    layout: [
      cardGrid(
        'The Medora Auri Hotel and Medora Orbis campsite welcome all guests who wish to take their loyal family members on holiday with them. In order for you and your pet, as well as other guests, to enjoy your holiday, please follow the rules of staying with pets.',
        [
          {
            imageId: petsAuriImgId,
            title: 'Medora Auri hotel rules of staying with pets',
            excerpt:
              'Find out all the rules and guidelines for bringing your pet to the Medora Auri Family Beach Resort.',
            link: '/contact',
          },
          {
            imageId: petsOrbisImgId,
            title: 'Medora Orbis campsite rules of staying with pets',
            excerpt:
              'Find out all the rules and guidelines for bringing your pet to the Medora Orbis Luxury Homes & Camping.',
            link: '/contact',
          },
          {
            imageId: petsCroatiaImgId,
            title: 'Rules for entering Croatia with your pet',
            excerpt:
              'Information on the required documentation and procedures for bringing your pet into Croatia.',
            link: '/contact',
          },
        ],
      ),
    ],
  })

  // ── We think green page ───────────────────────────────────────────────────

  await upsertPage(payload, 'we-think-green', {
    title: 'We think green!',
    hero: { type: 'highImpact', media: greenHeroId, richText: lexH1('We think green!') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Sustainability is our way of doing business!',
          'Medora Auri Hotel was one of the first hotels in Croatia to obtain the Travelife certificate of sustainability in 2017.',
          'In 2018, we received the Gold medal in sustainability based on customer ratings by the TUI Nordic agency, after competing against 40 Blue Star hotels around the world.',
          'We pay special attention to sustainable business practices and environmental protection, and we also invite you, our guests, to play an active role in the important mission to preserve the health of our planet.',
          'During your stay, you will probably notice many different details related to this, especially the following:',
        ),
        null,
      ),
      contentSection(
        'Electric vehicles',
        lexBullets([
          'We use an electric vehicle to transport guests on the hotel grounds.',
          'We own an electric vehicle charging station.',
        ]),
        greenElectricImgId,
        'right',
      ),
      contentSection(
        'Reception desk',
        lexBullets([
          'The room key card sleeves are made from recycled paper.',
          'Receipts are printed on recycled paper, which helps preserve our forests.',
          'The air-conditioning unit in a room automatically switches off when the balcony doors are opened. The air-conditioning unit is centrally programmed and can be individually adjusted by +/- 5°C.',
          'The tap water pressure is regulated automatically to ensure optimum water usage.',
          'The bathroom hygiene bags and laundry bags are made from biodegradable material.',
          'All of the hygiene supplies and cosmetic products in the bathroom are paraben-free and enclosed in boxes made from recycled materials.',
        ]),
        greenReceptionImgId,
        'right',
      ),
      contentSection(
        'Restaurants and bars',
        lexBullets([
          'We use biodegradable straws made from renewable materials in all of our establishments.',
          'We avoid throwing away food that is still edible, so the buffet will not be entirely full near closing time. However, you can always ask for any additional meal we offer if necessary.',
        ]),
        greenRestaurantImgId,
        'right',
      ),
      contentSection(
        'Pools and beach',
        lexBullets([
          'We recommend air-drying your pool and beach towels and using them multiple times, which helps reduce water pollution caused by detergents.',
          'Using inflatable plastic mattresses and pool toys contributes to pollution, and they are only allowed in the hotel pool for children.',
        ]),
        greenPoolImgId,
        'right',
      ),
      contentSection(
        'Communal areas',
        lexBullets([
          'The hotel uses solar energy to heat water.',
          'We use recycled paper towels in all of the public toilets.',
          "There are waste containers for sorting waste in the hotel's public areas. Thank you for helping us protect the environment by respecting the rules on proper waste sorting.",
        ]),
        greenSolarImgId,
        'right',
      ),
      contentSection(
        'Protection and safety of children',
        lexBullets([
          'The hotel complies with protection and safety regulations that ensure a safe stay for all our guests, especially children.',
          'We are particularly devoted to protecting children from sexual abuse. This is why our staff have been trained on how to act if they suspect a child is in danger.',
        ]),
        null,
      ),
      contentSection(
        'Animal welfare',
        lexBullets([
          'In order to maintain a natural balance in the ecosystem, we kindly ask our guests not to feed or disturb seagulls, sparrows, cats, and other animals found on hotel grounds.',
        ]),
        null,
      ),
      contentSection(
        'Local community',
        lexBullets([
          'Medora hotels and resorts welcome every opportunity to take part in the grants, sponsorships and activities of various local groups, arts and culture associations, sports clubs, and charity projects.',
          'In accordance with our Corporate Social Responsibility Policy, we endeavour to develop and maintain a partnership with everyone involved in the local community.',
          'We value local suppliers and business owners, and make an effort to buy their products whenever possible.',
          'We encourage employees and guests alike to act responsibly toward environment and our cultural heritage.',
          'We attach great importance to our cultural and natural wealth, for this reason we encourage our guests to behave responsibly towards the environment in the cultural heritage.',
          'Our business is fully compliant with the Croatian Labour Act.',
          'We value our employees and treat them fairly and with respect, ensuring no one is discriminated against on the basis of their age, disability, nationality, gender, race, political views, religious beliefs, or sexual orientation.',
          'We place great emphasis on the professional development of our employees and provide them with various forms of training that help them perform their tasks better and build their careers in our company.',
          'We try to employ local people whenever possible.',
          'We educate all of our employees on the importance and benefits of sustainable business practices with the aim of fostering their better understanding and active involvement in the realisation of our goals.',
          'Whenever possible we encourage our employees to use public transport to reduce the negative impact on the environment.',
          'Vacation has always been a time when we escape our everyday routine and training schedule. This is why we have created the Medora Fit programme, where your health comes first. For more information on the Medora Fit activity programme, please contact our entertainment department staff.',
        ]),
        greenEmployeesImgId,
        'right',
      ),
    ],
  })

  // ── Upload footer-page images ─────────────────────────────────────────────

  const [
    wellnessHeroId,
    spaImgId,
    fitnessImgId,
    poolsImgId,
    diningHeroId,
    indigoImgId,
    activeHeroId,
    riviereHeroId,
    aboutHeroId,
    awardsHeroId,
    howToReachHeroId,
  ] = await Promise.all([
    img(
      payload,
      `${BASE}/kategorije/wellness-hero.jpg`,
      'wellness-hero.jpg',
      'Wellness at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/spa/Medora%20Auri%20Spa%20cover%20photo%20mobile.jpg`,
      'spa-img.jpg',
      'Spa on 9th floor',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/fitness%20mobile.jpg`,
      'fitness-img.jpg',
      'Fitness centre',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/pools%20mobile.jpg`,
      'pools-img.jpg',
      'Heated pools and beach',
    ),
    img(payload, `${BASE}/kategorije/dining-hero.jpg`, 'dining-hero.jpg', 'Dining & Bars'),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/indigo%20mobile.jpg`,
      'indigo-img.jpg',
      'Taste the Indigo restaurant',
    ),
    img(
      payload,
      `${BASE}/kategorije/active-vacation-hero.jpg`,
      'active-hero.jpg',
      'Active vacation',
    ),
    img(
      payload,
      `${BASE}/galerije/Brela%20beach%20cover%20mobile%20.jpg`,
      'riviera-hero.jpg',
      'Makarska Riviera',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/Medora%20Auri%20hotel%20cover%20mobile.jpg`,
      'about-hero.jpg',
      'About Medora Hotels & Resorts',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/recenzije%20i%20nagrade%20desktop.jpg`,
      'awards-hero.jpg',
      'Reviews & Rewards',
    ),
    img(
      payload,
      `${BASE}/kategorije/how-to-reach-us-hero.jpg`,
      'how-to-reach-hero.jpg',
      'How to reach Podgora',
    ),
  ])

  // ── Help Center / FAQ ─────────────────────────────────────────────────────

  await upsertPage(payload, 'help-center', {
    title: 'Medora Help Center',
    hero: { type: 'lowImpact', richText: lexH1('Medora Help Center') },
    layout: [
      cardGrid(
        'Find answers to the most common questions about your stay at Medora Hotels & Resorts. Browse by topic or contact us directly.',
        [
          {
            imageId: null,
            title: 'Reservations',
            excerpt: 'Information about booking, cancellation, and modification of reservations.',
            link: '/contact',
          },
          {
            imageId: null,
            title: 'Holiday at the hotel',
            excerpt:
              'Everything you need to know about your stay at Medora Auri Family Beach Resort.',
            link: '/contact',
          },
          {
            imageId: null,
            title: 'Holiday at the campsite',
            excerpt: 'All you need to know about staying at Medora Orbis Luxury Homes & Camping.',
            link: '/contact',
          },
          {
            imageId: null,
            title: 'Holiday with children',
            excerpt: 'Kids clubs, programs, and family-friendly facilities at Medora.',
            link: '/destination/vacation-with-children',
          },
          {
            imageId: null,
            title: 'Holiday with pets',
            excerpt: 'Rules and guidelines for bringing your pet to Medora hotels.',
            link: '/destination/vacation-with-pets',
          },
          {
            imageId: null,
            title: 'Swimming pools & beaches',
            excerpt: 'Information about heated pools, beach access, and sunbeds.',
            link: '/destination/wellness',
          },
          {
            imageId: null,
            title: 'Wellness center',
            excerpt: 'Spa, fitness, massages, and wellness facilities at Medora Auri.',
            link: '/destination/wellness',
          },
          {
            imageId: null,
            title: 'Arrival in Podgora',
            excerpt: 'Directions and transport options for reaching Medora in Podgora.',
            link: '/how-to-reach-us',
          },
          {
            imageId: null,
            title: 'Food and drink',
            excerpt: 'Restaurant hours, half-board options, and dining information.',
            link: '/destination/dining-bars',
          },
          {
            imageId: null,
            title: 'Hotel parking',
            excerpt: 'Parking availability, pricing, and EV charging at Medora Auri.',
            link: '/contact',
          },
        ],
      ),
      contentSection(
        "Haven't found your answer?",
        lexParas(
          "If you haven't found the answer to your question, contact us directly and our team will be happy to help.",
        ),
        null,
        'right',
        '/contact',
      ),
    ],
  })

  // ── Packages & Special Offers ─────────────────────────────────────────────

  await upsertPage(payload, 'packages-special-offers', {
    title: 'Packages & Special Offers',
    hero: { type: 'lowImpact', richText: lexH1("An offer you can't refuse") },
    layout: [
      contentSection(
        null,
        lexParas(
          'Podgora is a place full to the brim with differences, its beauty and sun attracting numerous curious people wanting rest and enjoyment. Precisely because of this, we have created special offers that turn your dream vacation into a reality.',
          'Special accommodation prices and unique experiences we are able to offer are just a part of what you can expect here with us in Podgora. Every day is an opportunity to find something new for yourself and make your vacation more beautiful and affordable.',
          "Find an offer you can't refuse, and we will do everything to meet your expectations.",
        ),
        null,
      ),
      cardGrid(null, [
        {
          imageId: null,
          title: 'Last minute free lunch',
          excerpt: 'Book last minute and enjoy complimentary lunch included in your stay.',
          link: '/offers/last-minute-free-lunch',
        },
        {
          imageId: null,
          title: 'Luxury camping with hotel breakfast',
          excerpt:
            'Experience the best of luxury camping with a full hotel breakfast every morning.',
          link: '/offers/luxury-camping-with-hotel-breakfast',
        },
        {
          imageId: null,
          title: 'Book directly and feel safe with us!',
          excerpt:
            'Book directly on our website and receive exclusive inclusions — excursion, parking, sunloungers, and drinks with dinner.',
          link: '/offers/book-directly-and-feel-safe',
        },
        {
          imageId: null,
          title: 'One summer in Orbis',
          excerpt: 'Experience the unique atmosphere of Medora Orbis Luxury Homes & Camping.',
          link: '/offers/one-summer-in-orbis',
        },
        {
          imageId: null,
          title: 'Family holiday at Medora',
          excerpt:
            'Make unforgettable memories with your family at Medora Auri Family Beach Resort.',
          link: '/offers/family-holiday-at-medora',
        },
      ]),
    ],
  })

  // ── Wellness ──────────────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/wellness', {
    title: 'Wellness',
    hero: wellnessHeroId
      ? { type: 'highImpact', media: wellnessHeroId, richText: lexH1('Dream Holiday') }
      : { type: 'lowImpact', richText: lexH1('Dream Holiday') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Make your stay at Medora Auri a complete wellness experience. Our facilities offer everything you need to relax, recharge, and stay active during your holiday on the Makarska Riviera.',
        ),
        null,
      ),
      contentSection(
        'Spa (9th floor)',
        lexBullets([
          'Finish sauna',
          'Infrared sauna',
          'Whirlpool',
          'Relax zone',
          'Working hours: 07:00–21:00 h',
        ]),
        spaImgId,
        'right',
      ),
      contentSection(
        'Massages',
        lexParas(
          'Treat yourself to a relaxing massage by our professional therapists. Various massage techniques are available to help you unwind and restore your body.',
          'Working hours: 08:30–18:30 h (or on request)',
        ),
        null,
      ),
      contentSection(
        'Pools & Beaches',
        lexBullets([
          'Heated outdoor pool for babies and young children',
          'Heated outdoor pool for older children and adults',
          'Beach with free sunbeds, umbrellas, and towels',
          'Working hours: 08:00–20:00 h',
        ]),
        poolsImgId,
        'right',
      ),
      contentSection(
        'Fitness',
        lexParas(
          'Our fully equipped fitness centre offers top quality gear overlooking the sea and the islands of the Makarska Riviera. A perfect way to maintain your routine during your holiday.',
          'Working hours: 07:00–21:00 h',
        ),
        fitnessImgId,
        'right',
      ),
    ],
  })

  // ── Dining & Bars ─────────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/dining-bars', {
    title: 'Dining & Bars',
    hero: diningHeroId
      ? { type: 'highImpact', media: diningHeroId, richText: lexH1('Dining & Bars') }
      : { type: 'lowImpact', richText: lexH1('Dining & Bars') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Make your vacation at the Makarska Riviera an excellent one with the rich eno-gastronomy in our large choice of quality restaurants and cosy cocktail bars. Whether you like fast food or want to taste traditional Mediterranean dishes, feel the magic of the gastronomic offer in beautiful Podgora.',
          'Let our top chefs take you on a crazy journey through a variety of flavours and aromas, while our professional restaurant staff ensure that your every single arrival is transformed into an unforgettable experience, coupled with the flavours of quality homemade wines.',
          'Relax in our cosy cocktail bars, where you will enjoy, along with the beautiful sounds of the sea, quality cocktails from our top cocktail masters, while you bask in the view of the coast, the sea or the islands of the Makarska Riviera.',
        ),
        null,
      ),
      contentSection(
        'Taste the Indigo',
        lexParas(
          'New gastronomic magic with a view of the Adriatic Sea. Traditional Mediterranean and modern world cuisine — meat, fish or vegetarian options for every taste.',
          'Located on the promenade, Taste the Indigo is the perfect setting for an unforgettable dining experience.',
        ),
        indigoImgId,
        'right',
      ),
      contentSection(
        'Juice / Cocktail Bar',
        lexParas(
          'Refresh yourself with freshly squeezed juices during the day, and enjoy evening cocktails at sunset. Our cocktail bar offers a wide selection of classic and signature cocktails.',
        ),
        null,
      ),
      contentSection(
        'Lobby Bar',
        lexParas(
          'Enjoy a panoramic view of Podgora, the golden beaches, the crystal blue sea, and the distant islands from our Lobby Bar. A perfect spot for morning coffee or an afternoon drink.',
        ),
        null,
      ),
    ],
  })

  // ── Active Vacation ───────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/active-vacation', {
    title: 'Active Vacation',
    hero: activeHeroId
      ? { type: 'highImpact', media: activeHeroId, richText: lexH1('Active Vacation') }
      : { type: 'lowImpact', richText: lexH1('Active Vacation') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Fill your holiday at the beautiful Makarska Riviera with the various activities at your disposal. Whether you want to explore the heights of the beautiful Biokovo mountain, ride a bicycle on the cycling trails, or stay in shape with our Medora Fit programme, your holiday will be filled with a variety of activities in Podgora.',
        ),
        null,
      ),
      contentSection(
        'Medora Fit Programme',
        lexBullets([
          'Yoga and pilates on the beach',
          'Running and Nordic walking',
          'Cycling on local trails',
          'Gym training and circuit workouts',
          'Various sports competitions',
          'Photography competitions',
        ]),
        null,
      ),
      contentSection(
        'Excursions',
        lexParas(
          'Discover the beauty of the Makarska Riviera and the surrounding region with our organised excursions:',
        ),
        null,
      ),
      contentSection(
        'Skywalk Biokovo',
        lexParas(
          'The Skywalk Biokovo is a spectacular glass-floored platform perched on the cliffs of Biokovo mountain, offering breathtaking views of the Makarska Riviera and the Adriatic Sea. Located at 1,228 metres above sea level.',
          'Included free of charge when you book directly at medorahotels.com.',
        ),
        null,
        'right',
        '/offers/book-directly-and-feel-safe',
      ),
      contentSection(
        'Boat trips to the islands',
        lexParas(
          'Explore the beautiful islands of the central Adriatic on a guided boat trip. Visit the island of Brač, known for its famous Zlatni Rat beach, or discover the hidden coves of Hvar.',
          'Included free of charge when you book directly at medorahotels.com.',
        ),
        null,
        'right',
        '/offers/book-directly-and-feel-safe',
      ),
    ],
  })

  // ── About Makarska Riviera ────────────────────────────────────────────────

  await upsertPage(payload, 'destination/about-makarska-riviera', {
    title: 'About Makarska Riviera',
    hero: riviereHeroId
      ? {
          type: 'highImpact',
          media: riviereHeroId,
          richText: lexH1('The secret of eternal beauty'),
        }
      : { type: 'lowImpact', richText: lexH1('The secret of eternal beauty') },
    layout: [
      contentSection(
        null,
        lexParas(
          'The Makarska Riviera is one of the most beautiful parts of the Adriatic coast, stretching 60 kilometres along the central Adriatic, in the heart of central Dalmatia. With many small areas for fishing, the Riviera is becoming a real attraction for tourists who, besides natural beauty, want to enjoy good service.',
          'Today, the Makarska Riviera is synonymous with a unique and top quality tourist service that perfectly matches the local natural and cultural beauty, and places like Podgora, Tučepi, Gradac, Baška Voda and others have become the favourite destinations of the most demanding tourists.',
          'Due to its geographical position, located under the magnificent mountain of Biokovo, it is an example of fantastic contrasts of stone, sea and Mediterranean vegetation. This is the area where the most beautiful beaches of the Adriatic are located, and the crystal clear sea, decorated with blue flags, bears proof of ecologically clean water, beaches and marinas.',
          'The Makarska Riviera is also unique due to its delicious traditional Dalmatian cuisine, authentic quality wines, places famous for the best entertainment, as well as a rich culture and history dating back to ancient times.',
        ),
        null,
      ),
      contentSection(
        'The greatest jewel of the Makarska Riviera',
        lexParas(
          'After 1960, the Makarska Riviera started to develop rapidly and became the leading tourist destination on the Adriatic coast. Discover the most beautiful towns of the Riviera — from Brela and Baška Voda to Podgora, Tučepi and Gradac.',
        ),
        null,
        'right',
        '/destination/about-makarska-riviera/greatest-jewel',
      ),
      contentSection(
        'Pleasure on a plate',
        lexParas(
          'Dalmatian cuisine is highly regarded for its nutritional values, richness of flavour and variety, where fish, shellfish, crustaceans, olive oil and green leafy vegetables are at the forefront.',
        ),
        null,
        'right',
        '/destination/about-makarska-riviera/pleasure-on-a-plate',
      ),
    ],
  })

  // ── About Makarska Riviera subpages ───────────────────────────────────────

  const greatestJewelHeroId = await img(
    payload,
    `${BASE}/galerije/Makarska%20cover.jpg`,
    'makarska-cover.jpg',
    'The greatest jewel of the Makarska Riviera',
  )
  const pleasurePlateHeroId = await img(
    payload,
    `${BASE}/galerije/Restorani/Treasure%20on%20a%20plate%20Nota%20Bene.jpg`,
    'pleasure-plate-hero.jpg',
    'Pleasure on a plate — Dalmatian cuisine',
  )

  await upsertPage(payload, 'destination/about-makarska-riviera/greatest-jewel', {
    title: 'The greatest jewel of the Makarska Riviera',
    hero: greatestJewelHeroId
      ? {
          type: 'highImpact',
          media: greatestJewelHeroId,
          richText: lexH1('The greatest jewel of the Makarska Riviera'),
        }
      : { type: 'lowImpact', richText: lexH1('The greatest jewel of the Makarska Riviera') },
    layout: [
      contentSection(
        null,
        lexParas(
          'After 1960, the Makarska Riviera started to develop rapidly and became the leading tourist destination on the Adriatic coast, as well as a reference for great holidays. This is due to its many well-known tourist sites spread throughout the Riviera:',
        ),
        null,
      ),
      contentSection(
        'Brela',
        lexParas(
          'Brela is a small tourist resort that can boast the most beautiful beach in Europe and one of the top 10 most beautiful beaches in the world, according to the influential Forbes magazine. The beach is Punta rata. Apart from the clean sea and more than 6 km of pebble beaches, Brela is well-known for its sophisticated offer of rural tourism on the slopes of Biokovo, with an excellent gastronomic offer of local specialities.',
        ),
        null,
      ),
      contentSection(
        'Baška Voda',
        lexParas(
          'The first mention of Baška Voda was in 1688, on the Coranelli map, as a small fishing and agricultural place called Basca, which grew into one of the leading tourism centres on the Makarska Riviera today. Baška Voda justifies its location with its beautiful pebble beaches, long promenades along the sea, pine forests and an array of hotels, apartments, and tourist amenities.',
        ),
        null,
      ),
      contentSection(
        'Promajna',
        lexParas(
          'Promajna is the perfect harbour for a peaceful family or romantic holiday, that offers its guests excellent accommodation in villas and apartments, a beautiful promenade along the sea, clean beaches, relaxation in the shade of centuries-old pine trees, and cosy gourmet facilities.',
        ),
        null,
      ),
      contentSection(
        'Makarska',
        lexParas(
          "It is the largest place in the Makarska Riviera that gave its name to the whole area. The city is renowned for a variety of hospitality and entertainment facilities, cultural events and concerts, especially the Fishermen's nights, the Kalelarga nights and the summer carnival.",
        ),
        null,
      ),
      contentSection(
        'Tučepi',
        lexParas(
          'The town of Tučepi has the longest beach on the Makarska Riviera (5 km long) with a lovely promenade. Tučepi is an attractive tourist destination with its cultural and historical monuments and a catering offer of local cuisine.',
        ),
        null,
      ),
      contentSection(
        'Podgora',
        lexParas(
          'According to many, the most beautiful place on the Makarska Riviera, Podgora, has become a true little paradise, offering its visitors an ecologically clean beach and beautiful sea, a rich gastronomic offer, numerous restaurants and taverns, modern hotel and apartment accommodation, as well as entertainment and sports facilities. The best recommendation for a perfect family holiday is the Medora Auri Family Beach Resort.',
        ),
        null,
      ),
      contentSection(
        'Bratuš',
        lexParas(
          'It is a small fishing village for all those who want peace, quiet, and want to enjoy the beautiful nature, seaside, quiet coves, mountain hiking on Biokovo, and the joy of serenity and the natural gifts of the Mediterranean.',
        ),
        null,
      ),
      contentSection(
        'Drašnice',
        lexParas(
          'It is another picturesque place in the Makarska Riviera for a peaceful family or romantic getaway. Apart from its natural benefits, Drašnice is famous for its sacred objects, dating back to the 15th century.',
        ),
        null,
      ),
      contentSection(
        'Igrane',
        lexParas(
          'The small town of Igrane was known for its olive groves and the production of famous olive oil; today, with its modern olive processing facility, it is a place completely dedicated to tourism. Above Igrane, on the slopes of Biokovo, is the most important medieval monument of the Makarska Riviera, the Church of St. Michael from the 11th century.',
        ),
        null,
      ),
      contentSection(
        'Živogošće',
        lexParas(
          'A picturesque, authentic Dalmatian town consisting of three settlements, dedicated to tourism, well known for its hospitality, delicious gastronomic offer and comfortable accommodation. Živogošće has been populated since the ancient Roman times, which can be seen in the remains of the Illyrian graves and villa rustica.',
        ),
        null,
      ),
      contentSection(
        'Drvenik',
        lexParas(
          'Located between two natural coves, Gornja and Donja Vala, the town of Drvenik delights with the beauty of its natural landscape. Drvenik is first mentioned in the 13th century and its name comes from the Croatian word for wood, "drvo". Today, its guests enjoy a true and quiet holiday in the charms of its cultural and gastronomic offer.',
        ),
        null,
      ),
      contentSection(
        'Zaostrog',
        lexParas(
          'Zaostrog is first mentioned in the 15th century. Since the 20th century, the place has been living from tourism, which is its main economic activity. Nowadays, there are numerous hotels, camps, apartments and villas, a rich catering offer and a beautiful promenade along the crystal clean sea with pebble beaches.',
        ),
        null,
      ),
      contentSection(
        'Podaca',
        lexParas(
          'Podaca is a peaceful tourist village which consists of 3 smaller villages: Kapeć, Viskovića vala and Ravanje. The place has natural beauty, clean sea, beautiful beaches, pleasant accommodation and a tourist offer tailor made for a special family holiday.',
        ),
        null,
      ),
      contentSection(
        'Brist',
        lexParas(
          'It is an attractive and small tourist town, where the locals are still engaged in agriculture, fishing and olive growing. A place of special indigenous experience of the old Mediterranean in combination with modern accommodation units, well-kept beaches, a restaurant offer of local delicacies and cultural and historical monuments from the 15th century.',
        ),
        null,
      ),
      contentSection(
        'Gradac',
        lexParas(
          'A calm Dalmatian place of rich archaeological finds from ancient times as evidence of ancient settlements. Today, the inhabitants mostly work in tourism, fishing, agriculture and olive growing. There is a beautiful long pebble beach in Gradac, the favourite place for a summer holiday of many visitors.',
        ),
        null,
      ),
    ],
  })

  await upsertPage(payload, 'destination/about-makarska-riviera/pleasure-on-a-plate', {
    title: 'Pleasure on a plate',
    hero: pleasurePlateHeroId
      ? { type: 'highImpact', media: pleasurePlateHeroId, richText: lexH1('Pleasure on a plate') }
      : { type: 'lowImpact', richText: lexH1('Pleasure on a plate') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Dalmatian cuisine is highly regarded for its nutritional values, richness of flavour and variety, where fish, shellfish, crustaceans, olive oil and green leafy vegetables are at the forefront.',
          'One of the most famous Dalmatian dishes is the "pašticada", known since ancient times, followed by dishes prepared under the bell peka, grilled lamb and numerous fish specialities, roasted octopus, squid, sea bream, redfish, sea bass and, of course, the traditional homemade cheese, prosciutto and olives.',
          'The most favourite desserts are the aromatic flan and irresistible fritters, as well as cakes made of figs, raisins and almonds. The Makarana cake is a dessert known throughout the Makarska Riviera, and it is prepared, based on a traditional recipe, for holidays, festivities and special guests.',
          'Legend says that the cake was named in 1838, when it was served to the Saxon King Friedrich August during his visit to Makarska. The honoured guest, delighted with the nameless dessert, decided to give it the name of the host city. Today, the Makarana cake is a protected cultural heritage.',
          'Mediterranean spices also play a major role in preparing Dalmatian dishes; they give that final appealing note to each dish: oregano, marjoram, rosemary, basil, laurel and sage.',
          'Dalmatia is also widely known for its high quality and award-winning wines that go perfectly with the Mediterranean cuisine and create a true spell of flavour delight!',
        ),
        null,
      ),
    ],
  })

  // ── About Medora Hotels & Resorts ─────────────────────────────────────────

  await upsertPage(payload, 'about', {
    title: 'About Medora Hotels & Resorts',
    hero: aboutHeroId
      ? { type: 'highImpact', media: aboutHeroId, richText: lexH1('About Medora Hotels & Resorts') }
      : { type: 'lowImpact', richText: lexH1('About Medora Hotels & Resorts') },
    layout: [
      contentSection(
        'Our Vision',
        lexParas(
          'The vision of the development of the society is to become a leading hotel company on the Makarska Riviera.',
        ),
        null,
      ),
      contentSection(
        'Our Mission',
        lexParas(
          'The mission of the development of the company is to reposition existing objects into attractive and commercially viable tourism products by introducing international standards of management and operations and by linking traditional local values with the modern tourist trends.',
          'The mission of the society is also to act as a coordinator of the professionalisation of tourist development on the Makarska Riviera, as well as on the entire territory of Dalmatia.',
        ),
        null,
      ),
      contentSection(
        'Our Values',
        lexBullets([
          'Commitment to the guest — All activities are focused on quality and guest satisfaction. Our primary task is understanding guest needs and fulfilling expectations, creating a unique experience. Honesty, respect and responsibility.',
          'Excellence and work — Continuous adoption of new knowledge and development of skills; guarantee of services according to the highest quality standards and best practices of the hotel industry.',
          'A team and winning spirit — The team is our most valuable potential. We build a stimulating working environment based on mutual respect, community and camaraderie.',
          'Proactivity and innovation — Openness to new ideas and creativity; diverse knowledge and skills. Free and open thinking; accepting challenges with a positive attitude as an opportunity for training and positive change.',
        ]),
        null,
      ),
    ],
  })

  // ── Our Prizes & Achievements ─────────────────────────────────────────────

  await upsertPage(payload, 'about/awards', {
    title: 'Our Prizes & Achievements',
    hero: awardsHeroId
      ? { type: 'highImpact', media: awardsHeroId, richText: lexH1('Reviews & Rewards') }
      : { type: 'lowImpact', richText: lexH1('Reviews & Rewards') },
    layout: [
      cardGrid(
        'A part of the family — we are proud of the recognition we have received from our guests and industry partners over the years.',
        [
          {
            imageId: null,
            title: 'Rewards',
            excerpt:
              'Medora Hotels & Resorts has received numerous awards and certifications recognising our commitment to quality, sustainability, and guest satisfaction.',
            link: '/contact',
          },
          {
            imageId: null,
            title: 'Guest reviews for Medora Auri hotel',
            excerpt:
              'Read what our guests say about their stay at the Medora Auri Family Beach Resort.',
            link: '/contact',
          },
        ],
      ),
    ],
  })

  // ── How to Reach Us ───────────────────────────────────────────────────────

  await upsertPage(payload, 'how-to-reach-us', {
    title: 'How to Reach Us',
    hero: howToReachHeroId
      ? { type: 'highImpact', media: howToReachHeroId, richText: lexH1('How to reach us') }
      : { type: 'lowImpact', richText: lexH1('How to reach us') },
    layout: [
      contentSection(
        'By car',
        lexParas(
          'From Rijeka/Zagreb: Take the A1 motorway and exit at Zagvozd, then continue through the Sveti Ilija tunnel, across Makarska to Podgora.',
          'From Dubrovnik: Follow the D8 Adriatic coastal highway northward, or take the ferry line Ploče–Trpanj (Pelješac) and continue to Podgora.',
          'For up-to-date road conditions, visit the Croatian Autoclub (HAK) at www.hak.hr.',
        ),
        null,
      ),
      contentSection(
        'By boat',
        lexParas(
          'The nearest major port is Split. Regular ferry lines connect Split with various Adriatic islands and mainland ports.',
          'For ferry schedules and reservations visit www.jadrolinija.hr.',
        ),
        null,
      ),
      contentSection(
        'By air',
        lexParas(
          'The nearest airports are Split Airport (approximately 65 km) and Dubrovnik Airport (approximately 150 km).',
          'From both airports, you can reach Podgora by taxi, transfer service, or public bus. Contact us to arrange a private transfer.',
        ),
        null,
        'right',
        '/contact',
      ),
      contentSection(
        'By bus',
        lexParas(
          'Regular bus lines connect Podgora with major Croatian cities including Zagreb, Rijeka, Split, and Dubrovnik, as well as international routes from Sarajevo and other regional hubs.',
          'The Podgora bus stop is located near the hotel. Contact the local bus station for current schedules.',
        ),
        null,
      ),
      contentSection(
        'Our address',
        lexParas(
          'Medora Auri Family Beach Resort',
          'Sv. Martina 26, 21327 Podgora, Croatia',
          'Tel: +385 (0)21 601 701',
          'Email: reservations@medorahotels.com',
        ),
        null,
        'right',
        '/contact',
      ),
    ],
  })

  // ── Personal Data Protection Policy ──────────────────────────────────────

  await upsertPage(payload, 'personal-data-protection-policy', {
    title: 'Personal Data Protection Policy',
    hero: { type: 'lowImpact', richText: lexH1('Personal Data Protection Policy') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Updated on 07.2026',
          'Medora Hotels & Resorts d.o.o. za ugostiteljstvo',
          'Mrkušića dvori 2, 21327 Podgora, Croatia',
          'Phone: +385 (0)21 601 700 | Email: privacy@medorahotels.com',
        ),
        null,
      ),
      contentSection(
        null,
        lexParas(
          'We, at Medora Hotels & Resorts, respect your privacy and protect your personal data in accordance with applicable laws. Our mission is to exceed the expectations of our guests, responsibly using the information provided to us.',
        ),
        null,
      ),
      contentSection(
        '1. Purpose of Collection of Personal Data',
        lexBullets([
          'Website improvement and user experience optimisation',
          'Reservation handling and contractual fulfilment',
          'Processing of additional service requests',
          'Payment processing',
          'Internal statistics and business analysis',
          'Processing of job applications',
          'Compliance with legal obligations (Hospitality Act, Accounting Act, Labour Act)',
          'Video surveillance for security purposes',
        ]),
        null,
      ),
      contentSection(
        '2. Guest Personal Data Processing',
        lexParas(
          'We collect your name, email address, and phone number for enquiries. Additional data is required for booking (identification document, payment card information). At hotel reception, we also collect: name, address, date of birth, ID document details, citizenship, room number, arrival and departure dates, and gender — stored for 10 years as required by the e-visitor system.',
          'Card data is encrypted and we are PCI-DSS compliant. Invoice data is kept for 11 years. Bookings made via third-party platforms (Booking.com, Expedia) are subject to their respective privacy policies. Data is stored for a minimum of 5 years for operational purposes.',
        ),
        null,
      ),
      contentSection(
        '3. Processing of Personal Data of Medora Employees',
        lexParas(
          'Job application data sent to posao@medorahotels.com is kept with your consent and can be withdrawn at any time. Employee data includes: name, date of birth, address, bank account, ID, CV, and employment data. Video surveillance recordings are kept for 14 days.',
        ),
        null,
      ),
      contentSection(
        '4. Use of Social Networks and Our Websites',
        lexParas(
          'This policy applies to medorahotels.com, camping-makarska-riviera.com, mhr-podgora.com, and our social media profiles. We use first-party cookies (temporary and persistent) and third-party cookies. Cookies collect anonymous and statistical data (IP address, browser type, operating system, timestamp). Cookie settings can be adjusted in your browser.',
        ),
        null,
      ),
      contentSection(
        '5. Storage and Deletion of Your Personal Data',
        lexParas(
          'Data is stored only as long as necessary and is deleted when no longer needed, subject to applicable legal retention periods.',
        ),
        null,
      ),
      contentSection(
        '6. Data Transfer to Third Parties',
        lexParas(
          'Data is transferred to third parties only with your consent, for contractual or legal obligations, or to contracted service providers. Standard contractual clauses are used for transfers outside the EEA.',
        ),
        null,
      ),
      contentSection(
        '7. Your Rights',
        lexParas(
          'You have the right to access, correct, or request deletion of your personal data at any time. Submit your request to privacy@medorahotels.com or by post to the address above. Identity verification will be required.',
        ),
        null,
      ),
      contentSection(
        "8. Protection of Children's Personal Data",
        lexParas(
          'Medora does not intentionally collect personal data from minors without verifiable parental consent.',
        ),
        null,
      ),
      contentSection(
        '9. Security Measures',
        lexParas(
          'We use SSL encryption for all data transfers, PCI-DSS compliant payment systems, strict access controls, and regular employee training on GDPR data handling practices.',
        ),
        null,
      ),
    ],
  })

  // ── Cookies Policy ────────────────────────────────────────────────────────

  await upsertPage(payload, 'cookies-policy', {
    title: 'Cookies Policy',
    hero: { type: 'lowImpact', richText: lexH1('Cookie Statement') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Medora Hotels & Resorts d.o.o. za ugostiteljstvo is committed to protecting your privacy and providing transparency regarding the technologies we use. This statement aims to inform you about the types of cookies we use, their purposes, and your options for managing them.',
          'If you have any questions or concerns about our cookie practices, please contact us at privacy@medorahotels.com.',
        ),
        null,
      ),
      contentSection(
        'What is a Cookie?',
        lexParas(
          'A cookie is a small file that is stored on your device when you visit a website. It allows the website to remember your settings and activities.',
        ),
        null,
      ),
      contentSection(
        'What Kind of Cookies Are There?',
        lexParas(
          'First-party cookies are set by Medora when you use our website. They can be permanent or temporary and allow websites to store data for subsequent visits (e.g. language selection).',
          'Third-party cookies are set by external companies or tools when you use our website. These help us monitor marketing campaign success and understand how visitors found our site.',
        ),
        null,
      ),
      contentSection(
        'Why Do We Use Cookies?',
        lexBullets([
          'To understand how you use our site and which content is most interesting to you',
          'To automatically display the page in the language you used on your next visit',
          'To enable smooth online accommodation reservations',
          'To monitor the success of our digital marketing campaigns',
          'To identify and solve technical problems',
        ]),
        null,
      ),
      contentSection(
        'What Types of Cookies Do We Use?',
        lexBullets([
          'Strictly necessary — Crucial for the functionality of our site (e.g. reservation steps, privacy settings)',
          'Functionality cookies — Measure your use of the site in order to improve it',
          'Experience cookies — Recognise you and remember preferences such as language selection',
          'Advertising cookies — Collect information about your visit to monitor marketing campaign results',
          'Google Analytics — Collects anonymous visit data (number of visits, duration, traffic sources, user behaviour)',
          'Facebook pixel — Tracks conversions and enables targeted advertising on Facebook',
          'Google AdSense — Enables targeted ads through the Google AdSense network',
        ]),
        null,
      ),
      contentSection(
        'How Long Do Cookies Last?',
        lexParas(
          'Session cookies last only for the duration of your current online session and are automatically deleted when you close your browser.',
          'Persistent cookies remain on your device after you close your browser but have a specific duration (not longer than 13 months). These remember your preferences between different browsing sessions.',
        ),
        null,
      ),
      contentSection(
        'How Can You Manage Cookies?',
        lexParas(
          'When you visit our website, you can accept all cookies, accept only certain cookies, or reject all but strictly necessary cookies.',
          'You can also manage cookies through your browser settings — usually found in "Options" or "Settings". Many browsers offer a "private" or "incognito" mode that automatically blocks cookies.',
          'Note: disabling all cookies may affect the functionality of websites. We recommend turning off only the cookies you truly do not need.',
        ),
        null,
      ),
    ],
  })

  // ── Update MainNav — EN first (gets IDs), then HR/DE reuse those IDs ──────

  const navItemsEN = [
    {
      label: 'Accommodation',
      href: '/accommodation',
      children: [
        { label: 'Medora Auri Family Beach Resort 4*', href: '/' },
        { label: 'Medora Orbis Luxury Homes & Camping 4*', href: '/orbis' },
      ],
    },
    {
      label: 'Destination',
      href: '/destination',
      children: [
        { label: 'Location', href: '/destination/location' },
        { label: 'Vacation with children', href: '/destination/vacation-with-children' },
        { label: 'Things to do', href: '/amenities' },
        { label: 'Beaches', href: '/destination/beaches' },
        { label: 'Weather', href: '/destination/weather' },
        { label: 'Transfers', href: '/destination/transfers' },
        { label: 'Vacation with pets', href: '/destination/vacation-with-pets' },
      ],
    },
    { label: 'We think green', href: '/we-think-green', children: [] },
    { label: 'All contacts', href: '/contact', children: [] },
    { label: 'FAQ', href: '/faq', children: [] },
  ]

  const enResult = await payload.updateGlobal({
    slug: 'main-nav',
    locale: 'en' as any,
    data: { items: navItemsEN },
    context: { disableRevalidate: true },
  })
  const enItems: any[] = (enResult as any).items ?? []

  // Attach IDs from EN result so HR/DE updates patch existing rows (no delete+recreate)
  function withIds(items: any[]) {
    return items.map((item, i) => ({
      ...item,
      id: enItems[i]?.id,
      children:
        item.children?.map((child: any, j: number) => ({
          ...child,
          id: enItems[i]?.children?.[j]?.id,
        })) ?? [],
    }))
  }

  await payload.updateGlobal({
    slug: 'main-nav',
    locale: 'hr' as any,
    data: {
      items: withIds([
        {
          label: 'Smještaj',
          href: '/accommodation',
          children: [
            { label: 'Medora Auri Family Beach Resort 4*', href: '/' },
            { label: 'Medora Orbis Luxury Homes & Camping 4*', href: '/orbis' },
          ],
        },
        {
          label: 'Destinacija',
          href: '/destination',
          children: [
            { label: 'Lokacija', href: '/destination/location' },
            { label: 'Odmor s djecom', href: '/destination/vacation-with-children' },
            { label: 'Aktivnosti', href: '/amenities' },
            { label: 'Plaže', href: '/destination/beaches' },
            { label: 'Klima', href: '/destination/weather' },
            { label: 'Transferi', href: '/destination/transfers' },
            { label: 'Odmor s kućnim ljubimcima', href: '/destination/vacation-with-pets' },
          ],
        },
        { label: 'Zeleno razmišljamo', href: '/we-think-green', children: [] },
        { label: 'Svi kontakti', href: '/contact', children: [] },
        { label: 'Česta pitanja', href: '/faq', children: [] },
      ]),
    },
    context: { disableRevalidate: true },
  })

  await payload.updateGlobal({
    slug: 'main-nav',
    locale: 'de' as any,
    data: {
      items: withIds([
        {
          label: 'Unterkunft',
          href: '/accommodation',
          children: [
            { label: 'Medora Auri Family Beach Resort 4*', href: '/' },
            { label: 'Medora Orbis Luxury Homes & Camping 4*', href: '/orbis' },
          ],
        },
        {
          label: 'Destination',
          href: '/destination',
          children: [
            { label: 'Lage', href: '/destination/location' },
            { label: 'Urlaub mit Kindern', href: '/destination/vacation-with-children' },
            { label: 'Aktivitäten', href: '/amenities' },
            { label: 'Strände', href: '/destination/beaches' },
            { label: 'Klima', href: '/destination/weather' },
            { label: 'Transfers', href: '/destination/transfers' },
            { label: 'Urlaub mit Haustieren', href: '/destination/vacation-with-pets' },
          ],
        },
        { label: 'Wir denken grün', href: '/we-think-green', children: [] },
        { label: 'Alle Kontakte', href: '/contact', children: [] },
        { label: 'FAQ', href: '/faq', children: [] },
      ]),
    },
    context: { disableRevalidate: true },
  })

  payload.logger.info('  ✓ Content pages seeded and MainNav updated.')
}
