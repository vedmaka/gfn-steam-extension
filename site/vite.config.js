import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SITE_DESCRIPTION =
  'See which Steam games work on GeForce NOW while you browse. Free Chrome extension with one-click launch.'
const STORE_URL =
  'https://chromewebstore.google.com/detail/geforce-now-checker-for-s/hjdoenjhlobmeojekgckfkkbbplloklm'

function normalizeOrigin(raw) {
  return String(raw || '').trim().replace(/\/$/, '')
}

function absoluteUrl(origin, path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return origin ? `${origin}${normalized}` : normalized
}

function buildJsonLd(origin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GeForce Now Checker for Steam',
    alternateName: 'GFN Checker',
    description: SITE_DESCRIPTION,
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: absoluteUrl(origin, '/'),
    downloadUrl: STORE_URL,
    installUrl: STORE_URL,
    image: absoluteUrl(origin, '/og-image.jpg'),
  }
}

function seoHtmlPlugin(origin) {
  return {
    name: 'seo-html',
    transformIndexHtml(html) {
      // Replace longer placeholders first so `/` suffix matches cover og:image paths.
      return html
        .replaceAll('__SITE_ORIGIN__/', `${absoluteUrl(origin, '/')}`)
        .replaceAll('__SITE_ORIGIN__', origin)
        .replace('__JSON_LD__', JSON.stringify(buildJsonLd(origin)))
    },
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const robotsLines = ['User-agent: *', 'Allow: /']
      if (origin) {
        robotsLines.push(`Sitemap: ${absoluteUrl(origin, '/sitemap.xml')}`)
      }
      robotsLines.push('')
      writeFileSync(resolve(outDir, 'robots.txt'), robotsLines.join('\n'))

      if (origin) {
        writeFileSync(
          resolve(outDir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${absoluteUrl(origin, '/')}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${absoluteUrl(origin, '/privacy')}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
`,
        )
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = normalizeOrigin(env.VITE_SITE_ORIGIN)

  return {
    plugins: [react(), tailwindcss(), seoHtmlPlugin(siteOrigin)],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test-setup.js',
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
    },
  }
})
