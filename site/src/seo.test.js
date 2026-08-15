import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FAQ_ITEMS } from './content'
import { SITE_DESCRIPTION, SITE_TITLE, faqPageJsonLd, softwareApplicationJsonLd } from './seo'

describe('seo content', () => {
  it('keeps title and description within practical SERP lengths', () => {
    expect(SITE_TITLE.length).toBeGreaterThan(10)
    expect(SITE_TITLE.length).toBeLessThanOrEqual(70)
    expect(SITE_DESCRIPTION.length).toBeGreaterThan(40)
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160)
  })

  it('builds SoftwareApplication JSON-LD with store install URL', () => {
    const data = softwareApplicationJsonLd()
    expect(data['@type']).toBe('SoftwareApplication')
    expect(data.offers.price).toBe('0')
    expect(data.installUrl).toContain('chromewebstore.google.com')
    expect(data.image).toContain('og-image.jpg')
  })

  it('builds FAQPage JSON-LD from the same FAQ items as the page', () => {
    const data = faqPageJsonLd(FAQ_ITEMS)
    expect(data['@type']).toBe('FAQPage')
    expect(data.mainEntity).toHaveLength(FAQ_ITEMS.length)
    expect(data.mainEntity[0].name).toBe(FAQ_ITEMS[0].question)
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(FAQ_ITEMS[0].answer)
  })
})


describe('index.html meta shell', () => {
  const html = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8')

  it('includes core SEO, social, and icon tags', () => {
    expect(html).toContain('name="description"')
    expect(html).toContain('property="og:title"')
    expect(html).toContain('property="og:image"')
    expect(html).toContain('name="twitter:card"')
    expect(html).toContain('summary_large_image')
    expect(html).toContain('rel="canonical"')
    expect(html).toContain('apple-touch-icon')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('og-image.jpg')
  })
})
