import { STORE_URL } from '../content'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070d14] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <p className="text-base font-medium text-[#e8f1fa]">
            Free on the Chrome Web Store
          </p>
          <p className="mt-2.5 text-base leading-relaxed text-slate-500">
            Independent project, not affiliated with Valve or NVIDIA. Steam, GeForce NOW, and
            related marks belong to their respective owners. You need Chrome, the Steam store site,
            and your own GeForce NOW account to play. The extension only shows catalog availability
            and links. It does not provide cloud gaming service.
          </p>
          <p className="mt-4 text-base text-slate-500">
            <a className="text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline" href="/privacy">
              Privacy Policy
            </a>
          </p>
          <p className="mt-4 text-base text-slate-400">
            <a
              className="underline underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="https://ko-fi.com/C6S42AFEM4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support on Ko-fi
            </a>
            <span className="mt-2 block text-sm">Free to use · Support is optional</span>
          </p>
        </div>
        <a className="cta h-11 shrink-0 px-5 text-base leading-none" href={STORE_URL} target="_blank" rel="noreferrer">
          Add to Chrome
        </a>
      </div>
    </footer>
  )
}
