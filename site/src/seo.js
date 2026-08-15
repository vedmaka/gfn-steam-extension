import { STORE_URL } from './content'

/** Public site origin without trailing slash. Set at build via VITE_SITE_ORIGIN. */
export const SITE_ORIGIN = String(import.meta.env.VITE_SITE_ORIGIN || '').replace(/\/$/, '')

export const SITE_NAME = 'GFN Checker'
export const SITE_TITLE = 'GFN Checker - GeForce NOW on Steam'
export const SITE_DESCRIPTION =
  'See which Steam games work on GeForce NOW while you browse. Free Chrome extension with one-click launch.'

export const OG_IMAGE_PATH = '/og-image.jpg'
export const OG_IMAGE_ALT = 'GeForce NOW availability shown on a Steam store page with GFN Checker'

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return SITE_ORIGIN ? `${SITE_ORIGIN}${normalized}` : normalized
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GeForce Now Checker for Steam',
    alternateName: SITE_NAME,
    description: SITE_DESCRIPTION,
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: absoluteUrl('/'),
    downloadUrl: STORE_URL,
    installUrl: STORE_URL,
    image: absoluteUrl(OG_IMAGE_PATH),
  }
}

/** FAQPage schema. Pass the same items rendered on the page. */
export function faqPageJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

