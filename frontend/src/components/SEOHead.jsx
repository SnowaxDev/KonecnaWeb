import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'SeknuTo.cz';
const SITE_URL = 'https://seknuto.cz';
const SITE_PHONE = '+420730588372';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

const DEFAULT_SEO = {
  title: 'Sekání trávy Dvůr Králové | Zahradnické služby | SeknuTo.cz',
  description: 'Profesionální sekání trávy, likvidace zarostlých pozemků a údržba zahrad ve Dvoře Králové nad Labem a okolí. Bezplatná obhlídka a kalkulace na míru. 730 588 372',
  keywords: 'sekání trávy Dvůr Králové, zahradnické služby, likvidace pozemků, čištění zarostlých parcel, údržba zahrad, vertikutace trávníku, hnojení trávníku, sekání trávy Trutnov, sekání trávy Vrchlabí, zahradník Dvůr Králové',
  canonical: SITE_URL,
  image: DEFAULT_IMAGE,
};

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
      <html lang="cs" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="cs_CZ" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta name="format-detection" content="telephone=yes" />

      {schema && (
        Array.isArray(schema)
          ? schema.map((s, i) => (
              <script key={i} type="application/ld+json">
                {JSON.stringify(s)}
              </script>
            ))
          : <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}

export const SCHEMAS = {
  localBusiness: {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'LawnCareService'],
    '@id': `${SITE_URL}/#business`,
    name: SITE_NAME,
    image: `${SITE_URL}/og-image.jpg`,
    description: 'Profesionální sekání trávy, likvidace pozemků a zahradnické služby ve Dvoře Králové nad Labem. Bezplatná obhlídka, cena vždy předem.',
    url: SITE_URL,
    telephone: SITE_PHONE,
    email: 'info@seknuto.cz',
    priceRange: 'Kč',
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
        opens: '09:00',
        closes: '15:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: 24,
      bestRating: '5',
      worstRating: '1',
    },
    areaServed: [
      { '@type': 'City', name: 'Dvůr Králové nad Labem' },
      { '@type': 'City', name: 'Trutnov' },
      { '@type': 'City', name: 'Vrchlabí' },
      { '@type': 'City', name: 'Hostinné' },
      { '@type': 'City', name: 'Jaroměř' },
      { '@type': 'City', name: 'Náchod' },
      { '@type': 'City', name: 'Hořice' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Zahradnické služby',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Sekání trávy', description: 'Profesionální sekání trávníku – cena po bezplatné obhlídce' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Stříhání keřů a živých plotů', description: 'Stříhání a tvarování keřů, tújí a živých plotů' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Kácení a ořez stromů', description: 'Ořez, prořez a kácení stromů včetně rizikového kácení a odvozu větví' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Realizace zahrad', description: 'Realizace zahrad na klíč – návrh, zakládání trávníků a výsadba zeleně' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Likvidace a čištění pozemků', description: 'Kompletní vyčištění zarostlých pozemků a parcel' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Vertikutace trávníku', description: 'Provzdušnění trávníku' },
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Celoroční VIP servis', description: 'Kompletní celoroční péče o zahradu' },
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
      acceptedAnswer: { '@type': 'Answer', text: answer },
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

  service: ({ name, description, areaServed = 'Dvůr Králové nad Labem' }) => ({
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
  }),

  blogPost: ({ title, description, slug, datePublished, dateModified, image }) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image || `${SITE_URL}/og-image.jpg`,
    url: `${SITE_URL}/blog/${slug}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
  }),

  // Detail realizace v galerii – fotky + případná videa (jen veřejné http URL, ne base64)
  galleryProject: ({ title, description, slug, images = [], videos = [], uploadDate }) => {
    const httpImages = images.filter((u) => typeof u === 'string' && u.startsWith('http'));
    const httpVideos = videos.filter((u) => typeof u === 'string' && u.startsWith('http'));
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: title,
      description: description || title,
      url: `${SITE_URL}/nase-prace/${slug}`,
      ...(httpImages.length > 0 && { image: httpImages }),
      ...(httpVideos.length > 0 && {
        video: httpVideos.map((v) => ({
          '@type': 'VideoObject',
          name: title,
          description: description || title,
          contentUrl: v,
          thumbnailUrl: httpImages[0] || DEFAULT_IMAGE,
          uploadDate: uploadDate || new Date().toISOString().slice(0, 10),
        })),
      }),
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    };
  },

  reviews: (reviewItems) => reviewItems.map((r) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: r.text,
    datePublished: r.isoDate || '2024-10-01',
    itemReviewed: { '@type': 'LocalBusiness', name: SITE_NAME },
  })),

  localLanding: ({ cityName, citySlug }) => ({
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'LawnCareService'],
    name: `${SITE_NAME} – ${cityName}`,
    url: `${SITE_URL}/sekani-travy-${citySlug}`,
    telephone: SITE_PHONE,
    areaServed: { '@type': 'City', name: cityName },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dvůr Králové nad Labem',
      addressRegion: 'Královéhradecký kraj',
      postalCode: '544 01',
      addressCountry: 'CZ',
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: 24 },
  }),
};
