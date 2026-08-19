import { getPayload } from 'payload'
import config from '@payload-config'

const BASE = 'https://medorahotels.com/UserDocsImages'

export const maxDuration = 60

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== process.env.PAYLOAD_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    await seedFaq(payload)
    return Response.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return Response.json({ success: false, error: msg }, { status: 500 })
  }
}

async function uploadImg(
  payload: Awaited<ReturnType<typeof getPayload>>,
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
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        mimetype: res.headers.get('content-type') ?? 'image/jpeg',
        name: filename,
        size: buffer.length,
      },
    })
    return doc.id as number
  } catch {
    return null
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

async function upsertCategory(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  titleEn: string,
  titleHr: string,
  titleDe: string,
  order: number,
  imageId: number | null,
  items: Array<{ en: [string, string]; hr: [string, string]; de: [string, string] }>,
) {
  const existing = await payload.find({
    collection: 'faq-categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const data = {
    slug,
    order,
    ...(imageId ? { image: imageId } : {}),
    title: titleEn,
    items: items.map((item) => ({
      question: item.en[0],
      answer: lexParas(item.en[1]),
    })),
  }
  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'faq-categories',
      id: existing.docs[0]!.id,
      data,
      locale: 'en',
    })
  } else {
    await payload.create({ collection: 'faq-categories', data, locale: 'en' })
  }

  const created = await payload.find({
    collection: 'faq-categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const id = created.docs[0]!.id
  // Get item IDs so locale updates patch existing items rather than replacing the array
  const itemIds = ((created.docs[0]!.items ?? []) as Array<{ id?: string | null }>).map((i) => i.id)

  await payload.update({
    collection: 'faq-categories',
    id,
    locale: 'hr',
    data: {
      title: titleHr,
      items: items.map((item, i) => ({
        id: itemIds[i],
        question: item.hr[0],
        answer: lexParas(item.hr[1]),
      })),
    },
  })
  await payload.update({
    collection: 'faq-categories',
    id,
    locale: 'de',
    data: {
      title: titleDe,
      items: items.map((item, i) => ({
        id: itemIds[i],
        question: item.de[0],
        answer: lexParas(item.de[1]),
      })),
    },
  })
}

async function seedFaq(payload: Awaited<ReturnType<typeof getPayload>>) {
  const [
    imgReservations,
    imgHotel,
    imgCampsite,
    imgChildren,
    imgPets,
    imgPools,
    imgWellness,
    imgArrival,
    imgFood,
    imgParking,
    imgFreeTime,
    imgOther,
  ] = await Promise.all([
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-%20reservations.svg`,
      'faq-icon-reservations.svg',
      'Reservations',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-holday-hotel.svg`,
      'faq-icon-hotel.svg',
      'Holiday at the Hotel',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-holiday-campsite.svg`,
      'faq-icon-campsite.svg',
      'Holiday at the Campsite',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-holiday-children.svg`,
      'faq-icon-children.svg',
      'Holiday with Children',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-holiday-pets.svg`,
      'faq-icon-pets.svg',
      'Holiday with Pets',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-pool-black.svg`,
      'faq-icon-pools.svg',
      'Swimming Pools & Beaches',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-wellness_black.svg`,
      'faq-icon-wellness.svg',
      'Wellness Center',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon_arrival-podgora.svg`,
      'faq-icon-arrival.svg',
      'Arrival in Podgora',
    ),
    uploadImg(payload, `${BASE}//faq-icons/icon-food.svg`, 'faq-icon-food.svg', 'Food & drinks'),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-parking.svg`,
      'faq-icon-parking.svg',
      'Parking place',
    ),
    uploadImg(
      payload,
      `${BASE}//faq-icons/icon-freetime.svg`,
      'faq-icon-freetime.svg',
      'Free time',
    ),
    uploadImg(payload, `${BASE}//faq-icons/icon-other.svg`, 'faq-icon-other.svg', 'Other'),
  ])

  await upsertCategory(
    payload,
    'reservations',
    'Reservations',
    'Rezervacije',
    'Buchungen',
    0,
    imgReservations,
    [
      {
        en: [
          'Do you offer discounts for longer stays?',
          'Yes, we offer special early-bird and long-stay discounts. Please check our current offers page or contact our reservations team for details.',
        ],
        hr: [
          'Nudite li popuste za duži boravak?',
          'Da, nudimo posebne popuste za rani rezervacije i duže boravke. Provjerite našu stranicu s ponudama ili kontaktirajte naš tim za rezervacije.',
        ],
        de: [
          'Bieten Sie Rabatte für längere Aufenthalte?',
          'Ja, wir bieten spezielle Frühbucher- und Langzeitrabatte. Bitte prüfen Sie unsere aktuelle Angebotsseite oder kontaktieren Sie unser Reservierungsteam.',
        ],
      },
      {
        en: [
          'Can I book adjacent rooms?',
          'Yes, you can request adjacent rooms when booking. Please mention this in the special requests field or contact us directly to ensure availability.',
        ],
        hr: [
          'Mogu li rezervirati susjedne sobe?',
          'Da, možete zatražiti susjedne sobe pri rezervaciji. Navedite to u polju za posebne zahtjeve ili nas izravno kontaktirajte.',
        ],
        de: [
          'Kann ich benachbarte Zimmer buchen?',
          'Ja, Sie können benachbarte Zimmer bei der Buchung anfordern. Bitte geben Sie dies im Sonderanfragenfeld an oder kontaktieren Sie uns direkt.',
        ],
      },
      {
        en: [
          'Do you offer gift certificates?',
          'Yes, we offer gift certificates for stays and experiences. Contact our reservations team at reservations@medorahotels.com for more information.',
        ],
        hr: [
          'Nudite li poklon bonove?',
          'Da, nudimo poklon bonove za boravak i iskustva. Kontaktirajte naš tim na reservations@medorahotels.com za više informacija.',
        ],
        de: [
          'Bieten Sie Geschenkgutscheine an?',
          'Ja, wir bieten Geschenkgutscheine für Aufenthalte und Erlebnisse an. Kontaktieren Sie unser Team unter reservations@medorahotels.com.',
        ],
      },
      {
        en: [
          'Which credit cards do you accept?',
          'We accept all major credit cards including Visa, Mastercard, and American Express.',
        ],
        hr: [
          'Koje kreditne kartice prihvaćate?',
          'Prihvaćamo sve glavne kreditne kartice: Visa, Mastercard i American Express.',
        ],
        de: [
          'Welche Kreditkarten werden akzeptiert?',
          'Wir akzeptieren alle gängigen Kreditkarten, einschließlich Visa, Mastercard und American Express.',
        ],
      },
      {
        en: [
          'How can I change my reservation?',
          'You can change your reservation by contacting our reservations team at reservations@medorahotels.com or by calling +385 (0)21 601 701.',
        ],
        hr: [
          'Kako mogu promijeniti rezervaciju?',
          'Rezervaciju možete promijeniti kontaktiranjem našeg tima na reservations@medorahotels.com ili pozivom na +385 (0)21 601 701.',
        ],
        de: [
          'Wie kann ich meine Reservierung ändern?',
          'Sie können Ihre Reservierung ändern, indem Sie uns unter reservations@medorahotels.com oder +385 (0)21 601 701 kontaktieren.',
        ],
      },
      {
        en: [
          'What is your cancellation policy?',
          'Cancellation policies vary by rate and season. Please review the terms at the time of booking or contact our reservations team for details.',
        ],
        hr: [
          'Kakva je vaša politika otkazivanja?',
          'Uvjeti otkazivanja variraju ovisno o cijeni i sezoni. Provjerite uvjete pri rezervaciji ili kontaktirajte naš tim.',
        ],
        de: [
          'Was ist Ihre Stornierungsrichtlinie?',
          'Die Stornierungsbedingungen variieren je nach Tarif und Saison. Bitte prüfen Sie die Bedingungen bei der Buchung oder kontaktieren Sie uns.',
        ],
      },
      {
        en: [
          'Where can I find your terms and conditions?',
          'Our general terms and conditions are available on our website. You can also request a copy from our reservations team.',
        ],
        hr: [
          'Gdje mogu pronaći opće uvjete poslovanja?',
          'Opći uvjeti poslovanja dostupni su na našoj web stranici. Kopiju možete zatražiti od našeg tima za rezervacije.',
        ],
        de: [
          'Wo finde ich Ihre allgemeinen Geschäftsbedingungen?',
          'Unsere AGB sind auf unserer Website verfügbar. Sie können auch eine Kopie bei unserem Reservierungsteam anfordern.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'holiday-at-the-hotel',
    'Holiday at the Hotel',
    'Odmor u hotelu',
    'Urlaub in Hotel',
    1,
    imgHotel,
    [
      {
        en: [
          'Can 3-4 adults stay in a family room?',
          'Family rooms are designed for 2 adults and children. For 3-4 adults, please contact us to check availability of suitable room configurations.',
        ],
        hr: [
          'Mogu li 3-4 odrasle osobe boraviti u obiteljskoj sobi?',
          'Obiteljske sobe predviđene su za 2 odrasle osobe i djecu. Za 3-4 odrasle osobe, kontaktirajte nas za provjeru dostupnosti.',
        ],
        de: [
          'Können 3-4 Erwachsene in einem Familienzimmer übernachten?',
          'Familienzimmer sind für 2 Erwachsene und Kinder ausgelegt. Für 3-4 Erwachsene kontaktieren Sie uns bitte.',
        ],
      },
      {
        en: [
          'Do rooms have a shower or bathtub?',
          'Room amenities vary by room type. Please check the individual room descriptions when booking or contact us for details on your preferred room.',
        ],
        hr: [
          'Imaju li sobe tuš ili kadu?',
          'Oprema sobe varira ovisno o vrsti sobe. Provjerite opise soba pri rezervaciji ili nas kontaktirajte za detalje.',
        ],
        de: [
          'Haben die Zimmer eine Dusche oder Badewanne?',
          'Die Zimmerausstattung variiert je nach Zimmertyp. Bitte prüfen Sie die Zimmerbeschreibungen bei der Buchung.',
        ],
      },
      {
        en: [
          'Are all rooms non-smoking?',
          'Yes, all rooms at Medora Hotels are non-smoking. Smoking is only permitted in designated outdoor areas.',
        ],
        hr: [
          'Jesu li sve sobe nepušačke?',
          'Da, sve sobe u Medora hotelima su nepušačke. Pušenje je dozvoljeno samo na označenim vanjskim mjestima.',
        ],
        de: [
          'Sind alle Zimmer Nichtraucherzimmer?',
          'Ja, alle Zimmer der Medora Hotels sind Nichtraucherzimmer. Das Rauchen ist nur in ausgewiesenen Außenbereichen gestattet.',
        ],
      },
      {
        en: [
          'What is the door width for accessibility?',
          'We have rooms accessible for guests with reduced mobility. Please contact us directly to discuss your specific needs and we will find the best solution.',
        ],
        hr: [
          'Koja je širina vrata za pristupačnost?',
          'Imamo sobe dostupne gostima s ograničenom pokretljivošću. Kontaktirajte nas izravno da razgovaramo o vašim specifičnim potrebama.',
        ],
        de: [
          'Wie breit sind die Türen für Barrierefreiheit?',
          'Wir haben Zimmer für Gäste mit eingeschränkter Mobilität. Bitte kontaktieren Sie uns direkt, um Ihre spezifischen Bedürfnisse zu besprechen.',
        ],
      },
      {
        en: [
          'Do you have rooms adapted for guests with disabilities?',
          'Yes, we have rooms specially adapted for guests with disabilities. Please contact our reservations team to arrange the most suitable accommodation.',
        ],
        hr: [
          'Imate li sobe prilagođene gostima s invaliditetom?',
          'Da, imamo sobe posebno prilagođene gostima s invaliditetom. Kontaktirajte naš tim za rezervacije za najprikladniji smještaj.',
        ],
        de: [
          'Haben Sie Zimmer für Gäste mit Behinderungen?',
          'Ja, wir haben speziell angepasste Zimmer für Gäste mit Behinderungen. Bitte kontaktieren Sie unser Reservierungsteam.',
        ],
      },
      {
        en: [
          'Can I get an extra bed in my room?',
          'Extra beds are available in some room types for an additional charge. Please request this at the time of booking.',
        ],
        hr: [
          'Mogu li dobiti pomoćni krevet u sobi?',
          'Pomoćni kreveti dostupni su u nekim vrstama soba uz dodatnu naknadu. Zatražite to pri rezervaciji.',
        ],
        de: [
          'Kann ich ein Zusatzbett im Zimmer bekommen?',
          'Zusatzbetten sind in einigen Zimmertypen gegen Aufpreis verfügbar. Bitte fordern Sie dies bei der Buchung an.',
        ],
      },
      {
        en: [
          'Can I request a specific room number?',
          'We will do our best to accommodate specific room requests, but they cannot be guaranteed. Please note your preference during booking.',
        ],
        hr: [
          'Mogu li zatražiti određeni broj sobe?',
          'Trudimo se udovoljiti zahtjevima za određenu sobu, ali to ne možemo jamčiti. Navedite svoju preferenciju pri rezervaciji.',
        ],
        de: [
          'Kann ich eine bestimmte Zimmernummer anfragen?',
          'Wir werden unser Bestes tun, um spezifische Zimmeranfragen zu erfüllen, können dies jedoch nicht garantieren.',
        ],
      },
      {
        en: [
          'Can I upgrade to a larger room?',
          'Room upgrades are subject to availability. Please contact our front desk or reservations team to inquire about upgrade options.',
        ],
        hr: [
          'Mogu li nadograditi na veću sobu?',
          'Nadogradnje soba ovise o dostupnosti. Kontaktirajte našu recepciju ili tim za rezervacije za mogućnosti nadogradnje.',
        ],
        de: [
          'Kann ich auf ein größeres Zimmer upgraden?',
          'Zimmer-Upgrades sind je nach Verfügbarkeit möglich. Bitte kontaktieren Sie unser Personal.',
        ],
      },
      {
        en: [
          'What are the front desk hours?',
          'Our front desk is open 24 hours a day, 7 days a week.',
        ],
        hr: [
          'Kakvo je radno vrijeme recepcije?',
          'Naša recepcija radi 24 sata dnevno, 7 dana u tjednu.',
        ],
        de: [
          'Was sind die Öffnungszeiten der Rezeption?',
          'Unsere Rezeption ist 24 Stunden täglich, 7 Tage die Woche geöffnet.',
        ],
      },
      {
        en: [
          'Do rooms have a balcony?',
          'Many of our rooms feature balconies with sea or garden views. Please check the room description when booking to confirm.',
        ],
        hr: [
          'Imaju li sobe balkon?',
          'Mnoge naše sobe imaju balkone s pogledom na more ili vrt. Provjerite opis sobe pri rezervaciji.',
        ],
        de: [
          'Haben die Zimmer einen Balkon?',
          'Viele unserer Zimmer haben Balkone mit Meer- oder Gartenblick. Bitte prüfen Sie die Zimmerbeschreibung bei der Buchung.',
        ],
      },
      {
        en: [
          'Can I control the temperature in my room?',
          'Yes, all rooms have individual air conditioning units that allow you to control the temperature to your comfort.',
        ],
        hr: [
          'Mogu li kontrolirati temperaturu u sobi?',
          'Da, sve sobe imaju individualne klima uređaje koji vam omogućavaju kontrolu temperature.',
        ],
        de: [
          'Kann ich die Temperatur in meinem Zimmer regulieren?',
          'Ja, alle Zimmer verfügen über individuelle Klimaanlagen.',
        ],
      },
      {
        en: [
          'Is there a minibar in the room?',
          'Selected room categories include a minibar. Please check the room amenities when booking or contact us for details.',
        ],
        hr: [
          'Ima li soba minibar?',
          'Odabrane kategorije soba uključuju minibar. Provjerite opremu sobe pri rezervaciji ili nas kontaktirajte.',
        ],
        de: [
          'Gibt es eine Minibar im Zimmer?',
          'Ausgewählte Zimmerkategorien verfügen über eine Minibar. Bitte prüfen Sie die Zimmerausstattung bei der Buchung.',
        ],
      },
      {
        en: [
          'Are the hotel buildings connected?',
          'The hotel facilities and buildings are connected via covered walkways and paths, allowing comfortable movement between areas.',
        ],
        hr: [
          'Jesu li hotelske zgrade povezane?',
          'Hotelski sadržaji i zgrade povezani su natkrivenim prolazima i stazama, omogućujući ugodno kretanje između područja.',
        ],
        de: [
          'Sind die Hotelgebäude verbunden?',
          'Die Hoteleinrichtungen und Gebäude sind durch überdachte Gänge und Wege verbunden.',
        ],
      },
      {
        en: [
          'Are bathrobes provided?',
          'Bathrobes are available in selected room categories. Please check the room amenities or contact us for details.',
        ],
        hr: [
          'Osiguravaju li se ogrtači za kupanje?',
          'Ogrtači za kupanje dostupni su u odabranim kategorijama soba. Provjerite opremu sobe ili nas kontaktirajte.',
        ],
        de: [
          'Werden Bademäntel bereitgestellt?',
          'Bademäntel sind in ausgewählten Zimmerkategorien verfügbar.',
        ],
      },
      {
        en: [
          'In which currency can I pay at the hotel?',
          'Payments can be made in Euros (EUR) and Croatian Kuna equivalents via card. All major credit cards are accepted.',
        ],
        hr: [
          'U kojoj valuti mogu platiti u hotelu?',
          'Plaćanje je moguće u Eurima (EUR) karticom. Prihvaćaju se sve glavne kreditne kartice.',
        ],
        de: [
          'In welcher Währung kann ich im Hotel bezahlen?',
          'Zahlungen sind in Euro (EUR) per Karte möglich. Alle gängigen Kreditkarten werden akzeptiert.',
        ],
      },
      {
        en: [
          'Can I store my luggage at the hotel?',
          'Yes, we offer luggage storage for guests before check-in and after check-out. Please ask at the front desk.',
        ],
        hr: [
          'Mogu li pohraniti prtljagu u hotelu?',
          'Da, nudimo čuvanje prtljage za goste prije prijave i nakon odjave. Obratite se recepciji.',
        ],
        de: [
          'Kann ich mein Gepäck im Hotel aufbewahren?',
          'Ja, wir bieten Gepäckaufbewahrung für Gäste vor dem Check-in und nach dem Check-out an.',
        ],
      },
      {
        en: [
          'Is there a lift to the walkway?',
          'Our facilities are designed to be as accessible as possible. Please contact us to discuss specific accessibility requirements.',
        ],
        hr: [
          'Postoji li lift do šetnice?',
          'Naši sadržaji dizajnirani su da budu što pristupačniji. Kontaktirajte nas za specifične zahtjeve dostupnosti.',
        ],
        de: [
          'Gibt es einen Aufzug zum Gehweg?',
          'Unsere Einrichtungen sind so gestaltet, dass sie so zugänglich wie möglich sind.',
        ],
      },
      {
        en: [
          'Is there a lift in the hotel?',
          'Yes, our hotel has lifts serving all floors. Please contact us if you have specific accessibility needs.',
        ],
        hr: [
          'Postoji li lift u hotelu?',
          'Da, naš hotel ima liftove na svim katovima. Kontaktirajte nas ako imate specifične potrebe pristupačnosti.',
        ],
        de: ['Gibt es einen Aufzug im Hotel?', 'Ja, unser Hotel hat Aufzüge auf allen Etagen.'],
      },
      {
        en: [
          'Can I bring food to the room?',
          'We offer room service for meals and snacks. Please contact the front desk to place an order.',
        ],
        hr: [
          'Mogu li donijeti hranu u sobu?',
          'Nudimo sobnu uslugu za obroke i grickalice. Obratite se recepciji za narudžbu.',
        ],
        de: [
          'Kann ich Essen auf das Zimmer bringen?',
          'Wir bieten Zimmerservice für Mahlzeiten und Snacks an.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'holiday-at-the-campsite',
    'Holiday at the Campsite',
    'Odmor u kampu',
    'Urlaub auf Campingplätzen',
    2,
    imgCampsite,
    [
      {
        en: [
          'How far is the campsite from the beach?',
          'Medora Orbis is located directly by the sea, with private beach access just steps from the campsite.',
        ],
        hr: [
          'Koliko je kamp udaljen od plaže?',
          'Medora Orbis nalazi se neposredno uz more, s privatnim pristupom plaži odmah uz kamp.',
        ],
        de: [
          'Wie weit ist der Campingplatz vom Strand entfernt?',
          'Medora Orbis liegt direkt am Meer, mit privatem Strandzugang direkt neben dem Campingplatz.',
        ],
      },
      {
        en: [
          'Do mobile homes have a sea view?',
          'Some mobile homes have sea views. Please check the specific unit description when booking or contact us to inquire about available options.',
        ],
        hr: [
          'Imaju li mobilne kućice pogled na more?',
          'Neke mobilne kućice imaju pogled na more. Provjerite opis jedinice pri rezervaciji ili nas kontaktirajte.',
        ],
        de: [
          'Haben Mobilheime Meerblick?',
          'Einige Mobilheime haben Meerblick. Bitte prüfen Sie die Beschreibung bei der Buchung.',
        ],
      },
      {
        en: [
          'Is there a shop on the campsite?',
          'Yes, we have a shop on the campsite offering groceries, toiletries, and other essentials.',
        ],
        hr: [
          'Postoji li prodavaonica na kampu?',
          'Da, na kampu se nalazi prodavaonica s prehrambenim proizvodima, toaletnim potrepštinama i osnovnim potrepštinama.',
        ],
        de: [
          'Gibt es einen Shop auf dem Campingplatz?',
          'Ja, wir haben einen Shop auf dem Campingplatz mit Lebensmitteln und anderen Grundbedarfsartikeln.',
        ],
      },
      {
        en: [
          'Is parking available at the campsite?',
          'Yes, parking is available at the campsite. Charges may apply depending on the season.',
        ],
        hr: [
          'Je li parking dostupan na kampu?',
          'Da, parking je dostupan na kampu. Naknade mogu biti primijenjene ovisno o sezoni.',
        ],
        de: [
          'Gibt es Parkplätze auf dem Campingplatz?',
          'Ja, Parkplätze sind auf dem Campingplatz verfügbar. Je nach Saison können Gebühren anfallen.',
        ],
      },
      {
        en: [
          'What is the pool size at the campsite?',
          'The campsite features a large outdoor pool. Please visit our facilities page for exact dimensions and details.',
        ],
        hr: [
          'Koja je veličina bazena na kampu?',
          'Kamp ima velik vanjski bazen. Posjetite našu stranicu sadržaja za točne dimenzije i detalje.',
        ],
        de: [
          'Wie groß ist der Pool auf dem Campingplatz?',
          'Der Campingplatz verfügt über einen großen Außenpool. Bitte besuchen Sie unsere Einrichtungsseite für genaue Maße.',
        ],
      },
      {
        en: [
          'Do camping pitches have a sea view?',
          'Some pitches offer sea views. We recommend booking early to secure a preferred pitch location.',
        ],
        hr: [
          'Imaju li parcele na kampu pogled na more?',
          'Neke parcele nude pogled na more. Preporučamo rano rezerviranje kako biste osigurali željenu lokaciju.',
        ],
        de: [
          'Haben Stellplätze Meerblick?',
          'Einige Stellplätze bieten Meerblick. Wir empfehlen eine frühzeitige Buchung.',
        ],
      },
      {
        en: [
          'Are barbecues allowed at the campsite?',
          'Barbecues are permitted in designated areas only. Please ask the reception for the specific locations.',
        ],
        hr: [
          'Je li roštilj dozvoljen na kampu?',
          'Roštilj je dozvoljen samo na označenim mjestima. Obratite se recepciji za specifične lokacije.',
        ],
        de: [
          'Sind Grillgeräte auf dem Campingplatz erlaubt?',
          'Grillen ist nur in ausgewiesenen Bereichen erlaubt.',
        ],
      },
      {
        en: [
          'How far is the campsite from the town centre?',
          'Medora Orbis is located in Podgora, within easy walking distance of the town centre, local restaurants, and shops.',
        ],
        hr: [
          'Koliko je kamp udaljen od centra mjesta?',
          'Medora Orbis nalazi se u Podgori, u lakoj pješačkoj udaljenosti od centra mjesta, lokalnih restorana i trgovina.',
        ],
        de: [
          'Wie weit ist der Campingplatz vom Ortszentrum entfernt?',
          'Medora Orbis liegt in Podgora, in kurzer Gehentfernung vom Ortszentrum.',
        ],
      },
      {
        en: [
          'What type of surface do the pitches have?',
          'Pitches are on grass and gravel surfaces. Pitch types and sizes vary — please check availability when booking.',
        ],
        hr: [
          'Kakva je podloga na parcelama?',
          'Parcele su na travnatoj i šljunčanoj podlozi. Vrste i veličine parcela variraju — provjerite dostupnost pri rezervaciji.',
        ],
        de: [
          'Welche Oberfläche haben die Stellplätze?',
          'Stellplätze sind auf Gras- und Schotteroberflächen. Bitte prüfen Sie die Verfügbarkeit bei der Buchung.',
        ],
      },
      {
        en: [
          'What are the campsite reception hours?',
          'The campsite reception is open daily. During peak season, it operates 24 hours. Please contact us for off-season hours.',
        ],
        hr: [
          'Kakvo je radno vrijeme kamping recepcije?',
          'Kamping recepcija radi svakodnevno. U sezoni radi 24 sata. Kontaktirajte nas za izvansezonsko radno vrijeme.',
        ],
        de: [
          'Was sind die Öffnungszeiten der Campingrezeption?',
          'Die Campingrezeption ist täglich geöffnet. In der Hochsaison rund um die Uhr.',
        ],
      },
      {
        en: [
          'Are pets allowed at the campsite?',
          'Pets are welcome at the campsite in designated areas. Please notify us at the time of booking if you are bringing a pet.',
        ],
        hr: [
          'Jesu li kućni ljubimci dozvoljeni na kampu?',
          'Kućni ljubimci su dobrodošli na kampu u označenim područjima. Obavijestite nas pri rezervaciji ako donosite kućnog ljubimca.',
        ],
        de: [
          'Sind Haustiere auf dem Campingplatz erlaubt?',
          'Haustiere sind auf dem Campingplatz in ausgewiesenen Bereichen willkommen.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'holiday-with-children',
    'Holiday with Children',
    'Odmor s djecom',
    'Urlaub mit Kindern',
    3,
    imgChildren,
    [
      {
        en: [
          'Is accommodation free for children under 5?',
          'Children under 5 years old stay free of charge when sharing a room with parents using existing bedding.',
        ],
        hr: [
          'Je li smještaj besplatan za djecu ispod 5 godina?',
          'Djeca mlađa od 5 godina borave besplatno kada dijele sobu s roditeljima koristeći postojeću posteljinu.',
        ],
        de: [
          'Ist die Unterkunft für Kinder unter 5 Jahren kostenlos?',
          'Kinder unter 5 Jahren übernachten kostenlos, wenn sie sich ein Zimmer mit den Eltern teilen.',
        ],
      },
      {
        en: [
          'Are there playrooms for children?',
          'Yes, we have dedicated play areas and playrooms for children of various ages.',
        ],
        hr: [
          'Postoje li igraonice za djecu?',
          'Da, imamo namjenska igrališta i igraonice za djecu različite dobi.',
        ],
        de: [
          'Gibt es Spielzimmer für Kinder?',
          'Ja, wir haben dedizierte Spielbereiche und Spielzimmer für Kinder verschiedener Altersgruppen.',
        ],
      },
      {
        en: [
          'What activities are available for children?',
          "We offer a wide range of children's activities including animation programs, sports, crafts, and beach activities throughout the season.",
        ],
        hr: [
          'Koje aktivnosti su dostupne za djecu?',
          'Nudimo širok raspon aktivnosti za djecu uključujući animacijske programe, sport, kreativne radionice i aktivnosti na plaži.',
        ],
        de: [
          'Welche Aktivitäten gibt es für Kinder?',
          'Wir bieten ein breites Spektrum an Kinderaktivitäten, darunter Animationsprogramme, Sport und Strandaktivitäten.',
        ],
      },
      {
        en: [
          'Do you provide prams or cots?',
          'Travel cots are available on request for an additional charge. Prams can be accommodated but must be brought by guests.',
        ],
        hr: [
          'Osiguravate li dječja kolica ili krevetiće?',
          'Dječji krevetići dostupni su na zahtjev uz dodatnu naknadu. Kolica moraju donijeti gosti.',
        ],
        de: [
          'Stellen Sie Kinderwagen oder Kinderbetten bereit?',
          'Reisekinderbetten sind auf Anfrage gegen Aufpreis verfügbar.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'holiday-with-pets',
    'Holiday with Pets',
    'Odmor s kućnim ljubimcima',
    'Urlaub mit Haustieren',
    4,
    imgPets,
    [
      {
        en: [
          'Can I bring my dog on holiday?',
          'Dogs are welcome at Medora Orbis Campsite. A pet fee applies. Please notify us when booking.',
        ],
        hr: [
          'Mogu li dovesti psa na odmor?',
          'Psi su dobrodošli u Medora Orbis kampu. Primjenjuje se naknada za kućne ljubimce. Obavijestite nas pri rezervaciji.',
        ],
        de: [
          'Kann ich meinen Hund in den Urlaub mitnehmen?',
          'Hunde sind im Medora Orbis Campingplatz willkommen. Eine Haustiergebb ühr fällt an.',
        ],
      },
      {
        en: [
          'Can my dog come to the beach?',
          'Dogs are permitted on designated pet-friendly beach areas. Please ask at reception for the current designated areas.',
        ],
        hr: [
          'Može li moj pas ići na plažu?',
          'Psi su dopušteni na određenim plažama prilagođenim kućnim ljubimcima. Pitajte recepciju za trenutna označena područja.',
        ],
        de: [
          'Darf mein Hund an den Strand?',
          'Hunde sind an ausgewiesenen tierfreundlichen Strandbereichen erlaubt.',
        ],
      },
      {
        en: [
          'Where are dogs allowed?',
          'Dogs are permitted in outdoor areas and on the campsite. They are not allowed in restaurant areas, pool areas, or indoor facilities.',
        ],
        hr: [
          'Gdje su psi dozvoljeni?',
          'Psi su dozvoljeni na otvorenim prostorima i na kampu. Nisu dozvoljeni u restoranskim prostorima, bazenima ili unutarnjim sadržajima.',
        ],
        de: [
          'Wo sind Hunde erlaubt?',
          'Hunde sind in Außenbereichen und auf dem Campingplatz erlaubt. Nicht gestattet in Restaurantbereichen, Pools oder Inneneinrichtungen.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'swimming-pools-beaches',
    'Swimming Pools & Beaches',
    'Bazeni i plaže',
    'Pools und Strände',
    5,
    imgPools,
    [
      {
        en: [
          'Are the pools fresh water or salt water?',
          'Our pools are filled with fresh water and treated with modern filtration systems.',
        ],
        hr: [
          'Jesu li bazeni s pitkom ili morskom vodom?',
          'Naši bazeni punjeni su slatkom vodom i tretiraju se modernim sustavima filtracije.',
        ],
        de: [
          'Sind die Pools mit Süß- oder Salzwasser gefüllt?',
          'Unsere Pools sind mit Süßwasser gefüllt und werden mit modernen Filtrationsanlagen behandelt.',
        ],
      },
      {
        en: [
          'Are the pools heated?',
          'Our indoor pool is heated year-round. Outdoor pools are open during the summer season and are not heated.',
        ],
        hr: [
          'Jesu li bazeni grijani?',
          'Naš unutarnji bazen grijan je cijele godine. Vanjski bazeni otvoreni su durante ljeta i nisu grijani.',
        ],
        de: [
          'Sind die Pools beheizt?',
          'Unser Innenpool ist ganzjährig beheizt. Außenpools sind in der Sommersaison geöffnet und werden nicht beheizt.',
        ],
      },
      {
        en: [
          'When do the pools open?',
          'Outdoor pools open in June and close in September. The indoor pool is available year-round.',
        ],
        hr: [
          'Kada se otvaraju bazeni?',
          'Vanjski bazeni otvaraju se u lipnju i zatvaraju u rujnu. Unutarnji bazen dostupan je cijele godine.',
        ],
        de: [
          'Wann öffnen die Pools?',
          'Außenpools öffnen im Juni und schließen im September. Der Innenpool ist ganzjährig verfügbar.',
        ],
      },
      {
        en: [
          'Are sunbeds charged?',
          'Sunbeds at the pool area are complimentary for hotel guests. Beach sunbeds may incur a charge during peak season.',
        ],
        hr: [
          'Naplaćuju li se ležaljke?',
          'Ležaljke u bazenskom prostoru besplatne su za hotelske goste. Ležaljke na plaži mogu se naplaćivati u sezoni.',
        ],
        de: [
          'Sind Liegestühle kostenpflichtig?',
          'Liegestühle im Poolbereich sind für Hotelgäste kostenlos. Strandliegen können in der Hochsaison kostenpflichtig sein.',
        ],
      },
      {
        en: [
          'Are beach towels provided?',
          'Beach towels are available for hotel guests. A towel card deposit system is in place — please ask at reception for details.',
        ],
        hr: [
          'Osiguravaju li se ručnici za plažu?',
          'Ručnici za plažu dostupni su za hotelske goste. Postoji sustav kartice za ručnike — obratite se recepciji za detalje.',
        ],
        de: [
          'Werden Strandhandtücher bereitgestellt?',
          'Strandtücher stehen Hotelgästen zur Verfügung. Ein Handtuch-Kartensystem ist vorhanden — fragen Sie an der Rezeption.',
        ],
      },
      {
        en: [
          'Is there a nudist beach nearby?',
          'There is a natural nudist area on the beach near the hotel. Please ask at reception for directions.',
        ],
        hr: [
          'Postoji li nudistička plaža u blizini?',
          'U blizini hotela postoji prirodno nudističko područje na plaži. Obratite se recepciji za upute.',
        ],
        de: [
          'Gibt es in der Nähe einen FKK-Strand?',
          'In der Nähe des Hotels gibt es einen natürlichen FKK-Bereich am Strand.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'wellness-center',
    'Wellness Center',
    'Wellness centar',
    'Wellness-Center',
    6,
    imgWellness,
    [
      {
        en: [
          'Can children use the wellness facilities?',
          'The wellness area is reserved for guests aged 16 and over. Children must be accompanied by an adult and may have restricted access to certain facilities.',
        ],
        hr: [
          'Mogu li djeca koristiti wellness sadržaje?',
          'Wellness područje rezervirano je za goste starije od 16 godina. Djeca moraju biti u pratnji odrasle osobe i mogu imati ograničen pristup određenim sadržajima.',
        ],
        de: [
          'Können Kinder die Wellnesseinrichtungen nutzen?',
          'Der Wellnessbereich ist für Gäste ab 16 Jahren reserviert. Kinder müssen von Erwachsenen begleitet werden.',
        ],
      },
      {
        en: [
          'Which wellness facilities are included in the hotel stay?',
          'Access to the indoor pool, sauna, and fitness area is included in the hotel stay. Massages and treatments are available at an additional cost.',
        ],
        hr: [
          'Koji wellness sadržaji su uključeni u hotelski boravak?',
          'Pristup unutarnjem bazenu, sauni i fitness centru uključen je u hotelski boravak. Masaže i tretmani dostupni su uz dodatnu naknadu.',
        ],
        de: [
          'Welche Wellnesseinrichtungen sind im Hotelaufenthalt inbegriffen?',
          'Der Zugang zum Innenpool, zur Sauna und zum Fitnessbereich ist im Aufenthalt enthalten. Massagen sind gegen Aufpreis erhältlich.',
        ],
      },
      {
        en: [
          'Do I need to book wellness treatments in advance?',
          'We recommend booking wellness treatments in advance, especially during peak season, to ensure availability at your preferred time.',
        ],
        hr: [
          'Moram li unaprijed rezervirati wellness tretmane?',
          'Preporučamo rezerviranje wellness tretmana unaprijed, posebno u sezoni, kako biste osigurali dostupnost u željenom terminu.',
        ],
        de: [
          'Muss ich Wellnessbehandlungen im Voraus buchen?',
          'Wir empfehlen, Wellnessbehandlungen im Voraus zu buchen, insbesondere in der Hochsaison.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'arrival-in-podgora',
    'Arrival in Podgora',
    'Dolazak u Podgoru',
    'Anreise in Podgora',
    7,
    imgArrival,
    [
      {
        en: [
          'Is there an airport transfer service?',
          'Yes, we can arrange airport transfers from Split Airport. Please contact our reservations team to book a transfer in advance.',
        ],
        hr: [
          'Postoji li usluga prijevoza od aerodroma?',
          'Da, možemo organizirati prijevoz od Splitskog aerodroma. Kontaktirajte naš tim za rezervacije za rezervaciju prijevoza unaprijed.',
        ],
        de: [
          'Gibt es einen Flughafentransferservice?',
          'Ja, wir können Transfers vom Flughafen Split arrangieren. Bitte kontaktieren Sie unser Reservierungsteam im Voraus.',
        ],
      },
      {
        en: [
          'Can I rent a car through the hotel?',
          'We can connect you with local car rental services. Please ask at reception for assistance and current rates.',
        ],
        hr: [
          'Mogu li unajmiti automobil putem hotela?',
          'Možemo vas povezati s lokalnim uslugama iznajmljivanja automobila. Obratite se recepciji za pomoć i trenutne cijene.',
        ],
        de: [
          'Kann ich über das Hotel ein Auto mieten?',
          'Wir können Sie mit lokalen Autovermietungen in Verbindung bringen.',
        ],
      },
      {
        en: [
          'Is there EV charging at the hotel?',
          'We have EV charging points available on site. Please contact reception for location details and any applicable charges.',
        ],
        hr: [
          'Postoji li punjač za električna vozila u hotelu?',
          'Imamo punionice za električna vozila na lokaciji. Obratite se recepciji za detalje o lokaciji i eventualnim naknadama.',
        ],
        de: [
          'Gibt es E-Ladesäulen im Hotel?',
          'Wir haben E-Ladesäulen vor Ort. Bitte kontaktieren Sie die Rezeption für Standortdetails.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'food-and-drink',
    'Food & drinks',
    'Hrana i piće',
    'Essen und Trinken',
    10,
    imgFood,
    [
      {
        en: [
          'Do you cater for vegetarian or gluten-free diets?',
          'Yes, our restaurants offer vegetarian and gluten-free options. Please inform us of any dietary requirements when booking or at the restaurant.',
        ],
        hr: [
          'Nudite li vegetarijanski ili bezglutenski meni?',
          'Da, naši restorani nude vegetarijanske i bezglutenske opcije. Obavijestite nas o prehrambenim zahtjevima pri rezervaciji ili u restoranu.',
        ],
        de: [
          'Bieten Sie vegetarische oder glutenfreie Optionen an?',
          'Ja, unsere Restaurants bieten vegetarische und glutenfreie Optionen an.',
        ],
      },
      {
        en: [
          'What are the restaurant opening hours?',
          'Restaurant hours vary by season. Breakfast is typically served from 7:00–10:00, lunch from 12:00–14:30, and dinner from 18:30–21:30.',
        ],
        hr: [
          'Kakvo je radno vrijeme restorana?',
          'Radno vrijeme restorana varira prema sezoni. Doručak se obično poslužuje od 7:00–10:00, ručak od 12:00–14:30, a večera od 18:30–21:30.',
        ],
        de: [
          'Was sind die Öffnungszeiten des Restaurants?',
          'Die Restaurantzeiten variieren je nach Saison. Frühstück 7:00–10:00, Mittagessen 12:00–14:30, Abendessen 18:30–21:30.',
        ],
      },
      {
        en: [
          'Is there a surcharge for dinner?',
          'Dinner is included in half-board and full-board packages. For bed & breakfast guests, dinner can be purchased separately.',
        ],
        hr: [
          'Postoji li doplata za večeru?',
          'Večera je uključena u polupansion i puni pansion. Za goste s doručkom, večera se može kupiti zasebno.',
        ],
        de: [
          'Gibt es einen Aufpreis für das Abendessen?',
          'Das Abendessen ist in Halb- und Vollpensionspaketen enthalten. Für Frühstücksgäste kann es separat erworben werden.',
        ],
      },
      {
        en: [
          'Is dinner a buffet or served at the table?',
          'We offer a buffet-style dining experience with a wide selection of local and international dishes.',
        ],
        hr: [
          'Je li večera u obliku švedskog stola ili poslužena za stolom?',
          'Nudimo obrok u obliku švedskog stola s bogatim izborom lokalnih i međunarodnih jela.',
        ],
        de: [
          'Ist das Abendessen ein Büfett oder Tischservice?',
          'Wir bieten Büfett-Dining mit einer großen Auswahl an lokalen und internationalen Gerichten.',
        ],
      },
      {
        en: [
          'Are drinks included with meals?',
          'Water is included at meals in some packages. Other beverages are available for purchase. Please check your specific package inclusions.',
        ],
        hr: [
          'Jesu li pića uključena u obroke?',
          'Voda je uključena u obroke u nekim paketima. Ostala pića dostupna su za kupnju. Provjerite što vaš paket uključuje.',
        ],
        de: [
          'Sind Getränke bei den Mahlzeiten inklusive?',
          'Wasser ist in einigen Paketen bei Mahlzeiten inklusive. Andere Getränke sind käuflich erhältlich.',
        ],
      },
      {
        en: [
          'Where can I have lunch?',
          'Lunch is served in our main restaurant. We also have a beach bar and snack bar for lighter options during the day.',
        ],
        hr: [
          'Gdje mogu ručati?',
          'Ručak se poslužuje u našem glavnom restoranu. Imamo i plažni bar i snack bar za lakše opcije tijekom dana.',
        ],
        de: [
          'Wo kann ich zu Mittag essen?',
          'Das Mittagessen wird in unserem Hauptrestaurant serviert. Wir haben auch eine Strandbar für leichtere Optionen.',
        ],
      },
      {
        en: [
          'Can I order a packed lunch?',
          'Yes, packed lunches can be arranged on request. Please contact reception the evening before to arrange this service.',
        ],
        hr: [
          'Mogu li naručiti pakete za ručak?',
          'Da, paketi za ručak mogu se dogovoriti na zahtjev. Obratite se recepciji večer prije za dogovor.',
        ],
        de: [
          'Kann ich ein Lunchpaket bestellen?',
          'Ja, Lunchpakete können auf Anfrage arrangiert werden. Bitte kontaktieren Sie die Rezeption am Abend zuvor.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'hotel-parking',
    'Parking place',
    'Parking',
    'Parkplatz',
    8,
    imgParking,
    [
      {
        en: [
          'Is hotel parking charged?',
          'Parking fees may apply depending on the season. Please check our current pricing when booking or contact reception for up-to-date information.',
        ],
        hr: [
          'Naplaćuje li se hotelski parking?',
          'Naknade za parking mogu se primjenjivati ovisno o sezoni. Provjerite naše trenutne cijene pri rezervaciji ili kontaktirajte recepciju.',
        ],
        de: [
          'Ist der Hotelparkplatz kostenpflichtig?',
          'Parkgebühren können je nach Saison anfallen. Bitte prüfen Sie unsere aktuellen Preise bei der Buchung.',
        ],
      },
      {
        en: [
          'Is the parking covered and under surveillance?',
          'Our parking area is under 24-hour security surveillance. Covered parking is available in limited spaces — please ask at reception.',
        ],
        hr: [
          'Je li parking natkrit i pod nadzorom?',
          'Naš parking je pod 24-satnim sigurnosnim nadzorom. Natkriveni parking dostupan je na ograničenom broju mjesta — pitajte recepciju.',
        ],
        de: [
          'Ist der Parkplatz überdacht und bewacht?',
          'Unser Parkbereich steht unter 24-Stunden-Sicherheitsüberwachung. Überdachte Stellplätze sind begrenzt verfügbar.',
        ],
      },
    ],
  )

  await upsertCategory(
    payload,
    'free-time',
    'Free time',
    'Slobodno vrijeme',
    'Freizeit',
    9,
    imgFreeTime,
    [
      {
        en: [
          'Which excursions are available from Podgora?',
          'During your holiday in Podgora, we strongly recommend that you visit the picturesque locations and stunning cultural and natural attractions in the surrounding area. You can find all available excursions HERE. For all further information and reservations, please contact the hospitality desk staff at the Medora Auri Hotel or the front desk staff at the Medora Orbis campsite.',
        ],
        hr: [
          'Na koje izlete se može ići iz Podgore?',
          'Tijekom odmora u Podgori svakako preporučujemo posjetiti slikovita mjesta i prelijepe kulturne i prirodne atrakcije u okolici. Sve dostupne izlete možete pronaći OVDJE. Za sve dodatne potrebne informacije i rezervacije možete se obratiti osoblju na hospitality desku hotela Medora Auri ili osoblju na recepciji kampa Medora Orbis.',
        ],
        de: [
          'Welche Ausflüge können von Podgora aus unternommen werden?',
          'Während des Urlaubs in Podgora empfehlen wir auf jeden Fall, malerische Orte und schöne kulturelle und natürliche Sehenswürdigkeiten in der Umgebung zu besuchen. Alle verfügbaren Ausflüge finden Sie HIER. Für weitere Informationen und Reservierungen wenden Sie sich an das Personal des Medora Auri Hospitality Desk oder an der Rezeption des Campingplatzes Medora Orbis.',
        ],
      },
      {
        en: [
          'Where can I find the best evening entertainment in Podgora?',
          'All the evening events are shown on our digital screens at the Medora Auri Hotel and on posters on the promenade in the center of Podgora.',
        ],
        hr: [
          'Gdje je najbolja večernja zabava u Podgori?',
          'Sva večernja događanja u Podgori možete vidjeti na našim digitalnim zaslonima u hotelu Medora Auri i na plakatima na promenadi u centru Podgore.',
        ],
        de: [
          'Wo ist die beste Abendunterhaltung in Podgora?',
          'Alle Abendveranstaltungen werden auf unseren digitalen Bildschirmen im Medora Auri Hotel und auf Plakaten an der Promenade im Zentrum von Podgora gezeigt.',
        ],
      },
    ],
  )

  await upsertCategory(payload, 'other', 'Other', 'Ostalo', 'Sonstiges', 11, imgOther, [
    {
      en: [
        'Where is the nearest hair salon?',
        'Our accommodation unit front desk staff will provide you with directions to the nearest open hair salons.',
      ],
      hr: [
        'Gdje se nalazi najbliži frizerski salon?',
        'Osoblje na recepcijama naših smještajnih objekata uputit će Vas o najbližim otvorenim frizerskim salonima.',
      ],
      de: [
        'Wo befindet sich der nächste Friseursalon?',
        'Das Personal der Rezeption unserer Unterkunftsobjekte wird Ihnen den nächstgelegenen offenen Friseursalon empfehlen.',
      ],
    },
    {
      en: [
        "Where is the nearest doctor's office?",
        'If you require medical assistance, please contact the front desk staff and they will call a doctor. The doctor is paid directly for the examination. A general internal medicine outpatient clinic is located at 1 Put Sv. Vicenca, Podgora. Emergency medical assistance is available at the Makarska Community Health Centre, 2 Stjepana Ivičevića, Makarska.',
      ],
      hr: [
        'Gdje se nalazi najbliža liječnička ordinacija?',
        'Ako Vam zatreba liječnička pomoć, molimo da se javite osoblju na recepciji koje će pozvati liječnika. Pregled plaćate izravno liječniku. Ambulanta opće medicine nalazi se na adresi Put Sv. Vicenca 1, Podgora. Hitna medicinska pomoć dostupna je na adresi Dom zdravlja Makarska, Stjepana Ivičevića 2, Makarska.',
      ],
      de: [
        'Wo befindet sich die nächste Arztpraxis?',
        'Wenn Sie ärztliche Hilfe benötigen, wenden Sie sich bitte an das Personal an der Rezeption. Die Untersuchung wird direkt beim Arzt gezahlt. Die Ambulanz für Allgemeinmedizin befindet sich unter der Adresse Put Sv. Vicenca 1, Podgora. Medizinische Notfallhilfe ist im Gesundheitszentrum Makarska, Stjepana Ivičevića 2, Makarska verfügbar.',
      ],
    },
    {
      en: [
        'Where is the church located and when are the Holy Masses celebrated?',
        'The Church of the Assumption of Mary is located close to the Medora Orbis campsite, some 500 m from the Medora Auri Hotel. You will receive detailed instructions from the front desk staff of the accommodation unit. Catholic Masses are celebrated at 8:30 am on workdays and 10 am on Sunday.',
      ],
      hr: [
        'Gdje se nalazi crkva i kada je misa?',
        'Crkva uznesenja Marijinoga u Podgori nalazi se u neposrednoj blizini kampa Medora Orbis, a otprilike 500 metara od hotela Medora Auri. Detaljne upute dat će Vam osoblje na recepcijama objekata, a katolički obredi održavaju se radnim danima u 8:30, a nedjeljom u 10:00 sati.',
      ],
      de: [
        'Wo befindet sich die Kirche und wann ist Gottesdienst?',
        'Die Kirche Mariä Himmelfahrt in Podgora befindet sich in der Nähe des Campingplatzes Medora Orbis und ist etwa 500 m vom Hotel Medora Auri entfernt. Detaillierte Anweisungen erhalten Sie vom Personal der Rezeption. Katholische Riten finden an Werktagen um 08:30 Uhr und sonntags um 10:00 Uhr statt.',
      ],
    },
  ])
}
