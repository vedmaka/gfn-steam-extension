import { STORE_URL } from '../content'

function ChromeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      className="shrink-0 fill-none stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 3a9 9 0 0 1 7.8 4.5H12" />
      <path d="M4.2 7.5 9.1 15.2" />
      <path d="M14.9 15.2 19.8 7.5" />
    </svg>
  )
}

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-20"
    >
      <div>
        <h1 className="max-w-xl text-[2.65rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f4f8fc] sm:text-[3.25rem] lg:text-[3.5rem]">
          <span className="text-[#76b900]">GeForce NOW</span>
          {' '}
          badges on
          {' '}
          <span className="text-[#66c0f4]">Steam</span>
        </h1>
        <p className="mt-6 max-w-lg text-xl leading-relaxed text-slate-300">
          See which games stream while you browse. Open supported titles in GeForce NOW without leaving the store.
        </p>
        <p className="mt-5 max-w-lg border-l-2 border-[#76b900]/70 pl-4 text-base leading-relaxed text-slate-400">
          Built after too many trips between a wishlist and the GFN library.
        </p>
        <div className="mt-9 flex flex-col items-start gap-3.5">
          <a
            className="cta h-12 gap-2.5 px-6 text-base leading-none"
            href={STORE_URL}
            target="_blank"
            rel="noreferrer"
          >
            <ChromeIcon />
            <span>Add to Chrome</span>
          </a>
          <p className="text-base leading-snug text-slate-500">
            Free · No account · Steam store pages only
          </p>
        </div>
      </div>

      <div className="relative w-full">
        <figure className="overflow-hidden rounded-lg border border-white/10 bg-[#0d1824] shadow-[0_24px_60px_rgba(0,0,0,.45)]">
          <img
            alt="GeForce NOW availability shown on a Steam store page"
            className="block aspect-[8/5] w-full object-cover object-top"
            decoding="async"
            fetchPriority="high"
            height="800"
            src="/screenshots/steam1.jpeg"
            width="1280"
          />
          <figcaption className="border-t border-white/8 px-4 py-3 text-sm text-slate-500">
            Real Steam page with the extension running
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
