import { MotionConfig } from 'motion/react'
import { Bento } from './components/Bento'
import { Hero, Nav } from './components/Hero'
import { Download, Faq, Footer, Studio, Workflow } from './components/Sections'
import { ThemeProvider } from './lib/theme'

export function App() {
  return (
    // reducedMotion="user": visitors who turned animations off in their system get fades without movement.
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <div className="grain" aria-hidden="true" />
        <Nav />
        <main>
          <Hero />
          <Bento />
          <Studio />
          <Workflow />
          <Download />
          <Faq />
        </main>
        <Footer />
      </ThemeProvider>
    </MotionConfig>
  )
}
