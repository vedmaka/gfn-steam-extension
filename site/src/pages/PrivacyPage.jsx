import Footer from '../components/Footer'
import Header from '../components/Header'
import { PRIVACY_POLICY } from '../content'

export default function PrivacyPage() {
  const { title, updated, intro, sections } = PRIVACY_POLICY

  return (
    <>
      <Header variant="minimal" />
      <main className="px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-slate-500">
            <a className="text-slate-400 transition-colors hover:text-white" href="/">
              Home
            </a>
            <span className="mx-2 text-slate-600" aria-hidden="true">
              /
            </span>
            Privacy
          </p>
          <h1 className="mt-4 text-[2.25rem] font-semibold leading-tight tracking-[-0.03em] text-[#f4f8fc] sm:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-3 text-base text-slate-500">Last updated: {updated}</p>
          <p className="section-lead mt-6">{intro}</p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.title} aria-labelledby={`privacy-${section.title}`}>
                <h2
                  id={`privacy-${section.title}`}
                  className="text-xl font-semibold tracking-tight text-[#e8f1fa]"
                >
                  {section.title}
                </h2>
                <div className="prose-block mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 64)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
