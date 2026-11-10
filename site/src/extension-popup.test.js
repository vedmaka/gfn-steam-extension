import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { resolve } from 'node:path'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const html = readFileSync(resolve('../src/popup.html'), 'utf8')
const script = readFileSync(resolve('../src/popup.js'), 'utf8')

function openPopup(sendMessage) {
  document.body.innerHTML = html.match(/<body>([\s\S]*)<\/body>/)[1]
  runInNewContext(script, {
    document, Date, setInterval: vi.fn(), clearInterval: vi.fn(),
    window: { addEventListener: vi.fn() },
    chrome: {
      tabs: { query: async () => [{ url: 'https://store.steampowered.com/app/570/' }] },
      runtime: { sendMessage },
      storage: { onChanged: { addListener: vi.fn(), removeListener: vi.fn() } },
    },
  })
  document.dispatchEvent(new Event('DOMContentLoaded'))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('extension popup cache controls', () => {
  it.each([
    [30_000, /less than a minute ago/i],
    [300_000, /5 minutes ago/i],
    [7_200_000, /2 hours ago/i],
    [172_800_000, /2 days ago/i],
  ])('shows cache age for an age of %i ms', async (age, expected) => {
    openPopup(async () => ({ lastFetch: Date.now() - age, gameCount: 1234, expired: age > 86400000 }))
    await waitFor(() => expect(screen.getByText(expected)).toBeInTheDocument())
    expect(screen.getByText(/1,234 games/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear database cache/i })).toBeEnabled()
  })

  it('shows empty cache without offering an unnecessary clear', async () => {
    openPopup(async () => ({ lastFetch: 0, gameCount: 0, expired: false }))
    await waitFor(() => expect(screen.getByText(/no database cached/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /clear database cache/i })).toBeDisabled()
  })

  it('waits for clearing and shows that the next check will download the catalog', async () => {
    let finishClear
    let cleared = false
    openPopup(async ({ action }) => {
      if (action === 'clearCache') {
        await new Promise(resolve => { finishClear = resolve })
        cleared = true
        return { success: true }
      }
      return { lastFetch: cleared ? 0 : Date.now(), gameCount: cleared ? 0 : 42 }
    })
    const button = screen.getByRole('button', { name: /clear database cache/i })
    await waitFor(() => expect(button).toBeEnabled())
    fireEvent.click(button)
    expect(button).toBeDisabled()
    expect(screen.getByText(/clearing/i)).toBeInTheDocument()
    finishClear()
    await waitFor(() => expect(screen.getByText(/cache cleared/i)).toBeInTheDocument())
    expect(screen.getByText(/no database cached/i)).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('reports a clear failure and allows retry', async () => {
    openPopup(async ({ action }) => action === 'clearCache'
      ? { error: 'Storage unavailable' }
      : { lastFetch: Date.now(), gameCount: 42 })
    const button = screen.getByRole('button', { name: /clear database cache/i })
    await waitFor(() => expect(button).toBeEnabled())
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByText(/could not clear/i)).toBeInTheDocument())
    expect(button).toBeEnabled()
  })

  it('reports a status failure without hiding the tab status or support link', async () => {
    openPopup(async () => { throw new Error('Worker unavailable') })
    await waitFor(() => expect(screen.getByText(/could not read/i)).toBeInTheDocument())
    expect(screen.getByText(/active on steam store page/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /support on ko-fi/i })).toBeInTheDocument()
  })
})
