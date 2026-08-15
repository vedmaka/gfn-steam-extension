export const STORE_URL =
  'https://chromewebstore.google.com/detail/geforce-now-checker-for-s/hjdoenjhlobmeojekgckfkkbbplloklm'

export const NAV_ITEMS = [
  { label: 'Screenshots', href: '#screenshots' },
  { label: 'What it does', href: '#what' },
  { label: 'How it works', href: '#how' },
  { label: 'FAQ', href: '#faq' },
]

/** Concrete facts. Longer than slogans, still scannable. */
export const FACTS = [
  {
    title: 'Works across the store',
    description:
      'Markers appear on individual game pages, search results, recommendations, deals, discovery views, and shelves like "Released in the last month." If Steam lists a title as a store link, the extension can check it.',
  },
  {
    title: 'Opens GeForce NOW from the page',
    description:
      'When a game is on the GeForce NOW catalog, you get a green badge or a Play on GeForce NOW control. One click opens GFN so you can launch that title instead of hunting it in a separate library tab.',
  },
  {
    title: 'Runs locally in Chrome',
    description:
      "The extension talks to NVIDIA's public GeForce NOW game list, stores a copy in chrome.storage for about 24 hours, and matches titles on your machine. No GFN Checker account, no analytics, no reading your Steam credentials.",
  },
]

export const HOW_IT_WORKS = {
  title: 'How it works',
  lead: 'Shop Steam as usual. We answer "is this on GeForce NOW?" in the background.',
  beats: [
    {
      title: 'Install it. Then ignore it.',
      body: 'One install from the Chrome Web Store. After that it only runs on store.steampowered.com, and only to mark games with GeForce NOW badges and Play buttons.',
    },
    {
      title: 'Browse. We snoop the page (politely).',
      body: "As you open store pages, it matches games against a local copy of NVIDIA's catalog. App IDs and store URLs first, names if needed.",
    },
    {
      title: 'Green means stop alt-tabbing.',
      body: 'Supported titles get a badge or Play button. Click opens GeForce NOW. You still need your own GFN account to play.',
    },
  ],
}

export const FAQ_ITEMS = [
  {
    question: 'Is GFN Checker free?',
    answer:
      'Yes. The extension is free on the Chrome Web Store. GeForce NOW itself may require a free or paid NVIDIA subscription depending on the game and tier. The extension only shows availability and links. It does not include cloud playtime.',
  },
  {
    question: 'Do I need to sign in with Steam or NVIDIA?',
    answer:
      'No. GFN Checker does not ask for Steam, NVIDIA, or Google account access beyond installing a normal Chrome extension. You only sign into GeForce NOW if you choose to open a game there.',
  },
  {
    question: 'Which Steam pages does it work on?',
    answer:
      'It runs on Steam store pages in Chrome. That includes product pages, search, recommendations, promotional shelves, discovery-style layouts, and similar store views where game links appear. It is not a library manager and does not modify the Steam desktop client.',
  },
  {
    question: 'How accurate is the game list?',
    answer:
      "Availability comes from NVIDIA's GeForce NOW catalog, cached in your browser for about 24 hours. Catalog changes on NVIDIA's side can lag until the next refresh. Matching uses Steam IDs and URLs when possible, with name matching as a fallback, so edge-case renames or regional differences can still slip through.",
  },
  {
    question: 'Does it collect my data?',
    answer:
      "No. The extension does not collect personal data, run analytics, or create an account. A copy of NVIDIA's public game list is cached in your browser so checks stay fast. See the Privacy Policy for details.",
  },
  {
    question: 'Is this an official NVIDIA or Valve product?',
    answer:
      'No. GFN Checker is an independent project. Steam, GeForce NOW, and related marks belong to their respective owners. The extension is not affiliated with, endorsed by, or supported by Valve or NVIDIA.',
  },
]

export const SCREENSHOTS_INTRO =
  'These are real Steam store pages with the extension running. Game pages, deals, search, recommendations, discovery layouts, and recent-release shelves. Green markers mean the title is in the GeForce NOW catalog so you can jump to cloud play without leaving your browsing flow.'

export const SCREENSHOTS = [
  {
    alt: 'Play on GeForce NOW button on a Steam game page',
    label: 'Game page',
    description: 'Full button on the product page when the title is supported.',
    src: '/screenshots/steam4.jpeg',
  },
  {
    alt: 'GeForce NOW badges on Steam discount cards',
    label: 'Deals',
    description: 'Small badges on sale cards and promo shelves.',
    src: '/screenshots/steam2.jpeg',
  },
  {
    alt: 'GeForce NOW badges in Steam search results',
    label: 'Search',
    description: 'Cloud-ready games marked in result lists.',
    src: '/screenshots/steam7.png',
  },
  {
    alt: 'GeForce NOW badges in Steam recommendations',
    label: 'Recommendations',
    description: 'Same markers in personalized recommendation rows.',
    src: '/screenshots/steam5.png',
  },
  {
    alt: 'GeForce NOW badges in Steam discovery layouts',
    label: 'Discovery',
    description: 'Works in the discovery queue and similar views.',
    src: '/screenshots/steam8.png',
  },
  {
    alt: 'GeForce NOW badges on Steam Released in the last month cards',
    label: 'Recent releases',
    description: 'Badges on the "Released in the last month" shelf, not only classic store rows.',
    src: '/screenshots/steam10.jpeg',
  },
]

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  updated: 'July 14, 2026',
  intro:
    'This policy describes GeForce Now Checker for Steam (GFN Checker), a free Chrome extension and its related website. It is written in plain language on purpose.',
  sections: [
    {
      title: 'Short version',
      paragraphs: [
        'The extension does not collect personal information about you. It does not create accounts, sell data, run ads, or send analytics about your browsing.',
        'It reads Steam store pages in your browser only to show GeForce NOW availability, fetches a public game catalog from NVIDIA, and keeps a temporary copy of that catalog on your device. That is the whole story.',
      ],
    },
    {
      title: 'Who this covers',
      paragraphs: [
        'This applies to the Chrome extension published as GeForce Now Checker for Steam and to this informational website. It does not cover Steam, GeForce NOW, Google Chrome, or the Chrome Web Store. Those products have their own policies.',
      ],
    },
    {
      title: 'What we do not collect',
      paragraphs: [
        'We do not collect names, emails, passwords, payment details, Steam or NVIDIA account data, purchase history, wishlists, IP addresses for our own records, advertising identifiers, or usage analytics.',
        'There is no GFN Checker user account and no server of ours that stores a profile about you.',
      ],
    },
    {
      title: 'What the extension does on your device',
      paragraphs: [
        'On https://store.steampowered.com pages, the extension looks at game links and product information already shown in the page so it can decide whether to show a GeForce NOW badge or Play control.',
        'It uses Chrome storage on your computer to cache a copy of NVIDIA\'s public GeForce NOW game list (roughly for a day) so checks stay fast and do not hit the network on every page view.',
        'That cache lives in your browser profile. Uninstalling the extension removes it with Chrome\'s normal extension data cleanup. We never receive a copy of that cache.',
      ],
    },
    {
      title: 'Network requests',
      paragraphs: [
        'The extension may contact NVIDIA\'s public GeForce NOW game list API (api-prod.nvidia.com) to download or refresh the catalog. That request is made by your browser from your network connection, the same way any HTTPS request works. We do not attach your Steam identity or other personal fields to it.',
        'The extension does not send your browsing history or personal data to the extension author or any analytics service. Opening a GeForce NOW link takes you to NVIDIA\'s site or app under their terms.',
      ],
    },
    {
      title: 'Permissions',
      paragraphs: [
        'Chrome will show the permissions the extension asks for. In short: access related to Steam store pages so badges can appear, storage so the catalog cache can be saved locally, and contact with NVIDIA\'s game list host so the catalog can be refreshed. Permissions exist only to run the features described above.',
      ],
    },
    {
      title: 'This website',
      paragraphs: [
        'This site is a static landing page. It does not require login and does not intentionally set tracking cookies or run third-party analytics as part of the product.',
        'Your host, browser, or network provider may still produce normal technical logs (for example IP addresses on HTTPS requests). That is outside the extension\'s control.',
      ],
    },
    {
      title: 'Children',
      paragraphs: [
        'The extension is a utility for browsing the Steam store. It is not directed at children and does not knowingly collect personal information from anyone, including children.',
      ],
    },
    {
      title: 'No warranties and no obligations',
      paragraphs: [
        'GFN Checker is provided free of charge, as is, without warranties of any kind, express or implied. That includes accuracy of GeForce NOW availability, fitness for a particular purpose, and uninterrupted operation.',
        'Steam, NVIDIA, Chrome, and the Chrome Web Store can change at any time. The extension may break, show wrong results, or stop working. You use it at your own risk.',
        'The author has no obligation to provide support, updates, refunds (the extension is free), data export, or ongoing availability of the extension or this website. Publishing a free tool does not create a service contract with you.',
        'Nothing in this policy creates a partnership with Valve, NVIDIA, or Google, or any endorsement by them.',
      ],
    },
    {
      title: 'Your choices',
      paragraphs: [
        'You can stop using the extension at any time by disabling or uninstalling it in Chrome. That removes its local cache under normal Chrome behavior.',
        'Because we do not hold personal data about you on our systems, there is no account to delete and no personal dataset for us to export or correct.',
      ],
    },
    {
      title: 'Changes',
      paragraphs: [
        'This policy may be updated when the extension or site changes. The "Last updated" date at the top will change when that happens. Continued use after an update means you accept the revised policy. If you do not agree, uninstall the extension and stop using the site.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [
        'There is no customer support desk and no obligation to respond to messages. If you need to reference this policy (for example for the Chrome Web Store), use the URL of this page on the site where the extension is documented.',
        'Questions about Steam, GeForce NOW subscriptions, or Chrome itself should go to those companies, not to this project.',
      ],
    },
  ],
}
