import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'SeknuTo.cz';
const SITE_URL = 'https://seknuto.cz';
const SITE_PHONE = '+420730588372';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

const DEFAULT_SEO = {
  title: 'Sekání trávy Dvůr Králové | SeknuTo.cz – Od 2,5 Kč/m²',
  description: 'Profesionální sekání trávy ve Dvoře Králové nad Labem od 2,5 Kč/m². Vertikutace, hnojení, sezónní balíčky. Rychlá domluva ☎ 730 588 372',
  keywords: 'sekání trávy Dvůr Králové, zahradnické služby Dvůr Králové, údržba zahrad, vertikutace trávníku, hnojení trávníku, sekání trávy Trutnov, sekání trávy Vrchlabí',
  canonical: SITE_URL,
  image: DEFAULT_IMAGE,
};

/**
 * SEOHead – per-page meta tagy, Open Graph, Twitter Card, JSON-LD schema
 * Props:
 *   title, description, keywords, canonical, image, schema (JSON-LD object)
 */
export default function SEOHead({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  canonical = DEFAULT_SEO.canonical,
  image = DEFAULT_SEO.image,
  schema = null,
  noindex = false,
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      {/* ── ZÁKLADNÍ META TAGY ── */}
      <html lang="cs" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── OPEN GRAPH ── */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="cs_CZ" />

      {/* ── TWITTER CARD ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* ── TELEFON (mobile) ── */}
      <meta name="format-detection" content="telephone=yes" />

      {/* ── JSON-LD SCHEMA (per-page) ── */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

/* ── PŘEDPŘIPRAVENÁ SCHEMA DATA ── */

export const SCHEMAS = {
  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: SITE_NAME,
    image: `${SITE_URL}/logo.png`,
    description: 'Profesionální sekání trávy a zahradnické služby ve Dvoře Králové nad Labem. Férové ceny, rychlá domluva, spolehlivost.',
    url: SITE_URL,
    telephone: SITE_PHONE,
    priceRange: 'Kč Kč',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dvůr Králové nad Labem',
      addressRegion: 'Královéhradecký kraj',
      postalCode: '544 01',
      addressCountry: 'CZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 50.4318,
      longitude: 15.8142,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '14:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '20',
    },
    areaServed: [
      { '@type': 'City', name: 'Dvůr Králové nad Labem' },
      { '@type': 'City', name: 'Trutnov' },
      { '@type': 'City', name: 'Vrchlabí' },
      { '@type': 'City', name: 'Hostinné' },
      { '@type': 'City', name: 'Jaroměř' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Zahradnické služby',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Sekání trávy',
            description: 'Profesionální sekání trávníku od 2,5 Kč/m²',
          },
          price: '2.5',
          priceCurrency: 'CZK',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Vertikutace trávníku',
            description: 'Provzdušnění trávníku',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Celoroční VIP servis',
            description: 'Kompletní péče o zahradu za 6 900 Kč/rok',
          },
          price: '6900',
          priceCurrency: 'CZK',
        },
      ],
    },
    sameAs: [
      'https://www.facebook.com/seknuto.cz',
      'https://www.instagram.com/seknuto.cz',
    ],
  },

  faqPage: (items) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }),

  breadcrumb: (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE_URL}${url}`,
    })),
  }),

  service: ({ name, description, price, priceCurrency = 'CZK', unitText = 'm²', areaServed = 'Dvůr Králové nad Labem' }) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    description,
    provider: {
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      telephone: SITE_PHONE,
      url: SITE_URL,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dvůr Králové nad Labem',
        addressCountry: 'CZ',
      },
    },
    areaServed: { '@type': 'City', name: areaServed },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price,
          priceCurrency,
          unitText,
        },
      },
    }),
  }),
};
