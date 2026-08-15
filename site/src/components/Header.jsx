import { NAV_ITEMS, STORE_URL } from '../content'

export default function Header({ variant = 'full' }) {
  const minimal = variant === 'minimal'

  return (
    <header className="relative z-20 border-b border-white/[0.06]">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10"
      >
        <a className="flex items-center gap-2.5 text-base font-semibold text-[#f0f6fc]" href="/">
          <img
            alt=""
            className="size-8 rounded-md"
            height="32"
            src="/icon.png"
            width="32"
          />
          <span>GFN Checker</span>
        </a>
        {!minimal && (
          <div className="hidden items-center gap-7 text-base text-slate-400 md:flex">
            {NAV_ITEMS.map((item) => (
              <a className="transition-colors hover:text-white" href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        )}
        <a className="cta h-10 px-4 text-base leading-none" href={STORE_URL} target="_blank" rel="noreferrer">
          Add to Chrome
        </a>
      </nav>
    </header>
  )
}
