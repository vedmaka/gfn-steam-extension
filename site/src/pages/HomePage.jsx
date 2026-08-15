import Faq from '../components/Faq'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import ScreenshotGallery from '../components/ScreenshotGallery'
import WhatItDoes from '../components/WhatItDoes'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ScreenshotGallery />
        <WhatItDoes />
        <HowItWorks />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
