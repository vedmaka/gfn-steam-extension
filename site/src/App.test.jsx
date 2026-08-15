import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { FAQ_ITEMS, PRIVACY_POLICY, SCREENSHOTS, STORE_URL } from './content'

function setPath(path) {
  window.history.pushState({}, '', path)
}

afterEach(() => {
  setPath('/')
})

describe('landing page', () => {
  it('presents the product and routes every install CTA to Chrome Web Store', () => {
    setPath('/')
    render(<App />)

    expect(screen.getByRole('heading', {
      level: 1,
      name: /geforce now badges on steam/i,
    })).toBeInTheDocument()

    const installLinks = screen.getAllByRole('link', { name: /add to chrome/i })
    expect(installLinks.length).toBeGreaterThanOrEqual(2)
    installLinks.forEach((link) => expect(link).toHaveAttribute('href', STORE_URL))
  })

  it('uses semantic sections and primary navigation', () => {
    setPath('/')
    render(<App />)

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /what it does/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /how it works/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /screenshots/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /faq/i })).toBeInTheDocument()
  })

  it('explains what the extension does, how it works, FAQ, and independence', () => {
    setPath('/')
    render(<App />)

    ;[
      'Works across the store',
      'Opens GeForce NOW from the page',
      'Runs locally in Chrome',
    ].forEach((heading) => {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    })

    expect(screen.getByText(/built after too many trips/i)).toBeInTheDocument()
    expect(screen.getByText(/free · no account · steam store pages only/i)).toBeInTheDocument()
    expect(screen.getByText(/install it\. then ignore it/i)).toBeInTheDocument()
    expect(screen.getByText(/green means stop alt-tabbing/i)).toBeInTheDocument()
    expect(screen.getByText(/not affiliated with Valve or NVIDIA/i)).toBeInTheDocument()

    FAQ_ITEMS.forEach((item) => {
      expect(screen.getByRole('heading', { name: item.question })).toBeInTheDocument()
      expect(screen.getByText(item.answer)).toBeInTheDocument()
    })
  })

  it('shows real extension screenshots in the hero and gallery', () => {
    setPath('/')
    render(<App />)

    expect(screen.getByRole('img', {
      name: /geforce now availability shown on a steam store page/i,
    })).toHaveAttribute('src', '/screenshots/steam1.jpeg')

    const gallery = screen.getByRole('region', { name: /screenshots/i })
    const galleryImages = within(gallery).getAllByRole('img')

    expect(galleryImages).toHaveLength(SCREENSHOTS.length)
    expect(galleryImages[0]).toHaveAttribute('src', SCREENSHOTS[0].src)
    expect(galleryImages[0]).toHaveAttribute('loading', 'lazy')
    expect(within(gallery).getByText(SCREENSHOTS[0].label)).toBeInTheDocument()
    expect(within(gallery).getByText(SCREENSHOTS[0].description)).toBeInTheDocument()
    expect(within(gallery).getByText(SCREENSHOTS[1].label)).toBeInTheDocument()
    expect(within(gallery).getByText(SCREENSHOTS[1].description)).toBeInTheDocument()

    expect(within(gallery).getAllByRole('button', { name: /open .* screenshot/i })).toHaveLength(
      SCREENSHOTS.length,
    )
    expect(screen.getByRole('link', { name: 'Screenshots' })).toHaveAttribute('href', '#screenshots')
  })

  it('opens a native screenshot dialog and restores focus when it closes', async () => {
    setPath('/')
    render(<App />)

    const first = SCREENSHOTS[0]
    const trigger = screen.getByRole('button', { name: `Open ${first.label} screenshot` })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: first.label })
    expect(dialog).toHaveAttribute('open')
    expect(within(dialog).getByRole('img', { name: first.alt })).toHaveAttribute('src', first.src)

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close screenshot' }))

    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
    await waitFor(() => expect(trigger).toHaveFocus())

    fireEvent.click(trigger)
    fireEvent(dialog, new Event('cancel', { cancelable: true }))

    await waitFor(() => expect(dialog).not.toHaveAttribute('open'))
  })

  it('links to the privacy policy from the footer', () => {
    setPath('/')
    render(<App />)
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy')
  })
})

describe('privacy policy page', () => {
  it('renders the full policy at /privacy', () => {
    setPath('/privacy')
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: PRIVACY_POLICY.title })).toBeInTheDocument()
    expect(screen.getByText(`Last updated: ${PRIVACY_POLICY.updated}`)).toBeInTheDocument()
    expect(screen.getByText(/does not collect personal information/i)).toBeInTheDocument()
    expect(screen.getByText(/as is, without warranties/i)).toBeInTheDocument()
    expect(screen.getByText(/no obligation to provide support/i)).toBeInTheDocument()

    PRIVACY_POLICY.sections.forEach((section) => {
      expect(screen.getByRole('heading', { name: section.title })).toBeInTheDocument()
    })
  })
})
