import { HOW_IT_WORKS } from '../content'

export default function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="how-title" className="section-title">
          {HOW_IT_WORKS.title}
        </h2>
        <p className="section-lead mt-4">
          {HOW_IT_WORKS.lead}
        </p>
        <ol className="mt-10 max-w-2xl space-y-8">
          {HOW_IT_WORKS.beats.map((beat, index) => (
            <li key={beat.title}>
              <p className="text-sm font-semibold tracking-wide text-[#76b900]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="prose-heading mt-2">{beat.title}</h3>
              <p className="prose-block mt-2.5">{beat.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
