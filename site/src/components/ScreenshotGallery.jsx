import { useEffect, useRef, useState } from 'react'
import { SCREENSHOTS, SCREENSHOTS_INTRO } from '../content'

export default function ScreenshotGallery() {
  const dialogRef = useRef(null)
  const openerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!selected || !dialog) return undefined

    if (!dialog.open) dialog.showModal()
    closeButtonRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selected])

  function openLightbox(screenshot, event) {
    openerRef.current = event.currentTarget
    setSelected(screenshot)
  }

  function closeLightbox() {
    dialogRef.current?.close()
  }

  function handleClose() {
    setSelected(null)
    queueMicrotask(() => openerRef.current?.focus())
  }

  function handleCancel(event) {
    event.preventDefault()
    closeLightbox()
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) closeLightbox()
  }

  return (
    <section
      id="screenshots"
      aria-labelledby="screenshots-title"
      className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="screenshots-title" className="section-title">
          Screenshots
        </h2>
        <p className="section-lead mt-4">
          {SCREENSHOTS_INTRO}
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SCREENSHOTS.map((shot) => (
            <figure key={shot.src} className="group">
              <button
                type="button"
                aria-label={`Open ${shot.label} screenshot`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-white/10 bg-[#0d1824] text-left transition-colors hover:border-white/20"
                onClick={(event) => openLightbox(shot, event)}
              >
                <img
                  alt={shot.alt}
                  className="block aspect-[8/5] w-full object-cover object-top"
                  decoding="async"
                  height="800"
                  loading="lazy"
                  src={shot.src}
                  width="1280"
                />
              </button>
              <figcaption className="mt-3.5">
                <p className="text-base font-medium text-[#e8f1fa]">{shot.label}</p>
                <p className="mt-1.5 text-base leading-relaxed text-slate-500">{shot.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <dialog
          ref={dialogRef}
          aria-label={selected?.label ?? 'Screenshot preview'}
          className="m-auto max-h-[94vh] w-[min(94vw,1100px)] overflow-visible rounded-lg border border-white/12 bg-[#0a121c] p-0 text-white shadow-2xl shadow-black backdrop:bg-black/80"
          onCancel={handleCancel}
          onClick={handleBackdropClick}
          onClose={handleClose}
        >
          {selected && (
            <div className="relative overflow-hidden rounded-lg">
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close screenshot"
                className="absolute right-2.5 top-2.5 z-10 grid size-10 place-items-center rounded-md border border-white/15 bg-[#0a121c]/90 text-xl text-white transition hover:bg-[#152233]"
                onClick={closeLightbox}
              >
                <span aria-hidden="true">×</span>
              </button>
              <img
                alt={selected.alt}
                className="block max-h-[80vh] w-full bg-black object-contain"
                decoding="async"
                height="800"
                src={selected.src}
                width="1280"
              />
              <div className="border-t border-white/10 px-5 py-4">
                <p className="text-base font-medium text-[#e8f1fa]">{selected.label}</p>
                <p className="mt-1.5 text-base text-slate-400">{selected.description}</p>
              </div>
            </div>
          )}
        </dialog>
      </div>
    </section>
  )
}
