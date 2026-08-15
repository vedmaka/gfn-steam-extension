import { FAQ_ITEMS } from '../content'
import { faqPageJsonLd } from '../seo'

export default function Faq() {
  const jsonLd = faqPageJsonLd(FAQ_ITEMS)

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-white/[0.06] bg-[#080f17] px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="faq-title" className="section-title">
          FAQ
        </h2>
        <p className="section-lead mt-4">
          Straight answers about install, privacy, accuracy, and who makes this extension.
        </p>

        <dl className="mt-10 divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="py-7 sm:py-8">
              <dt>
                <h3 className="prose-heading">{item.question}</h3>
              </dt>
              <dd className="prose-block mt-3">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>

        <script
          type="application/ld+json"
          // Visible FAQ content above. Schema mirrors the same Q&A for rich results.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    </section>
  )
}
