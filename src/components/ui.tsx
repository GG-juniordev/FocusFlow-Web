import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, type Variants } from 'motion/react'

export const cn = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ')

export const EASE = [0.2, 0.8, 0.2, 1] as const

/* ---------- reveal on scroll ---------- */

/** Parent: children appear one after another the first time the block scrolls into view. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

export const rise: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 120, damping: 20, mass: 0.9 } }
}

export const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-80px' } } as const

/* ---------- marks ---------- */

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#171b26" />
      <circle cx="16" cy="16" r="8.6" fill="none" stroke="#3a445e" strokeWidth="3.4" />
      <path d="M16 7.4 A8.6 8.6 0 1 1 7.5 17.3" fill="none" stroke="#f5a93b" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.9" fill="#f5a93b" />
    </svg>
  )
}

export function GitHubMark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

/** Four-pane window glyph for "Download for Windows". */
export function WindowsGlyph({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d="M0 0h7.4v7.4H0zM8.6 0H16v7.4H8.6zM0 8.6h7.4V16H0zM8.6 8.6H16V16H8.6z" />
    </svg>
  )
}

/* ---------- interactions ---------- */

/** Pulls its child slightly toward the cursor, with a spring. Purely decorative. */
export function Magnetic({ children, strength = 0.22, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 })

  const move = (e: MouseEvent): void => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }
  const reset = (): void => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} style={{ x, y }} onMouseMove={move} onMouseLeave={reset} className={cn('inline-block', className)}>
      {children}
    </motion.div>
  )
}

/** Bento card whose border and surface light up under the cursor. */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const set = (name: string, value: string): void => ref.current?.style.setProperty(name, value)

  return (
    <motion.div
      ref={ref}
      variants={rise}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        set('--mx', `${e.clientX - rect.left}px`)
        set('--my', `${e.clientY - rect.top}px`)
      }}
      onMouseEnter={() => {
        set('--glow', '0.75')
        set('--lit', '1')
      }}
      onMouseLeave={() => {
        set('--glow', '0')
        set('--lit', '0')
      }}
      style={{ '--glow': 0, '--lit': 0 } as CSSProperties}
      className={cn('spot flex flex-col overflow-hidden', className)}
    >
      {children}
    </motion.div>
  )
}

/* ---------- typography ---------- */

export function SectionHeading({ kicker, title, lead, align = 'left' }: { kicker: string; title: ReactNode; lead?: string; align?: 'left' | 'center' }) {
  return (
    <motion.div variants={stagger} {...inView} className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <motion.p variants={rise} className="font-mono text-[12px] text-amber">
        {kicker}
      </motion.p>
      <motion.h2 variants={rise} className="mt-3 text-[34px] font-bold leading-[1.08] text-ink sm:text-[44px]">
        {title}
      </motion.h2>
      {lead && (
        <motion.p variants={rise} className="mt-4 text-[17px] leading-relaxed text-dim">
          {lead}
        </motion.p>
      )}
    </motion.div>
  )
}

/** Small monospaced chip for versions, shortcuts and other technical facts. */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11.5px] text-dim', className)}>
      {children}
    </span>
  )
}
