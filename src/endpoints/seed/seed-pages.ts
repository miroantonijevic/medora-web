import type { Payload } from 'payload'

const BASE = 'https://medorahotels.com/UserDocsImages'

// Public URL for an uploaded Media doc's file, served from the public/media static dir
function mediaUrl(filename: string) {
  return `/media/${filename}`
}

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

// Mixes paragraphs (plain strings) and bullet lists (string arrays) in one rich text body
function lexMixed(blocks: (string | string[])[]) {
  return {
    root: {
      type: 'root',
      children: blocks.map((block) =>
        Array.isArray(block)
          ? {
              type: 'list',
              listType: 'bullet',
              tag: 'ul',
              start: 1,
              children: block.map((text, i) => ({
                type: 'listitem',
                value: i + 1,
                children: [
                  {
                    type: 'text',
                    text,
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                  },
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
            }
          : {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: block,
                  version: 1,
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
      ),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ── Inline node helpers (for paragraphs/list items mixing text and links) ─────

function lexText(text: string, bold = false) {
  return {
    type: 'text',
    text,
    version: 1,
    detail: 0,
    format: bold ? 1 : 0,
    mode: 'normal',
    style: '',
  }
}

function lexLink(text: string, url: string, newTab = true) {
  return {
    type: 'link',
    fields: { linkType: 'custom' as const, url, newTab },
    children: [lexText(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 2,
  }
}

// Builds a richText body where paragraphs/list items can mix plain text and links
function lexPara(children: (ReturnType<typeof lexText> | ReturnType<typeof lexLink>)[]) {
  return {
    type: 'paragraph' as const,
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function lexRoot(children: object[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function lexBulletsRich(items: (ReturnType<typeof lexText> | ReturnType<typeof lexLink>)[][]) {
  return {
    type: 'list' as const,
    listType: 'bullet' as const,
    tag: 'ul' as const,
    start: 1,
    children: items.map((children, i) => ({
      type: 'listitem' as const,
      value: i + 1,
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
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

function mapEmbed(lat: number, lng: number, directionsUrl: string, zoom = 15) {
  return {
    blockType: 'mapEmbed' as const,
    lat,
    lng,
    zoom,
    directionsUrl,
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

function infoCardHero(params: {
  heroImageId: number | null
  title: string
  workingHoursText?: string | null
  phone?: string
  email?: string
  cardSubtext?: string | null
  showInquiryButton?: boolean
}) {
  return {
    type: 'infoCard' as const,
    heroImage: params.heroImageId,
    title: params.title,
    workingHoursText: params.workingHoursText ?? null,
    phone: params.phone ?? null,
    email: params.email ?? null,
    cardSubtext: params.cardSubtext ?? null,
    showInquiryButton: params.showInquiryButton ?? true,
  }
}

function photoGallery(label: string, imageIds: (number | null)[]) {
  return {
    blockType: 'photo-gallery' as const,
    label,
    images: imageIds.filter(Boolean).map((id) => ({ image: id })),
  }
}

// Builds a medorahotels.com /UserDocsImages/galerije/... URL, encoding each path segment separately
function galUrl(folder: string, file: string) {
  return `${BASE}/galerije/${folder
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')}/${encodeURIComponent(file)}`
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

  // ── Upload sustainability report PDFs and the "Did you know?" hero image ──
  // (PDFs are referenced by their fixed filename via mediaUrl(), so their ids aren't needed)

  const [, , , , greenDidYouKnowHeroId] = await Promise.all([
    img(
      payload,
      `${BASE}/dokumenti/Sustainability%20report%202023.pdf`,
      'sustainability-report-2023.pdf',
      'Sustainability report 2023',
    ),
    img(
      payload,
      `${BASE}/dokumenti/Report-on-sustainability%202020.pdf`,
      'report-on-sustainability-2020.pdf',
      'Report on sustainability 2020',
    ),
    img(
      payload,
      `${BASE}/dokumenti/20-Member-Template-Hazardous-Substance-Register.pdf`,
      'hazardous-substance-register.pdf',
      'Hazardous Substance Register',
    ),
    img(
      payload,
      `${BASE}/dokumenti/Potro%C5%A1nja%20energije%202021-2023.pdf`,
      'energy-consumption-2021-2023.pdf',
      'Energy consumption 2021-2023',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/Medora%20sustainability%20.jpg`,
      'green-did-you-know-hero.jpg',
      'Did you know? Medora sustainability facts',
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
    meta: {
      title: 'Destination',
      description:
        'Discover Podgora and the Makarska Riviera: location, beaches, weather, things to do and everything around Medora Auri hotel and Medora Orbis camp.',
    },
    hero: {
      type: 'lowImpact',
      richText: lexH1('All is well in Podgora (merry differences)'),
    },
    layout: [
      contentSection(
        null,
        lexParas(
          'The Medora Auri hotel complex in Podgora, the jewel of the Makarska Riviera, is an ideal starting point for your exploration of Podgora and the Adriatic coast.',
          'Located between the mighty Biokovo and the clear blue sea, this place exudes beauty and simplicity, while numerous natural and historic elements make it even more attractive. The unbreakable bond between Podgora and the sea has moulded the lives and customs of this place, while historic circumstances have created a vibrant world in which each visitor can immerse themselves.',
          'Regardless of whether your inner self is a conqueror, sailor, trader, gourmand or pure hedonist, Podgora offers features that will make you crave more.',
          'Find out why Podgora is one of the most visited tourist destinations in Dalmatia and the Makarska Riviera, and learn how to best enjoy its variety.',
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
        'Wellness',
        lexParas(
          'Discover our wellness facilities, from the spa and massages to fitness and pools & beaches.',
        ),
        null,
        'right',
        '/destination/wellness',
      ),
      contentSection(
        'Dining & Bars',
        lexParas(
          'Enjoy our restaurants and bars, from Taste the Indigo to the Juice/Cocktail Bar and Lobby Bar.',
        ),
        null,
        'right',
        '/destination/dining-bars',
      ),
      contentSection(
        'Active Vacation',
        lexParas(
          'Fill your holiday with activities, from Biokovo excursions and boat trips to the Medora Fit programme.',
        ),
        null,
        'right',
        '/destination/active-vacation',
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

  const [
    locationHeroId,
    locationHistoryHeroId,
    locationKlimaHeroId,
    whatToVisitHeroId,
    secretsHeroId,
  ] = await Promise.all([
    img(payload, `${BASE}/kategorije/podgora-hero.jpg`, 'podgora-hero.jpg', 'About Podgora'),
    img(
      payload,
      `${BASE}/kategorije/podgora-history-hero.jpg`,
      'location-history-hero.jpg',
      'History and culture of Podgora',
    ),
    img(payload, `${BASE}/kategorije/klima-hero.jpg`, 'podgora-klima-hero.jpg', 'Podgora climate'),
    img(
      payload,
      `${BASE}/kategorije/what-to-visit-hero.jpg`,
      'what-to-visit-hero.jpg',
      'What you can visit in Podgora',
    ),
    img(
      payload,
      `${BASE}/kategorije/did-you-know-hero.jpg`,
      'secrets-podgora-hero.jpg',
      'Secrets of Podgora',
    ),
  ])

  // ── Location page ─────────────────────────────────────────────────────────

  await upsertPage(payload, 'destination/location', {
    title: 'Location',
    hero: locationHistoryHeroId
      ? {
          type: 'highImpact',
          media: locationHeroId ?? locationHistoryHeroId,
          richText: lexH1('Location'),
        }
      : { type: 'lowImpact', richText: lexH1('Location') },
    layout: [
      cardGrid(null, [
        {
          imageId: locationHeroId,
          title: 'Medora Auri Hotel',
          excerpt: 'Medora Auri Family Beach Resort — Ul. Tina Ujevića, 21327 Podgora',
          link: '/destination/location/medora-auri-hotel',
        },
        {
          imageId: locationHistoryHeroId,
          title: 'Medora Orbis Campsite',
          excerpt: 'Medora Orbis Luxury Homes and Camping — Put Sv. Vicenca bb, 21327 Podgora',
          link: '/destination/location/medora-orbis-campsite',
        },
      ]),
    ],
  })

  await upsertPage(payload, 'destination/location/medora-auri-hotel', {
    title: 'Medora Auri Hotel',
    hero: locationHeroId
      ? { type: 'highImpact', media: locationHeroId, richText: lexH1('Medora Auri Hotel') }
      : { type: 'lowImpact', richText: lexH1('Medora Auri Hotel') },
    layout: [
      contentSection(
        null,
        lexParas('Medora Auri Family Beach Resort', 'Ul. Tina Ujevića', '21327, Podgora'),
        null,
      ),
      mapEmbed(
        43.23702,
        17.07675,
        'https://www.google.hr/maps/dir//Medora+Auri+Family+Beach+Resort,+Ul.+Tina+Ujevi%C4%87a+7,+21327,+Podgora',
      ),
    ],
  })

  await upsertPage(payload, 'destination/location/medora-orbis-campsite', {
    title: 'Medora Orbis Campsite',
    hero: locationHistoryHeroId
      ? {
          type: 'highImpact',
          media: locationHistoryHeroId,
          richText: lexH1('Medora Orbis Campsite'),
        }
      : { type: 'lowImpact', richText: lexH1('Medora Orbis Campsite') },
    layout: [
      contentSection(
        null,
        lexParas('Medora Orbis Luxury Homes and Camping', 'Put Sv. Vicenca bb', '21327, Podgora'),
        null,
      ),
      mapEmbed(
        43.233897,
        17.078811,
        'https://www.google.com/maps/dir//Medora+Orbis+Camping+%26+Glamping,+Put+Sv.+Vicenca+bb,+21327,+Podgora',
      ),
    ],
  })

  // Note: the following 4 pages (history-and-culture, what-you-can-visit, secrets-of-podgora,
  // podgora-climate) mirror medorahotels.com's separate "About Podgora" footer section
  // (footer/amenities/about-podgora/*), NOT the Destination > Location page — kept at their
  // existing paths below but no longer linked from destination/location.

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
    hero: locationKlimaHeroId
      ? { type: 'highImpact', media: locationKlimaHeroId, richText: lexH1('Podgora climate') }
      : { type: 'lowImpact', richText: lexH1('Podgora climate') },
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
          'Every day at specific times, special programs for children and adults are performed, provided by a weekly schedule of activities.',
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
          'The Plišivac Bay is more than 1 km long, and some parts are quite narrow, though with enough room for a pleasant stay. Although it is seemingly far removed from the Podgora bustle, do not look for peace and solitude on this popular beach in July and August, as many guests choose to relax and enjoy the summer activities here. Along the hinterland are pine trees that provide natural shade, while refreshments can be found in the nearby restaurants and cafés.',
        ),
        beachPlisivacImgId,
        'right',
      ),
      contentSection(
        'Dračevac Beach',
        lexParas(
          'Dračevac Beach is located about 1 km to the north of the centre of Podgora, in the direction of Tučepi. It is about 400 meters long and covered with beautiful white rounded pebbles that create a visually impressive scene in combination with the turquoise sea.',
          'It is one of the most popular nudist beaches on the Makarska Riviera. It is surrounded by dense pine trees and other Mediterranean vegetation that create natural shade. The entrance into the sea is gradual and very pleasant. Although this beach has no changing rooms, showers and toilets, and the nearest refreshment facilities are a short walk away on the Podgora promenade, this beach will conquer you with its natural beauty and special charm.',
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
          'Nearby are bars and restaurants, which is why this beach is popular with younger people, but also with families for its easy entrance into the sea and proximity to restaurants.',
        ),
        beachSutiklaImgId,
        'right',
      ),
      contentSection(
        'Čaklje Beach',
        lexParas(
          'The central beach in the village of Čaklje is a beautiful pebble beach with clear water, and a mild and gradual entrance into the water. It is partially covered with pine tree shade and close to many restaurants, which is why it is often filled with visitors in July and August — especially families with children.',
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
          'Punta Rata Beach is located in Brela, 20 km from Podgora. In 2004, the American magazine Forbes included it in the 10 most beautiful beaches in the world. It has been awarded the Blue Flag for the highest level of cleanliness of the sea, the colour of which changes from azure to deep blue.',
          'The terrain is of tiny pleasant gravel with a sandy entrance into the sea, making the beach a favourite for families with children. Chairs and umbrellas are available for rent and visitors can enjoy the natural shade of pine trees. Showers and changing rooms are also available, and there are numerous cafés and restaurants nearby.',
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
          'Tučepi Beach is located in Tučepi. It is the longest beach on the Makarska Riviera — a 4-kilometre long area of pebbles. It is largely covered with pine trees, which provide natural shade. The sea is clear and turquoise, with a mild, gradual entrance into the water.',
          'Visitors can rent chairs and umbrellas, and use the showers and changing rooms. Apart from sunbathing and swimming, the beach has a number of water attractions such as banana rides and parasailing. Above the beach is a long promenade with many shops and restaurants, which is especially good for family visits.',
        ),
        beachTucepiImgId,
        'right',
      ),
      contentSection(
        'The best known Croatian beaches',
        lexParas(
          'During your stay in Podgora, you can visit one of the world famous beaches nearby and enjoy sunbathing, swimming and the natural beauty of the magical landscape of central Dalmatia.',
        ),
        null,
      ),
      contentSection(
        'Zlatni Rat Beach',
        lexParas(
          'Zlatni Rat beach is the most famous beach of the Adriatic located in Bol, on Brač island, about 50 km from Podgora. The beach changes its shape — that is, the surface — according to the currents and waves. It is covered with fine white sand, surrounded by crystal clear azure sea and bathed in sunshine.',
          'The deeper hinterland features a pine forest with cafés and restaurants where you can enjoy refreshing summer cocktails in the shade, which is an additional lure for everyone who wants to experience this unique beach.',
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
        "The Medora Auri Hotel and Medora Orbis campsite welcome all guests who wish to take their loyal family members on holiday with them - their pets. Due to the hotel options, we are thankful in advance for following all the information on the rules on your pet's stay. In order for you and your pet, as well as other guests of our hotel, to enjoy their holiday, please follow the 12 golden rules of staying at the Medora Auri Hotel and Medora Orbis campsite.",
        [
          {
            imageId: petsAuriImgId,
            title: 'Medora Auri hotel rules of staying with pets',
            excerpt:
              'Find out all the rules and guidelines for bringing your pet to the Medora Auri Family Beach Resort.',
            link: '/destination/vacation-with-pets/medora-auri-hotel-rules-of-staying-with-pets',
          },
          {
            imageId: petsOrbisImgId,
            title: 'Medora Orbis campsite rules of staying with pets',
            excerpt:
              'Find out all the rules and guidelines for bringing your pet to the Medora Orbis Luxury Homes & Camping.',
            link: '/destination/vacation-with-pets/medora-orbis-campsite-rules-of-staying-with-pets',
          },
          {
            imageId: petsCroatiaImgId,
            title: 'Requirements to fulfil before bringing a pet to Croatia',
            excerpt:
              'Information on the required documentation and procedures for bringing your pet into Croatia.',
            link: '/destination/vacation-with-pets/requirements-to-fulfil-before-bringing-a-pet-to-croatia',
          },
        ],
      ),
    ],
  })

  // ── Vacation with pets subpages ───────────────────────────────────────────

  await upsertPage(
    payload,
    'destination/vacation-with-pets/medora-auri-hotel-rules-of-staying-with-pets',
    {
      title: 'Medora Auri hotel rules of staying with pets',
      hero: petsAuriImgId
        ? {
            type: 'highImpact',
            media: petsAuriImgId,
            richText: lexH1('Medora Auri hotel rules of staying with pets'),
          }
        : { type: 'lowImpact', richText: lexH1('Medora Auri hotel rules of staying with pets') },
      layout: [
        contentSection(
          null,
          lexBullets([
            'The price for pet accommodation is € 27.00 per night.',
            'If a guest does not register a pet at the front desk, the price for pet accommodation is € 100 per night.',
            'Only trained pets (dogs and cats) up to 9 kg are accepted at the hotel, maximum 2 pets per room with prior notice and pet registration at the front desk.',
            'In case the guest arrives with a heavier pet, the hotel reserves the right to refuse to accommodate the guest and/or the pet, or to charge a larger fee for pet accommodation at the price of € 50 per night.',
            'If the pet damages the hotel (urinating inside the hotel, rubbing and scratching the furniture or walls), the hotel reserves the right to deny the guest and/or pet further hospitality, and charge for any damages; equal to the current value of the damaged property, plus 10%.',
            'Pets will have access to guest rooms, hallways, and they can stay in the lobby and the cocktail bar, only on a lead.',
            'Pets (except for guide dogs) are not allowed in the common areas of the hotel - swimming pools, restaurant, playroom, wellness centre, gym, and beach. If the guest brings their pet to these areas of the hotel, they will be asked to leave the premises.',
            'A dog cannot use the bed or sofa in the room, and it is not permitted to bathe the pet in the bathroom. The guest is not allowed to leave their pet on the balcony of the room.',
            'If the guest leaves their pet alone in the room, the guest is obliged to place a notice on the door which will be provided to them at the front desk during check-in.',
            "The hotel shall bear no responsibility for the guest's complaints against irregular cleaning of the room, if the guest left their pet unsupervised in the room during the foreseen cleaning time.",
            'The guest shall follow paragraph 8, Article 17 of the Veterinary Act (Official Gazette 70/79) in the Republic of Croatia.',
            'The beach in front of the Medora Auri Hotel is not intended for bathing pets. There is a beach in Podgora that is intended for bathing pets (dogs).',
          ]),
          null,
        ),
      ],
    },
  )

  await upsertPage(
    payload,
    'destination/vacation-with-pets/medora-orbis-campsite-rules-of-staying-with-pets',
    {
      title: 'Medora Orbis campsite rules of staying with pets',
      hero: petsOrbisImgId
        ? {
            type: 'highImpact',
            media: petsOrbisImgId,
            richText: lexH1('Medora Orbis campsite rules of staying with pets'),
          }
        : {
            type: 'lowImpact',
            richText: lexH1('Medora Orbis campsite rules of staying with pets'),
          },
      layout: [
        contentSection(
          null,
          lexBullets([
            'The price for pet accommodation in the mobile home and glamping pad is € 25.00 per night and on the pitches is € 6.70 per night.',
            'Pet owners are required to check in their pets at the front desk by presenting a vaccination card. Pet owners are required to keep their dogs on a leash and chain them in their designated area. They are also required to pick up and clean up after their pets. Violation of the aforementioned point shall result in charges.',
            'If the pet damages the campsite units (urinating inside the mobile home, rubbing and scratching the furniture or walls), the campsite reserves the right to deny the guest and/or pet further hospitality, and charge for any damages; equal to the current value of the damaged property, plus 10%.',
            'The dog is not allowed to use the bed and sofa in the mobile home, it is not allowed to bathe the dog in the bathroom and it is not allowed to leave the pet on the terrace of the house and the dog cannot use the swimming pool at the house.',
            'If the guest leaves their pet alone in the room, the guest is obliged to place a notice on the door which will be provided to them at the front desk during check-in.',
            'The guest shall follow paragraph 8, Article 17 of the Veterinary Act (Official Gazette 70/79) in the Republic of Croatia.',
            'The beach in front of the Medora Orbis campsite is not intended for bathing pets. There is a beach in Podgora that is intended for bathing pets (dogs).',
          ]),
          null,
        ),
      ],
    },
  )

  await upsertPage(
    payload,
    'destination/vacation-with-pets/requirements-to-fulfil-before-bringing-a-pet-to-croatia',
    {
      title: 'Requirements to fulfil before bringing a pet to Croatia',
      hero: petsCroatiaImgId
        ? {
            type: 'highImpact',
            media: petsCroatiaImgId,
            richText: lexH1('Requirements to fulfil before bringing a pet to Croatia'),
          }
        : {
            type: 'lowImpact',
            richText: lexH1('Requirements to fulfil before bringing a pet to Croatia'),
          },
      layout: [
        contentSection(
          null,
          lexMixed([
            'General conditions for the importation of dogs, cats and domesticated minks (also known as domestic ferrets, white ferrets, African ferrets, weasels, ferrets, domestic weasels or domesticated ferrets) from EU Member States and non-EU countries of low risk:',
            [
              'Animals must have an identification system (microchip). If the animal has a microchip that does not comply with ISO 11784 or 11785 standards, the owner must provide a suitable microchip reader. At any given time, it must be possible to determine the name and address of the owner. The passport or certificate of the animal, which is entered together with the animal, must contain the number of the microchip issued by a veterinarian.',
              'The animal must have a passport or certificate issued by a veterinarian authorised by the authority in question.',
              'The animal must be vaccinated against rabies.',
              'Animals from EU or non-EU countries that are considered as low risk, may enter the territory of the Republic of Croatia if the owner or escort has a valid passport, less than three months old and which have not been vaccinated, or certificate if the animals live in the same place of their birth and if they were not in contact with wild animals that could cause them to be infected or if they are travelling with their mother and they are still dependent on her.',
            ],
            'Dogs, cats and members of the Mustelidae family from high-risk countries, must meet the following requirements:',
            [
              'They must have an identification system (microchip).',
              'They must have a certificate issued by an official veterinarian or, after re-entry, a passport (dogs from Croatia).',
              'They must be vaccinated against rabies.',
              'They must pass an antibody neutralisation test by antibody titration of at least 0.5 IJ/ml per sample, taken by a licensed veterinarian at an authorised laboratory, 30 days after vaccination and three months before entry. The list of authorised institutions is available on the following website: http://ec.europa.eu/food/animal/liveanimals/pets/approval_en.htm.',
              'The said period of three months shall not apply in the case of re-entry of pets from the Republic of Croatia, whose passports confirm positive test results of antibody titration before the animal has left the Republic of Croatia.',
              'Animals that have been commercially imported and sent as a package must be screened by a veterinarian prior to dispatchment.',
              'For further information, please contact the Ministry of Agriculture - Veterinary Directorate. Tel.: +385 1 6443 540. Webpage: www.mps.hr',
            ],
          ]),
          null,
        ),
      ],
    },
  )

  // ── We think green page ───────────────────────────────────────────────────

  await upsertPage(payload, 'we-think-green', {
    title: 'We think green!',
    meta: {
      title: 'We think green!',
      description:
        'Sustainability is our way of doing business. Discover the eco-friendly practices at Medora Auri hotel and Medora Orbis camp.',
    },
    hero: { type: 'highImpact', media: greenHeroId, richText: null },
    layout: [
      contentSection(
        null,
        lexRoot([
          lexPara([lexText('Sustainability is our way of doing business!', true)]),
          lexPara([
            lexText(
              'Medora Auri Hotel was one of the first hotels in Croatia to obtain the Travelife certificate of sustainability in 2017.',
            ),
          ]),
          lexPara([
            lexText(
              'In 2018, we received the Gold medal in sustainability based on customer ratings by the TUI Nordic agency, after competing against 40 Blue Star hotels around the world.',
            ),
          ]),
          lexPara([
            lexText(
              'We pay special attention to sustainable business practices and environmental protection, and we also invite you, our guests, to play an active role in the important mission to preserve the health of our planet.',
            ),
          ]),
          lexPara([lexText('Please find Medora Auri report:')]),
          lexBulletsRich([
            [
              lexText('on sustainability '),
              lexLink('HERE', mediaUrl('sustainability-report-2023.pdf')),
              lexText(' and '),
              lexLink('HERE', mediaUrl('report-on-sustainability-2020.pdf')),
              lexText('.'),
            ],
            [
              lexText('on energy saving '),
              lexLink('HERE', mediaUrl('hazardous-substance-register.pdf')),
              lexText(' and '),
              lexLink('HERE', mediaUrl('energy-consumption-2021-2023.pdf')),
              lexText('.'),
            ],
          ]),
          lexPara([
            lexText('Learn more about '),
            lexLink('our way of doing business.', '/en/we-think-green/did-you-know', false),
          ]),
          lexPara([
            lexText(
              'During your stay, you will probably notice many different details related to this, especially the following:',
            ),
          ]),
        ]),
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
        ]),
        greenReceptionImgId,
        'right',
      ),
      contentSection(
        'Hotel room',
        lexBullets([
          'The air-conditioning unit in a room automatically switches off when the balcony doors are opened. The air-conditioning unit is centrally programmed and can be individually adjusted by +/- 5°C.',
          'The tap water pressure is regulated automatically to ensure optimum water usage.',
          'The bathroom hygiene bags and laundry bags are made from biodegradable material.',
          'All of the hygiene supplies and cosmetic products in the bathroom are paraben-free and enclosed in boxes made from recycled materials.',
        ]),
        greenRoomImgId,
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
        greenChildImgId,
        'right',
      ),
      contentSection(
        'Animal welfare',
        lexBullets([
          'In order to maintain a natural balance in the ecosystem, we kindly ask our guests not to feed or disturb seagulls, sparrows, cats, and other animals found on hotel grounds.',
        ]),
        greenAnimalImgId,
        'right',
      ),
      contentSection(
        'Local community',
        lexBullets([
          'Medora hotels and resorts welcome every opportunity to take part in the grants, sponsorships and activities of various local groups, arts and culture associations, sports clubs, and charity projects.',
          'In accordance with our Corporate Social Responsibility Policy, we endeavour to develop and maintain a partnership with everyone involved in the local community.',
          'We value local suppliers and business owners, and make an effort to buy their products whenever possible.',
          'We encourage employees and guests alike to act responsibly toward environment and our cultural heritage.',
          'We attach great importance to our cultural and natural wealth, for this reason we encourage our guests to behave responsibly towards the environment in the cultural heritage.',
        ]),
        null,
      ),
      contentSection(
        'Employees',
        lexBullets([
          'Our business is fully compliant with the Croatian Labour Act.',
          'We value our employees and treat them fairly and with respect, ensuring no one is discriminated against on the basis of their age, disability, nationality, gender, race, political views, religious beliefs, or sexual orientation.',
          'We place great emphasis on the professional development of our employees and provide them with various forms of training that help them perform their tasks better and build their careers in our company.',
          'We try to employ local people whenever possible.',
          'We educate all of our employees on the importance and benefits of sustainable business practices with the aim of fostering their better understanding and active involvement in the realisation of our goals.',
          'Whenever possible we encourage our employees to use public transport to reduce the negative impact on the environment.',
        ]),
        greenEmployeesImgId,
        'right',
      ),
      contentSection(
        'Medora fit',
        lexBullets([
          'Vacation has always been a time when we escape our everyday routine and training schedule. This is why we have created the Medora Fit programme, where your health comes first. For more information on the Medora Fit activity programme, please contact our entertainment department staff.',
        ]),
        greenFitImgId,
        'right',
      ),
    ],
  })

  // ── Did you know? page (sustainability facts, linked from We think green) ─

  await upsertPage(payload, 'we-think-green/did-you-know', {
    title: 'Did you know?',
    hero: { type: 'mediumImpact', media: greenDidYouKnowHeroId, richText: lexH1('Did you know?') },
    layout: [
      contentSection(
        null,
        lexRoot([
          lexBulletsRich([
            [
              lexText(
                'The Medora Auri Hotel was one of the first hotels in Croatia to obtain the ',
              ),
              lexText('Gold Travelife certificate', true),
              lexText(' of sustainability in 2017.'),
            ],
            [
              lexText('Food waste', true),
              lexText(' in Medora Auri hotel has been reduced by 33% from 2018.'),
            ],
            [
              lexText(
                'At the Medora Auri hotel we encourage our guests to donate 1 euro for the protection of the Balkan snow vole, which is an ',
              ),
              lexText('endemic species.', true),
            ],
            [
              lexText('All '),
              lexText('meat products', true),
              lexText(' used in Medora Hotels are exclusively '),
              lexText('produced in Croatia', true),
              lexText('.'),
            ],
            [
              lexText('Fruits and vegetables', true),
              lexText(' consumed in Medora Hotels are purchased from '),
              lexText('local distributors', true),
              lexText(' in Neretva valley.'),
            ],
            [
              lexText('Water consumption', true),
              lexText(' at the Medora Auri hotel has '),
              lexText('decreased', true),
              lexText(' by 10% since 2017.'),
            ],
            [
              lexText('Gas', true),
              lexText(' consumption at the Medora Auri hotel has '),
              lexText('decreased', true),
              lexText(' by 18,5% since 2017.'),
            ],
            [
              lexText('At the reception of the Medora Auri Hotel, there is a '),
              lexText('Red Cross box', true),
              lexText(' used to raise funds for families with disabilities.'),
            ],
            [
              lexText('Medora Hotels assist the '),
              lexText('local community', true),
              lexText(
                ' in a range of activities (assisting the elementary school, donating to the fire department, holding traditional fairs, cleaning up the underwater world of Podgora, etc.).',
              ),
            ],
            [
              lexText('At the Medora Auri Hotel and at the Medora Orbis Camp, we have a '),
              lexText('charging station for electric vehicles', true),
              lexText(' and use an electric vehicle to transport guests.'),
            ],
            [
              lexText('In all our facilities we use '),
              lexText('biodegradable straws', true),
              lexText(' made from '),
              lexText('renewable materials', true),
              lexText('.'),
            ],
            [
              lexText('The napkins used at the Medora Auri Restaurant are made from '),
              lexText('recycled fibers', true),
              lexText(' collected from cardboard boxes.'),
            ],
            [
              lexText('All of the '),
              lexText('hygiene supplies', true),
              lexText(' and '),
              lexText('cosmetic products', true),
              lexText(' in the bathroom of Medora Auri hotel are '),
              lexText('paraben-free', true),
              lexText(' and enclosed in boxes made from '),
              lexText('recycled materials', true),
              lexText('.'),
            ],
            [
              lexText('Medora hotels employ locals and share of local hotel staff has '),
              lexText('increased', true),
              lexText(' by 5% since 2017.'),
            ],
            [
              lexText('Medora Hotels employ '),
              lexText('people with disability', true),
              lexText(' through continuous '),
              lexText('cooperation', true),
              lexText(
                ' with the largest local Association of People with Disability "Sunce" from Makarska.',
              ),
            ],
          ]),
        ]),
        null,
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
          'We, at Medora Hotels & Resorts d.o.o za ugostiteljstvo., respect your privacy and protect your personal data in accordance with applicable laws and regulations for the protection of personal data. Our mission is to exceed the expectations of our guests with the quality of our products and services, and we always strive to provide our guests, as well as employees, with a pleasant experience during their stay or work with us, responsibly using the information provided to us.',
          'With this document, we would like to explain to you how we collect and what we use personal data for when you use our websites, during your stay in our facilities, or during your employment with us, with whom and why we share them, and your rights regarding your personal data that we use, and how we protect them.',
          'The described Personal Data Protection Policy applies to all business and hospitality facilities of Medora Hotels & Resorts d.o.o za ugostiteljstvo., websites www.medorahotels.com, www.camping-makarska-riviera.com and www.mhr-podgora.com and profiles on social networks.',
        ),
        null,
      ),
      contentSection(
        'Purpose of Collection of Personal Data',
        lexMixed([
          'The main purpose of collecting personal data of our guests is to provide and improve our services and fulfill our legal obligations. Personal data is collected for the following purposes:',
          [
            'Improving the functionality of our websites www.medorahotels.com and www.camping-makarska-riviera.com',
            'Reservation of accommodation or communication with clients in order to respond to their interests about our services (through our websites, by email or by phone)',
            'Execution of the contractual relationship with the guest during his stay',
            'Purchase of additional services',
            'Payment for services',
            'Internal statistical processing of data and preferred services of our guests, and informing our guests about our services, based on our legitimate interest with the aim of improving the quality and sale of our services',
            'Publication and collection of job applications via e-mail and on the website www.mhr-podgora.com',
            'Fulfillment of our legal obligations according to the current Act on Hospitality Activities and accompanying regulations, the Act on the provision of services in tourism, the Act on Accounting, the Act on Labor, the Act on Occupational Safety and the Act on the Protection of Financial Institutions.',
            'Protection of persons and property with a video surveillance system based on our legitimate interest.',
            'Organization of business processes in business and hospitality facilities of Medora.',
          ],
        ]),
        null,
      ),
      contentSection(
        'Guest Personal Data Processing',
        lexMixed([
          'If you have asked us for accommodation, we need your personal data to address the appropriate offer to you and forward it to you. In most cases, this is your first and last name and your e-mail address and/or telephone number, but there is a possibility that we will ask you for additional information in order to adapt our offer to your needs and expectations, such as the number of children traveling with you or the language in which you want us to send you the offer. Only authorized employees of our sales department have access to the data. When you decide to accept our offer and book accommodation, we may need additional information for your identification upon arrival and payment security in accordance with our general terms and conditions. After the reservation has been made and on the day of your arrival, access to your data will be provided to authorized persons at our reception. When you book accommodation through our websites, we collect your basic information such as name, email address, telephone number and payment information. This data is used exclusively to process your reservation and provide accommodation services during your stay. Payment data, i.e. your card data, is encrypted and stored exclusively in systems that comply with PS DSS standards that regulate secure payment. If you contacted us by phone or via chat, the conversation with you remains recorded in our call center based on our legitimate interest in the safe processing of your inquiry, the control of our sales employees and the improvement of their work. Data from the call center is processed by authorized employees of our sales department. Medora has ongoing contracts with other, frequently used online sales channels, through which it advertises its available accommodation capacities and current offers, for example:',
          [
            'www.booking.com, operated by Booking.com, Herengracht 597, Amsterdam, The Netherlands',
            'www.expedia.com, operated by Expedia Lodging Partner Services Sar, Geneva 1207, Switzerland.',
          ],
          'If you booked your stay in Medora through some of the partner sales channels and not directly with us (in communication by phone or email with our sales staff, directly at the reception desks of some of our facilities or on our website), Medora cannot influence the types of personal data that these online agencies are looking for you for the purposes of registering you as their user, nor the details of the processing of your data by them. From these websites, Medora processes and receives only the data necessary to make the correct accommodation reservation in our systems as stated above.',
          'When you, as a guest, come to one of our facilities, the laws governing the hospitality industry oblige us to collect legally defined personal data from each guest. In the event that the guest does not provide the minimum information required for guest registration in all relevant registers, we will not be able to provide accommodation services in accordance with the contract and the law. The personal data collected for this purpose by our authorized employees at the reception are:',
          [
            'name and surname',
            'residential address',
            'date of birth',
            'number, type of identification document and place of issue',
            'citizenship',
            'the name of the facility where you are staying',
            'accommodation unit number',
            'date of arrival and departure of the guest',
            'gender',
          ],
          'Medora stores the above data in its guest database and, in accordance with the legal obligation, sends it to the E-visitor system (electronic system for guest registration) to the competent authorities of the Republic of Croatia, and the above data must be kept in the system for 10 years.',
          'For the purposes of collecting the contract with the guest in accordance with the general terms of business, if payment is not made in cash, data on the account number from which the advance payment was received or data on the debited card are processed. In order to protect our guests as much as possible, your credit card number, which you have entered into the reservation system on our website as a payment guarantee or which we will debit for payment purposes, is recorded in our system in its entirety only until the end of your stay with us and is visible a minimum and strictly defined number of responsible employees. The system we use complies with the highest standard for payment security, the PS DSS standard. After the service has been charged, your card number is masked for further processing in such a way that certain numbers are replaced by an X, and this is also printed on your invoice or payment confirmation. If payment is made by card, your card number is processed exclusively on verified and secure POS devices certified by leading card companies.',
          "In accordance with legal regulations, Medora is obliged to keep all invoices issued to guests with the guest's personal data for 11 years.",
          "Other data related to the circumstances of your stay, such as: method of travel, who you are traveling with, marital status, number of children, pets, food allergies and other interests, will also be collected if they are directly related to the provision of our services. For example if you are traveling by car and want to park it during your stay in one of our designated parking lots or enter the camp with it unhindered, we will also need your vehicle's registration plate. Also, if you ask us to organize transportation for you from/to the airport or to another desired destination, or buy an excursion or other arrangement from our offer, your interests and requests will be recorded in our systems, and your data will be forwarded to one of our external associates with the aim of providing the requested services.",
          'The data we collected during your inquiry, reservation or stay via our website, e-mail, call center or directly at our receptions are stored in our database for a minimum of 5 years, based on our legitimate interest with the aim of improving our services, better and faster response to inquiries in case of return of our guests, and to improve the organization and quality of work of our employees and services in our facilities. Only data that is necessary in accordance with our legal obligations (minimum amount of data prescribed by law) is stored for a longer period. This does not apply to sensitive card payment data that is processed in the system in the manner described above. You can object to the data we process based on our legitimate interest at any time at privacy@medorahotels.com.',
          "If, for the purposes of sending an offer or booking an accommodation, we communicated with you by e-mail, or you gave us your address during a telephone conversation, online correspondence with our staff, registration at our reception desks, participation in prize games or filling out a customer satisfaction survey e-mail as your personal data, Medora's marketing team may occasionally contact you via it. It is our desire that you come back to us again and be our guest again, and with this goal in mind, and to enable you to receive notifications about our special promotions and discounts related to our services, we reserve our legitimate interest to occasionally contact you at your e-mail address. The information you will receive will refer exclusively to the services offered by Medora, which we believe you, as our client, are still interested in. Medora may also introduce a new channel for sending notifications, such as social networks or online advertising, based on our legitimate interest or if we receive your consent. If we made a mistake and you do not want to receive our notifications, you can file a complaint at privacy@medorahotels.com at any time, and we will stop sending them without delay. Personal data are processed in the system we use to send notifications for 5 years, and contain your first and last name, and your e-mail address.",
          "For the safety of our guests and employees, but also in accordance with our legal obligations under the Act on Occupational Safety and the Act on the Protection of Financial Institutions, Medora's business and hospitality facilities are monitored by a video surveillance system and an access control system. Video surveillance system recordings are kept for 14 days.",
        ]),
        null,
      ),
      contentSection(
        'Processing of Personal Data of Medora Employees',
        lexMixed([
          'While you are not yet our employee, your personal data received at the e-mail address posao@medorahotels.com, through published job advertisements or online job application at www.mhr-podgora.com will be used exclusively for the purposes of recruiting Medora hotels and resorts. d.d. By sending your application and CV, you give us your consent to process the personal data received for employment purposes for the needs of currently open positions as well as for our future employment needs. You can withdraw your consent at any time by contacting us at privacy@medorahotels.com, after which we will delete or make your data unavailable for this processing.',
          'When you become our employee, we process your data for the sake of our legal obligations as your employer in accordance with the Labor Act and other valid legal regulations. Data processed include:',
          [
            'Your name and surname',
            'Your date of birth',
            'Your address and your contact information',
            'Your current account number',
            'Number and type of your personal document',
            'Data from your job application and your CV',
            'Additional data necessary for the purposes of employment and exercising your rights (eg, sick leave, tax benefits) as an employee.',
          ],
          'Data processed in accordance with the Labor Act are stored permanently, regardless of the duration of your employment relationship with us. For the needs of daily business organization, we process your data in internal software tools that are used for communication, organization of daily schedules, implementation of business processes, records of working hours, etc. The data processed in these systems, in addition to primarily your first and last name, may also include your official e-mail address, name of your workplace, business correspondence, information about your stay during an official trip and other information in accordance with business needs and according to applicable legal regulations. The working time record system can also use your biometric data in accordance with internal decisions and your consent. Depending on the software tool and the purpose of the processing, the storage time of your personal data varies. Medora\u2019s business and hospitality facilities are equipped with a video surveillance system for the safety of our employees, guests and property, and in accordance with the Law on Occupational Safety and the Law on the Protection of Financial Institutions. Recordings of the video surveillance system can also process your personal data, and they are kept for 14 days.',
        ]),
        null,
      ),
      contentSection(
        'Use of Social Networks and Our Websites',
        lexParas(
          'Our Personal Data Protection Policy is regularly updated on our website and is available to all visitors to our website. By using our websites, filling out an online job application or publishing your own content on our pages, you confirm that you agree with our Personal Data Protection Policy and that you agree that we process your personal data in accordance with the purpose of processing and the published Personal Data Protection Policy. Medora hotels and resorts d.o.o. za ugostiteljstvo. manages and edits profiles on social networks, such as Facebook or Instagram. Visitors to our profiles on social networks can publish content, photos or comments related to our facilities, services or stay with us. Medora hotels and resorts do not encourage or prevent such posts, but they are based solely on the interest and approval of visitors to our profiles. Medora hotels and resorts d.o.o. za ugostiteljstvo will not be liable for any direct or indirect, accidental, material or immaterial damage or expense incurred as a result of the use of Medora\u2019s websites and profiles on social networks or the publication of content by visitors to our pages or profiles. Sometimes we will ask you for your permission to publish these contents on our websites or social network profiles for publicly published content. The contents that we can publish refer exclusively to publicly available images and comments published on Facebook, Instagram or other social networks for which you have given us your consent. With your consent to such publications, you accept the rights and use of your content, which will be presented to you when asking for your consent.',
          'In order for our websites to work optimally and for us to be able to make further improvements to the pages in order to improve your user experience, we use cookies on our websites. Cookie settings can be controlled and adjusted in your web browser, and the use of cookies can be disabled according to your choice. If you disable cookies, you can still browse our site, but some of its features will not be available to you.',
          'A cookie is information saved on your computer by the website you visit. Cookies usually store your preferences for a website, such as your preferred language or address. Later, when you open the same website again, the Internet browser sends back the cookies belonging to that page. This allows the site to display information tailored to your needs.',
          'There are several types of cookies: first-party cookies, session cookies, persistent cookies, and third-party cookies that we use to monitor the success of our digital campaigns and advertising.',
          "First-party cookies come from the website you are viewing and can be permanent or temporary. With the help of these cookies, websites can store data that will be used again during the next visit to that website (e.g. language selection). Temporary cookies or session cookies are removed from the computer when the Internet browser is closed. Permanent or saved cookies remain on the computer after closing the Internet browser program. With them, websites store information, such as your login name and password, so you don't have to log in every time you visit a particular site. Permanent cookies will remain on the computer until you, as a user, disable/delete them or until your browser deletes them (period defined in browser settings).",
          'Third-party cookies come from other websites (eg from advertising). Using these cookies, websites can, for example, monitor and improve the success of digital marketing campaigns.',
          'Medora hotels and resorts d.o.o. za ugostiteljstvo uses cookies on its websites www.medorahotels.com and www.camping-makarska-riviera.com. We use first-party cookies (temporary and permanent) and third-party cookies.',
          'We use cookies to optimize the pages in terms of system performance, ease of use and offer useful information about our services. With cookies, we automatically collect and store data in log files on your computer. Data collected includes information about your IP address, browser type and language settings, operating system, ISP (Internet Service Provider) name, and date/time stamp.',
          'Individual user data is not disclosed to us, but the data we process is anonymous and statistical data, as well as demographic data about our users as a whole. We use this data to analyze trends and marketing needs, as well as effectively manage websites, because they help us learn more about the behavior of our users on our pages, the success of some of our marketing campaigns and the primary interests of our website visitors.',
        ),
        null,
      ),
      contentSection(
        'Storage and Deletion of Your Personal Data',
        lexParas(
          'Your personal data will be stored in a form that can identify you for no longer than is necessary for the purpose for which it is processed. At the end of this time, which for certain processing is regulated by local laws that oblige us to retain data for a longer period, the data will be deleted or made unavailable for further processing.',
        ),
        null,
      ),
      contentSection(
        'Data Transfer to Third Parties',
        lexMixed([
          'In the case of certain data processing, the data you provide to us may be transferred or made available to third parties. In no case do we sell, rent or transfer your data to unauthorized third parties. The transfer of data or access to data is carried out for the following reasons:',
          [
            'When we received your consent for such transfer (e.g. purchase of certain services organized by third parties)',
            'When companies or service providers that Medora hotels use for certain processing purposes access data in a manner that is regulated by the contractual relationship with Medora hotels and resorts d.o.o. za ugostiteljstvo (e.g. billing for services, technical maintenance of certain software tools, archiving and reporting)',
            'To fulfill our contractual and legal obligations (e.g. registration of guests in the e-visitor system, registration of employees or payment of salaries)',
          ],
          'In the event of the need to transfer data, due to one of the above-mentioned reasons, we try to limit the data that is transferred to the necessary minimum. The third parties to whom we transfer your data have undertaken to protect your data in accordance with applicable laws and regulations on the protection of personal data. In the event that your personal data is transferred to third countries outside the European Economic Area (e.g. in the event that the processor is from the USA or uses data resources in the USA), we use standard contractual clauses to ensure adequate data protection during their transfer.',
        ]),
        null,
      ),
      contentSection(
        'Right to Access Your Personal Data, Correction or Delete',
        lexMixed([
          'At any time, you can request information about your personal data that Medora hotels and resorts d.o.o. za ugostiteljstvo processes, for the purpose of processing, data recipients as well as entities to which we transfer your personal data. In addition, you have the right to update, correct, block or delete your data in accordance with legal provisions.',
          'We will be happy to fulfill your request to delete your personal data in the following cases:',
          [
            'if your personal data are no longer necessary in relation to the purposes for which they were collected or otherwise processed;',
            'if you withdraw the consent on which the processing is based;',
            'if you file an objection to the processing and there are no stronger legitimate reasons for the processing, or file an objection to the processing in which the data is processed for the purposes of direct marketing.',
          ],
          'You can send us a request for access to personal data to the e-mail address privacy@medorahotels.com or to our address \u201cMedora hoteli i ljetovi\u0161ta d.o.o za ugostiteljstvo., Mrku\u0161i\u0107a dvori 2\u201d, 21327 Podgora, Croatia with your mandatory contact information and the note "Request for access to personal data". We cannot provide access to personal data through a telephone conversation. In order to prevent the misuse of your personal data, we will send you a predefined form and ask you to fill it in personally and return it to us, and we may also ask you for additional proof of your identity. Without establishing the correct identity, we will not be able to fulfill the request for access to personal data.',
        ]),
        null,
      ),
      contentSection(
        "Protection of Children's Personal Data",
        lexParas(
          'Medora hotels and resorts d.o.o. za ugostiteljstvo advises parents and guardians to teach children about safe and responsible handling of personal data on the Internet, because although at Medora we do not want or intend to collect information about minors without parental or guardian consent, we cannot always know the age of the person who accesses our websites. As a parent or guardian, you always have the right to request access to all personal data about your child that we have received on one of our websites, during your stay or your employment relationship with us. Also, Medora hotels and resorts d.o.o. za ugostiteljstvo they guarantee the protection of children\u2019s personal data provided for by special laws governing that issue.',
        ),
        null,
      ),
      contentSection(
        'Security Measures for the Protection of Personal Data',
        lexParas(
          'Medora hotels and resorts d.o.o za ugostiteljstvo. recognize the importance of information security, and we continuously evaluate and upgrade our technical, physical and organizational security measures and procedures. We provide the users of the reservation system with the highest level of data protection. For secure data transfer between your PC and our servers, we use SSL technology with strong encryption. All personal data, numbers of personal documents, credit cards or other means of payment that users submit through the reservation system are transmitted exclusively through a secure connection using data encryption. The data processed in our systems are accessed only by authorized employees in accordance with the needs of business processes that require individual processing and, in some cases, by third parties who have undertaken to protect your data in accordance with applicable laws and regulations on the protection of personal data. Our employees are trained on how to handle personal data in accordance with legal provisions.',
        ),
        null,
      ),
      contentSection(
        null,
        lexParas(
          'Updated on 07.2026',
          'Medora Hotels & Resorts d.o.o. za ugostiteljstvo',
          'Mrku\u0161i\u0107a dvori 2, 21327 Podgora, Croatia',
          'Tel: +385 (0)21 601 700 | E-mail: privacy@medorahotels.com',
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

  // ── Wellness → update hub to card grid + create subpages ────────────────

  const [
    spaHeroId,
    massageHeroId,
    poolsBeachesHeroId,
    fitnessHeroId,
    fitnessDesktopHeroId,
    wellnessCoverId,
    spaGallery1Id,
    spaGallery3Id,
    spaGallery4Id,
    spaGallery6Id,
    spaGallery7Id,
    spaGallery8Id,
    spaGallery9Id,
    spaGallery10Id,
    spaGallery11Id,
    fitnessGallery1Id,
    fitnessGallery2Id,
    fitnessGallery3Id,
    fitnessGallery4Id,
    fitnessGallery5Id,
  ] = await Promise.all([
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/spa%20people%20desktop.jpg`,
      'spa-hero.jpg',
      'Spa at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/massage%20medora%20auri.jpg`,
      'massage-hero.jpg',
      'Massages at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/kategorije/things-pools-beaches-hero.jpg`,
      'pools-beaches-hero.jpg',
      'Pools & Beaches at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/gym%20mobile.jpg`,
      'fitness-hero.jpg',
      'Fitness Centre at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/gym%20desktop.jpg`,
      'fitness-desktop-hero.jpg',
      'Fitness Centre at Medora Auri (desktop)',
    ),
    img(
      payload,
      `${BASE}/galerije/Interijer/welness%20cover.jpg`,
      'wellness-cover.jpg',
      'Wellness at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%201.jpg`,
      'spa-gallery-1.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%203.jpg`,
      'spa-gallery-3.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%204.jpg`,
      'spa-gallery-4.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%206.jpg`,
      'spa-gallery-6.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%207.jpg`,
      'spa-gallery-7.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%208.jpg`,
      'spa-gallery-8.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%209.jpg`,
      'spa-gallery-9.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%2010.jpg`,
      'spa-gallery-10.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Wellness-Spa/Medora%20Auri%20Wellness%2011.jpg`,
      'spa-gallery-11.jpg',
      'Medora Auri Wellness',
    ),
    img(
      payload,
      `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness%20I.jpg`,
      'fitness-gallery-1.jpg',
      'Fitness Centre at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness%20II.jpg`,
      'fitness-gallery-2.jpg',
      'Fitness Centre at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness%20III.jpg`,
      'fitness-gallery-3.jpg',
      'Fitness Centre at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Interijer/Medora%20Auri%20Fitness.jpg`,
      'fitness-gallery-4.jpg',
      'Fitness Centre at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Interijer/Medora%20Auri%20Girije.jpg`,
      'fitness-gallery-5.jpg',
      'Fitness Centre at Medora Auri',
    ),
  ])

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
      cardGrid(null, [
        {
          imageId: spaHeroId,
          title: 'Spa (9th floor)',
          excerpt: 'Finnish sauna, infrared sauna, whirlpool and relax zone.',
          link: '/destination/wellness/spa',
        },
        {
          imageId: massageHeroId,
          title: 'Massages',
          excerpt: 'Working hours: 08:30–18:30 h (or on request).',
          link: '/destination/wellness/massages',
        },
        {
          imageId: poolsBeachesHeroId,
          title: 'Pools & Beaches',
          excerpt:
            'Heated outdoor pools and beach with free sunbeds, umbrellas and towels. Working hours: 08:00–20:00 h.',
          link: '/destination/wellness/pools-beaches',
        },
        {
          imageId: fitnessHeroId,
          title: 'Fitness',
          excerpt:
            'Fully equipped fitness centre with top quality gear overlooking the sea and islands. Working hours: 07:00–21:00 h.',
          link: '/destination/fitness',
        },
      ]),
    ],
  })

  await upsertPage(payload, 'destination/wellness/spa', {
    title: 'Spa (9th floor)',
    hero: infoCardHero({
      heroImageId: spaHeroId,
      title: 'Spa (9th floor)',
      phone: '+385 (0)21 602 101',
      email: 'reservations@medorahotels.com',
      cardSubtext: 'Finnish & infrared sauna',
      showInquiryButton: true,
    }),
    layout: [
      contentSection(
        "Stress doesn't live here anymore",
        lexParas(
          'Exposure to stressful situations is a part of everyday life that leaves more or less visible traces on all of us. That is why relaxation is of the utmost importance to our physical and mental health. Why not start right here and right now?',
          'In accordance with the highest professional standards, and above all in accordance with your needs and expectations, we offer tested methods of relaxation to cleanse your body and soul of any traces of stress.',
          'For a pleasant and total detoxification, we propose the Finnish or infrared sauna. If you just want to enjoy the peace and tranquillity, we suggest the relaxation room, and if you are a fan of massage or are about to become one, we offer a number of free treatments that you will want to repeat every day.',
        ),
        wellnessCoverId,
        'right',
      ),
      contentSection(
        'Free spa for your enjoyment!',
        lexMixed([
          "Medora Auri Spa offers special treatments to revive your body, feel better and can't wait to come back again.",
          ['Finnish sauna', 'Infrared sauna', 'Whirlpool', 'Relax zone'],
        ]),
        null,
      ),
      photoGallery('Spa photo gallery', [
        spaGallery6Id,
        spaGallery7Id,
        spaGallery10Id,
        spaGallery1Id,
        spaGallery11Id,
        spaGallery3Id,
        spaGallery4Id,
        spaGallery8Id,
        spaGallery9Id,
      ]),
    ],
  })

  await upsertPage(payload, 'destination/wellness/massages', {
    title: 'Massages',
    hero: infoCardHero({
      heroImageId: massageHeroId,
      title: 'Massages',
      workingHoursText: '08:30 - 21:00',
      phone: '+385 (0)21 602 101',
      email: 'auri.reception@medorahotels.com',
      showInquiryButton: true,
    }),
    layout: [
      contentSection(
        'Enjoy your own nature',
        lexParas(
          'With its beauty and diversity, Podgora will remind you every time how important it is to keep in touch with nature and its relaxing properties. Vistas of untouched nature, the scents of eternal grasses and Mediterranean tastes will awaken all your senses and breathe life into them.',
          'We have complemented these natural multi-sensory experiences with a wide range of treatments and massages at the Medora Auri Hotel Wellness Centre, which will help you relax and discover a never-ending source of healthy living energy.',
          'Enjoy a hydro-massage or let our trained, expert staff treat your spine and neck with care and knowledge to rid you of pain. You can completely enjoy your own nature with a sense of pleasure and relief.',
          'The wellness centre is open every day: 08:00 - 21:00 h (or on request)',
        ),
        massageHeroId,
        'right',
      ),
    ],
  })

  await upsertPage(payload, 'destination/wellness/pools-beaches', {
    title: 'Pools & Beaches',
    hero: poolsBeachesHeroId
      ? { type: 'highImpact', media: poolsBeachesHeroId, richText: lexH1('Pools & Beaches') }
      : { type: 'lowImpact', richText: lexH1('Pools & Beaches') },
    layout: [
      contentSection(
        'Real refreshment for your vacation',
        lexParas(
          'The Makarska Riviera is a synonym for some of the most beautiful beaches on the Adriatic Sea, and that is reason enough to laze on the beach and bathe in the clean water every day. A perfect mix of Mediterranean climate, rich vegetation, crystal clear sea and various types of beaches will leave nobody indifferent; it caters for all tastes.',
          "The variety of Podgora can be seen on all levels, including our offer. For those who see their enjoyable vacation as extra comfort and services, we have the large and small pools. They are ideal for relaxation with carefree children's play and numerous activities for fun and a true family vacation.",
          'Pool working hours: 08 - 20 h',
        ),
        poolsBeachesHeroId,
        'right',
      ),
    ],
  })

  await upsertPage(payload, 'destination/fitness', {
    title: 'Fitness',
    hero: infoCardHero({
      heroImageId: fitnessDesktopHeroId,
      title: 'Fitness',
      workingHoursText: '07 - 21 h',
      phone: '+385 (0)21 602 101',
      email: 'reservations@medorahotels.com',
      showInquiryButton: true,
    }),
    layout: [
      contentSection(
        'An active vacation for active pleasure',
        lexParas(
          'An active vacation is not reserved for those who want to fill their daily lives with physical activities and excitement; it is also intended for those who want to explore something different, discover unique content and let new exciting experiences take over. The best place to start your active vacation is definitely the Medora Auri Hotel fitness centre.',
          'An expertly equipped space to satisfy the highest standards will enable each and every user to enjoy a daily dose of physical activity, and all with a lovely view of the sea.',
        ),
        null,
      ),
      photoGallery('Fitness photo gallery', [
        fitnessGallery2Id,
        fitnessGallery1Id,
        fitnessGallery3Id,
        fitnessGallery4Id,
        fitnessGallery5Id,
      ]),
    ],
  })

  // ── Dining & Bars → update hub to card grid + create subpages ────────────

  const [indigoSubImgId, juiceBarImgId, lobbyBarImgId] = await Promise.all([
    img(
      payload,
      `${BASE}/galerije/Restorani/Taste%20Medora.jpg`,
      'taste-indigo-img.jpg',
      'Taste the Indigo restaurant',
    ),
    img(
      payload,
      `${BASE}/galerije/Restorani/indigo%20cocktail%20bar.jpg`,
      'juice-bar-img.jpg',
      'Juice & Cocktail Bar',
    ),
    img(payload, `${BASE}/slike/lobby-bar.jpg`, 'lobby-bar-img.jpg', 'Lobby Bar at Medora Auri'),
  ])

  await upsertPage(payload, 'destination/dining-bars', {
    title: 'Dining & Bars',
    hero: diningHeroId
      ? { type: 'highImpact', media: diningHeroId, richText: lexH1('Dining & Bars') }
      : { type: 'lowImpact', richText: lexH1('Dining & Bars') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Make your vacation at the Makarska Riviera an excellent one with the rich eno-gastronomy in our large choice of quality restaurants and cosy cocktail bars.',
          'Let our top chefs take you on a crazy journey through a variety of flavours and aromas, while our professional restaurant staff ensure that your every single arrival is transformed into an unforgettable experience.',
        ),
        null,
      ),
      cardGrid(null, [
        {
          imageId: indigoSubImgId,
          title: 'Taste the Indigo',
          excerpt:
            'A new gastronomic magic with a view of the Adriatic Sea. Traditional Mediterranean and modern world cuisine.',
          link: '/destination/dining-bars/taste-the-indigo',
        },
        {
          imageId: juiceBarImgId,
          title: 'Juice / Cocktail Bar',
          excerpt:
            'Refresh yourself with freshly squeezed juices during the day and enjoy an evening cocktail while watching the sunset.',
          link: '/destination/dining-bars/juice-cocktail-bar',
        },
        {
          imageId: lobbyBarImgId,
          title: 'Lobby Bar',
          excerpt:
            'Unforgettable moments with a panoramic view of Podgora, golden beaches, crystal blue sea and distant islands.',
          link: '/destination/dining-bars/lobby-bar',
        },
      ]),
    ],
  })

  await upsertPage(payload, 'destination/dining-bars/taste-the-indigo', {
    title: 'Taste the Indigo',
    hero: indigoSubImgId
      ? { type: 'highImpact', media: indigoSubImgId, richText: lexH1('Taste the Indigo') }
      : { type: 'lowImpact', richText: lexH1('Taste the Indigo') },
    layout: [
      contentSection(
        'Mediterranean flavours, Adriatic views',
        lexParas(
          'We listened to your wishes and created a new gastronomic magic in our restaurant with a view of the Adriatic Sea.',
          'Follow the paths of aromas and flavors of traditional Mediterranean and modern world cuisine. You can choose from a meat, fish or vegetarian option on site.',
          'Located on the promenade, Taste the Indigo is the perfect setting for an unforgettable dining experience at the Makarska Riviera.',
        ),
        indigoSubImgId,
        'right',
      ),
      contentSection(
        'On the menu',
        lexBullets([
          'À la carte dinner',
          'Fish, meat & vegetarian menus',
          'Sea view terrace',
          'Homemade wine selection',
        ]),
        null,
      ),
    ],
  })

  await upsertPage(payload, 'destination/dining-bars/juice-cocktail-bar', {
    title: 'Juice / Cocktail Bar',
    hero: juiceBarImgId
      ? { type: 'highImpact', media: juiceBarImgId, richText: lexH1('Juice / Cocktail Bar') }
      : { type: 'lowImpact', richText: lexH1('Juice / Cocktail Bar') },
    layout: [
      contentSection(
        'Sip the sunset',
        lexParas(
          'Refresh yourself with freshly squeezed juices during the day and enjoy an evening cocktail while watching the sunset over the Adriatic.',
          'Our cocktail bar offers a wide selection of classic and signature cocktails prepared by our top cocktail masters, while you bask in the view of the coast, the sea or the islands of the Makarska Riviera.',
        ),
        juiceBarImgId,
        'right',
      ),
      contentSection(
        'On the menu',
        lexBullets([
          'Fresh juices by day',
          'Cocktails by night',
          'Poolside location',
          'Sunset views',
        ]),
        null,
      ),
    ],
  })

  await upsertPage(payload, 'destination/dining-bars/lobby-bar', {
    title: 'Lobby Bar',
    hero: lobbyBarImgId
      ? { type: 'highImpact', media: lobbyBarImgId, richText: lexH1('Lobby Bar') }
      : { type: 'lowImpact', richText: lexH1('Lobby Bar') },
    layout: [
      contentSection(
        'Panoramic views over Podgora',
        lexParas(
          'Unforgettable moments with a panoramic view of Podgora, golden beaches, crystal blue sea and distant islands.',
          'The Lobby Bar has a view that you will never forget and which will be the main, heart-warming topic of your conversations for months to come.',
          'A perfect spot for morning coffee, afternoon drinks, or an evening aperitif.',
        ),
        lobbyBarImgId,
        'right',
      ),
      contentSection(
        'Highlights',
        lexBullets([
          '360° coastal views',
          'Morning coffee to evening drinks',
          'Live music evenings',
          'Sea and island panorama',
        ]),
        null,
      ),
    ],
  })

  // ── Reviews & Rewards → update hub to card grid + create subpages ─────────

  const [rewardsHeroId, guestReviewsHeroId] = await Promise.all([
    img(payload, `${BASE}/kategorije/1920%20award.jpg`, 'rewards-hero.jpg', 'Medora Awards'),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/Medora%20Auri%20reviews%20desktop.jpg`,
      'guest-reviews-hero.jpg',
      'Guest Reviews for Medora Auri',
    ),
  ])

  await upsertPage(payload, 'about/awards', {
    title: 'Reviews & Rewards',
    hero: awardsHeroId
      ? { type: 'highImpact', media: awardsHeroId, richText: lexH1('Reviews & Rewards') }
      : { type: 'lowImpact', richText: lexH1('Reviews & Rewards') },
    layout: [
      contentSection(
        null,
        lexParas(
          'At Medora Hotels & Resorts, quality and guest satisfaction are our top priorities. These awards and reviews reflect our ongoing commitment to providing the best possible holiday experience on the Makarska Riviera.',
        ),
        null,
      ),
      cardGrid(null, [
        {
          imageId: rewardsHeroId,
          title: 'Rewards',
          excerpt:
            'TUI Blue Star, Travelife Gold, HolidayCheck and Hotels.com awards recognising our commitment to excellence and sustainability.',
          link: '/about/awards/rewards',
        },
        {
          imageId: guestReviewsHeroId,
          title: 'Guest reviews for Medora Auri hotel',
          excerpt:
            'Read what our guests say about their stay. Score: 9.4 / 10 based on 2304 reviews across 5 booking platforms.',
          link: '/about/awards/guest-reviews',
        },
      ]),
    ],
  })

  await upsertPage(payload, 'about/awards/rewards', {
    title: 'Rewards',
    hero: rewardsHeroId
      ? { type: 'highImpact', media: rewardsHeroId, richText: lexH1('Rewards') }
      : { type: 'lowImpact', richText: lexH1('Rewards') },
    layout: [
      contentSection(
        '2019 TUI Blue Star – Respect environment award',
        lexParas(
          'The Medora Auri Hotel won the gold Tui Nordic Blue Star award for respect environment. This award is proof of our effort in the area of sustainability and motivation for further development and assistance in creating a better and healthier future.',
        ),
        null,
      ),
      contentSection(
        '2018 TUI Blue Star – Sustainability award GOLD',
        lexParas(
          'In 2018, the Medora Auri Hotel won the gold Tui Nordic Blue Star award for sustainable development. Sustainability is an important subject in our business world and we are doing everything in our power to advance operations in that area. This prestigious award is proof of our effort in the area of sustainability and motivation for further development.',
        ),
        null,
      ),
      contentSection(
        '2018 Holiday Check award',
        lexParas(
          "In 2018, the HolidayCheck portal, one of the world's leading destination reviews portals, gave the Medora Auri Hotel an award as a recommended hotel. Including the grade of 5.5/6, this proves the type of quality service we provide to our guests.",
        ),
        null,
      ),
      contentSection(
        '2017–2019 Travelife GOLD Certificate',
        lexParas(
          'The Medora Auri Hotel won the Travelife Gold certificate, which means that it satisfies the criteria on socioeconomic and environmental sustainability. We have managed to satisfy up to 150 criteria, such as waste management and advising guests about preserving the environment, helping in the development of Podgora, advancing the knowledge of our employees and improving working conditions.',
        ),
        null,
      ),
      contentSection(
        '2017 TUI Blue Star – Hotel General Impression GOLD',
        lexParas(
          'The Medora Auri Hotel won the gold Tui Nordic Blue Star award for excellent hotel impression. This award is a great recognition of the effort we have put into providing quality accommodation and it will encourage us to provide the best possible service to our beloved guests.',
        ),
        null,
      ),
      contentSection(
        '2017 Hotels.com Loved by Guests award – 8.8',
        lexParas(
          'The Medora Auri Hotel is a proud winner of the award of the Hotels.com portal as a hotel loved by guests with a high grade of 8.8/10. This award shows that our service is going in the right direction and we will continue to listen to the comments and proposals of our guests.',
        ),
        null,
      ),
      contentSection(
        '2016 TUI Blue Star – Best Wi-Fi service SPECIAL',
        lexParas(
          'The Medora Auri Hotel recognises the importance of a quality internet connection in this modern, digital age. That is why we take special pride in this unique TUI Nordic Blue Star award for the best Wi-Fi service among 37 hotels on the Mediterranean.',
        ),
        null,
      ),
      contentSection(
        '2016 TUI Blue Star – Hotel Room Standard BRONZE',
        lexParas(
          "In 2016, the Medora Auri Hotel won a bronze TUI Nordic Blue Star award for the complete maintenance and cleanliness of the hotel. This recognition is a special thank you for all the effort our employees have put in to create a more beautiful and quality surrounding area for our guests' vacation.",
        ),
        null,
      ),
    ],
  })

  await upsertPage(payload, 'about/awards/guest-reviews', {
    title: 'Guest reviews for Medora Auri hotel',
    hero: guestReviewsHeroId
      ? {
          type: 'highImpact',
          media: guestReviewsHeroId,
          richText: lexH1('Guest reviews for Medora Auri hotel'),
        }
      : { type: 'lowImpact', richText: lexH1('Guest reviews for Medora Auri hotel') },
    layout: [
      contentSection(
        'Guest Rating Score™',
        lexParas(
          'Score: 9.4 / 10 based on 2304 reviews across 5 booking platforms.',
          'Positive: 2124 reviews | Neutral: 105 reviews | Negative: 75 reviews',
          'We are proud of the trust and satisfaction of our guests. Every review helps us to improve and continue providing the best possible holiday experience on the Makarska Riviera.',
        ),
        null,
      ),
      contentSection(
        null,
        lexParas(
          'To read the latest guest reviews, please visit our profile on TripAdvisor, Booking.com, Hotels.com, Expedia, or HolidayCheck.',
        ),
        null,
        'right',
        '/contact',
      ),
    ],
  })

  // ── Hotel/Camp facilities & services, Photos & gallery, Orbis guest reviews ─

  const [
    parkingImgId,
    wifiImgId,
    restaurantImgId,
    bistroImgId,
    kidsVacationImgId,
    petsVacationImgId,
    poolsBeachImgId,
    roomServiceImgId,
    teslaImgId,
    medicalImgId,
    auriGalleryCoverId,
    auriVideoCoverId,
    orbisReviewsHeroId,
  ] = await Promise.all([
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/parking%20services%20medora.jpg`,
      'parking-services.jpg',
      'Parking at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/wi%20fi%20connection%20medora.jpg`,
      'wifi-connection.jpg',
      'Wi-Fi at Medora Auri',
    ),
    img(
      payload,
      `${BASE}/galerije/Medora%20Auri/Hotel%20restaurant%20photo.jpg`,
      'hotel-restaurant-photo.jpg',
      'Medora Auri hotel restaurant',
    ),
    img(
      payload,
      `${BASE}/galerije/benefiti/indigo%20small%20photo.jpg`,
      'bistro-taste-photo.jpg',
      'Bistro Taste',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/vacation%20with%20children%20medora.jpg`,
      'vacation-children.jpg',
      'Holiday with children',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/vacation%20with%20dog%20medora.jpg`,
      'vacation-pets.jpg',
      'Holiday with pets',
    ),
    img(
      payload,
      `${BASE}/galerije/sustainability/solar%20pannels%20small%20photo.jpg`,
      'pools-beach-services.jpg',
      'Swimming pools and beach',
    ),
    img(
      payload,
      `${BASE}/galerije/benefiti/wine%20in%20the%20room%20small%20photo.jpg`,
      'room-service-wine.jpg',
      'Additional room services',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/tesla%20charger%20medora.jpg`,
      'tesla-charger.jpg',
      'Tesla charger for electric cars',
    ),
    img(
      payload,
      `${BASE}/galerije/Desktop%20novo/doctor%20service%20medora.jpg`,
      'medical-service.jpg',
      'Medical services',
    ),
    img(
      payload,
      `${BASE}/galerije/Eksterijer/Medora%20Auri%20cover%20mobile.jpg`,
      'auri-gallery-cover.jpg',
      'Photo gallery - Medora Auri hotel',
    ),
    img(
      payload,
      `${BASE}/galerije/pla%C5%BEe/Video%20gallery%20mobile.jpg`,
      'auri-video-cover.jpg',
      'Video gallery',
    ),
    img(
      payload,
      `${BASE}/galerije/Medora%20Orbis/Medora%20Orbis%20recepcija.jpg`,
      'orbis-reviews-hero.jpg',
      'Medora Orbis Luxury Homes & Camping',
    ),
  ])

  await upsertPage(payload, 'properties/medora-auri/facilities', {
    title: 'Hotel facilities & services',
    hero: { type: 'lowImpact', richText: lexH1('Hotel facilities & services') },
    layout: [
      contentSection(
        null,
        lexParas(
          'To be best prepared for your holiday departure to Medora Auri Family beach resort, we have prepared answers to frequently asked questions that you may need before coming to the hotel.',
          'We want to make your stay at the Medora Auri Hotel as carefree and enjoyable as possible, so our friendly front desk staff will be available 24/7 and answer with smile to any question you might have as well as help booking extra services.',
        ),
        null,
      ),
      contentSection(
        'Parking',
        lexMixed([
          ['free of charge for one car', 'electric vehicle charging station'],
          'Hotel Medora Auri provides you with a secure parking space for your car. You can park your car at one of three parking spaces which are distant 30, 100 and 200 meters away. Since the number of parking spaces are limited, they cannot be booked prior to arrival at the hotel.',
          'Upon arrival and check-in, ask our friendly staff to accompany you to the nearest available parking space and provide you with detailed instructions how to use it.',
        ]),
        parkingImgId,
        'right',
      ),
      contentSection(
        'Internet',
        lexMixed([
          ['Free wireless internet access'],
          "All Medora Auri hotel guests have free wireless internet access throughout the hotel. It doesn't matter if you spend time in the room, on the balcony, have fun at the hotel's cocktail bar, pool or sea, Wi-Fi is available for you all the time. You will be provided with detailed instructions on how login to free Wi-Fi at the front desk in the moment of check-in.",
        ]),
        wifiImgId,
        'right',
      ),
      contentSection(
        'Hotel restaurant',
        lexMixed([
          [
            'breakfast and dinner: drinks free of charge',
            'dinner supplement - in the case of a bed and breakfast service',
          ],
          'Medora Auri hotel restaurant is open daily from 7:00 am to 10:30 am for breakfast and from 6:30 pm to 9:30 pm for dinner. Breakfast and dinner in the hotel restaurant are served as adjusted buffet.',
          'You can enjoy in discovering local meals in a relaxing atmosphere of our terrace from where extends unavoidable view on the endless space of the Adriatic Sea.',
        ]),
        restaurantImgId,
        'right',
      ),
      contentSection(
        'Bistro Taste',
        lexMixed([
          ['Working hours for lunch: 11:00 a.m. - 05:30 p.m.'],
          'We listened to your wishes and created a new gastronomic magic in our restaurant Taste with a view of the Adriatic Sea.',
          'Follow the paths of aromas and flavors of traditional Mediterranean and modern world cuisine.',
          'You can choose from a meat, fish or vegetarian option on site.',
        ]),
        bistroImgId,
        'right',
      ),
      contentSection(
        'Holiday with children',
        lexMixed([
          [
            'additional free room services: baby cot, baby bottle heater, baby bathtubs, socket protection and baby toilet boards, stroller (subject to availability, available at the reception)',
          ],
          "Hotel Medora Auri offers a rich selection of activities specially designed for a fun and educational vacation for children and a carefree vacation for parents. The Medora Auri hotel offers specially designed activities for the youngest as part of animation programs such as activities on the beach, children's playrooms and board games, as well as a handful of art workshops and a children's mini-disco, organized in the immediate vicinity of the hotel pool.",
          'The opening hours of the games room next to the reception are from 08:00 to 22:00. You can find out more information about the facilities for children here or contact our friendly staff at the hotel reception.',
        ]),
        kidsVacationImgId,
        'right',
      ),
      contentSection(
        'Holiday with pets',
        lexMixed([
          'Price (per pet, per day): 27 EUR',
          'If you would like to bring also your pet on holiday in Medora Auri hotel, you must announce it before arrival, by sending an e-mail at reservations@medorahotels.com or by call on phone number +385 (0) 21 602 100.',
          'In order to enjoy your well-deserved holidays and all hotel benefits, but also respect the comfort of other hotel guests, please pay attention to the four golden rules for pets stay in Medora Auri Hotel:',
          [
            'pets (except guide dogs) are not allowed to enter the hotel common areas - swimming pools, restaurant, playrooms, wellness, gym and the beach.',
            'pets are not allowed to use beds and sofas in hotel rooms and is also not allowed to wash them in room bathrooms.',
            'beach in front of Medora Auri hotel is not intended for pet swimming. Pet-friendly beach is located 100 metres away from the lower entrance to the hotel.',
            'finally, we wish you to relax and enjoy your stay with your four-legged friend :)',
          ],
          'Detailed rules of behaviour for pets staying in Medora Auri hotel you can read on our Vacation with pets page.',
        ]),
        petsVacationImgId,
        'right',
      ),
      contentSection(
        'Swimming pools and beach',
        lexMixed([
          ['pool deck chairs: no additional charge', 'beach deck chairs: no additional charge'],
          'A perfect holiday in Podgora would not be complete without modern and heated swimming pools and superbly arranged golden beach situated right next to the Medora Auri hotel. Swimming pools and the beach are ideal for families or couples where they will experience a great and authentic holiday experience in Dalmatia.',
          'To make your holiday in Medora Auri hotel as relaxed as possible you can, for no extra charge, use daily our swimming pool and beach towels. And to help us preserve the wonderful Dalmatian environment for future generations, if they are clean please dry the towels in the warm Podgora sun. For a complete holiday experience, through July and August there are also available Beach bar and Pool bar Indigo where you can relax with the sounds and smells of the sea while enjoying your cold drink.',
        ]),
        poolsBeachImgId,
        'right',
      ),
      contentSection(
        'Additional room services',
        lexMixed([
          [
            'Bottle of wine (red, white, rose, sparkling) - 24,70 - 50€',
            'Flower petals / Bouquet - 18,5€',
            'Fruit salad - 10,3€',
            'Cake - 35 - 46€',
          ],
          'If you want to book one of our additional room services upon arrival, feel free to contact our operators on the phone number +385 21 601 701 and the selected service will be waiting for you in the room. If you decide on the need for additional services while you are already in the hotel, simply contact the reception on the phone number +385 21 602 100 and we guarantee that it will be delivered to your room as soon as possible.',
          "Enjoy a romantic atmosphere with a bottle of fine wine, flower petals and a fruit platter or cake of your choice. All this with the sound of waves and a beautiful sea view. Sounds tempting, doesn't it? :)",
        ]),
        roomServiceImgId,
        'right',
      ),
      contentSection(
        'Tesla charger for electric cars',
        lexParas(
          'Holiday time is ideal to take care about the environment. All guests coming in Tesla electric car have a special Tesla electric car charger in front of Medora Auri hotel. For assistance and detailed instructions on using the charger, please contact our friendly staff at the hotel reception.',
          'Tesla Destination Charging program enables charging Tesla cars at exclusive locations around the world. Thanks to special battery charging technology, after just an hour of fast charging, your car will be able to travel up to 100 kilometres. We are extremely proud of our partnership with Tesla as well as of our contribution to sustainable transportation and business.',
        ),
        teslaImgId,
        'right',
      ),
      contentSection(
        'Medical services',
        lexParas(
          'If during your stay in Medora Auri hotel you experience an unplanned situation and you need medical help and service, please contact our friendly staff at the hotel reception who will call a doctor for you.',
          'The doctor will arrive at the hotel as soon as possible and service will be charged according to the valid price list approved by the Croatian Medical Chamber.',
          'Hoping that here will be no need for medical intervention we wish you a pleasant and carefree stay at Medora Auri hotel!',
        ),
        medicalImgId,
        'right',
      ),
    ],
  })

  await upsertPage(payload, 'properties/medora-auri/gallery', {
    title: 'Photos & gallery',
    hero: { type: 'lowImpact', richText: lexH1('Photos & gallery') },
    layout: [
      cardGrid(null, [
        {
          imageId: auriGalleryCoverId,
          title: 'Photo gallery - Medora Auri hotel',
          excerpt:
            'Browse photos of the rooms, restaurant, pools and beach at Medora Auri Family Beach Resort.',
          link: '/properties/medora-auri/gallery/photos',
        },
        {
          imageId: auriVideoCoverId,
          title: 'Video gallery',
          excerpt: 'Watch videos of Medora Auri Family Beach Resort.',
          link: '/properties/medora-auri/gallery/videos',
        },
      ]),
    ],
  })

  // Real photo-gallery categories from medorahotels.com's Medora Auri photo gallery page
  const auriGalleryAttractions = [
    '1.png',
    '18.png',
    '28.png',
    '3.png',
    '21.png',
    '10.png',
    '4.png',
    '29.jpg',
    '26.png',
    '6.png',
    '8.png',
    '14.png',
    '11.png',
    '12.png',
    '7.png',
    '30.jpg',
    '13.png',
    '16.png',
    '22.png',
    '15.png',
    '2.png',
    '17.png',
    '19.png',
    '20.png',
    '23.png',
    '5.png',
    '24.png',
    '25.png',
    '9.png',
    '27.png',
    '31.jpg',
  ].map((file) => ({ folder: 'Izleti', file }))

  const auriGalleryInterior = [
    { folder: 'Eksterijer', file: 'Medora Auri hotel dron I.jpg' },
    { folder: 'Eksterijer', file: 'Medora Auri pool model I (2).jpg' },
    { folder: 'Medora Auri', file: 'Medora Auri galery VII.png' },
    { folder: 'Eksterijer', file: '5.2.png' },
    { folder: 'Eksterijer', file: '_N854080-Edit-ivanisevicivan.com.jpg' },
    { folder: 'Interijer', file: '0S3A3192.jpg' },
    { folder: 'Eksterijer', file: 'Medora Auri beach.jpg' },
    { folder: 'Interijer', file: 'Medora Auri Fitness II.jpg' },
    { folder: 'Eksterijer', file: '_N853802-ivanisevicivan.jpg' },
    { folder: 'Eksterijer', file: '_N853719-ivanisevicivan.jpg' },
    { folder: 'Medora Auri', file: 'Medora Auri galery XVI.png' },
    { folder: 'Interijer', file: 'Medora Auri šank.jpg' },
    { folder: 'Interijer', file: 'Medora Auri spa I.jpg' },
    { folder: 'Interijer', file: 'Medora Auri kafic.jpg' },
    { folder: 'Interijer', file: 'Medora Auri lobby.jpg' },
    { folder: 'Interijer', file: 'Medora Auri sauna.jpg' },
    { folder: 'Interijer', file: 'Medora Auri welness.jpg' },
    { folder: 'Interijer', file: 'Medora Auri spa.jpg' },
    { folder: 'Interijer', file: 'Medora Auri welness I.jpg' },
    { folder: 'Medora Auri', file: 'Medora Auri galery XVII.png' },
    { folder: 'Eksterijer', file: 'Medora Auri pool model.jpg' },
    { folder: 'Eksterijer', file: '_N853600-ivanisevicivan.jpg' },
    { folder: 'Eksterijer', file: 'R2D29362 copy.jpg' },
    { folder: 'Eksterijer', file: 'Superior room balcony.jpg' },
    { folder: 'Eksterijer', file: 'Hotel´s beach.jpg' },
    { folder: 'Eksterijer', file: 'Hotel´s pool.jpg' },
  ]

  const auriGalleryEntertainment = [
    'volleyball playground medora auri.jpg',
    'Medora auri fit program.jpg',
    'Medora Auri igraonica I.jpg',
    'playground for children in front of auri.jpg',
    'Medora Auri disco.jpg',
    'Medora Auri diving.jpg',
    'Medora Auri igraonica II.jpg',
    'Medora Auri fireshow I.jpg',
    'Medora auri fitness.jpg',
    'Medora Auri pool.jpg',
    'Medora auri radionica I.jpg',
    'Medora auri radionica.jpg',
    'Medora Auri glasses.jpg',
    'Medora Auri havana I.jpg',
    'Medora auri jet ski.jpg',
    'Medora Auri mountain tour.jpg',
    'Medora Auri fire show II.jpg',
    'Medora auri boat.jpg',
    'Medora Auri dječja igraonica.jpg',
  ].map((file) => ({ folder: 'zabava', file }))

  const auriGalleryRestaurants = [
    { folder: 'Restorani', file: 'Medora Auri new buffet restaurant II.jpg' },
    { folder: 'Restorani', file: 'Medora auri restaurant show cooking.jpg' },
    { folder: 'Restorani/noveNovi direktorij', file: 'Medora Indigo view.jpg' },
    { folder: 'Restorani/noveNovi direktorij', file: 'Medora Taste details.jpg' },
    { folder: 'Restorani/noveNovi direktorij', file: 'Medora Taste salad.jpg' },
    { folder: 'Restorani', file: 'Medora Auri new buffet restaurant I.jpg' },
    { folder: 'Restorani/noveNovi direktorij', file: 'Medora cocktails Riva.jpg' },
    { folder: 'Restorani/noveNovi direktorij', file: 'Taste bistrou terrace.jpg' },
    { folder: 'Restorani', file: 'Medora Auri new buffet restaurant.jpg' },
    { folder: 'Restorani/noveNovi direktorij', file: 'Medora Taste table.jpg' },
    { folder: 'Restorani', file: 'Medora Auri restaurant domestic products.jpg' },
    { folder: 'Restorani/noveNovi direktorij', file: 'Restoran riva stol.jpg' },
    { folder: 'Restorani', file: 'Medora Auri new buffet restaurant dinner.jpg' },
    { folder: 'Restorani', file: 'Medora auri girl cooking dinner.jpg' },
    { folder: 'Restorani', file: 'Medora Auri sweet corner.jpg' },
    { folder: 'Restorani', file: 'Medora Auri restaurant kids.jpg' },
    { folder: 'Restorani', file: 'Medora Auri Indigo II.jpg' },
    { folder: 'Restorani', file: 'Bistrou taste photo from lobby bar.jpg' },
    { folder: 'Restorani', file: 'Medora Auri obitelj.jpg' },
    { folder: 'Restorani', file: 'Medora Auri new buffet restaurant food.jpg' },
    { folder: 'Restorani', file: 'Medora Auri Taste.jpg' },
    { folder: 'Restorani', file: 'Medora auri mul.jpg' },
    { folder: 'Restorani', file: 'Medora Auri family.jpg' },
    { folder: 'Restorani', file: 'Riva Medora.jpg' },
    { folder: 'Restorani', file: 'indigo cocktail bar.jpg' },
  ]

  const auriGalleryCategories = [
    { label: 'Attractions near Medora', items: auriGalleryAttractions },
    { label: 'Hotel interior & exterior', items: auriGalleryInterior },
    { label: 'Entertainment', items: auriGalleryEntertainment },
    { label: 'Restaurants & bars', items: auriGalleryRestaurants },
  ]

  const auriGalleryAllItems = auriGalleryCategories.flatMap((cat, catIdx) =>
    cat.items.map((it, i) => ({ ...it, catIdx, i })),
  )

  const auriGalleryAllIds = await Promise.all(
    auriGalleryAllItems.map((it) => {
      const ext = it.file.split('.').pop()
      return img(
        payload,
        galUrl(it.folder, it.file),
        `auri-gallery-${it.catIdx}-${it.i}.${ext}`,
        it.file.replace(/\.(jpg|png)$/i, ''),
      )
    }),
  )

  let auriGalleryOffset = 0
  const auriGalleryBlocks = auriGalleryCategories.map((cat) => {
    const ids = auriGalleryAllIds.slice(auriGalleryOffset, auriGalleryOffset + cat.items.length)
    auriGalleryOffset += cat.items.length
    return photoGallery(cat.label, ids)
  })

  await upsertPage(payload, 'properties/medora-auri/gallery/photos', {
    title: 'Photo gallery - Medora Auri hotel',
    hero: { type: 'lowImpact', richText: lexH1('Photo gallery - Medora Auri hotel') },
    layout: auriGalleryBlocks,
  })

  await upsertPage(payload, 'properties/medora-auri/gallery/videos', {
    title: 'Video gallery',
    hero: { type: 'lowImpact', richText: lexH1('Video gallery') },
    layout: [
      contentSection(
        null,
        lexParas(
          'Watch our latest videos of Medora Auri Family Beach Resort on our official YouTube channel.',
        ),
        null,
        'right',
        'https://www.youtube.com/channel/UCTtE8QDM52-BZKFvfgjqm9Q',
      ),
    ],
  })

  await upsertPage(payload, 'properties/luxury-camp-orbis/facilities', {
    title: 'Camp facilities & services',
    hero: { type: 'lowImpact', richText: lexH1('Camp facilities & services') },
    layout: [
      contentSection(
        'Additional campsite information',
        lexBullets([
          'Category: 4*',
          'Campsite area: 1.3 ha',
          'Campsite capacity: 77 accommodation units, 260 persons',
          'Free Wi-Fi Internet access',
          'Parking for one vehicle free of charge',
          'Campsite environmental standards: waste sorting, eco-irrigation, solar collectors, well-maintained and preserved environment',
          'The campsite is partially accessible to persons with special needs',
          'Pets are allowed in the designated campsite area with additional charge',
        ]),
        null,
      ),
      contentSection(
        'Opening hours',
        lexBullets([
          'Reception information: 0-24',
          'Entering the campsite by car: 7 AM - 11 PM',
          'Check-in (pitches): from 11 AM',
          'Check-out (pitches): until 10 AM',
          'Check-in (luxury homes): from 3 PM',
          'Check-out (luxury homes): until 10 AM',
        ]),
        null,
      ),
      contentSection(
        'Other useful information',
        lexBullets([
          'Emergency service (all hours): 112',
          'Pharmacy: T + 385 21 625 024; opening hours: 7 AM - 2 PM (closed on weekends)',
          'Shops (town centre); opening hours 7 AM - 10 PM',
        ]),
        null,
      ),
    ],
  })

  const orbisGalleryFiles = [
    'beach in front of orbis campsite.jpg',
    'campers in medora orbis.png',
    'Lifestyle HQ - Mesek Mislav-7740.jpg',
    'Medora Orbis - interior.jpg',
    'Medora Orbis breakfast.jpg',
    'Medora Orbis camping and glamping  mountain view.jpg',
    'Medora Orbis camping and glamping .jpg',
    'Medora Orbis camping and glamping bird view.jpg',
    'Medora Orbis camping and glamping I .jpg',
    'Medora Orbis camping and glamping II.jpg',
    'Medora Orbis camping and glamping view.jpg',
    'medora orbis common area.png',
    'Medora orbis from the top.jpg',
    'Medora Orbis Glamping HQ - Mesek Mislav-0107.jpg',
    'Medora Orbis Glamping HQ - Mesek Mislav-0109.jpg',
    'Medora Orbis Glamping HQ - Mesek Mislav-0226.jpg',
    'Medora Orbis Glamping HQ - Mesek Mislav-9468.jpg',
    'Medora Orbis Glamping HQ - Mesek Mislav-9487.jpg',
    'Medora Orbis Glamping HQ - Mesek Mislav-9555.jpg',
    'Medora Orbis glamping pads.jpg',
    'Medora Orbis glamping.jpg',
    'Medora Orbis HQ - Mesek Mislav-175.jpg',
    'Medora Orbis HQ - Mesek Mislav-193.jpg',
    'Medora Orbis HQ - Mesek Mislav-273.jpg',
    'Medora Orbis HQ - Mesek Mislav-277.jpg',
    'Medora Orbis HQ - Mesek Mislav-401.jpg',
    'Medora Orbis HQ - Mesek Mislav-7978.jpg',
    'Medora Orbis HQ - Mesek Mislav-8328.jpg',
    'Medora Orbis HQ - Mesek Mislav-8348.jpg',
    'Medora Orbis HQ - Mesek Mislav-8417.jpg',
    'Medora orbis mobile homes.jpg',
    'Medora Orbis nature.jpg',
    'Medora Orbis pitch.jpg',
    'Medora Orbis pitches.jpg',
    'medora orbis playground for kids.png',
    'Medora Orbis pool.jpg',
    'Medora Orbis recepcija.jpg',
    'medora orbis reception and facilities.jpg',
    'Medora Orbis sunset in mobile home.jpg',
    'medora orbis toilets and facilities.png',
    'Medora Orbis welcome basket.jpg',
    'Mobilehomes with pool and glamping.jpg',
    'Parcele - Mesek Mislav-9397.jpg',
    'Parcele - Mesek Mislav-9432.jpg',
    'View on makarska riviera.jpg',
  ]

  const orbisGalleryIds = await Promise.all(
    orbisGalleryFiles.map((filename, i) => {
      const ext = filename.match(/\.(jpg|png)$/i)?.[1]?.toLowerCase() ?? 'jpg'
      return img(
        payload,
        `${BASE}/galerije/Medora%20Orbis/${encodeURIComponent(filename)}`,
        `orbis-gallery-${i + 1}.${ext}`,
        filename.replace(/\.(jpg|png)$/i, ''),
      )
    }),
  )

  const orbisGalleryHeroId = await img(
    payload,
    `${BASE}/galerije/Desktop%20novo/Medora%20Orbis%20photo%20gallery%20desktop.jpg`,
    'orbis-gallery-hero.jpg',
    'Photos & gallery - Medora Orbis',
  )

  await upsertPage(payload, 'properties/luxury-camp-orbis/gallery', {
    title: 'Photos & gallery',
    hero: orbisGalleryHeroId
      ? { type: 'highImpact', media: orbisGalleryHeroId, richText: lexH1('Photos & gallery') }
      : { type: 'lowImpact', richText: lexH1('Photos & gallery') },
    layout: [
      contentSection(
        'Natural luxury',
        lexParas(
          'If you are looking for luxury in nature, you might think that this is impossible, but everything is possible! Even luxury has found its place here, in Podgora.',
          'A modernly equipped camp with all the necessary facilities and services combines luxury and nature. For those who like less traditional camping and dream about sleeping in a tree, we make their dreams come true in the glamping tree-houses. Your comfort is complete with the numerous possibilities that await you here. You might think that you\u2019ve found your new home. And perhaps you have.',
        ),
        null,
      ),
      photoGallery(null, orbisGalleryIds),
    ],
  })

  await upsertPage(payload, 'properties/luxury-camp-orbis/guest-reviews', {
    title: 'Guest reviews',
    hero: orbisReviewsHeroId
      ? { type: 'highImpact', media: orbisReviewsHeroId, richText: lexH1('Guest reviews') }
      : { type: 'lowImpact', richText: lexH1('Guest reviews') },
    layout: [
      contentSection(
        'Guest Rating Score™',
        lexParas(
          'Booking.com score: 9.6 / 10 (Exceptional) based on 367 reviews.',
          'Google score: 4.7 / 5 (Excellent) based on 1,173 reviews.',
          'We are proud of the trust and satisfaction of our guests at Medora Orbis Luxury Homes & Camping. Every review helps us to improve and continue providing the best possible holiday experience on the Makarska Riviera.',
        ),
        null,
      ),
      contentSection(
        null,
        lexParas(
          'To read the latest guest reviews, please visit our profile on Booking.com or Google.',
        ),
        null,
        'right',
        '/contact',
      ),
    ],
  })

  // ── Update MainNav — EN first (gets IDs), then HR/DE reuse those IDs ──────

  const navItemsEN = [
    {
      label: 'Accommodation',
      href: '/accommodation',
      children: [
        {
          label: 'Medora Auri Family Beach Resort 4*',
          href: '/',
          grandchildren: [
            {
              label: 'Rooms and suites',
              href: '/properties/medora-auri/rooms',
              subLinks: [
                { label: 'Double rooms', href: '/properties/medora-auri/rooms/auri-double-rooms' },
                { label: 'Family rooms', href: '/properties/medora-auri/rooms/auri-family-rooms' },
                { label: 'Suites', href: '/properties/medora-auri/rooms/auri-suites' },
              ],
            },
            { label: 'Hotel facilities & services', href: '/properties/medora-auri/facilities' },
            { label: 'Photos & gallery', href: '/properties/medora-auri/gallery' },
            { label: 'Reviews & Rewards', href: '/about/awards' },
          ],
        },
        {
          label: 'Medora Orbis Luxury Homes & Camping 4*',
          href: '/orbis',
          grandchildren: [
            {
              label: 'Luxury homes & camping experience',
              href: '/properties/luxury-camp-orbis/rooms',
              subLinks: [
                {
                  label: 'Luxury homes for 2 - 5 persons',
                  href: '/properties/luxury-camp-orbis/rooms/orbis-cabins-small',
                },
                {
                  label: 'Luxury homes for 6 - 7 persons',
                  href: '/properties/luxury-camp-orbis/rooms/orbis-cabins-large',
                },
                {
                  label: 'Pitches and camping places',
                  href: '/properties/luxury-camp-orbis/rooms/orbis-pitches',
                },
              ],
            },
            {
              label: 'Camp facilities & services',
              href: '/properties/luxury-camp-orbis/facilities',
            },
            { label: 'Photos & gallery', href: '/properties/luxury-camp-orbis/gallery' },
            { label: 'Guest reviews', href: '/properties/luxury-camp-orbis/guest-reviews' },
          ],
        },
      ],
    },
    {
      label: 'Destination',
      href: '/destination',
      children: [
        { label: 'Location', href: '/destination/location' },
        { label: 'Vacation with children', href: '/destination/vacation-with-children' },
        { label: 'Things to do', href: '/destination' },
        { label: 'Beaches', href: '/destination/beaches' },
        { label: 'Weather', href: '/destination/weather' },
        { label: 'Transfers', href: '/destination/transfers' },
        { label: 'Vacation with pets', href: '/destination/vacation-with-pets' },
      ],
    },
    { label: 'We think green', href: '/we-think-green', children: [] },
    { label: 'All contacts', href: '/contact', children: [] },
    { label: 'FAQ', href: '/help-center', children: [] },
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
          grandchildren:
            child.grandchildren?.map((grandchild: any, k: number) => ({
              ...grandchild,
              id: enItems[i]?.children?.[j]?.grandchildren?.[k]?.id,
              subLinks:
                grandchild.subLinks?.map((greatGrandchild: any, l: number) => ({
                  ...greatGrandchild,
                  id: enItems[i]?.children?.[j]?.grandchildren?.[k]?.subLinks?.[l]?.id,
                })) ?? [],
            })) ?? [],
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
            {
              label: 'Medora Auri Family Beach Resort 4*',
              href: '/',
              grandchildren: [
                {
                  label: 'Sobe i suiteovi',
                  href: '/properties/medora-auri/rooms',
                  subLinks: [
                    {
                      label: 'Dvokrevetne',
                      href: '/properties/medora-auri/rooms/auri-double-rooms',
                    },
                    {
                      label: 'Obiteljske',
                      href: '/properties/medora-auri/rooms/auri-family-rooms',
                    },
                    { label: 'Suiteovi', href: '/properties/medora-auri/rooms/auri-suites' },
                  ],
                },
                {
                  label: 'Sadržaji i usluge hotela',
                  href: '/properties/medora-auri/facilities',
                },
                { label: 'Fotografije i galerija', href: '/properties/medora-auri/gallery' },
                { label: 'Recenzije i nagrade', href: '/about/awards' },
              ],
            },
            {
              label: 'Medora Orbis Luxury Homes & Camping 4*',
              href: '/orbis',
              grandchildren: [
                {
                  label: 'Luksuzne kućice i kamp iskustvo',
                  href: '/properties/luxury-camp-orbis/rooms',
                  subLinks: [
                    {
                      label: 'Luksuzne kućice za 2 - 5 osoba',
                      href: '/properties/luxury-camp-orbis/rooms/orbis-cabins-small',
                    },
                    {
                      label: 'Luksuzne kućice za 6 - 7 osoba',
                      href: '/properties/luxury-camp-orbis/rooms/orbis-cabins-large',
                    },
                    {
                      label: 'Parcele i kamp mjesta',
                      href: '/properties/luxury-camp-orbis/rooms/orbis-pitches',
                    },
                  ],
                },
                {
                  label: 'Sadržaji i usluge kampa',
                  href: '/properties/luxury-camp-orbis/facilities',
                },
                {
                  label: 'Fotografije i galerija',
                  href: '/properties/luxury-camp-orbis/gallery',
                },
                {
                  label: 'Recenzije gostiju',
                  href: '/properties/luxury-camp-orbis/guest-reviews',
                },
              ],
            },
          ],
        },
        {
          label: 'Destinacija',
          href: '/destination',
          children: [
            { label: 'Lokacija', href: '/destination/location' },
            { label: 'Odmor s djecom', href: '/destination/vacation-with-children' },
            { label: 'Aktivnosti', href: '/destination' },
            { label: 'Plaže', href: '/destination/beaches' },
            { label: 'Klima', href: '/destination/weather' },
            { label: 'Transferi', href: '/destination/transfers' },
            { label: 'Odmor s kućnim ljubimcima', href: '/destination/vacation-with-pets' },
          ],
        },
        { label: 'Zeleno razmišljamo', href: '/we-think-green', children: [] },
        { label: 'Svi kontakti', href: '/contact', children: [] },
        { label: 'Česta pitanja', href: '/help-center', children: [] },
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
            {
              label: 'Medora Auri Family Beach Resort 4*',
              href: '/',
              grandchildren: [
                {
                  label: 'Zimmer & Suiten',
                  href: '/properties/medora-auri/rooms',
                  subLinks: [
                    {
                      label: 'Doppelzimmer',
                      href: '/properties/medora-auri/rooms/auri-double-rooms',
                    },
                    {
                      label: 'Familienzimmer',
                      href: '/properties/medora-auri/rooms/auri-family-rooms',
                    },
                    { label: 'Suiten', href: '/properties/medora-auri/rooms/auri-suites' },
                  ],
                },
                {
                  label: 'Hotelausstattung & Services',
                  href: '/properties/medora-auri/facilities',
                },
                { label: 'Fotos & Galerie', href: '/properties/medora-auri/gallery' },
                { label: 'Bewertungen & Auszeichnungen', href: '/about/awards' },
              ],
            },
            {
              label: 'Medora Orbis Luxury Homes & Camping 4*',
              href: '/orbis',
              grandchildren: [
                {
                  label: 'Luxushäuser & Camping-Erlebnis',
                  href: '/properties/luxury-camp-orbis/rooms',
                  subLinks: [
                    {
                      label: 'Luxushäuser für 2 - 5 Personen',
                      href: '/properties/luxury-camp-orbis/rooms/orbis-cabins-small',
                    },
                    {
                      label: 'Luxushäuser für 6 - 7 Personen',
                      href: '/properties/luxury-camp-orbis/rooms/orbis-cabins-large',
                    },
                    {
                      label: 'Stellplätze und Camping',
                      href: '/properties/luxury-camp-orbis/rooms/orbis-pitches',
                    },
                  ],
                },
                {
                  label: 'Camp-Ausstattung & Services',
                  href: '/properties/luxury-camp-orbis/facilities',
                },
                { label: 'Fotos & Galerie', href: '/properties/luxury-camp-orbis/gallery' },
                {
                  label: 'Gästebewertungen',
                  href: '/properties/luxury-camp-orbis/guest-reviews',
                },
              ],
            },
          ],
        },
        {
          label: 'Destination',
          href: '/destination',
          children: [
            { label: 'Lage', href: '/destination/location' },
            { label: 'Urlaub mit Kindern', href: '/destination/vacation-with-children' },
            { label: 'Aktivitäten', href: '/destination' },
            { label: 'Strände', href: '/destination/beaches' },
            { label: 'Klima', href: '/destination/weather' },
            { label: 'Transfers', href: '/destination/transfers' },
            { label: 'Urlaub mit Haustieren', href: '/destination/vacation-with-pets' },
          ],
        },
        { label: 'Wir denken grün', href: '/we-think-green', children: [] },
        { label: 'Alle Kontakte', href: '/contact', children: [] },
        { label: 'FAQ', href: '/help-center', children: [] },
      ]),
    },
    context: { disableRevalidate: true },
  })

  payload.logger.info('  ✓ Content pages seeded and MainNav updated.')
}
