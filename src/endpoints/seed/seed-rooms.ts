import type { Payload } from 'payload'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '..', '..', '..', 'public')

async function getOrUploadMedia(
  payload: Payload,
  filename: string,
  relPath: string,
  mimeType: string,
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const filePath = path.join(PUBLIC_DIR, relPath)
  const data = fs.readFileSync(filePath)
  const doc = await payload.create({
    collection: 'media',
    data: { alt: filename.replace(/\.[^.]+$/, '').replace(/-/g, ' ') },
    file: { data, mimetype: mimeType, name: filename, size: data.length },
  })
  payload.logger.info(`  Uploaded: ${filename} => id=${doc.id}`)
  return doc.id as number
}

function lexical(text: string) {
  return {
    root: {
      children: [
        {
          children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
          direction: 'ltr', format: '', indent: 0, type: 'paragraph', version: 1,
        },
      ],
      direction: 'ltr', format: '', indent: 0, type: 'root', version: 1,
    },
  }
}

function lexicalRich(_title: string, body: string) {
  const textNode = (t: string) => ({ detail: 0, format: 0, mode: 'normal', style: '', text: t, type: 'text', version: 1 })
  return {
    root: {
      children: [
        { children: [textNode(body)], direction: 'ltr', format: '', indent: 0, type: 'paragraph', version: 1 },
      ],
      direction: 'ltr', format: '', indent: 0, type: 'root', version: 1,
    },
  }
}

// ─── Rooms data ───────────────────────────────────────────────────────────────

const AURI_ROOMS = [
  {
    slug: 'double-room',
    category: 'room',
    capacity: 3,
    imageFiles: [
      { name: 'auri-superior-double-sea.jpg', rel: 'rooms/auri-superior-double-sea.jpg', mime: 'image/jpeg' },
      { name: 'auri-double-balcony.jpg', rel: 'rooms/auri-double-balcony.jpg', mime: 'image/jpeg' },
      { name: 'auri-double-render.jpg', rel: 'rooms/auri-double-render.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Superior Double Room - sea view with balcony (children stay FREE)',
      size: '26 m\u00b2',
      bedType: 'Double bed or twin beds',
      title: 'Relax on the spacious balcony',
      description: 'This room features a large balcony with comfortable sun loungers where you can enjoy sunbathing under the warm sun while refreshed by a soothing summer sea breeze. Ideal for families with one child, couples or young travellers. The room has one larger and one smaller balcony overlooking the sea, Biokovo mountain and Podgora.',
      inclusions: [
        'Free Wi-Fi',
        'Balcony with outdoor furniture',
        'Air conditioning / heating',
        'Bathroom with shower, hairdryer, complimentary toiletries & towels',
        'Wardrobe',
        'Safe with inner socket for laptop/phone charging',
        'Tiled/marble floor',
        'Flat-screen TV with satellite channels',
        'Minibar',
        'Kettle with complimentary coffee & tea sachets',
        'Work desk',
        'Telephone',
        'Radio',
        'Wake-up service',
      ],
    },
    hr: {
      name: 'Superior dvokrevetna soba - pogled na more s balkonom (djeca borave BESPLATNO)',
      size: '26 m\u00b2',
      bedType: 'Bra\u010dni krevet ili odvojena le\u017eaja',
      title: 'Opu\u0161tanje na velikom balkonu',
      description: 'Ova soba ima veliki balkon na kojem \u0107ete prona\u0107i udobne le\u017ealjke na kojima mo\u017eete u\u017eivati u sun\u010danju pod zlatnim suncem dok se osvje\u017eavaju umiruju\u0107im ljetnim povjetarcem koji dolazi s mora. Idealno za obitelji s jednim djetetom, parove ili mlade koji putuju zajedno. Ova soba ima jedan ve\u0107i i jedan manji balkon s pogledom na more, Biokovo i Podgoru.',
      inclusions: [
        'Besplatni Wi-Fi',
        'Balkon s vanjskim namje\u0161tajem',
        'Klima ure\u0111aj/grijanje',
        'Kupaonica s tu\u0161em, su\u0161ilom za kosu, besplatnim toaletnim priborom i ru\u010dnicima',
        'Garderoba/ormar',
        'Sef sa unutra\u0161njom uti\u010dnicom za sigurno punjenje prijenosnog ra\u010dunala ili mobitela',
        'Poplо\u010dani/mramorni pod',
        'TV ravnog ekrana sa satelitskim kanalima',
        'Minibar',
        'Kuhalo za vodu s besplatnim vre\u0107icama instant kave i \u010daja',
        'Radni stol',
        'Telefon',
        'Radio',
        'Usluga bu\u0111enja',
      ],
    },
    de: {
      name: 'Superior Doppelzimmer - Meerblick mit Balkon (Kinder GRATIS)',
      size: '26 m\u00b2',
      bedType: 'Doppelbett oder Einzelbetten',
      title: 'Entspannen Sie auf dem gro\u00dfen Balkon',
      description: 'Dieses Zimmer verf\u00fcgt \u00fcber einen gro\u00dfen Balkon mit bequemen Sonnenliegen, auf denen Sie unter der warmen Sonne relaxen k\u00f6nnen, w\u00e4hrend Sie von einer sanften Meeresbrise erfrischt werden. Ideal f\u00fcr Familien mit einem Kind, Paare oder junge Reisende. Das Zimmer bietet von einem gr\u00f6\u00dferen und einem kleineren Balkon aus einen herrlichen Blick auf das Meer, den Biokovo und Podgora.',
      inclusions: [
        'Kostenloses WLAN',
        'Balkon mit Au\u00dfenm\u00f6beln',
        'Klimaanlage / Heizung',
        'Badezimmer mit Dusche, Haartrockner, Toilettenartikeln & Handtüchern',
        'Kleiderschrank',
        'Safe mit Innensteckdose f\u00fcr Laptop/Handy',
        'Gefliester/Marmorboden',
        'Flachbild-TV mit Satellitenkan\u00e4len',
        'Minibar',
        'Wasserkocher mit Kaffee- & Teebeuteln',
        'Schreibtisch',
        'Telefon',
        'Radio',
        'Weckservice',
      ],
    },
  },
  {
    slug: 'family-room',
    category: 'room',
    capacity: 4,
    imageFiles: [
      { name: 'auri-family-superior-actual.jpg', rel: 'rooms/auri-family-superior-actual.jpg', mime: 'image/jpeg' },
      { name: 'auri-family-1.jpg', rel: 'rooms/auri-family-1.jpg', mime: 'image/jpeg' },
      { name: 'auri-family-2.jpg', rel: 'rooms/auri-family-2.jpg', mime: 'image/jpeg' },
      { name: 'auri-family-3.jpg', rel: 'rooms/auri-family-3.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Superior Family Room - sea view with balcony',
      size: '37\u201341 m\u00b2',
      bedType: '1 double bed + 2 single beds',
      title: 'Comfort and privacy with two separate bedrooms',
      description: 'Superior family rooms with balcony and sea view feature two bedrooms and one spacious bathroom. One bedroom has a double bed, while the other has standard single beds. In the evenings, at sunset, you can enjoy the beauty of Podgora\'s nature from the balcony \u2014 sharing an unforgettable sunset with your loved ones.',
      inclusions: [
        'Free Wi-Fi',
        '2x balcony with outdoor furniture',
        'Air conditioning / heating',
        'Bathroom with bathtub, hairdryer, complimentary toiletries & towels + extra WC',
        '2x wardrobe',
        'Safe with inner socket for laptop/phone charging',
        '2x flat-screen TV with satellite channels',
        'Minibar',
        'Kettle with complimentary coffee & tea sachets',
        'Work desk',
        'Telephone',
        'Radio',
        'Wake-up service',
      ],
    },
    hr: {
      name: 'Superior obiteljska soba - pogled na more s balkonom',
      size: '37\u201341 m\u00b2',
      bedType: '1 bra\u010dni krevet + 2 odvojena kreveta',
      title: 'Udobnost i privatnost sa dvije odvojene spava\u0107e sobe',
      description: 'Superior obiteljske sobe s balkonom i pogledom na more imaju dvije spava\u0107e sobe, jednu prostranu kupaonicu. Jedna soba je sa bra\u010dnim krevetom, dok se u drugoj nalaze standardni single kreveti. U ve\u010dernjim satima, pri zalasku sunca, s balkona \u0107ete mo\u0107i do\u017eivjeti ljepotu podgorske prirode u\u017eivaju\u0107i u nezaboravnom zalasku sunca sa svojim najmilijima.',
      inclusions: [
        'Besplatni Wi-Fi',
        '2x balkon s vanjskim namje\u0161tajem',
        'Klima ure\u0111aj/grijanje',
        'Kupaonica s kadom, su\u0161ilom za kosu, besplatnim toaletnim priborom i ru\u010dnicima, dodatni WC',
        '2x garderoba/ormar',
        'Sef sa unutra\u0161njom uti\u010dnicom za sigurno punjenje prijenosnog ra\u010dunala ili mobitela',
        '2x TV ravnog ekrana sa satelitskim kanalima',
        'Minibar',
        'Kuhalo za vodu sa besplatnim vre\u0107icama instant kave i \u010daja',
        'Radni stol',
        'Telefon',
        'Radio',
        'Usluga bu\u0111enja',
      ],
    },
    de: {
      name: 'Superior Familienzimmer - Meerblick mit Balkon',
      size: '37\u201341 m\u00b2',
      bedType: '1 Doppelbett + 2 Einzelbetten',
      title: 'Komfort und Privatsph\u00e4re mit zwei getrennten Schlafzimmern',
      description: 'Superior Familienzimmer mit Balkon und Meerblick verf\u00fcgen \u00fcber zwei Schlafzimmer und ein ger\u00e4umiges Badezimmer. Ein Schlafzimmer hat ein Doppelbett, das andere Standardeinzelbetten. Am Abend beim Sonnenuntergang k\u00f6nnen Sie vom Balkon die Sch\u00f6nheit der Natur Podgoras genie\u00dfen \u2014 ein unvergesslicher Sonnenuntergang mit Ihren Liebsten.',
      inclusions: [
        'Kostenloses WLAN',
        '2x Balkon mit Au\u00dfenm\u00f6beln',
        'Klimaanlage / Heizung',
        'Badezimmer mit Badewanne, Haartrockner, Toilettenartikeln & Handtüchern + extra WC',
        '2x Kleiderschrank',
        'Safe mit Innensteckdose',
        '2x Flachbild-TV mit Satellitenkan\u00e4len',
        'Minibar',
        'Wasserkocher mit Kaffee- & Teebeuteln',
        'Schreibtisch',
        'Telefon',
        'Radio',
        'Weckservice',
      ],
    },
  },
  {
    slug: 'deluxe-suite',
    category: 'suite',
    capacity: 6,
    imageFiles: [
      { name: 'auri-deluxe-suite-actual.jpg', rel: 'rooms/auri-deluxe-suite-actual.jpg', mime: 'image/jpeg' },
      { name: 'auri-suite-living.jpg', rel: 'rooms/auri-suite-living.jpg', mime: 'image/jpeg' },
      { name: 'auri-suite-render.jpg', rel: 'rooms/auri-suite-render.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Deluxe Suite - direct sea view - rooftop terrace',
      size: '76 m\u00b2',
      bedType: '2 double beds + pull-out sofa',
      title: 'An unforgettable holiday experience',
      description: 'The Deluxe apartment is located on the top floor of Hotel Medora Auri and features a 15 m\u00b2 terrace with a stunning view of the Adriatic Sea and the Dalmatian islands. The spacious apartment has two bedrooms, a living room, dining area and a large bathroom with bathtub. Complete your experience in this beautiful apartment by surrendering to the restorative power of unforgettable sunsets from the large terrace sun loungers.',
      inclusions: [
        'Free Wi-Fi',
        '2x balcony with outdoor furniture',
        'Air conditioning / heating',
        '2x bathroom with bathtub, hairdryer & complimentary toiletries',
        'Living room and dining area',
        'Wardrobe',
        'Safe with inner socket for laptop/phone charging',
        'Tiled/marble floor',
        '3x flat-screen TV with satellite channels',
        'Minibar',
        'Kettle with complimentary coffee & tea sachets',
        'Work desk',
        'Telephone',
        'Radio',
        'Wake-up service',
      ],
    },
    hr: {
      name: 'Deluxe suite - direktni pogled na more - krovna terasa',
      size: '76 m\u00b2',
      bedType: '2 bra\u010dna kreveta + krevet na razvla\u010denje',
      title: 'Nezaboravno iskustvo odmora',
      description: 'Deluxe apartman nalazi se na zadnjem katu hotela Medora Auri i ima terasu od 15 m\u00b2 s koje se pru\u017ea prekrasan pogled na Jadransko more i dalmatinske otoke. Prostrani apartman ima dvije spava\u0107e sobe, dnevni boravak i blagovaonicu te veliku kupaonicu s kadom. Kako biste upotpunili svoje iskustvo u ovom prekrasnom apartmanu, prepustite se obnoviteljskoj snazi nezaboravnih zalazaka sunca dok boravite na velikoj terasi u udobnim le\u017ealjkama.',
      inclusions: [
        'Besplatni Wi-Fi',
        '2x balkon s vanjskim namje\u0161tajem',
        'Klima ure\u0111aj/grijanje',
        '2x kupaonica s kadom, su\u0161ilom za kosu, besplatnim toaletnim priborom i ru\u010dnicima',
        'Dnevni boravak i blagovaonica',
        'Garderoba/ormar',
        'Sef sa unutra\u0161njom uti\u010dnicom za sigurno punjenje prijenosnog ra\u010dunala ili mobitela',
        'Poplо\u010dani/mramorni pod',
        '3x TV ravnog ekrana sa satelitskim kanalima',
        'Minibar',
        'Kuhalo za vodu sa besplatnim vre\u0107icama instant kave i \u010daja',
        'Radni stol',
        'Telefon',
        'Radio',
        'Usluga bu\u0111enja',
      ],
    },
    de: {
      name: 'Deluxe Suite - direkter Meerblick - Dachterrasse',
      size: '76 m\u00b2',
      bedType: '2 Doppelbetten + Ausziehsofa',
      title: 'Ein unvergessliches Ferienerlebnis',
      description: 'Die Deluxe-Suite befindet sich im obersten Stockwerk des Hotels Medora Auri und verf\u00fcgt \u00fcber eine 15 m\u00b2 Terrasse mit einem atemberaubenden Blick auf die Adria und die dalmatinischen Inseln. Die ger\u00e4umige Suite hat zwei Schlafzimmer, einen Wohn- und Essbereich und ein gro\u00dfes Badezimmer mit Badewanne. Genie\u00dfen Sie unvergessliche Sonnenunterg\u00e4nge von den Sonnenliegen auf der gro\u00dfen Terrasse.',
      inclusions: [
        'Kostenloses WLAN',
        '2x Balkon mit Au\u00dfenm\u00f6beln',
        'Klimaanlage / Heizung',
        '2x Badezimmer mit Badewanne, Haartrockner & Toilettenartikeln',
        'Wohn- und Essbereich',
        'Kleiderschrank',
        'Safe mit Innensteckdose',
        'Gefliester/Marmorboden',
        '3x Flachbild-TV mit Satellitenkan\u00e4len',
        'Minibar',
        'Wasserkocher mit Kaffee- & Teebeuteln',
        'Schreibtisch',
        'Telefon',
        'Radio',
        'Weckservice',
      ],
    },
  },
  {
    slug: 'double-room-creative',
    category: 'room',
    capacity: 3,
    imageFiles: [
      { name: 'auri-comfort-double-park.jpg', rel: 'rooms/auri-comfort-double-park.jpg', mime: 'image/jpeg' },
      { name: 'auri-double-balcony.jpg', rel: 'rooms/auri-double-balcony.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Superior Double Room - creative design (children stay FREE)',
      size: '26 m²',
      bedType: 'Double bed or twin beds',
      title: 'A room for the free spirit',
      description: 'This uniquely decorated double room blends comfort with creative flair. Enjoy the balcony views over Podgora and the Adriatic. Ideal for couples and young travellers seeking something different.',
      inclusions: [
        'Free Wi-Fi',
        'Balcony with outdoor furniture',
        'Air conditioning / heating',
        'Bathroom with shower, hairdryer, complimentary toiletries & towels',
        'Wardrobe',
        'Safe with inner socket for laptop/phone charging',
        'Flat-screen TV with satellite channels',
        'Minibar',
        'Kettle with complimentary coffee & tea sachets',
        'Work desk',
        'Telephone',
        'Radio',
        'Wake-up service',
      ],
    },
    hr: {
      name: 'Superior dvokrevetna soba - kreativni dizajn (djeca borave BESPLATNO)',
      size: '26 m²',
      bedType: 'Bračni krevet ili odvojena ležaja',
      title: 'Soba za slobodne duhove',
      description: 'Ova jedinstveno uređena dvokrevetna soba spaja udobnost s kreativnim duhom. Uživajte u pogledu s balkona na Podgoru i Jadran. Idealna za parove i mlade putnike koji žele nešto drugačije.',
      inclusions: [
        'Besplatni Wi-Fi',
        'Balkon s vanjskim namještajem',
        'Klima uređaj/grijanje',
        'Kupaonica s tušem, sušilom za kosu, besplatnim toaletnim priborom i ručnicima',
        'Garderoba/ormar',
        'Sef sa unutrašnjom utičnicom za sigurno punjenje prijenosnog računala ili mobitela',
        'TV ravnog ekrana sa satelitskim kanalima',
        'Minibar',
        'Kuhalo za vodu s besplatnim vrećicama instant kave i čaja',
        'Radni stol',
        'Telefon',
        'Radio',
        'Usluga buđenja',
      ],
    },
    de: {
      name: 'Superior Doppelzimmer - kreatives Design (Kinder GRATIS)',
      size: '26 m²',
      bedType: 'Doppelbett oder Einzelbetten',
      title: 'Ein Zimmer für freie Geister',
      description: 'Dieses einzigartig dekorierte Doppelzimmer verbindet Komfort mit kreativem Flair. Genießen Sie den Balkon mit Blick auf Podgora und die Adria. Ideal für Paare und Reisende, die etwas anderes suchen.',
      inclusions: [
        'Kostenloses WLAN',
        'Balkon mit Außenmöbeln',
        'Klimaanlage / Heizung',
        'Badezimmer mit Dusche, Haartrockner, Toilettenartikeln & Handtüchern',
        'Kleiderschrank',
        'Safe mit Innensteckdose für Laptop/Handy',
        'Flachbild-TV mit Satellitenkanälen',
        'Minibar',
        'Wasserkocher mit Kaffee- & Teebeuteln',
        'Schreibtisch',
        'Telefon',
        'Radio',
        'Weckservice',
      ],
    },
  },
  // ─── Additional double rooms (sea-view sub-group) ──────────────────────────
  {
    slug: 'auri-comfort-double-sea',
    category: 'room',
    capacity: 3,
    imageFiles: [
      { name: 'auri-comfort-double-sea.jpg', rel: 'rooms/auri-comfort-double-sea.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Comfort Double Room - sea view with balcony (children stay FREE)',
      size: '21.5 m\u00b2',
      bedType: 'Double bed or twin beds',
      title: 'Sea views and Adriatic breeze',
      description: 'Comfort double room with balcony overlooking the Adriatic Sea. Ideal for couples or solo travellers seeking the perfect seaside retreat on the Makarska Riviera.',
      inclusions: ['Free Wi-Fi', 'Balcony with outdoor furniture', 'Air conditioning / heating', 'Bathroom with shower, hairdryer & complimentary toiletries', 'Wardrobe', 'Safe', 'Flat-screen TV with satellite channels', 'Minibar', 'Kettle with coffee & tea sachets', 'Work desk', 'Telephone', 'Radio', 'Wake-up service'],
    },
    hr: {
      name: 'Comfort dvokrevetna soba - pogled na more s balkonom (djeca borave BESPLATNO)',
      size: '21,5 m\u00b2',
      bedType: 'Bra\u010dni krevet ili odvojena le\u017eaja',
      title: 'Pogled na more i jadranski povjetarac',
      description: 'Comfort dvokrevetna soba s balkonom s pogledom na Jadransko more. Idealna za parove ili solo putnike koji tra\u017ee savr\u0161en odmor uz more na Makarskoj rivijeri.',
      inclusions: ['Besplatni Wi-Fi', 'Balkon s vanjskim namje\u0161tajem', 'Klima ure\u0111aj/grijanje', 'Kupaonica s tu\u0161em, su\u0161ilom za kosu i toaletnim priborom', 'Garderoba/ormar', 'Sef', 'TV ravnog ekrana sa satelitskim kanalima', 'Minibar', 'Kuhalo za vodu s kavom i \u010dajem', 'Radni stol', 'Telefon', 'Radio', 'Usluga bu\u0111enja'],
    },
    de: {
      name: 'Comfort Doppelzimmer - Meerblick mit Balkon (Kinder GRATIS)',
      size: '21,5 m\u00b2',
      bedType: 'Doppelbett oder Einzelbetten',
      title: 'Meerblick und Adriabrise',
      description: 'Comfort Doppelzimmer mit Balkon und Blick auf die Adria. Ideal f\u00fcr Paare oder Alleinreisende an der Makarska Riviera.',
      inclusions: ['Kostenloses WLAN', 'Balkon mit Au\u00dfenm\u00f6beln', 'Klimaanlage / Heizung', 'Badezimmer mit Dusche, Haartrockner & Toilettenartikeln', 'Kleiderschrank', 'Safe', 'Flachbild-TV mit Satellitenkan\u00e4len', 'Minibar', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Schreibtisch', 'Telefon', 'Radio', 'Weckservice'],
    },
  },
  // ─── Additional double rooms (creative sub-group) ──────────────────────────
  {
    slug: 'auri-comfort-double-park-sea',
    category: 'room',
    capacity: 3,
    imageFiles: [
      { name: 'auri-comfort-double-park-sea.jpg', rel: 'rooms/auri-comfort-double-park-sea.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Comfort Double Room - nature park and sea view with balcony (children stay FREE)',
      size: '21.5 m\u00b2',
      bedType: 'Double bed or twin beds',
      title: 'Unique views of Biokovo and the sea',
      description: 'Comfort double room with balcony offering views of the Biokovo nature park and the Adriatic. Ideal for guests who love nature and tranquillity combined with sea views.',
      inclusions: ['Free Wi-Fi', 'Balcony with outdoor furniture', 'Air conditioning / heating', 'Bathroom with shower, hairdryer & complimentary toiletries', 'Wardrobe', 'Safe', 'Flat-screen TV with satellite channels', 'Minibar', 'Kettle with coffee & tea sachets', 'Work desk', 'Telephone', 'Radio', 'Wake-up service'],
    },
    hr: {
      name: 'Comfort dvokrevetna soba - pogled na park prirode i more - balkon (djeca borave BESPLATNO)',
      size: '21,5 m\u00b2',
      bedType: 'Bra\u010dni krevet ili odvojena le\u017eaja',
      title: 'Jedinstven pogled na Biokovo i more',
      description: 'Comfort dvokrevetna soba s balkonom s pogledom na park prirode Biokovo i Jadransko more. Idealna za goste koji vole prirodu i mir uz pogled na more.',
      inclusions: ['Besplatni Wi-Fi', 'Balkon s vanjskim namje\u0161tajem', 'Klima ure\u0111aj/grijanje', 'Kupaonica s tu\u0161em, su\u0161ilom za kosu i toaletnim priborom', 'Garderoba/ormar', 'Sef', 'TV ravnog ekrana sa satelitskim kanalima', 'Minibar', 'Kuhalo za vodu s kavom i \u010dajem', 'Radni stol', 'Telefon', 'Radio', 'Usluga bu\u0111enja'],
    },
    de: {
      name: 'Comfort Doppelzimmer - Naturpark- und Meerblick mit Balkon (Kinder GRATIS)',
      size: '21,5 m\u00b2',
      bedType: 'Doppelbett oder Einzelbetten',
      title: 'Einzigartiger Blick auf Biokovo und Meer',
      description: 'Comfort Doppelzimmer mit Balkon und Blick auf den Biokovo-Naturpark und die Adria. Ideal f\u00fcr G\u00e4ste, die Natur und Ruhe mit Meerblick verbinden m\u00f6chten.',
      inclusions: ['Kostenloses WLAN', 'Balkon mit Au\u00dfenm\u00f6beln', 'Klimaanlage / Heizung', 'Badezimmer mit Dusche, Haartrockner & Toilettenartikeln', 'Kleiderschrank', 'Safe', 'Flachbild-TV mit Satellitenkan\u00e4len', 'Minibar', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Schreibtisch', 'Telefon', 'Radio', 'Weckservice'],
    },
  },
  {
    slug: 'auri-comfort-double-park',
    category: 'room',
    capacity: 3,
    imageFiles: [
      { name: 'auri-comfort-double-park.jpg', rel: 'rooms/auri-comfort-double-park.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Comfort Double Room - nature park view (children stay FREE)',
      size: '21.5 m\u00b2',
      bedType: 'Double bed or twin beds',
      title: 'Serenity of the Biokovo nature park',
      description: 'Comfort double room with views of the Biokovo nature park. A peaceful retreat for guests who prefer lush greenery and natural surroundings.',
      inclusions: ['Free Wi-Fi', 'Balcony with outdoor furniture', 'Air conditioning / heating', 'Bathroom with shower, hairdryer & complimentary toiletries', 'Wardrobe', 'Safe', 'Flat-screen TV with satellite channels', 'Minibar', 'Kettle with coffee & tea sachets', 'Work desk', 'Telephone', 'Radio', 'Wake-up service'],
    },
    hr: {
      name: 'Comfort dvokrevetna soba - pogled na park prirode (djeca borave BESPLATNO)',
      size: '21,5 m\u00b2',
      bedType: 'Bra\u010dni krevet ili odvojena le\u017eaja',
      title: 'Mir parka prirode Biokovo',
      description: 'Comfort dvokrevetna soba s pogledom na park prirode Biokovo. Mirno utoci\u0161te za goste koji preferiraju zelenilo i prirodno okru\u017eenje.',
      inclusions: ['Besplatni Wi-Fi', 'Balkon s vanjskim namje\u0161tajem', 'Klima ure\u0111aj/grijanje', 'Kupaonica s tu\u0161em, su\u0161ilom za kosu i toaletnim priborom', 'Garderoba/ormar', 'Sef', 'TV ravnog ekrana sa satelitskim kanalima', 'Minibar', 'Kuhalo za vodu s kavom i \u010dajem', 'Radni stol', 'Telefon', 'Radio', 'Usluga bu\u0111enja'],
    },
    de: {
      name: 'Comfort Doppelzimmer - Naturparkblick (Kinder GRATIS)',
      size: '21,5 m\u00b2',
      bedType: 'Doppelbett oder Einzelbetten',
      title: 'Stille des Biokovo-Naturparks',
      description: 'Comfort Doppelzimmer mit Blick auf den Biokovo-Naturpark. Ein ruhiger R\u00fcckzugsort f\u00fcr G\u00e4ste, die gr\u00fcne Natur bevorzugen.',
      inclusions: ['Kostenloses WLAN', 'Balkon mit Au\u00dfenm\u00f6beln', 'Klimaanlage / Heizung', 'Badezimmer mit Dusche, Haartrockner & Toilettenartikeln', 'Kleiderschrank', 'Safe', 'Flachbild-TV mit Satellitenkan\u00e4len', 'Minibar', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Schreibtisch', 'Telefon', 'Radio', 'Weckservice'],
    },
  },
  {
    slug: 'auri-comfort-double-pines',
    category: 'room',
    capacity: 2,
    imageFiles: [
      { name: 'auri-comfort-double-pines.jpg', rel: 'rooms/auri-comfort-double-pines.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Comfort Double Room - ancient pines and sea view - balcony - Residences (children stay FREE)',
      size: '19 m\u00b2',
      bedType: 'Double bed or twin beds',
      title: 'Shaded by century-old pines',
      description: 'Cosy comfort room in the Residences building with balcony views of ancient pine trees and a glimpse of the sea. A calm, shaded setting for a relaxing holiday.',
      inclusions: ['Free Wi-Fi', 'Balcony with outdoor furniture', 'Air conditioning / heating', 'Bathroom with shower, hairdryer & complimentary toiletries', 'Wardrobe', 'Safe', 'Flat-screen TV with satellite channels', 'Minibar', 'Kettle with coffee & tea sachets', 'Work desk', 'Telephone', 'Radio', 'Wake-up service'],
    },
    hr: {
      name: 'Comfort dvokrevetna soba - pogled na stoljetne borove i more - balkon - Rezidencija (djeca borave BESPLATNO)',
      size: '19 m\u00b2',
      bedType: 'Bra\u010dni krevet ili odvojena le\u017eaja',
      title: 'U hladu stoljetnih borova',
      description: 'Udobna soba u Rezidencijama s balkonom s pogledom na stoljetne borove i djelimi\u010dnim pogledom na more. Mirno i zasjen\u010deno okru\u017eenje za opu\u0161taju\u0107i odmor.',
      inclusions: ['Besplatni Wi-Fi', 'Balkon s vanjskim namje\u0161tajem', 'Klima ure\u0111aj/grijanje', 'Kupaonica s tu\u0161em, su\u0161ilom za kosu i toaletnim priborom', 'Garderoba/ormar', 'Sef', 'TV ravnog ekrana sa satelitskim kanalima', 'Minibar', 'Kuhalo za vodu s kavom i \u010dajem', 'Radni stol', 'Telefon', 'Radio', 'Usluga bu\u0111enja'],
    },
    de: {
      name: 'Comfort Doppelzimmer - Kiefern- und Meerblick - Balkon - Residenzen (Kinder GRATIS)',
      size: '19 m\u00b2',
      bedType: 'Doppelbett oder Einzelbetten',
      title: 'Im Schatten jahrhundertealter Kiefern',
      description: 'Gem\u00fctliches Comfort-Zimmer in den Residenzen mit Balkon und Blick auf uralte Kiefern und einem Hauch Meer. Eine ruhige, schattige Umgebung f\u00fcr einen entspannenden Urlaub.',
      inclusions: ['Kostenloses WLAN', 'Balkon mit Au\u00dfenm\u00f6beln', 'Klimaanlage / Heizung', 'Badezimmer mit Dusche, Haartrockner & Toilettenartikeln', 'Kleiderschrank', 'Safe', 'Flachbild-TV mit Satellitenkan\u00e4len', 'Minibar', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Schreibtisch', 'Telefon', 'Radio', 'Weckservice'],
    },
  },
  {
    slug: 'auri-double-garden-res',
    category: 'room',
    capacity: 3,
    imageFiles: [
      { name: 'auri-double-garden-res.jpg', rel: 'rooms/auri-double-garden-res.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Double Room - garden view - Residences (children stay FREE)',
      size: '19 m\u00b2',
      bedType: 'Double bed or twin beds',
      title: 'A peaceful garden retreat',
      description: 'Double room in the Residences with views of the beautiful garden. A quiet, comfortable choice for guests who prefer a green, shaded setting for their holiday.',
      inclusions: ['Free Wi-Fi', 'Balcony with outdoor furniture', 'Air conditioning / heating', 'Bathroom with shower, hairdryer & complimentary toiletries', 'Wardrobe', 'Safe', 'Flat-screen TV with satellite channels', 'Minibar', 'Kettle with coffee & tea sachets', 'Work desk', 'Telephone', 'Radio', 'Wake-up service'],
    },
    hr: {
      name: 'Dvokrevetna soba - pogled na vrt - Rezidencija (djeca borave BESPLATNO)',
      size: '19 m\u00b2',
      bedType: 'Bra\u010dni krevet ili odvojena le\u017eaja',
      title: 'Miran vrtni odmor',
      description: 'Dvokrevetna soba u Rezidencijama s pogledom na prekrasan vrt. Tihi i udoban izbor za goste koji preferiraju zeleno, zasjen\u010deno okru\u017eenje.',
      inclusions: ['Besplatni Wi-Fi', 'Balkon s vanjskim namje\u0161tajem', 'Klima ure\u0111aj/grijanje', 'Kupaonica s tu\u0161em, su\u0161ilom za kosu i toaletnim priborom', 'Garderoba/ormar', 'Sef', 'TV ravnog ekrana sa satelitskim kanalima', 'Minibar', 'Kuhalo za vodu s kavom i \u010dajem', 'Radni stol', 'Telefon', 'Radio', 'Usluga bu\u0111enja'],
    },
    de: {
      name: 'Doppelzimmer - Gartenblick - Residenzen (Kinder GRATIS)',
      size: '19 m\u00b2',
      bedType: 'Doppelbett oder Einzelbetten',
      title: 'Ein ruhiges Gartenparadies',
      description: 'Doppelzimmer in den Residenzen mit Blick auf den sch\u00f6nen Garten. Eine ruhige, komfortable Wahl f\u00fcr G\u00e4ste, die eine gr\u00fcne Umgebung bevorzugen.',
      inclusions: ['Kostenloses WLAN', 'Balkon mit Au\u00dfenm\u00f6beln', 'Klimaanlage / Heizung', 'Badezimmer mit Dusche, Haartrockner & Toilettenartikeln', 'Kleiderschrank', 'Safe', 'Flachbild-TV mit Satellitenkan\u00e4len', 'Minibar', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Schreibtisch', 'Telefon', 'Radio', 'Weckservice'],
    },
  },
  // ─── Additional family rooms ────────────────────────────────────────────────
  {
    slug: 'auri-family-garden-res',
    category: 'room',
    capacity: 4,
    imageFiles: [
      { name: 'auri-family-garden-res.jpg', rel: 'rooms/auri-family-garden-res.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Family Room - garden and sea view - balcony - Residences',
      size: '37\u201341 m\u00b2',
      bedType: '1 double bed + 2 single beds',
      title: 'Family comfort in the Residences',
      description: 'Spacious family room in the Residences with balcony overlooking the garden and sea. Two bedrooms and a bathroom provide the privacy and space that families need.',
      inclusions: ['Free Wi-Fi', '2x balcony with outdoor furniture', 'Air conditioning / heating', 'Bathroom with bathtub, hairdryer & complimentary toiletries + extra WC', '2x wardrobe', 'Safe', '2x flat-screen TV with satellite channels', 'Minibar', 'Kettle with coffee & tea sachets', 'Work desk', 'Telephone', 'Radio', 'Wake-up service'],
    },
    hr: {
      name: 'Obiteljska soba - pogled na vrt i more - balkon - Rezidencije',
      size: '37\u201341 m\u00b2',
      bedType: '1 bra\u010dni krevet + 2 odvojena kreveta',
      title: 'Obiteljski komfor u Rezidencijama',
      description: 'Prostrana obiteljska soba u Rezidencijama s balkonom s pogledom na vrt i more. Dvije spava\u0107e sobe i kupaonica pru\u017eaju privatnost i prostor koji obitelji trebaju.',
      inclusions: ['Besplatni Wi-Fi', '2x balkon s vanjskim namje\u0161tajem', 'Klima ure\u0111aj/grijanje', 'Kupaonica s kadom, su\u0161ilom za kosu i toaletnim priborom + dodatni WC', '2x garderoba/ormar', 'Sef', '2x TV ravnog ekrana sa satelitskim kanalima', 'Minibar', 'Kuhalo za vodu s kavom i \u010dajem', 'Radni stol', 'Telefon', 'Radio', 'Usluga bu\u0111enja'],
    },
    de: {
      name: 'Familienzimmer - Garten- und Meerblick - Balkon - Residenzen',
      size: '37\u201341 m\u00b2',
      bedType: '1 Doppelbett + 2 Einzelbetten',
      title: 'Familienkomfort in den Residenzen',
      description: 'Ger\u00e4umiges Familienzimmer in den Residenzen mit Balkon und Blick auf Garten und Meer. Zwei Schlafzimmer und ein Badezimmer bieten die Privatsph\u00e4re, die Familien brauchen.',
      inclusions: ['Kostenloses WLAN', '2x Balkon mit Au\u00dfenm\u00f6beln', 'Klimaanlage / Heizung', 'Badezimmer mit Badewanne, Haartrockner & Toilettenartikeln + extra WC', '2x Kleiderschrank', 'Safe', '2x Flachbild-TV mit Satellitenkan\u00e4len', 'Minibar', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Schreibtisch', 'Telefon', 'Radio', 'Weckservice'],
    },
  },
  {
    slug: 'auri-family-young',
    category: 'room',
    capacity: 4,
    imageFiles: [
      { name: 'auri-family-young.jpg', rel: 'rooms/auri-family-young.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Family Room for young families - garden view - balcony - Residences',
      size: '19 m\u00b2',
      bedType: '1 double bed + 2 pull-out beds',
      title: 'Perfect for young adventurous families',
      description: 'Compact family room in the Residences, designed for young families seeking comfort at a great value. One double bed and two pull-out beds make it ideal for families with small children.',
      inclusions: ['Free Wi-Fi', 'Balcony with outdoor furniture', 'Air conditioning / heating', 'Bathroom with shower, hairdryer & complimentary toiletries', 'Wardrobe', 'Safe', 'Flat-screen TV with satellite channels', 'Minibar', 'Kettle with coffee & tea sachets', 'Work desk', 'Telephone', 'Radio', 'Wake-up service'],
    },
    hr: {
      name: 'Obiteljska soba za mlade obitelji - pogled na vrt - balkon - Rezidencija',
      size: '19 m\u00b2',
      bedType: '1 bra\u010dni krevet + 2 kreveta na izvla\u010denje',
      title: 'Savr\u0161eno za mlade obitelji',
      description: 'Kompaktna obiteljska soba u Rezidencijama za mlade obitelji koje \u017eele udobnost uz razumnu cijenu. Bra\u010dni krevet i dva kreveta na izvla\u010denje, idealna za obitelji s malom djecom.',
      inclusions: ['Besplatni Wi-Fi', 'Balkon s vanjskim namje\u0161tajem', 'Klima ure\u0111aj/grijanje', 'Kupaonica s tu\u0161em, su\u0161ilom za kosu i toaletnim priborom', 'Garderoba/ormar', 'Sef', 'TV ravnog ekrana sa satelitskim kanalima', 'Minibar', 'Kuhalo za vodu s kavom i \u010dajem', 'Radni stol', 'Telefon', 'Radio', 'Usluga bu\u0111enja'],
    },
    de: {
      name: 'Familienzimmer f\u00fcr junge Familien - Gartenblick - Balkon - Residenzen',
      size: '19 m\u00b2',
      bedType: '1 Doppelbett + 2 Ausziehbetten',
      title: 'Perfekt f\u00fcr junge Familien',
      description: 'Kompaktes Familienzimmer in den Residenzen f\u00fcr junge Familien, die Komfort zu einem guten Preis-Leistungs-Verh\u00e4ltnis suchen. Doppelbett und zwei Ausziehbetten, ideal f\u00fcr Familien mit kleinen Kindern.',
      inclusions: ['Kostenloses WLAN', 'Balkon mit Au\u00dfenm\u00f6beln', 'Klimaanlage / Heizung', 'Badezimmer mit Dusche, Haartrockner & Toilettenartikeln', 'Kleiderschrank', 'Safe', 'Flachbild-TV mit Satellitenkan\u00e4len', 'Minibar', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Schreibtisch', 'Telefon', 'Radio', 'Weckservice'],
    },
  },
]

const ORBIS_ROOMS = [
  {
    slug: 'orbis-deluxe-2bed-pool',
    category: 'cabin',
    capacity: 5,
    imageFiles: [
      { name: 'orbis-deluxe-2bed-actual.jpg', rel: 'rooms/orbis-deluxe-2bed-actual.jpg', mime: 'image/jpeg' },
      { name: 'orbis-deluxe-pool.jpg', rel: 'rooms/orbis-deluxe-pool.jpg', mime: 'image/jpeg' },
      { name: 'orbis-deluxe-outside.jpg', rel: 'rooms/orbis-deluxe-outside.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Deluxe Home with two bedrooms - private pool',
      size: '32 m\u00b2',
      bedType: '1 double bed + 2 single beds',
      title: 'Enjoy an unforgettable holiday',
      description: 'These mobile homes are ideal for families with two children who want to enjoy warm Dalmatian days. The homes feature two bedrooms, two bathrooms, a living room and a kitchen. Relax on sun loungers while your loved ones enjoy swimming in the private heated pool \u2014 especially enchanting in spring and early autumn. The home is further equipped with modern amenities including air conditioning, TV and complimentary Wi-Fi.',
      inclusions: [
        'Private heated pool with sun deck & loungers',
        'Free Wi-Fi',
        'Air conditioning',
        'Covered terrace with seating for 4',
        '2 bathrooms with shower & WC',
        'Bedroom with double bed (160\u00d7200)',
        'Bedroom with two single beds (80\u00d7200)',
        'Extra bed (135\u00d7185 cm)',
        'Kitchen with 4 electric hobs & fridge-freezer',
        'Kitchenware & microwave',
        'Kettle with complimentary coffee & tea sachets',
        'Satellite TV',
        'Table & seating for 4',
        'Safe',
        'Linen & towels included',
      ],
    },
    hr: {
      name: 'Deluxe ku\u0107ica s dvije spava\u0107e sobe - privatni bazen',
      size: '32 m\u00b2',
      bedType: '1 bra\u010dni krevet + 2 odvojena kreveta',
      title: 'Do\u017eivite nezaboravan odmor',
      description: 'Ove mobilne ku\u0107ice idealne su za obitelji s dvoje djece koje \u017eele u\u017eivati u toplim dalmatinskim danima. Iz tog razloga ku\u0107ice imaju dvije spava\u0107e sobe, dvije kupaonice, dnevni boravak i kuhinju. Opustite se na le\u017ealjkama dok va\u0161i najmilijii u\u017eivaju u kupanju u privatnom, grijanom bazenu, a \u0161to posebnu \u010dar daje u prolje\u0107e i ranu jesen. Ku\u0107ica je dodatno opremljena modernim sadr\u017eajima poput klimatizacijskog ure\u0111aja i televizora te besplatnim Wi-Fi internetom.',
      inclusions: [
        'Privatan grijani bazen sa sun\u010dali\u0161tem i le\u017ealjkama',
        'Besplatan Wi-Fi',
        'Klima ure\u0111aj',
        'Natkrivena terasa sa sje\u0111e\u0107om garniturom za 4 osobe',
        '2 kupaonice s tu\u0161-kabinom i WC-om',
        'Soba s bra\u010dnim krevetom (160\u00d7200)',
        'Soba s dva odvojena kreveta (80\u00d7200)',
        'Dodatni le\u017eaj (135\u00d7185 cm)',
        'Kuhinja s 4 plo\u010de za kuhanje na struju, hladnjak s zamrziva\u010dem',
        'Posu\u0111e, mikrovalna pe\u0107nica',
        'Kuhalo za vodu s besplatnim vre\u0107icama instant kave i \u010daja',
        'TV sa satelitskim kanalima',
        'Stol i sje\u0111e\u0107a mjesta za 4 osobe',
        'Sef',
        'Posteljina i ru\u010dnici uklju\u010deni u cijenu',
      ],
    },
    de: {
      name: 'Deluxe Haus mit zwei Schlafzimmern - privater Pool',
      size: '32 m\u00b2',
      bedType: '1 Doppelbett + 2 Einzelbetten',
      title: 'Erleben Sie einen unvergesslichen Urlaub',
      description: 'Diese Mobilheime sind ideal f\u00fcr Familien mit zwei Kindern, die die warmen dalmatinischen Tage genie\u00dfen m\u00f6chten. Die H\u00e4user verf\u00fcgen \u00fcber zwei Schlafzimmer, zwei Badezimmer, ein Wohnzimmer und eine K\u00fcche. Entspannen Sie auf Sonnenliegen, w\u00e4hrend Ihre Liebsten im privaten beheizten Pool schwimmen \u2014 besonders zauberhaft im Fr\u00fchling und Fr\u00fch herbst. Das Haus ist au\u00dferdem mit Klimaanlage, TV und kostenlosem WLAN ausgestattet.',
      inclusions: [
        'Privater beheizter Pool mit Sonnendeck & Liegen',
        'Kostenloses WLAN',
        'Klimaanlage',
        '\u00dcberdachte Terrasse mit Sitzgelegenheiten f\u00fcr 4',
        '2 Badezimmer mit Dusche & WC',
        'Schlafzimmer mit Doppelbett (160\u00d7200)',
        'Schlafzimmer mit zwei Einzelbetten (80\u00d7200)',
        'Zusatzbett (135\u00d7185 cm)',
        'K\u00fcche mit 4 Elektrokochplatten & K\u00fchl-Gefrier-Kombination',
        'Kochgeschirr & Mikrowelle',
        'Wasserkocher mit Kaffee- & Teebeuteln',
        'Satelliten-TV',
        'Tisch & Sitzpl\u00e4tze f\u00fcr 4',
        'Safe',
        'Bettw\u00e4sche & Handtücher inklusive',
      ],
    },
  },
  {
    slug: 'orbis-premium-2bed-pool',
    category: 'cabin',
    capacity: 5,
    imageFiles: [
      { name: 'orbis-premium-2bed-actual.jpg', rel: 'rooms/orbis-premium-2bed-actual.jpg', mime: 'image/jpeg' },
      { name: 'orbis-premium-terrace.jpg', rel: 'rooms/orbis-premium-terrace.jpg', mime: 'image/jpeg' },
      { name: 'orbis-premium-inside.jpg', rel: 'rooms/orbis-premium-inside.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Premium Home with two bedrooms - private pool',
      size: '32 m\u00b2',
      bedType: '1 double bed + 2 single beds',
      title: 'Choose this high-comfort modern home',
      description: 'The home features two fully equipped bedrooms \u2014 one with a double bed and one with two single beds \u2014 plus two bathrooms with shower, WC and toiletries, and a kitchen with fridge, microwave and filter coffee machine. Relax on the spacious sun terrace and enjoy the private heated pool. Modern amenities including air conditioning, TV and free Wi-Fi ensure carefree enjoyment of every moment in Podgora.',
      inclusions: [
        'Private heated pool with sun deck',
        'Free Wi-Fi',
        'Air conditioning',
        'Covered terrace with seating for 4',
        '2 bathrooms with shower & WC',
        'Bedroom with double bed (160\u00d7200)',
        'Bedroom with two single beds (80\u00d7200)',
        'Extra bed (135\u00d7185 cm)',
        'Kitchen with 4 electric hobs & fridge-freezer',
        'Kitchenware & microwave',
        'Kettle with complimentary coffee & tea sachets',
        'Satellite TV',
        'Table & seating for 4',
        'Safe',
        'Linen & towels included',
      ],
    },
    hr: {
      name: 'Premium ku\u0107ica s dvije spava\u0107e sobe - privatni bazen',
      size: '32 m\u00b2',
      bedType: '1 bra\u010dni krevet + 2 odvojena kreveta',
      title: 'Odaberite ovu modernu ku\u0107icu visokog komfora',
      description: 'U ku\u0107ici se nalaze dvije potpuno opremljene spava\u0107e sobe od kojih je u jednoj bra\u010dni krevet, a u drugoj dva odvojena kreveta. Osim toga, tu su i dvije kupaonice s tu\u0161 kabinom, WC-om i svim potrebnim toaletnim priborom te opremljena kuhinja s hladnjakom, mikrovalnom pe\u0107nicom i aparatom za filter kavu. Opustite se na prostranoj terasi s le\u017ealjkama, u kupanju u privatnom, grijanom bazenu, a \u0161to posebnu \u010dar daje u prolje\u0107e i ranu jesen. Moderne pogodnosti unutar ku\u0107ice poput klimatizacijskog ure\u0111aja, televizora i besplatnog Wi-Fi interneta omogu\u0107it \u0107e vam bezbrižno u\u017eivanje u svakoj minuti provedenoj u Podgori.',
      inclusions: [
        'Privatni grijani bazen sa sun\u010dali\u0161tem',
        'Besplatan Wi-Fi',
        'Klima ure\u0111aj',
        'Natkrivena terasa sa sje\u0111e\u0107om garniturom za 4 osobe',
        '2 kupaonice s tu\u0161-kabinom i WC-om',
        'Soba s bra\u010dnim krevetom (160\u00d7200)',
        'Spava\u0107a soba s dva odvojena kreveta (80\u00d7200)',
        'Dodatni le\u017eaj (135\u00d7185 cm)',
        'Kuhinja s 4 plo\u010de za kuhanje na struju, hladnjak s zamrziva\u010dem',
        'Posu\u0111e, mikrovalna pe\u0107nica',
        'Kuhalo za vodu s besplatnim vre\u0107icama instant kave i \u010daja',
        'TV sa satelitskim kanalima',
        'Stol i sje\u0111e\u0107a mjesta za 4 osobe',
        'Sef',
        'Posteljina i ru\u010dnici uklju\u010deni u cijenu',
      ],
    },
    de: {
      name: 'Premium Haus mit zwei Schlafzimmern - privater Pool',
      size: '32 m\u00b2',
      bedType: '1 Doppelbett + 2 Einzelbetten',
      title: 'W\u00e4hlen Sie dieses moderne Haus mit hohem Komfort',
      description: 'Das Haus verf\u00fcgt \u00fcber zwei voll ausgestattete Schlafzimmer \u2014 eines mit Doppelbett und eines mit zwei Einzelbetten \u2014 sowie zwei Badezimmer mit Dusche, WC und Toilettenartikeln und eine K\u00fcche mit K\u00fchlschrank, Mikrowelle und Filterkaffeemaschine. Entspannen Sie auf der ger\u00e4umigen Sonnenterrasse und genie\u00dfen Sie den privaten beheizten Pool. Klimaanlage, TV und kostenloses WLAN sorgen f\u00fcr unbeschwerten Genuss jedes Moments in Podgora.',
      inclusions: [
        'Privater beheizter Pool mit Sonnendeck',
        'Kostenloses WLAN',
        'Klimaanlage',
        '\u00dcberdachte Terrasse mit Sitzgelegenheiten f\u00fcr 4',
        '2 Badezimmer mit Dusche & WC',
        'Schlafzimmer mit Doppelbett (160\u00d7200)',
        'Schlafzimmer mit zwei Einzelbetten (80\u00d7200)',
        'Zusatzbett (135\u00d7185 cm)',
        'K\u00fcche mit 4 Elektrokochplatten & K\u00fchl-Gefrier-Kombination',
        'Kochgeschirr & Mikrowelle',
        'Wasserkocher mit Kaffee- & Teebeuteln',
        'Satelliten-TV',
        'Tisch & Sitzpl\u00e4tze f\u00fcr 4',
        'Safe',
        'Bettw\u00e4sche & Handtücher inklusive',
      ],
    },
  },
  {
    slug: 'orbis-superior-2bed',
    category: 'cabin',
    capacity: 5,
    imageFiles: [
      { name: 'orbis-superior-2bed-actual.png', rel: 'rooms/orbis-superior-2bed-actual.png', mime: 'image/png' },
      { name: 'orbis-superior-terrace1.jpg', rel: 'rooms/orbis-superior-terrace1.jpg', mime: 'image/jpeg' },
      { name: 'orbis-superior-terrace2.jpg', rel: 'rooms/orbis-superior-terrace2.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Superior Home with two bedrooms',
      size: '32 m\u00b2',
      bedType: '1 double bed + 2 single beds',
      title: 'Choose this high-comfort modern home',
      description: 'The home features two fully equipped bedrooms \u2014 one with a double bed and one with two single beds \u2014 plus two bathrooms with shower, WC and all toiletries, and a kitchen with fridge, microwave and filter coffee machine. Relax on the spacious terrace with sun loungers. Modern amenities including air conditioning, TV and free Wi-Fi ensure carefree enjoyment of every moment in Podgora.',
      inclusions: [
        'Free Wi-Fi',
        'Air conditioning',
        'Covered terrace with seating for 4',
        '2 bathrooms with shower & WC',
        'Bedroom with double bed (160\u00d7200)',
        'Bedroom with two single beds (80\u00d7200)',
        'Extra bed (135\u00d7185 cm)',
        'Kitchen with 4 electric hobs & fridge-freezer',
        'Kitchenware & microwave',
        'Kettle with complimentary coffee & tea sachets',
        'Satellite TV',
        'Table & seating for 4',
        'Safe',
        'Linen & towels included',
      ],
    },
    hr: {
      name: 'Superior ku\u0107ica s dvije spava\u0107e sobe',
      size: '32 m\u00b2',
      bedType: '1 bra\u010dni krevet + 2 odvojena kreveta',
      title: 'Odaberite ovu modernu ku\u0107icu visokog komfora',
      description: 'U ku\u0107ici se nalaze dvije potpuno opremljene spava\u0107e sobe od kojih je u jednoj bra\u010dni krevet, a u drugoj dva odvojena kreveta. Osim toga, tu su i dvije kupaonice s tu\u0161 kabinom, WC-om i svim potrebnim toaletnim priborom te opremljena kuhinja s hladnjakom, mikrovalnom pe\u0107nicom i aparatom za filter kavu. Opustite se na prostranoj terasi s le\u017ealjkama, a moderne pogodnosti unutar ku\u0107ice poput klimatizacijskog ure\u0111aja, televizora i besplatnog Wi-Fi interneta omogu\u0107it \u0107e vam bezbrižno u\u017eivanje u svakoj minuti provedenoj u Podgori.',
      inclusions: [
        'Besplatan Wi-Fi',
        'Klima ure\u0111aj',
        'Natkrivena terasa sa sje\u0111e\u0107om garniturom za 4 osobe',
        '2 kupaonice s tu\u0161-kabinom i WC-om',
        'Soba s bra\u010dnim krevetom (160\u00d7200)',
        'Spava\u0107a soba s dva odvojena kreveta (80\u00d7200)',
        'Dodatni le\u017eaj (135\u00d7185 cm)',
        'Kuhinja s 4 plo\u010de za kuhanje na struju, hladnjak s zamrziva\u010dem',
        'Posu\u0111e, mikrovalna pe\u0107nica',
        'Kuhalo za vodu s besplatnim vre\u0107icama instant kave i \u010daja',
        'TV sa satelitskim kanalima',
        'Stol i sje\u0111e\u0107a mjesta za 4 osobe',
        'Sef',
        'Posteljina i ru\u010dnici uklju\u010deni u cijenu',
      ],
    },
    de: {
      name: 'Superior Haus mit zwei Schlafzimmern',
      size: '32 m\u00b2',
      bedType: '1 Doppelbett + 2 Einzelbetten',
      title: 'W\u00e4hlen Sie dieses moderne Haus mit hohem Komfort',
      description: 'Das Haus verf\u00fcgt \u00fcber zwei voll ausgestattete Schlafzimmer \u2014 eines mit Doppelbett und eines mit zwei Einzelbetten \u2014 sowie zwei Badezimmer mit Dusche, WC und allen Toilettenartikeln und eine K\u00fcche mit K\u00fchlschrank, Mikrowelle und Filterkaffeemaschine. Entspannen Sie auf der ger\u00e4umigen Terrasse mit Sonnenliegen. Klimaanlage, TV und kostenloses WLAN sorgen f\u00fcr unbeschwerten Genuss jedes Moments in Podgora.',
      inclusions: [
        'Kostenloses WLAN',
        'Klimaanlage',
        '\u00dcberdachte Terrasse mit Sitzgelegenheiten f\u00fcr 4',
        '2 Badezimmer mit Dusche & WC',
        'Schlafzimmer mit Doppelbett (160\u00d7200)',
        'Schlafzimmer mit zwei Einzelbetten (80\u00d7200)',
        'Zusatzbett (135\u00d7185 cm)',
        'K\u00fcche mit 4 Elektrokochplatten & K\u00fchl-Gefrier-Kombination',
        'Kochgeschirr & Mikrowelle',
        'Wasserkocher mit Kaffee- & Teebeuteln',
        'Satelliten-TV',
        'Tisch & Sitzpl\u00e4tze f\u00fcr 4',
        'Safe',
        'Bettw\u00e4sche & Handtücher inklusive',
      ],
    },
  },
  // ─── Superior disabled (small group) ──────────────────────────────────────
  {
    slug: 'orbis-superior-disabled',
    category: 'cabin',
    capacity: 6,
    imageFiles: [
      { name: 'orbis-superior-2bed-actual.png', rel: 'rooms/orbis-superior-2bed-actual.png', mime: 'image/png' },
    ],
    en: {
      name: 'Superior Home for guests with disabilities',
      size: '32 m\u00b2',
      bedType: '1 double bed + 2 single beds',
      title: 'Accessible comfort for all guests',
      description: 'Superior mobile home specially adapted for guests with disabilities. Features wider doorways, an accessible bathroom and all standard amenities to ensure a comfortable stay.',
      inclusions: ['Free Wi-Fi', 'Air conditioning', 'Covered terrace with seating for 4', '2 bathrooms with shower & WC (wheelchair accessible)', 'Bedroom with double bed (160\u00d7200)', 'Bedroom with two single beds (80\u00d7200)', 'Extra bed (135\u00d7185 cm)', 'Kitchen with 4 electric hobs & fridge-freezer', 'Kitchenware & microwave', 'Kettle with coffee & tea sachets', 'Satellite TV', 'Table & seating for 4', 'Safe', 'Linen & towels included'],
    },
    hr: {
      name: 'Superior ku\u0107ica za osobe s invaliditetom',
      size: '32 m\u00b2',
      bedType: '1 bra\u010dni krevet + 2 odvojena kreveta',
      title: 'Pristupa\u010dna udobnost za sve goste',
      description: 'Superior mobilna ku\u0107ica posebno prilagodena za osobe s invaliditetom. \u0160ira vrata, pristupa\u010dna kupaonica i svi standardni sadr\u017eaji za ugodan boravak. Dvije spava\u0107e sobe i prostrani dnevni boravak.',
      inclusions: ['Besplatan Wi-Fi', 'Klima ure\u0111aj', 'Natkrivena terasa sa sje\u0111e\u0107om garniturom za 4 osobe', '2 kupaonice s tu\u0161-kabinom i WC-om (prilagodene osobama s invaliditetom)', 'Soba s bra\u010dnim krevetom (160\u00d7200)', 'Soba s dva odvojena kreveta (80\u00d7200)', 'Dodatni le\u017eaj (135\u00d7185 cm)', 'Kuhinja s 4 plo\u010de za kuhanje na struju, hladnjak s zamrziva\u010dem', 'Posu\u0111e, mikrovalna pe\u0107nica', 'Kuhalo za vodu s kavom i \u010dajem', 'TV sa satelitskim kanalima', 'Stol i sje\u0111e\u0107a mjesta za 4 osobe', 'Sef', 'Posteljina i ru\u010dnici uklju\u010deni u cijenu'],
    },
    de: {
      name: 'Superior Haus f\u00fcr G\u00e4ste mit Behinderung',
      size: '32 m\u00b2',
      bedType: '1 Doppelbett + 2 Einzelbetten',
      title: 'Barrierefreier Komfort f\u00fcr alle G\u00e4ste',
      description: 'Superior Mobilheim, speziell f\u00fcr G\u00e4ste mit Behinderungen angepasst. Breitere T\u00fcren, barrierefreies Badezimmer und alle Standardausstattungen f\u00fcr einen komfortablen Aufenthalt.',
      inclusions: ['Kostenloses WLAN', 'Klimaanlage', '\u00dcberdachte Terrasse mit Sitzgelegenheiten f\u00fcr 4', '2 Badezimmer mit Dusche & WC (rollstuhlgerecht)', 'Schlafzimmer mit Doppelbett (160\u00d7200)', 'Schlafzimmer mit zwei Einzelbetten (80\u00d7200)', 'Zusatzbett (135\u00d7185 cm)', 'K\u00fcche mit 4 Elektrokochplatten & K\u00fchl-Gefrier-Kombination', 'Kochgeschirr & Mikrowelle', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Satelliten-TV', 'Tisch & Sitzpl\u00e4tze f\u00fcr 4', 'Safe', 'Bettw\u00e4sche & Handtücher inklusive'],
    },
  },
  // ─── Premium 1-bedroom (small group) ──────────────────────────────────────
  {
    slug: 'orbis-premium-1bed-pool',
    category: 'cabin',
    capacity: 3,
    imageFiles: [
      { name: 'orbis-premium-1bed-actual.jpg', rel: 'rooms/orbis-premium-1bed-actual.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Premium Home with one bedroom - private pool',
      size: '20 m\u00b2',
      bedType: '1 double bed',
      title: 'Intimate luxury with private pool',
      description: 'Premium mobile home with one bedroom and a private heated pool. Perfect for couples who want all the luxury of a private pool experience.',
      inclusions: ['Private heated pool with sun deck', 'Free Wi-Fi', 'Air conditioning', 'Covered terrace with seating', '1 bathroom with shower & WC', 'Bedroom with double bed (160\u00d7200)', 'Extra bed (135\u00d7185 cm)', 'Kitchen with electric hobs & fridge-freezer', 'Kitchenware & microwave', 'Kettle with coffee & tea sachets', 'Satellite TV', 'Table & seating', 'Safe', 'Linen & towels included'],
    },
    hr: {
      name: 'Premium ku\u0107ica s jednom spava\u0107om sobom - privatni bazen',
      size: '20 m\u00b2',
      bedType: '1 bra\u010dni krevet',
      title: 'Intimni luksuz s privatnim bazenom',
      description: 'Premium mobilna ku\u0107ica s jednom spava\u0107om sobom i privatnim grijanim bazenom. Savr\u0161ena za parove koji \u017eele sve prednosti privatnog bazena.',
      inclusions: ['Privatni grijani bazen sa sun\u010dali\u0161tem', 'Besplatan Wi-Fi', 'Klima ure\u0111aj', 'Natkrivena terasa sa sje\u0111e\u0107om garniturom', '1 kupaonica s tu\u0161-kabinom i WC-om', 'Soba s bra\u010dnim krevetom (160\u00d7200)', 'Dodatni le\u017eaj (135\u00d7185 cm)', 'Kuhinja s plo\u010dama za kuhanje, hladnjak s zamrziva\u010dem', 'Posu\u0111e, mikrovalna pe\u0107nica', 'Kuhalo za vodu s kavom i \u010dajem', 'TV sa satelitskim kanalima', 'Stol i sje\u0111e\u0107a mjesta', 'Sef', 'Posteljina i ru\u010dnici uklju\u010deni u cijenu'],
    },
    de: {
      name: 'Premium Haus mit einem Schlafzimmer - privater Pool',
      size: '20 m\u00b2',
      bedType: '1 Doppelbett',
      title: 'Intimer Luxus mit privatem Pool',
      description: 'Premium Mobilheim mit einem Schlafzimmer und einem privaten beheizten Pool. Perfekt f\u00fcr Paare, die den Luxus eines privaten Pools genie\u00dfen m\u00f6chten.',
      inclusions: ['Privater beheizter Pool mit Sonnendeck', 'Kostenloses WLAN', 'Klimaanlage', '\u00dcberdachte Terrasse mit Sitzgelegenheiten', '1 Badezimmer mit Dusche & WC', 'Schlafzimmer mit Doppelbett (160\u00d7200)', 'Zusatzbett (135\u00d7185 cm)', 'K\u00fcche mit Elektrokochplatten & K\u00fchl-Gefrier-Kombination', 'Kochgeschirr & Mikrowelle', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Satelliten-TV', 'Tisch & Sitzpl\u00e4tze', 'Safe', 'Bettw\u00e4sche & Handtücher inklusive'],
    },
  },
  // ─── Large cabins (6-7 persons) ────────────────────────────────────────────
  {
    slug: 'orbis-deluxe-3bed-pool',
    category: 'cabin',
    capacity: 8,
    imageFiles: [
      { name: 'orbis-deluxe-3bed-actual.jpg', rel: 'rooms/orbis-deluxe-3bed-actual.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Deluxe Home with three bedrooms - private pool',
      size: '34 m\u00b2',
      bedType: '3 bedrooms',
      title: 'The ultimate family getaway',
      description: 'Spacious deluxe mobile home for larger families. Three bedrooms, two bathrooms, a private heated pool and fully equipped kitchen for a memorable holiday in Dalmatia.',
      inclusions: ['Private heated pool with sun deck & loungers', 'Free Wi-Fi', 'Air conditioning', 'Covered terrace with seating for 6', '2 bathrooms with shower & WC', 'Master bedroom with double bed', '2x bedroom with single beds', 'Extra bed', 'Kitchen with 4 electric hobs & fridge-freezer', 'Kitchenware & microwave', 'Kettle with coffee & tea sachets', 'Satellite TV', 'Table & seating for 6', 'Safe', 'Linen & towels included'],
    },
    hr: {
      name: 'Deluxe ku\u0107ica s tri spava\u0107e sobe - privatni bazen',
      size: '34 m\u00b2',
      bedType: '3 spava\u0107e sobe',
      title: 'Savr\u0161en obiteljski odmor',
      description: 'Prostrana deluxe mobilna ku\u0107ica za ve\u0107e obitelji. Tri spava\u0107e sobe, dvije kupaonice, privatni grijani bazen i opremljena kuhinja za nezaboravan odmor u Dalmaciji.',
      inclusions: ['Privatan grijani bazen sa sun\u010dali\u0161tem i le\u017ealjkama', 'Besplatan Wi-Fi', 'Klima ure\u0111aj', 'Natkrivena terasa sa sje\u0111e\u0107om garniturom za 6 osoba', '2 kupaonice s tu\u0161-kabinom i WC-om', 'Soba s bra\u010dnim krevetom', '2x soba s odvojenim krevetima', 'Dodatni le\u017eaj', 'Kuhinja s 4 plo\u010de za kuhanje, hladnjak s zamrziva\u010dem', 'Posu\u0111e, mikrovalna pe\u0107nica', 'Kuhalo za vodu s kavom i \u010dajem', 'TV sa satelitskim kanalima', 'Stol i sje\u0111e\u0107a mjesta za 6 osoba', 'Sef', 'Posteljina i ru\u010dnici uklju\u010deni u cijenu'],
    },
    de: {
      name: 'Deluxe Haus mit drei Schlafzimmern - privater Pool',
      size: '34 m\u00b2',
      bedType: '3 Schlafzimmer',
      title: 'Der ultimative Familienurlaub',
      description: 'Ger\u00e4umiges Deluxe-Mobilheim f\u00fcr gr\u00f6\u00dfere Familien. Drei Schlafzimmer, zwei Badezimmer, privater beheizter Pool und voll ausgestattete K\u00fcche f\u00fcr einen unvergesslichen Urlaub in Dalmatien.',
      inclusions: ['Privater beheizter Pool mit Sonnendeck & Liegen', 'Kostenloses WLAN', 'Klimaanlage', '\u00dcberdachte Terrasse mit Sitzgelegenheiten f\u00fcr 6', '2 Badezimmer mit Dusche & WC', 'Hauptschlafzimmer mit Doppelbett', '2x Schlafzimmer mit Einzelbetten', 'Zusatzbett', 'K\u00fcche mit 4 Elektrokochplatten & K\u00fchl-Gefrier-Kombination', 'Kochgeschirr & Mikrowelle', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Satelliten-TV', 'Tisch & Sitzpl\u00e4tze f\u00fcr 6', 'Safe', 'Bettw\u00e4sche & Handtücher inklusive'],
    },
  },
  {
    slug: 'orbis-premium-3bed-pool',
    category: 'cabin',
    capacity: 8,
    imageFiles: [
      { name: 'orbis-premium-3bed-actual.jpg', rel: 'rooms/orbis-premium-3bed-actual.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Premium Home with three bedrooms - private pool',
      size: '34 m\u00b2',
      bedType: '3 bedrooms',
      title: 'Premium space for the whole family',
      description: 'Premium mobile home for larger groups with three bedrooms, private heated pool and two bathrooms. High comfort standard with modern furnishings and fully equipped kitchen.',
      inclusions: ['Private heated pool with sun deck', 'Free Wi-Fi', 'Air conditioning', 'Covered terrace with seating for 6', '2 bathrooms with shower & WC', 'Bedroom with double bed', '2x bedroom with single beds', 'Extra bed', 'Kitchen with 4 electric hobs & fridge-freezer', 'Kitchenware & microwave', 'Kettle with coffee & tea sachets', 'Satellite TV', 'Table & seating for 6', 'Safe', 'Linen & towels included'],
    },
    hr: {
      name: 'Premium ku\u0107ica s tri spava\u0107e sobe - privatni bazen',
      size: '34 m\u00b2',
      bedType: '3 spava\u0107e sobe',
      title: 'Premium prostor za cijelu obitelj',
      description: 'Premium mobilna ku\u0107ica za ve\u0107e grupe s tri spava\u0107e sobe, privatnim grijanim bazenom i dvije kupaonice. Visoki standard udobnosti s modernim namje\u0161tajem i opremljenom kuhinjom.',
      inclusions: ['Privatni grijani bazen sa sun\u010dali\u0161tem', 'Besplatan Wi-Fi', 'Klima ure\u0111aj', 'Natkrivena terasa sa sje\u0111e\u0107om garniturom za 6 osoba', '2 kupaonice s tu\u0161-kabinom i WC-om', 'Soba s bra\u010dnim krevetom', '2x soba s odvojenim krevetima', 'Dodatni le\u017eaj', 'Kuhinja s 4 plo\u010de za kuhanje, hladnjak s zamrziva\u010dem', 'Posu\u0111e, mikrovalna pe\u0107nica', 'Kuhalo za vodu s kavom i \u010dajem', 'TV sa satelitskim kanalima', 'Stol i sje\u0111e\u0107a mjesta za 6 osoba', 'Sef', 'Posteljina i ru\u010dnici uklju\u010deni u cijenu'],
    },
    de: {
      name: 'Premium Haus mit drei Schlafzimmern - privater Pool',
      size: '34 m\u00b2',
      bedType: '3 Schlafzimmer',
      title: 'Premium-Raum f\u00fcr die ganze Familie',
      description: 'Premium Mobilheim f\u00fcr gr\u00f6\u00dfere Gruppen mit drei Schlafzimmern, privatem Pool und zwei Badezimmern. Hoher Komfortstandard mit modernem Mobiliar und voll ausgestatteter K\u00fcche.',
      inclusions: ['Privater beheizter Pool mit Sonnendeck', 'Kostenloses WLAN', 'Klimaanlage', '\u00dcberdachte Terrasse mit Sitzgelegenheiten f\u00fcr 6', '2 Badezimmer mit Dusche & WC', 'Schlafzimmer mit Doppelbett', '2x Schlafzimmer mit Einzelbetten', 'Zusatzbett', 'K\u00fcche mit 4 Elektrokochplatten & K\u00fchl-Gefrier-Kombination', 'Kochgeschirr & Mikrowelle', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Satelliten-TV', 'Tisch & Sitzpl\u00e4tze f\u00fcr 6', 'Safe', 'Bettw\u00e4sche & Handtücher inklusive'],
    },
  },
  {
    slug: 'orbis-superior-3bed',
    category: 'cabin',
    capacity: 8,
    imageFiles: [
      { name: 'orbis-superior-3bed-actual.jpg', rel: 'rooms/orbis-superior-3bed-actual.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Superior Home with three bedrooms',
      size: '34 m\u00b2',
      bedType: '3 bedrooms',
      title: 'Spacious Superior comfort for large groups',
      description: 'Superior mobile home with three bedrooms and two bathrooms for larger groups. Spacious terrace, fully equipped kitchen and modern amenities for a comfortable Dalmatian holiday.',
      inclusions: ['Free Wi-Fi', 'Air conditioning', 'Covered terrace with seating for 6', '2 bathrooms with shower & WC', 'Bedroom with double bed', '2x bedroom with single beds', 'Extra bed', 'Kitchen with 4 electric hobs & fridge-freezer', 'Kitchenware & microwave', 'Kettle with coffee & tea sachets', 'Satellite TV', 'Table & seating for 6', 'Safe', 'Linen & towels included'],
    },
    hr: {
      name: 'Superior ku\u0107ica s tri spava\u0107e sobe',
      size: '34 m\u00b2',
      bedType: '3 spava\u0107e sobe',
      title: 'Prostrani Superior komfor za ve\u0107e grupe',
      description: 'Superior mobilna ku\u0107ica s tri spava\u0107e sobe i dvije kupaonice za ve\u0107e grupe. Prostrana terasa, opremljena kuhinja i moderni sadr\u017eaji za ugodan dalmatinski odmor.',
      inclusions: ['Besplatan Wi-Fi', 'Klima ure\u0111aj', 'Natkrivena terasa sa sje\u0111e\u0107om garniturom za 6 osoba', '2 kupaonice s tu\u0161-kabinom i WC-om', 'Soba s bra\u010dnim krevetom', '2x soba s odvojenim krevetima', 'Dodatni le\u017eaj', 'Kuhinja s 4 plo\u010de za kuhanje, hladnjak s zamrziva\u010dem', 'Posu\u0111e, mikrovalna pe\u0107nica', 'Kuhalo za vodu s kavom i \u010dajem', 'TV sa satelitskim kanalima', 'Stol i sje\u0111e\u0107a mjesta za 6 osoba', 'Sef', 'Posteljina i ru\u010dnici uklju\u010deni u cijenu'],
    },
    de: {
      name: 'Superior Haus mit drei Schlafzimmern',
      size: '34 m\u00b2',
      bedType: '3 Schlafzimmer',
      title: 'Ger\u00e4umiger Superior-Komfort f\u00fcr gro\u00dfe Gruppen',
      description: 'Superior Mobilheim mit drei Schlafzimmern und zwei Badezimmern f\u00fcr gr\u00f6\u00dfere Gruppen. Ger\u00e4umige Terrasse, voll ausgestattete K\u00fcche und moderne Annehmlichkeiten.',
      inclusions: ['Kostenloses WLAN', 'Klimaanlage', '\u00dcberdachte Terrasse mit Sitzgelegenheiten f\u00fcr 6', '2 Badezimmer mit Dusche & WC', 'Schlafzimmer mit Doppelbett', '2x Schlafzimmer mit Einzelbetten', 'Zusatzbett', 'K\u00fcche mit 4 Elektrokochplatten & K\u00fchl-Gefrier-Kombination', 'Kochgeschirr & Mikrowelle', 'Wasserkocher mit Kaffee- & Teebeuteln', 'Satelliten-TV', 'Tisch & Sitzpl\u00e4tze f\u00fcr 6', 'Safe', 'Bettw\u00e4sche & Handtücher inklusive'],
    },
  },
  // ─── Pitch (pitches group) ─────────────────────────────────────────────────
  {
    slug: 'orbis-superior-pitch',
    category: 'cabin',
    capacity: 6,
    imageFiles: [
      { name: 'orbis-pitch-actual.jpg', rel: 'rooms/orbis-pitch-actual.jpg', mime: 'image/jpeg' },
    ],
    en: {
      name: 'Superior pitch (children stay FREE)',
      size: '60+ m\u00b2',
      bedType: 'Bring your own tent / caravan',
      title: 'Your own space in paradise',
      description: 'Superior pitch of over 60 m\u00b2 at Medora Orbis Luxury Camp. Enjoy all camp amenities \u2014 pools, beach access, restaurant \u2014 while having your own spacious plot.',
      inclusions: ['Free Wi-Fi on the plot', 'Access to shared sanitary facilities', 'Electricity connection (16A)', 'Water connection on the plot', 'Waste water drainage', 'Access to all camp amenities', 'Beach access', 'Swimming pool access', 'Parking'],
    },
    hr: {
      name: 'Superior parcela (djeca borave BESPLATNO)',
      size: 'vi\u0161e od 60 m\u00b2',
      bedType: 'Vlastiti \u0161ator / kamp-ku\u0107ica',
      title: 'Va\u0161 vlastiti prostor u raju',
      description: 'Superior parcela veli\u010dine vi\u0161e od 60 m\u00b2 u Medora Orbis Luxury Kampu. U\u017eivajte u svim sadr\u017eajima kampa \u2014 bazenima, pla\u017ei, restoranu \u2014 dok imate vlastitu prostrano parcelu.',
      inclusions: ['Besplatan Wi-Fi na parceli', 'Pristup zajedni\u010dkim sanitarnim \u010dvorovima', 'Priklju\u010dak za struju (16A)', 'Priklju\u010dak za vodu na parceli', 'Odvod otpadnih voda', 'Pristup svim sadr\u017eajima kampa', 'Pristup pla\u017ei', 'Pristup bazenu', 'Parkiranje'],
    },
    de: {
      name: 'Superior Stellplatz (Kinder GRATIS)',
      size: '\u00fcber 60 m\u00b2',
      bedType: 'Eigenes Zelt / Wohnmobil',
      title: 'Ihr eigener Platz im Paradies',
      description: 'Superior Stellplatz \u00fcber 60 m\u00b2 im Medora Orbis Luxury Camp. Genie\u00dfen Sie alle Campingeinrichtungen \u2014 Pools, Strandzugang, Restaurant \u2014 mit Ihrem eigenen ger\u00e4umigen Stellplatz.',
      inclusions: ['Kostenloses WLAN auf dem Stellplatz', 'Zugang zu gemeinsamen Sanit\u00e4ranlagen', 'Stromanschluss (16A)', 'Wasseranschluss auf dem Stellplatz', 'Abwasserentsorgung', 'Zugang zu allen Campingeinrichtungen', 'Strandzugang', 'Poolzugang', 'Parkplatz'],
    },
  },
]

// ─── Helper: get or create property ──────────────────────────────────────────

async function getOrCreateProperty(
  payload: Payload,
  data: { name: string; slug: string; type: string; shortDescription: string; address: string },
): Promise<number> {
  const existing = await payload.find({
    collection: 'properties',
    where: { slug: { equals: data.slug } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number

  const doc = await payload.create({
    collection: 'properties',
    depth: 0,
    data: {
      name: data.name,
      slug: data.slug,
      type: data.type,
      shortDescription: data.shortDescription,
      address: data.address,
    },
  })
  payload.logger.info(`  Created property: ${data.slug} => id=${doc.id}`)
  return doc.id as number
}

// ─── Helper: create room with all locales ─────────────────────────────────────

async function getOrCreateRoom(
  payload: Payload,
  room: (typeof AURI_ROOMS)[0],
  propertyId: number,
  mediaIds: number[],
): Promise<number> {
  const existing = await payload.find({
    collection: 'rooms',
    where: { slug: { equals: room.slug } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    const id = existing.docs[0].id as number
    const updated = await payload.update({ collection: 'rooms', id, locale: 'en', data: {
      name: room.en.name, size: room.en.size, bedType: room.en.bedType,
      images: mediaIds, description: lexicalRich(room.en.title, room.en.description),
      inclusions: room.en.inclusions.map((label) => ({ label })),
    }})
    await payload.update({ collection: 'rooms', id, locale: 'hr', data: {
      name: room.hr.name, size: room.hr.size, bedType: room.hr.bedType,
      description: lexicalRich(room.hr.title, room.hr.description),
      inclusions: (updated.inclusions as { id: string }[]).map((inc, i) => ({
        id: inc.id, label: room.hr.inclusions[i] ?? room.en.inclusions[i],
      })),
    }})
    await payload.update({ collection: 'rooms', id, locale: 'de', data: {
      name: room.de.name, size: room.de.size, bedType: room.de.bedType,
      description: lexicalRich(room.de.title, room.de.description),
      inclusions: (updated.inclusions as { id: string }[]).map((inc, i) => ({
        id: inc.id, label: room.de.inclusions[i] ?? room.en.inclusions[i],
      })),
    }})
    payload.logger.info(`  Updated room: ${room.slug} => id=${id}`)
    return id
  }

  const doc = await payload.create({
    collection: 'rooms',
    depth: 0,
    locale: 'en',
    data: {
      name: room.en.name,
      slug: room.slug,
      property: propertyId,
      category: room.category,
      capacity: room.capacity,
      size: room.en.size,
      bedType: room.en.bedType,
      images: mediaIds,
      description: lexicalRich(room.en.title, room.en.description),
      inclusions: room.en.inclusions.map((label) => ({ label })),
    },
  })
  const id = doc.id as number

  await payload.update({ collection: 'rooms', id, locale: 'hr', data: {
    name: room.hr.name,
    size: room.hr.size,
    bedType: room.hr.bedType,
    description: lexicalRich(room.hr.title, room.hr.description),
    inclusions: (doc.inclusions as { id: string }[]).map((inc, i) => ({
      id: inc.id,
      label: room.hr.inclusions[i] ?? room.en.inclusions[i],
    })),
  }})

  await payload.update({ collection: 'rooms', id, locale: 'de', data: {
    name: room.de.name,
    size: room.de.size,
    bedType: room.de.bedType,
    description: lexicalRich(room.de.title, room.de.description),
    inclusions: (doc.inclusions as { id: string }[]).map((inc, i) => ({
      id: inc.id,
      label: room.de.inclusions[i] ?? room.en.inclusions[i],
    })),
  }})

  payload.logger.info(`  Created room: ${room.slug} => id=${id}`)
  return id
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function seedRooms({ payload }: { payload: Payload }) {
  payload.logger.info('Seeding properties and rooms...')

  const auriId = await getOrCreateProperty(payload, {
    name: 'Medora Auri Family Beach Resort',
    slug: 'medora-auri',
    type: 'hotel',
    shortDescription: 'Beachfront 4-star resort on the Makarska Riviera with pools, spa and kids club.',
    address: 'Sv. Martina 26, 21327 Podgora, Croatia',
  })

  const orbisId = await getOrCreateProperty(payload, {
    name: 'Luxury Camp Orbis',
    slug: 'luxury-camp-orbis',
    type: 'camp',
    shortDescription: 'Premium glamping with luxury homes and private pools on the Adriatic coast.',
    address: 'Sv. Martina 34, 21327 Podgora, Croatia',
  })

  // Track first media ID per Auri room for group hero images
  const auriFirstMediaIds: number[] = []
  const auriRoomIds: number[] = []
  for (const room of AURI_ROOMS) {
    const mediaIds: number[] = []
    for (const f of room.imageFiles) {
      mediaIds.push(await getOrUploadMedia(payload, f.name, f.rel, f.mime))
    }
    auriFirstMediaIds.push(mediaIds[0]!)
    const roomId = await getOrCreateRoom(payload, room, auriId, mediaIds)
    auriRoomIds.push(roomId)
  }

  // Track first media ID per Orbis room for group hero images
  const orbisFirstMediaIds: number[] = []
  const orbisRoomIds: number[] = []
  for (const room of ORBIS_ROOMS) {
    const mediaIds: number[] = []
    for (const f of room.imageFiles) {
      mediaIds.push(await getOrUploadMedia(payload, f.name, f.rel, f.mime))
    }
    orbisFirstMediaIds.push(mediaIds[0]!)
    const roomId = await getOrCreateRoom(payload, room as typeof AURI_ROOMS[0], orbisId, mediaIds)
    orbisRoomIds.push(roomId)
  }

  // Pin rooms to homepages via featuredRooms (max 6)
  await payload.updateGlobal({ slug: 'auri-homepage', data: { featuredRooms: auriRoomIds.slice(0, 6) } })
  await payload.updateGlobal({ slug: 'orbis-homepage', data: { featuredRooms: orbisRoomIds.slice(0, 6) } })

  payload.logger.info(`  auri-homepage featuredRooms => [${auriRoomIds}]`)
  payload.logger.info(`  orbis-homepage featuredRooms => [${orbisRoomIds}]`)

  // ── Room groups helper ─────────────────────────────────────────────────────
  async function upsertGroup(
    slug: string,
    propertyId: number,
    names: { en: string; hr: string; de: string },
    opts: { heroImage?: number; parent?: number; order?: number } = {},
  ): Promise<number> {
    const existing = await payload.find({
      collection: 'room-groups',
      where: { slug: { equals: slug } },
      limit: 1, depth: 0,
    })
    let id: number
    if (existing.docs.length > 0) {
      id = existing.docs[0].id as number
      await payload.update({ collection: 'room-groups', id, locale: 'en', data: { name: names.en, ...opts } })
    } else {
      id = (await payload.create({
        collection: 'room-groups',
        locale: 'en',
        data: { name: names.en, slug, property: propertyId, ...opts },
      })).id as number
    }
    await payload.update({ collection: 'room-groups', id, locale: 'hr', data: { name: names.hr } })
    await payload.update({ collection: 'room-groups', id, locale: 'de', data: { name: names.de } })
    payload.logger.info(`  Room group: ${slug} => id=${id}`)
    return id
  }

  // ── Auri groups ────────────────────────────────────────────────────────────
  // auriFirstMediaIds: [0]=double hero, [1]=family hero, [2]=suite hero, [3]=double-creative hero
  const auriParentId = await upsertGroup(
    'auri-rooms-suites', auriId,
    { en: 'Rooms & Suites', hr: 'Sobe i suiteovi', de: 'Zimmer & Suiten' },
    { heroImage: auriFirstMediaIds[0]!, order: 1 },
  )
  const auriDoubleGroupId = await upsertGroup(
    'auri-double-rooms', auriId,
    { en: 'Double Rooms', hr: 'Dvokrevetne', de: 'Doppelzimmer' },
    { heroImage: auriFirstMediaIds[0]!, parent: auriParentId, order: 1 },
  )
  // Sub-groups within Dvokrevetne
  const auriDoubleSeaViewId = await upsertGroup(
    'auri-double-sea-view', auriId,
    { en: 'Double rooms with sea view', hr: 'Dvokrevetne s pogledom na more', de: 'Doppelzimmer mit Meerblick' },
    { heroImage: auriFirstMediaIds[0]!, parent: auriDoubleGroupId, order: 1 },
  )
  const auriDoubleCreativeId = await upsertGroup(
    'auri-double-creative', auriId,
    { en: 'Double rooms for people with more imagination', hr: 'Dvokrevetne za ljude s više mašte', de: 'Doppelzimmer für Kreative' },
    { heroImage: auriFirstMediaIds[3]!, parent: auriDoubleGroupId, order: 2 },
  )
  const auriFamilyGroupId = await upsertGroup(
    'auri-family-rooms', auriId,
    { en: 'Family Rooms', hr: 'Obiteljske', de: 'Familienzimmer' },
    { heroImage: auriFirstMediaIds[1]!, parent: auriParentId, order: 2 },
  )
  const auriSuitesGroupId = await upsertGroup(
    'auri-suites', auriId,
    { en: 'Suites', hr: 'Suiteovi', de: 'Suiten' },
    { heroImage: auriFirstMediaIds[2]!, parent: auriParentId, order: 3 },
  )

  // AURI_ROOMS: [0]=double-room, [1]=family-room, [2]=deluxe-suite, [3]=double-room-creative,
  //             [4]=comfort-double-sea, [5]=comfort-double-park-sea, [6]=comfort-double-park,
  //             [7]=comfort-double-pines, [8]=double-garden-res, [9]=family-garden-res, [10]=family-young
  // Sea-view sub-group
  await payload.update({ collection: 'rooms', id: auriRoomIds[0]!, data: { group: auriDoubleSeaViewId } })
  await payload.update({ collection: 'rooms', id: auriRoomIds[4]!, data: { group: auriDoubleSeaViewId } })
  // Creative sub-group
  await payload.update({ collection: 'rooms', id: auriRoomIds[3]!, data: { group: auriDoubleCreativeId } })
  await payload.update({ collection: 'rooms', id: auriRoomIds[5]!, data: { group: auriDoubleCreativeId } })
  await payload.update({ collection: 'rooms', id: auriRoomIds[6]!, data: { group: auriDoubleCreativeId } })
  await payload.update({ collection: 'rooms', id: auriRoomIds[7]!, data: { group: auriDoubleCreativeId } })
  await payload.update({ collection: 'rooms', id: auriRoomIds[8]!, data: { group: auriDoubleCreativeId } })
  // Family group
  await payload.update({ collection: 'rooms', id: auriRoomIds[1]!, data: { group: auriFamilyGroupId } })
  await payload.update({ collection: 'rooms', id: auriRoomIds[9]!, data: { group: auriFamilyGroupId } })
  await payload.update({ collection: 'rooms', id: auriRoomIds[10]!, data: { group: auriFamilyGroupId } })
  // Suites
  await payload.update({ collection: 'rooms', id: auriRoomIds[2]!, data: { group: auriSuitesGroupId } })
  payload.logger.info('  Assigned Auri rooms to sub-groups')

  // ── Orbis groups ───────────────────────────────────────────────────────────
  // ORBIS_ROOMS: [0]=deluxe-2bed-pool, [1]=premium-2bed-pool, [2]=superior-2bed,
  //              [3]=superior-disabled, [4]=premium-1bed-pool (all → small)
  //              [5]=deluxe-3bed-pool, [6]=premium-3bed-pool, [7]=superior-3bed (→ large)
  //              [8]=superior-pitch (→ pitches)
  const orbisParentId = await upsertGroup(
    'orbis-cabins', orbisId,
    { en: 'Accommodation', hr: 'Smje\u0161tajne jedinice', de: 'Unterk\u00fcnfte' },
    { heroImage: orbisFirstMediaIds[0]!, order: 1 },
  )
  // Remove legacy flat group if it exists
  const legacyOrbis = await payload.find({ collection: 'room-groups', where: { slug: { equals: 'orbis-luxury-cabins' } }, limit: 1, depth: 0 })
  if (legacyOrbis.docs.length > 0) {
    await payload.delete({ collection: 'room-groups', id: legacyOrbis.docs[0].id as number })
    payload.logger.info('  Deleted legacy group: orbis-luxury-cabins')
  }
  const orbisSmallGroupId = await upsertGroup(
    'orbis-cabins-small', orbisId,
    { en: 'Luxury Homes for 2\u20135 Persons', hr: 'Luksuzne ku\u0107ice za 2\u00a0-\u00a05 osoba', de: 'Luxush\u00e4user f\u00fcr 2\u20135 Personen' },
    { heroImage: orbisFirstMediaIds[0]!, parent: orbisParentId, order: 1 },
  )
  const orbisLargeGroupId = await upsertGroup(
    'orbis-cabins-large', orbisId,
    { en: 'Luxury Homes for 6\u20137 Persons', hr: 'Luksuzne ku\u0107ice za 6\u00a0-\u00a07 osoba', de: 'Luxush\u00e4user f\u00fcr 6\u20137 Personen' },
    { heroImage: orbisFirstMediaIds[5]!, parent: orbisParentId, order: 2 },
  )
  const orbisPitchesGroupId = await upsertGroup(
    'orbis-pitches', orbisId,
    { en: 'Pitches and Camp Sites', hr: 'Parcele i kamp mjesta', de: 'Stellpl\u00e4tze und Camping' },
    { heroImage: orbisFirstMediaIds[8]!, parent: orbisParentId, order: 3 },
  )

  // Small cabins (2-5 persons): rooms [0..4]
  for (let i = 0; i <= 4; i++) await payload.update({ collection: 'rooms', id: orbisRoomIds[i]!, data: { group: orbisSmallGroupId } })
  // Large cabins (6-7 persons): rooms [5..7]
  for (let i = 5; i <= 7; i++) await payload.update({ collection: 'rooms', id: orbisRoomIds[i]!, data: { group: orbisLargeGroupId } })
  // Pitches: room [8]
  await payload.update({ collection: 'rooms', id: orbisRoomIds[8]!, data: { group: orbisPitchesGroupId } })
  payload.logger.info('  Assigned Orbis rooms to sub-groups')

  payload.logger.info('Room seed complete.')
}
