import { useRef, type MouseEvent } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowDownToLine, Star } from 'lucide-react'
import { REPO_URL, RELEASES_URL, formatSize, formatStars, useRepo } from '../lib/github'
import { AppMockup } from './AppMockup'
import { GitHubMark, Logo, Magnetic, Mono, WindowsGlyph, cn, rise, stagger } from './ui'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#studio', label: 'Interactive Studio' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#faq', label: 'FAQ' }
]

/**
 * The download link: the latest release's .exe when GitHub reports one,
 * otherwise the releases page, so the button always leads somewhere useful.
 */
export function useDownload(): { href: string; direct: boolean; tag: string | null; size: string | null } {
  const { release } = useRepo()
  return {
    href: release?.downloadUrl ?? release?.pageUrl ?? RELEASES_URL,
    direct: !!release?.downloadUrl,
    tag: release?.tag ?? null,
    size: release?.sizeBytes ? formatSize(release.sizeBytes) : null
  }
}

/** `shortLabel` replaces `label` on narrow screens so the button stays on one line. */
export function DownloadButton({ size = 'md', label, shortLabel }: { size?: 'md' | 'lg'; label: string; shortLabel?: string }) {
  const { href, direct } = useDownload()
  return (
    <Magnetic>
      <a
        href={href}
        // A direct .exe link downloads in place; the releases page opens in a new tab.
        {...(direct ? {} : { target: '_blank', rel: 'noreferrer' })}
        data-testid="download"
        className={cn(
          'group relative inline-flex items-center overflow-hidden whitespace-nowrap rounded-full bg-amber font-semibold text-[#1a1206] transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.97]',
          size === 'lg' ? 'h-14 gap-2.5 px-5 text-[15px] sm:gap-3 sm:px-7 sm:text-[16px]' : 'h-10 gap-2 px-4 text-[13.5px]'
        )}
        style={{ boxShadow: '0 0 0 1px rgb(255 255 255 / 0.25) inset, 0 10px 40px -8px rgb(245 169 59 / 0.55)' }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/55 to-transparent" />
        <WindowsGlyph size={size === 'lg' ? 17 : 14} className="relative" />
        <span className={cn('relative', shortLabel && 'hidden sm:inline')}>{label}</span>
        {shortLabel && <span className="relative sm:hidden">{shortLabel}</span>}
        {size === 'lg' && <ArrowDownToLine size={18} className="relative transition-transform duration-200 group-hover:translate-y-0.5" />}
      </a>
    </Magnetic>
  )
}

export function Nav() {
  const { stars } = useRepo()
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.1 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav className="glass flex h-14 w-full max-w-[1080px] items-center gap-1 rounded-full pl-4 pr-2" aria-label="Main">
        <a href="#top" className="mr-2 flex shrink-0 items-center gap-2.5 rounded-full pr-2">
          <Logo size={26} />
          <span className="font-display text-[16px] font-bold tracking-[-0.03em]">FocusFlow</span>
        </a>
        <div className="hidden items-center md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="rounded-full px-3 py-1.5 text-[13.5px] text-dim transition-colors hover:bg-white/[0.06] hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>
        <span className="flex-1" />
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={stars === null ? 'FocusFlow on GitHub' : `FocusFlow on GitHub, ${stars} stars`}
          className="hidden h-10 items-center gap-2 rounded-full border border-white/10 px-3 text-[13px] text-dim transition-colors hover:border-white/25 hover:text-ink sm:inline-flex"
        >
          <GitHubMark size={15} />
          <span className="hidden lg:inline">GitHub</span>
          {stars !== null && (
            <span data-testid="stars" className="inline-flex items-center gap-1 border-l border-white/10 pl-2 font-mono text-[12px]">
              <Star size={11} className="fill-amber text-amber" />
              {formatStars(stars)}
            </span>
          )}
        </a>
        <DownloadButton label="Download for Windows" shortLabel="Download" />
      </nav>
    </motion.header>
  )
}

export function Hero() {
  const { release } = useRepo()
  const { tag, size, direct } = useDownload()
  const stage = useRef<HTMLDivElement>(null)

  // Scroll: the window starts leaning back and settles flat as it reaches the middle of the screen.
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start 85%', 'start 30%'] })
  const lean = useTransform(scrollYProgress, [0, 1], [14, 0])
  const lift = useTransform(scrollYProgress, [0, 1], [24, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1])

  // Pointer: a few degrees of tilt toward the cursor.
  const tiltX = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 })
  const tiltY = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 })
  const rotateX = useTransform([lean, tiltX], ([a, b]: number[]) => a + b)
  const onMove = (e: MouseEvent): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    tiltY.set(((e.clientX - rect.left) / rect.width - 0.5) * 5)
    tiltX.set(-((e.clientY - rect.top) / rect.height - 0.5) * 4)
  }
  const onLeave = (): void => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <section id="top" className="relative isolate px-5 pt-28 sm:pt-32">
      {/* Ambient light: a warm lamp from above, a cool fill from the side. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1100px] overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[620px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_169_59/0.28),transparent)]" />
        <div className="absolute right-[-180px] top-[220px] h-[520px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(92_112_255/0.16),transparent)]" />
        <div className="absolute left-[-220px] top-[420px] h-[520px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(245_169_59/0.08),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,#000,transparent)]" />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-[1040px] text-center">
        <motion.a
          variants={rise}
          href={release?.pageUrl ?? RELEASES_URL}
          target="_blank"
          rel="noreferrer"
          className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-3 pr-1.5 text-[13px] text-dim transition-colors hover:text-ink"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-amber" />
            <span className="relative size-2 rounded-full bg-amber" />
          </span>
          Free &amp; Open Source <span className="text-faint">•</span> Windows 10/11
          <Mono className="!text-amber">{tag ?? 'latest'}</Mono>
        </motion.a>

        <motion.h1 variants={rise} className="mt-6 text-[42px] font-extrabold leading-[1.03] text-ink sm:text-[60px] lg:text-[72px]">
          Stop juggling tabs.
          <br />
          <span className="text-gradient">Lock in on what matters.</span>
        </motion.h1>

        <motion.p variants={rise} className="mx-auto mt-5 max-w-[680px] text-[16.5px] leading-relaxed text-dim sm:text-[18px]">
          FocusFlow is a distraction-free workspace for Windows. A focus timer for the one task in front of you, a to-do list
          with step checklists and the apps each task needs, a calendar for time-blocking, and a floating Zen bar that stays
          on top while you work.
        </motion.p>

        <motion.div variants={rise} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <DownloadButton size="lg" label="Download FocusFlow for Windows (.exe)" shortLabel="Download for Windows (.exe)" />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="glass inline-flex h-14 items-center gap-2.5 rounded-full px-6 text-[15px] font-medium text-ink transition-colors hover:border-white/25"
          >
            <GitHubMark size={17} />
            View on GitHub
          </a>
        </motion.div>

        <motion.p variants={rise} className="mt-4 font-mono text-[12px] text-faint" data-testid="download-meta">
          {direct ? `${tag}${size ? ` · ${size}` : ''} · Windows 10/11 64-bit` : 'Windows 10/11 64-bit · installer on the GitHub releases page'}
        </motion.p>
      </motion.div>

      {/* The live demo */}
      <div ref={stage} className="mx-auto mt-12 max-w-[1040px] [perspective:1800px] sm:mt-14" onMouseMove={onMove} onMouseLeave={onLeave}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ rotateX, rotateY: tiltY, y: lift, scale, transformStyle: 'preserve-3d' }}
          className="relative"
        >
          <div aria-hidden="true" className="absolute -inset-x-10 -bottom-16 top-1/3 -z-10 rounded-[50%] bg-[radial-gradient(closest-side,rgb(245_169_59/0.22),transparent)] blur-2xl" />
          <AppMockup />
        </motion.div>
        <p className="mt-5 text-center text-[13px] text-faint">
          This is a live demo. Pause the timer, tick a step, switch to Tasks or Calendar.
        </p>
      </div>
    </section>
  )
}
