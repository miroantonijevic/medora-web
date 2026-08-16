import type { Payload } from 'payload'

const BASE = 'https://medorahotels.com/UserDocsImages'

async function fetchAndUploadMedia(
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
    payload.logger.info(`  Uploaded: ${filename} => id=${doc.id}`)
    return doc.id as number
  } catch (err) {
    payload.logger.warn(`  Failed to fetch ${url}: ${err}`)
    return null
  }
}

const GROUPS = [
  {
    slug: 'wellness',
    order: 1,
    heroImageUrl: `${BASE}/galerije/Wellness-Spa/spa%20people%20desktop.jpg`,
    heroImageFilename: 'wellness-group-hero.jpg',
    en: {
      name: 'Dream Holiday',
      description:
        'Relax your mind and body during your holidays with our rich wellness offering. From high-quality massages and beauty treatments to modern saunas and spa programmes, the wellness centre at Medora Auri offers rest for every guest.',
    },
    hr: {
      name: 'San odmor',
      description:
        'Opustite tijelo i um na odmoru uz bogatu wellness ponudu. Od kvalitetnih masaža i kozmetičkih tretmana do modernih sauna i spa programa, wellness centar Medore Auri nudi odmor za svakog gosta.',
    },
    de: {
      name: 'Traumurlaub',
      description:
        'Entspannen Sie Geist und Körper im Urlaub mit unserem umfangreichen Wellness-Angebot. Von hochwertigen Massagen und Beauty-Behandlungen bis hin zu modernen Saunen und Spa-Programmen — das Wellness-Zentrum im Medora Auri bietet Erholung für jeden Gast.',
    },
  },
  {
    slug: 'dining-bars',
    order: 2,
    heroImageUrl: `${BASE}/galerije/Restorani/Taste%20Medora.jpg`,
    heroImageFilename: 'dining-bars-group-hero.jpg',
    en: {
      name: 'Dining & Bars',
      description:
        'Make your holiday on the Makarska Riviera perfect with rich gastronomy and a large selection of high-quality restaurants and cosy cocktail bars. Whether you like fast food or want to taste traditional Mediterranean cuisine, feel the magic of the gastronomic offering in beautiful Podgora.',
    },
    hr: {
      name: 'Hrana i piće',
      description:
        'Učinite vaš odmor na Makarskoj rivijeri savršenim bogatom gastronomijom i velikim izborom visokokvalitetnih restorana i ugodnih koktel barova. Bez obzira volite li brzu hranu ili želite okusiti tradicionalna mediteranska jela, osjetite magiju gastronomske ponude u lijepoj Podgori.',
    },
    de: {
      name: 'Essen & Bars',
      description:
        'Machen Sie Ihren Urlaub an der Makarska Riviera mit reicher Gastronomie und einer großen Auswahl an hochwertigen Restaurants und gemütlichen Cocktailbars perfekt. Ob Sie Fast Food mögen oder traditionelle mediterrane Küche kosten möchten — spüren Sie die Magie des gastronomischen Angebots im wunderschönen Podgora.',
    },
  },
  {
    slug: 'active-vacation',
    order: 3,
    heroImageUrl: `${BASE}/galerije/Izleti/1.png`,
    heroImageFilename: 'active-vacation-group-hero.png',
    en: {
      name: 'Active Vacation',
      description:
        'Fill your holiday with activities — from Biokovo hikes and cycling trails to the Medora Fit programme.',
    },
    hr: {
      name: 'Aktivni odmor',
      description:
        'Ispunite odmor aktivnostima — od pješačenja na Biokovu i biciklističkih staza do Medora Fit programa.',
    },
    de: {
      name: 'Aktiver Urlaub',
      description:
        'Füllen Sie Ihren Urlaub mit Aktivitäten — von Biokovo-Wanderungen und Radwegen bis zum Medora Fit Programm.',
    },
  },
]

const AMENITIES = [
  // ── Wellness ──────────────────────────────────────────────────────────────
  {
    groupSlug: 'wellness',
    slug: 'spa',
    order: 1,
    heroImageUrl: `${BASE}/galerije/Wellness-Spa/spa%20people%20desktop.jpg`,
    heroImageFilename: 'amenity-spa-hero.jpg',
    en: {
      name: 'Spa (9th Floor)',
      tagline: "Stress doesn't live here anymore",
      openingHours: '09:00 – 21:00',
      location: '9th Floor',
      description:
        'Exposure to stressful situations is a part of everyday life that leaves more or less visible marks on each of us. That is why relaxation is of priceless importance for our physical and mental health. Why not start now and here?\n\nIn line with the highest professional standards and, above all, in line with your needs and expectations, we offer proven relaxation methods that will free your body and soul from all traces of stress.\n\nFor a pleasant and complete detox, we offer a Finnish sauna or infrared sauna. If you simply want to enjoy peace and quiet, we offer a relaxation room, and if you are a massage lover or are about to become one, we offer you a series of complimentary treatments you will want to repeat day after day.',
      highlights: ['Finnish sauna', 'Infrared sauna', 'Whirlpool', 'Relax zone'],
    },
    hr: {
      name: 'Spa (9. kat)',
      tagline: 'Stres ovdje ne stanuje',
      openingHours: '09:00 – 21:00',
      location: '9. kat',
      description:
        'Izlaganje stresnim situacijama dio je svakodnevnog života koji na svakom od nas ostavlja manje ili više vidljive tragove. Zato je relaksacija od neprocjenjive važnosti za naše fizičko i psihičko zdravlje. Zašto ne početi sada i ovdje?\n\nSukladno najvišim profesionalnim standardima, a prije svega sukladno vašim potrebama i očekivanjima, nudimo vam provjerene metode relaksacije koje će vaše tijelo i dušu osloboditi svih tragova stresa.',
      highlights: ['Finska sauna', 'Infracrvena sauna', 'Jacuzzi', 'Zona opuštanja'],
    },
    de: {
      name: 'Spa (9. Etage)',
      tagline: 'Stress wohnt hier nicht',
      openingHours: '09:00 – 21:00',
      location: '9. Etage',
      description:
        'Die Auseinandersetzung mit Stresssituationen ist Teil des Alltags, der mehr oder weniger sichtbare Spuren bei jedem von uns hinterlässt. Deshalb ist Entspannung von unschätzbarem Wert für unsere körperliche und geistige Gesundheit. Warum nicht jetzt und hier beginnen?\n\nGemäß den höchsten professionellen Standards und vor allem gemäß Ihren Bedürfnissen und Erwartungen bieten wir bewährte Entspannungsmethoden, die Ihren Körper und Ihre Seele von allen Stressspuren befreien.',
      highlights: ['Finnische Sauna', 'Infrarotsauna', 'Whirlpool', 'Ruheraum'],
    },
  },
  {
    groupSlug: 'wellness',
    slug: 'massages',
    order: 2,
    heroImageUrl: `${BASE}/galerije/massage%20medora%20auri.jpg`,
    heroImageFilename: 'amenity-massages-hero.jpg',
    en: {
      name: 'Massages',
      tagline: 'Stay in touch with your own nature',
      openingHours: '08:30 – 21:00 (or on request)',
      location: 'Spa, 9th Floor',
      description:
        'With its beauty and diversity, Podgora will remind you time and again how important it is to connect with nature and its relaxing properties. Views of untouched nature, the scents of eternal grass and the tastes of the Mediterranean will awaken all the senses and breathe life into them.\n\nThese natural, multi-sensory experiences are complemented by a wide selection of treatments and massages at the Medora Auri Wellness Centre, which will help you relax even further and discover an inexhaustible source of healthy life energy.\n\nTreat yourself to a hydromassage, or let our trained staff take care of your spine and neck and relieve pain. With a feeling of comfort and relief, you will fully enjoy your own nature.',
      highlights: ['Relaxation massage', 'Sports massage', 'Aromatherapy', 'Hydromassage'],
    },
    hr: {
      name: 'Masaže',
      tagline: 'Ostanite u kontaktu sa svojom prirodom',
      openingHours: '08:30 – 21:00 (ili na zahtjev)',
      location: 'Spa, 9. kat',
      description:
        'Svojom ljepotom i raznolikošću Podgora će vas svaki put podsjećati koliko je važan kontakt s prirodom i njezinim opuštajućim svojstvima. Pogledi netaknute prirode, mirisi vječne trave i okusi Mediterana razbudit će sva osjetila i udahnuti im život.\n\nOva prirodna, multisenzorna iskustva nadopunili smo bogatim izborom tretmana i masaža u Wellness centru hotela Medora Auri, koji će vam pomoći da se još više opustite.',
      highlights: ['Masaža opuštanja', 'Sportska masaža', 'Aromaterapija', 'Hidromasaža'],
    },
    de: {
      name: 'Massagen',
      tagline: 'Bleiben Sie in Kontakt mit Ihrer eigenen Natur',
      openingHours: '08:30 – 21:00 (oder auf Anfrage)',
      location: 'Spa, 9. Etage',
      description:
        'Mit seiner Schönheit und Vielfalt wird Sie Podgora immer wieder daran erinnern, wie wichtig es ist, mit der Natur und ihren entspannenden Eigenschaften in Kontakt zu bleiben. Ausblicke auf unberührte Natur, der Duft ewigen Grases und die Aromen des Mittelmeers werden alle Sinne erwecken.\n\nDiese natürlichen, multisensorischen Erlebnisse werden durch eine breite Auswahl an Behandlungen und Massagen im Wellness-Zentrum des Medora Auri ergänzt.',
      highlights: ['Entspannungsmassage', 'Sportmassage', 'Aromatherapie', 'Hydromassage'],
    },
  },
  {
    groupSlug: 'wellness',
    slug: 'pools-beaches',
    order: 3,
    heroImageUrl: `${BASE}/kategorije/things-pools-beaches-hero.jpg`,
    heroImageFilename: 'amenity-pools-beaches-hero.jpg',
    en: {
      name: 'Pools & Beaches',
      tagline: 'True refreshment for your holiday',
      openingHours: '08:00 – 20:00',
      description:
        'The Makarska Riviera is synonymous with some of the most beautiful beaches on the Adriatic — reason enough to make sunbathing and swimming in the clear sea a mandatory daily ritual. The perfect combination of warm Mediterranean climate, lush vegetation, crystal-clear sea and different types of beaches leaves no one indifferent and will satisfy every taste.\n\nThe diversity of Podgora is reflected at every level, including the offering available to you. For those who consider extra comfort and service part of the holiday pleasure, large and small pools are available — ideal for relaxed fun with children and numerous activities for true family holidays.\n\nPool opening hours: 08:00 – 20:00',
      highlights: [
        'Heated outdoor pools',
        'Baby pool',
        'Free beach chairs and umbrellas',
        'Beach towels included',
      ],
    },
    hr: {
      name: 'Bazeni i plaže',
      tagline: 'Pravo osvježenje za odmor',
      openingHours: '08:00 – 20:00',
      description:
        'Makarska rivijera sinonim je za neke od najljepših plaža na Jadranu — dovoljno razlog da ležanje na plaži i kupanje u bistrom moru postane obavezan dnevni ritual. Savršena kombinacija toplog mediteranskog podneblja, bujne vegetacije, kristalno čistog mora i različitih vrsta plaža ne ostavlja nikoga ravnodušnim.',
      highlights: [
        'Grijani vanjski bazeni',
        'Bazen za bebe',
        'Besplatne ležaljke i suncobrani',
        'Ručnici uključeni',
      ],
    },
    de: {
      name: 'Pools & Strände',
      tagline: 'Echte Erfrischung für Ihren Urlaub',
      openingHours: '08:00 – 20:00',
      description:
        'Die Makarska Riviera ist ein Synonym für einige der schönsten Strände der Adria — Grund genug, Sonnenbaden und Schwimmen im klaren Meer zu einem täglichen Pflichtprogramm zu machen. Die perfekte Kombination aus warmem Mittelmeerklima, üppiger Vegetation, kristallklarem Meer und verschiedenen Strandtypen lässt niemanden gleichgültig.',
      highlights: [
        'Beheizte Außenpools',
        'Babypool',
        'Kostenlose Liegestühle und Sonnenschirme',
        'Handtücher inklusive',
      ],
    },
  },
  {
    groupSlug: 'wellness',
    slug: 'fitness',
    order: 4,
    heroImageUrl: `${BASE}/galerije/Wellness-Spa/gym%20desktop.jpg`,
    heroImageFilename: 'amenity-fitness-hero.jpg',
    en: {
      name: 'Fitness',
      tagline: 'Active holidays for active pleasure',
      openingHours: '07:00 – 21:00',
      description:
        'Active holidays are not reserved only for those who must fill their daily lives with physical activity and excitement, but are also intended for those who want to discover different possibilities, discover unique content and indulge in new emotions. The best place to start an active holiday is certainly the fitness centre of Medora Auri hotel.\n\nProfessionally equipped and meeting the highest standards, the space will allow every user to enjoy a daily dose of physical activity — all with a beautiful view of the sea.',
      highlights: [
        'State-of-the-art equipment',
        'Sea and island views',
        'Personal trainer on request',
      ],
    },
    hr: {
      name: 'Fitness',
      tagline: 'Aktivni odmor za aktivni užitak',
      openingHours: '07:00 – 21:00',
      description:
        'Aktivni odmor nije rezerviran samo za one koji moraju ispuniti svakodnevni život fizičkom aktivnošću i uzbuđenjem, već je namijenjen i onima koji žele otkrivati različite mogućnosti i prepuštati se novim emocijama. Najbolje mjesto za početak aktivnog odmora svakako je fitness centar hotela Medora Auri.\n\nProfesionalno opremljen i zadovoljavajući najviše standarde, prostor će svakome omogućiti uživanje u dnevnoj dozi tjelesne aktivnosti — sve s prekrasnim pogledom na more.',
      highlights: ['Moderna oprema', 'Pogled na more i otoke', 'Osobni trener na zahtjev'],
    },
    de: {
      name: 'Fitness',
      tagline: 'Aktiver Urlaub für aktiven Genuss',
      openingHours: '07:00 – 21:00',
      description:
        'Aktive Ferien sind nicht nur für diejenigen reserviert, die ihren Alltag mit körperlicher Aktivität füllen müssen, sondern auch für diejenigen, die verschiedene Möglichkeiten entdecken und sich neuen Emotionen hingeben möchten. Der beste Ausgangspunkt für einen aktiven Urlaub ist das Fitnesszentrum des Hotels Medora Auri.\n\nProfessionell ausgestattet und den höchsten Standards entsprechend, ermöglicht der Raum jedem Nutzer eine tägliche Dosis körperlicher Aktivität — mit wunderschönem Meerblick.',
      highlights: ['Modernste Ausstattung', 'Meer- und Inselblick', 'Personal Trainer auf Anfrage'],
    },
  },
  // ── Dining & Bars ─────────────────────────────────────────────────────────
  {
    groupSlug: 'dining-bars',
    slug: 'taste-the-indigo',
    order: 1,
    heroImageUrl: `${BASE}/galerije/Restorani/Taste%20Medora.jpg`,
    heroImageFilename: 'amenity-taste-indigo-hero.jpg',
    en: {
      name: 'Taste the Indigo',
      tagline: 'Mediterranean flavours, Adriatic views',
      description:
        'We listened to your wishes and created new gastronomic magic in our restaurant overlooking the Adriatic Sea. Follow paths of aromas and flavours of traditional Mediterranean cuisine and modern world cooking.\n\nOur chefs will take you on a thrilling journey through the diversity of tastes and aromas, while the professional restaurant service will ensure that every visit becomes an unforgettable experience, paired with flavours of high-quality homemade wines.\n\nOn-site you can choose from meat, fish or vegetarian options.',
      highlights: [
        'À la carte dinner',
        'Fish, meat & vegetarian menus',
        'Sea view terrace',
        'Homemade wine selection',
      ],
    },
    hr: {
      name: 'Taste the Indigo',
      tagline: 'Mediteranski okusi, pogled na Jadran',
      description:
        'Poslušali smo vaše želje i stvorili novu gastronomsku magiju u našem restoranu s pogledom na Jadransko more. Slijedite puteve aroma i okusa tradicionalne mediteranske kuhinje i moderne svjetske gastronomije.\n\nNaši kuhari odnijet će vas na uzbudljivo putovanje kroz raznolikost okusa i aroma, a profesionalna restoranska usluga pobrinut će se da svaki vaš posjet postane nezaboravno iskustvo.\n\nNa licu mjesta možete odabrati mesnu, riblju ili vegetarijansku opciju.',
      highlights: [
        'À la carte večera',
        'Ribni, mesni i vegetarijanski jelovnici',
        'Terasa s pogledom na more',
        'Domaći izbor vina',
      ],
    },
    de: {
      name: 'Taste the Indigo',
      tagline: 'Mediterrane Aromen, Adriablick',
      description:
        'Wir haben Ihre Wünsche gehört und neue gastronomische Magie in unserem Restaurant mit Blick auf die Adria kreiert. Folgen Sie den Pfaden der Aromen und Geschmäcker der traditionellen mediterranen Küche und modernen Weltküche.\n\nUnsere Köche nehmen Sie mit auf eine aufregende Reise durch die Vielfalt der Geschmäcker und Aromen.',
      highlights: [
        'À la carte Abendessen',
        'Fisch-, Fleisch- und Vegetariermenüs',
        'Terrasse mit Meerblick',
        'Hausgemachte Weinauswahl',
      ],
    },
  },
  {
    groupSlug: 'dining-bars',
    slug: 'juice-cocktail-bar',
    order: 2,
    heroImageUrl: `${BASE}/galerije/Restorani/indigo%20cocktail%20bar.jpg`,
    heroImageFilename: 'amenity-juice-cocktail-bar-hero.jpg',
    en: {
      name: 'Juice / Cocktail Bar',
      tagline: 'Sip the sunset',
      description:
        'Refresh yourself with fresh juices during the day and savour an evening cocktail while watching the sunset. Our expert mixologists create both classic and signature cocktails using the finest spirits and fresh ingredients.\n\nPoolside location with views of the Adriatic coast makes every drink taste even better. The perfect spot for a pre-dinner aperitif or a relaxed evening with friends.',
      highlights: [
        'Fresh juices by day',
        'Cocktails by night',
        'Poolside location',
        'Sunset views',
      ],
    },
    hr: {
      name: 'Juice / Cocktail Bar',
      tagline: 'Popijte zalazak sunca',
      description:
        'Osvježite se svježim sokovima danju i uživajte u večernjem koktelu uz zalazak sunca. Naši miksologi stvaraju klasične i potpisne koktele od najfinijih pića i svježih sastojaka.\n\nLokacija uz bazen s pogledom na jadransku obalu čini svako piće još ukusnijim.',
      highlights: ['Svježi sokovi danju', 'Kokteli noću', 'Lokacija uz bazen', 'Pogled na zalazak'],
    },
    de: {
      name: 'Juice / Cocktail Bar',
      tagline: 'Den Sonnenuntergang genießen',
      description:
        'Erfrischen Sie sich tagsüber mit frischen Säften und genießen Sie abends einen Cocktail beim Beobachten des Sonnenuntergangs. Unsere Mixologen kreieren sowohl klassische als auch Signature Cocktails aus feinsten Spirituosen und frischen Zutaten.',
      highlights: [
        'Frische Säfte am Tag',
        'Cocktails am Abend',
        'Lage am Pool',
        'Sonnenuntergang-Aussicht',
      ],
    },
  },
  {
    groupSlug: 'dining-bars',
    slug: 'lobby-bar',
    order: 3,
    heroImageUrl: `${BASE}/slike/lobby-bar.jpg`,
    heroImageFilename: 'amenity-lobby-bar-hero.jpg',
    en: {
      name: 'Lobby Bar',
      tagline: 'Panoramic views over Podgora',
      description:
        'Unforgettable moments with a panoramic view of Podgora, golden beaches, crystal clear sea and distant islands. From the Lobby Bar there is a view you will never forget and which for many months will be the main, heart-warming topic of your conversations.\n\nFrom your morning coffee to evening drinks, the Lobby Bar offers the perfect setting for every occasion. Live music evenings make it the social heart of Medora Auri.',
      highlights: [
        '360° coastal views',
        'Morning coffee to evening drinks',
        'Live music evenings',
        'Sea and island panorama',
      ],
    },
    hr: {
      name: 'Lobby Bar',
      tagline: 'Panoramski pogled na Podgoru',
      description:
        'Nezaboravni trenuci s panoramskim pogledom na Podgoru, zlatne plaže, kristalno čisto more i udaljene otoke. Iz Lobby Bara pruža se pogled koji nikada nećete zaboraviti i koji će dugo biti glavna tema vaših razgovora.\n\nOd jutarnje kave do večernjih pića, Lobby Bar nudi savršen ugođaj za svaku prigodu.',
      highlights: [
        '360° pogled na obalu',
        'Od jutarnje kave do večernjih pića',
        'Večeri uz live glazbu',
        'Panorama mora i otoka',
      ],
    },
    de: {
      name: 'Lobby Bar',
      tagline: 'Panoramablick über Podgora',
      description:
        'Unvergessliche Momente mit Panoramablick auf Podgora, goldene Strände, kristallklares Meer und entfernte Inseln. Vom Lobby Bar aus genießen Sie einen Ausblick, den Sie nie vergessen werden.\n\nVom Morgenkaffee bis zum Abenddrink bietet die Lobby Bar das perfekte Ambiente für jeden Anlass.',
      highlights: [
        '360° Küstenblick',
        'Vom Morgenkaffee bis zum Abenddrink',
        'Live-Musik-Abende',
        'Meer- und Inselpanorama',
      ],
    },
  },
  // ── Active Vacation ───────────────────────────────────────────────────────
  {
    groupSlug: 'active-vacation',
    slug: 'biokovo-excursions',
    order: 1,
    heroImageUrl: `${BASE}/galerije/Izleti/1.png`,
    heroImageFilename: 'amenity-biokovo-hero.png',
    en: {
      name: 'Biokovo Excursions',
      tagline: 'Walk above the clouds on Skywalk Biokovo',
      description:
        'Fill your holiday on the beautiful Makarska Riviera with various activities. Whether you want to explore the peaks of the beautiful mountain Biokovo, cycle on cycling trails, or stay in shape with our Medora Fit programme, your holiday will be filled with diverse activities in Podgora.\n\nSkywalk Biokovo is the unique glass walkway perched on the cliffs of Biokovo mountain at an altitude of 1,228 m, offering an unforgettable view of the Adriatic and the islands. Guided mountain hikes are included free of charge for direct bookers.',
      highlights: [
        'Skywalk Biokovo glass platform',
        'Guided mountain hikes',
        'Included free for direct bookers',
      ],
    },
    hr: {
      name: 'Izleti na Biokovo',
      tagline: 'Hodajte iznad oblaka na Skywalk Biokovu',
      description:
        'Ispunite odmor na lijepoj Makarskoj rivijeri raznim aktivnostima. Bez obzira želite li istraživati vrhove Biokova, voziti se biciklom ili ostati u formi s našim Medora Fit programom, vaš odmor će biti ispunjen raznovrsnim aktivnostima u Podgori.',
      highlights: [
        'Staklena platforma Skywalk Biokovo',
        'Vođeni planinski pohodi',
        'Besplatno za direktne rezervacije',
      ],
    },
    de: {
      name: 'Biokovo-Ausflüge',
      tagline: 'Über den Wolken auf dem Skywalk Biokovo',
      description:
        'Füllen Sie Ihren Urlaub an der schönen Makarska Riviera mit verschiedenen Aktivitäten. Ob Sie die Gipfel des schönen Berges Biokovo erkunden, Radwege befahren oder mit unserem Medora Fit Programm in Form bleiben möchten — Ihr Urlaub wird in Podgora mit abwechslungsreichen Aktivitäten gefüllt sein.',
      highlights: [
        'Glasplattform Skywalk Biokovo',
        'Geführte Bergwanderungen',
        'Kostenlos für Direktbucher',
      ],
    },
  },
  {
    groupSlug: 'active-vacation',
    slug: 'boat-trips',
    order: 2,
    heroImageUrl: `${BASE}/galerije/Izleti/28.png`,
    heroImageFilename: 'amenity-boat-trips-hero.png',
    en: {
      name: 'Boat Trips',
      tagline: 'Discover the islands of the Makarska Riviera',
      highlights: [
        'Island hopping tours',
        'Included free for direct bookers',
        'Private charter available',
      ],
    },
    hr: {
      name: 'Izleti brodom',
      tagline: 'Otkrijte otoke Makarske rivijere',
      highlights: [
        'Obilazak otoka',
        'Besplatno za direktne rezervacije',
        'Privatni čarter dostupan',
      ],
    },
    de: {
      name: 'Bootsausflüge',
      tagline: 'Entdecken Sie die Inseln der Makarska Riviera',
      highlights: ['Inseltour', 'Kostenlos für Direktbucher', 'Privater Charter verfügbar'],
    },
  },
  {
    groupSlug: 'active-vacation',
    slug: 'medora-fit',
    order: 3,
    heroImageUrl: `${BASE}/galerije/Izleti/21.png`,
    heroImageFilename: 'amenity-medora-fit-hero.png',
    en: {
      name: 'Medora Fit',
      tagline: 'Stay in shape while on holiday',
      highlights: [
        'Daily group classes',
        'Aqua aerobics',
        'Yoga sessions',
        'Cycling & hiking trails nearby',
      ],
    },
    hr: {
      name: 'Medora Fit',
      tagline: 'Ostanite u formi i na odmoru',
      highlights: [
        'Dnevne grupne lekcije',
        'Aqua aerobik',
        'Yoga sesije',
        'Biciklističke i planinarske staze u blizini',
      ],
    },
    de: {
      name: 'Medora Fit',
      tagline: 'Im Urlaub in Form bleiben',
      highlights: [
        'Tägliche Gruppenkurse',
        'Wassergymnastik',
        'Yoga-Sessions',
        'Rad- und Wanderwege in der Nähe',
      ],
    },
  },
]

type LocalisedAmenity = {
  name: string
  tagline?: string
  openingHours?: string
  location?: string
  highlights?: string[]
  description?: string
}

function lexParas(text: string) {
  const paras = text.split('\n\n').filter(Boolean)
  return {
    root: {
      type: 'root',
      children: paras.map((p) => ({
        type: 'paragraph',
        children: [
          { type: 'text', text: p, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
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
    const heroImageId = await fetchAndUploadMedia(
      payload,
      group.heroImageUrl,
      group.heroImageFilename,
      group.en.name,
    )
    const doc = await payload.create({
      collection: 'amenity-groups',
      locale: 'en',
      data: {
        name: group.en.name,
        slug: group.slug,
        description: group.en.description,
        order: group.order,
        ...(heroImageId ? { heroImage: heroImageId } : {}),
      },
    })
    const id = doc.id as number
    groupIdMap[group.slug] = id
    await payload.update({
      collection: 'amenity-groups',
      id,
      locale: 'hr',
      data: { name: group.hr.name, description: group.hr.description },
    })
    await payload.update({
      collection: 'amenity-groups',
      id,
      locale: 'de',
      data: { name: group.de.name, description: group.de.description },
    })
    payload.logger.info(`  Created group: ${group.en.name}`)
  }

  // Create amenities
  for (const item of AMENITIES) {
    const groupId = groupIdMap[item.groupSlug]
    if (!groupId) continue

    const toHighlights = (loc: LocalisedAmenity) => (loc.highlights ?? []).map((text) => ({ text }))
    const heroImageId = await fetchAndUploadMedia(
      payload,
      item.heroImageUrl,
      item.heroImageFilename,
      item.en.name,
    )

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
        ...(item.en.description ? { description: lexParas(item.en.description) } : {}),
        ...(heroImageId ? { heroImage: heroImageId } : {}),
      },
    })
    const id = doc.id as number
    await payload.update({
      collection: 'amenities',
      id,
      locale: 'hr',
      data: {
        name: item.hr.name,
        tagline: item.hr.tagline,
        openingHours: item.hr.openingHours,
        location: item.hr.location,
        highlights: toHighlights(item.hr),
        ...(item.hr.description ? { description: lexParas(item.hr.description) } : {}),
      },
    })
    await payload.update({
      collection: 'amenities',
      id,
      locale: 'de',
      data: {
        name: item.de.name,
        tagline: item.de.tagline,
        openingHours: item.de.openingHours,
        location: item.de.location,
        highlights: toHighlights(item.de),
        ...(item.de.description ? { description: lexParas(item.de.description) } : {}),
      },
    })
    payload.logger.info(`  Created amenity: ${item.en.name}`)
  }

  // Update MainNav to include Amenities
  const currentNav = await payload.findGlobal({ slug: 'main-nav', locale: 'en' })
  const existing = (currentNav?.items ?? []) as Array<{ label: string; href: string }>
  const hasAmenities = existing.some((i) => i.href === '/amenities')
  if (!hasAmenities) {
    const amenitiesItem = {
      label: 'Amenities',
      href: '/amenities',
      children: [
        { label: 'Dream Holiday', href: '/amenities/wellness' },
        { label: 'Active Vacation', href: '/amenities/active-vacation' },
      ],
    }
    await payload.updateGlobal({
      slug: 'main-nav',
      locale: 'en',
      data: { items: [...existing, amenitiesItem] },
    })
    await payload.updateGlobal({
      slug: 'main-nav',
      locale: 'hr',
      data: {
        items: [
          ...existing,
          {
            label: 'Sadržaji',
            href: '/amenities',
            children: [
              { label: 'San odmor', href: '/amenities/wellness' },
              { label: 'Aktivni odmor', href: '/amenities/active-vacation' },
            ],
          },
        ],
      },
    })
    await payload.updateGlobal({
      slug: 'main-nav',
      locale: 'de',
      data: {
        items: [
          ...existing,
          {
            label: 'Angebote',
            href: '/amenities',
            children: [
              { label: 'Traumurlaub', href: '/amenities/wellness' },
              { label: 'Aktiver Urlaub', href: '/amenities/active-vacation' },
            ],
          },
        ],
      },
    })
    payload.logger.info('  Added Amenities to MainNav.')
  }

  payload.logger.info('Amenity groups and amenities seeded.')
}
