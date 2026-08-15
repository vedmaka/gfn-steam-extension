import { FACTS } from '../content'

export default function WhatItDoes() {
  return (
    <section
      id="what"
      aria-labelledby="what-title"
      className="border-y border-white/[0.06] bg-[#080f17] px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="what-title" className="section-title">
          What it does
        </h2>
        <p className="section-lead mt-4">
          A small Chrome extension that shows which Steam store games are available on GeForce NOW while you
          browse, and links you into cloud play when they are.
        </p>

        <ul className="mt-10 divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {FACTS.map((fact) => (
            <li
              className="grid gap-2 py-7 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-10 sm:py-8"
              key={fact.title}
            >
              <h3 className="prose-heading">{fact.title}</h3>
              <p className="prose-block">{fact.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
