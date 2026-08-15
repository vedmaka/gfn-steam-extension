# GeForce NOW Checker for Steam

I built this after one too many trips between my Steam wishlist and the GeForce NOW library. The extension puts a small marker next to supported Steam games and opens the matching GeForce NOW page when you click it

It works on game pages, search results, deals, recommendations, and other places where Steam shows game links

[![Available in the Chrome Web Store](https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png)](https://chromewebstore.google.com/detail/geforce-now-checker-for-s/hjdoenjhlobmeojekgckfkkbbplloklm)

![GeForce NOW markers on a Steam store page](site/public/screenshots/steam1.jpeg)

## Install

Click the Chrome Web Store image above, add the extension, then open or reload a [Steam store](https://store.steampowered.com/) page

No setup or GFN Checker account needed. You still need your own GeForce NOW account to play

### Install from source

```bash
git clone https://github.com/vedmaka/gfn-steam-extension.git
cd gfn-steam-extension
```

Open `chrome://extensions/`, enable **Developer mode**, choose **Load unpacked**, and select the `src` directory

When you change the source, reload the extension and the Steam tab

## What it does

- Checks Steam games against NVIDIA's GeForce NOW catalog
- Uses Steam app IDs and store URLs instead of guessing from similar titles
- Adds a Play button on supported game pages and compact markers beside supported game links
- Opens the matching title in GeForce NOW
- Keeps the catalog in Chrome storage for up to 24 hours, so it does not download it on every page
- Watches for game links that Steam adds after the page has loaded

## How it works

The content script finds Steam app IDs on the page and asks the background service worker whether each game is available. The service worker downloads NVIDIA's GraphQL catalog, keeps the Steam entries, and indexes them by app ID

Everything is plain JavaScript, HTML, and CSS. There is no extension build step and no package installation

## Privacy

The extension has no account system and does not send browsing data to the project author

Its Chrome permissions are used to:

- Read Steam store pages and add markers
- Download the catalog from NVIDIA
- Cache that catalog in the browser
- Show the current tab status in the popup

Opening a marker takes you to NVIDIA's GeForce NOW service

## Something not working?

First try reloading both the extension and the Steam tab. The initial catalog download can take a moment

No marker usually means one of three things:

- The game is not in NVIDIA's current catalog
- Steam has not exposed a usable app ID for that link
- The NVIDIA catalog request failed

If a marker points to the wrong game, please [open an issue](https://github.com/vedmaka/gfn-steam-extension/issues) with the Steam URL, what you expected, what happened, and your Chrome version

## Development

The extension lives in `src/`:

```text
src/
├── manifest.json
├── background.js
├── content.js
├── styles.css
├── popup.html
└── popup.js
```

There is no automated extension test suite. Test changes by loading `src/` as an unpacked extension, visiting a few Steam page types, and checking both supported and unsupported games

## Contributing

Issues and focused pull requests are welcome

This is an independent project with no affiliation or endorsement from Valve or NVIDIA. Steam, GeForce NOW, and related marks belong to their respective owners
