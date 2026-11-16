import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Cpu, HardDrive, ListChecks, CalendarClock, PictureInPicture2, ShieldCheck, WifiOff } from 'lucide-react'
import { ISSUES_URL, RELEASES_URL, REPO_URL, useRepo } from '../lib/github'
import { ACCENTS, PRESETS, useTheme } from '../lib/theme'
import { AppMockup } from './AppMockup'
import { DownloadButton, useDownload } from './Hero'
import { EASE, GitHubMark, Logo, Mono, SectionHeading, cn, inView, rise, stagger } from './ui'

/* ---------- Interactive Studio ---------- */

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange(hex: string): void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-[13.5px] text-dim">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-[12px] uppercase text-faint">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-7 cursor-pointer rounded-full border border-white/20 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
        />
      </span>
    </label>
  )
}

export function Studio() {
  const { theme, presetId, setPreset, set } = useTheme()
  return (
    <section id="studio" className="relative mx-auto max-w-[1160px] px-5 pt-32 sm:pt-44">
      <SectionHeading
        kicker="interactive studio"
        title="Make it yours before you install it."
        lead="Choose a look and use the app right here. The real settings offer the same choices: presets, any accent, and custom background and card colours."
      />

      <motion.div variants={stagger} {...inView} className="mt-12 grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <motion.div variants={rise} className="glass rounded-3xl p-5">
          <div className="text-[13px] font-semibold text-ink">Background</div>
          <div className="mt-3 grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Background preset">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={presetId === p.id}
                onClick={() => setPreset(p.id)}
                className={cn('relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors', presetId === p.id ? 'text-ink' : 'text-dim hover:text-ink')}
              >
                {presetId === p.id && <motion.span layoutId="studio-preset" className="absolute inset-0 rounded-xl border border-white/20 bg-white/[0.08]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="relative size-5 shrink-0 rounded-full border border-white/20" style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.surface} 50%)` }} />
                <span className="relative truncate">{p.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 text-[13px] font-semibold text-ink">Accent</div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {ACCENTS.map((accent) => (
              <button
                key={accent}
                type="button"
                aria-label={`Accent ${accent}`}
                aria-pressed={theme.accent === accent}
                onClick={() => set({ accent })}
                className={cn('size-7 rounded-full transition-transform hover:scale-110', theme.accent === accent && 'ring-2 ring-white ring-offset-2 ring-offset-[#101116]')}
                style={{ background: accent }}
              />
            ))}
          </div>

          <div className="mt-5 text-[13px] font-semibold text-ink">Or any colour</div>
          <div className="mt-3 space-y-1.5">
            <ColorInput label="App background" value={theme.bg} onChange={(bg) => set({ bg })} />
            <ColorInput label="Cards & panels" value={theme.surface} onChange={(surface) => set({ surface })} />
            <ColorInput label="Accent" value={theme.accent} onChange={(accent) => set({ accent })} />
          </div>
        </motion.div>

        <motion.div variants={rise}>
          <AppMockup startView="tasks" />
          <p className="mt-4 text-[13px] text-faint">Expand a task to tick its steps, press Focus now, or open Calendar and give a flexible task a time.</p>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ---------- How it works ---------- */

const STEPS = [
  {
    n: '01',
    icon: ListChecks,
    title: 'Capture & equip',
    body: 'Write the task down, break it into steps, estimate how long it takes, and attach the exact apps and links you will need.'
  },
  {
    n: '02',
    icon: CalendarClock,
    title: 'Schedule or keep it flexible',
    body: 'Give it a day and it waits in the Flexible row. Drag it onto an hour when you know when, or just press Focus now.'
  },
  {
    n: '03',
    icon: PictureInPicture2,
    title: 'Enter Zen mode',
    body: 'Shrink FocusFlow to the floating bar and work. The timer keeps counting; press Complete when the task is done.'
  }
]

export function Workflow() {
  return (
    <section id="workflow" className="relative mx-auto max-w-[1160px] px-5 pt-32 sm:pt-44">
      <SectionHeading kicker="workflow" title="From “I should do that” to done, in three moves." />
      <motion.ol variants={stagger} {...inView} className="relative mt-14 grid gap-5 md:grid-cols-3">
        {/* The line the three steps sit on */}
        <span aria-hidden="true" className="absolute left-0 right-0 top-[27px] hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />
        {STEPS.map(({ n, icon: Icon, title, body }) => (
          <motion.li key={n} variants={rise} className="relative">
            <div className="flex items-center gap-3">
              <span className="relative grid size-[54px] shrink-0 place-items-center rounded-2xl border border-white/10 bg-panel text-amber">
                <Icon size={22} />
              </span>
              <span className="font-mono text-[13px] text-faint">{n}</span>
            </div>
            <h3 className="mt-5 text-[22px] font-bold text-ink">{title}</h3>
            <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-dim">{body}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}

/* ---------- Download ---------- */

export function Download() {
  const { release, loading } = useRepo()
  const { size, tag, direct } = useDownload()
  const [open, setOpen] = useState(false)
  const specs = [
    { icon: Cpu, label: 'System', value: 'Windows 10 or 11, 64-bit' },
    { icon: HardDrive, label: 'Download size', value: size ?? 'about 120 MB' },
    { icon: WifiOff, label: 'Internet', value: 'Not needed. Works fully offline.' },
    { icon: ShieldCheck, label: 'Account', value: 'None required' }
  ]

  return (
    <section id="download" className="relative mx-auto max-w-[1160px] px-5 pt-32 sm:pt-44">
      <motion.div variants={stagger} {...inView} className="relative overflow-hidden rounded-[32px] border border-white/10 bg-panel">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_169_59/0.22),transparent)]" />
        <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <motion.div variants={rise}>
              <Mono className="!text-amber">{tag ?? (loading ? 'checking latest release…' : 'latest release')}</Mono>
            </motion.div>
            <motion.h2 variants={rise} className="mt-4 text-[36px] font-bold leading-[1.06] text-ink sm:text-[48px]">
              Install it in under a minute.
            </motion.h2>
            <motion.p variants={rise} className="mt-4 max-w-[46ch] text-[16.5px] leading-relaxed text-dim">
              One installer, no sign-up. FocusFlow puts a shortcut on your desktop and keeps your tasks in your own user folder.
            </motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
              <DownloadButton size="lg" label="Download for Windows (.exe)" />
              <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="text-[14.5px] text-dim underline decoration-white/20 underline-offset-4 transition-colors hover:text-ink">
                All releases and release notes
              </a>
            </motion.div>
            {!loading && !direct && (
              <motion.p variants={rise} className="mt-4 text-[13.5px] text-faint">
                {release ? 'This release has no installer attached yet. The button opens its page on GitHub.' : 'The button opens the releases page on GitHub, where the installer is published.'}
              </motion.p>
            )}
          </div>

          <motion.dl variants={rise} className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-[#101116] p-4">
                <dt className="flex items-center gap-2 text-[12.5px] text-faint">
                  <Icon size={14} />
                  {label}
                </dt>
                <dd className="mt-1.5 text-[14.5px] font-medium text-ink">{value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative border-t border-white/10">
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-7 py-4 text-left sm:px-12">
            <ShieldCheck size={17} className="shrink-0 text-amber" />
            <span className="flex-1 text-[14.5px] font-medium text-ink">Windows SmartScreen tip</span>
            <ChevronDown size={17} className={cn('text-dim transition-transform duration-200', open && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: EASE }} className="overflow-hidden">
                <p className="max-w-[70ch] px-7 pb-6 text-[14.5px] leading-relaxed text-dim sm:px-12">
                  Since FocusFlow is an independent open-source app, if Windows Defender SmartScreen appears on first launch,
                  click <Mono>More info</Mono> → <Mono>Run anyway</Mono>. Windows shows this for installers that are not signed
                  with a paid certificate. You can read the source or build it yourself from the{' '}
                  <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-ink underline decoration-white/25 underline-offset-4">
                    GitHub repository
                  </a>
                  .
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- FAQ ---------- */

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Is it free?',
    a: 'Yes. FocusFlow is free to download and use, with no paid tier, ads or trial period. The source code is public on GitHub.'
  },
  {
    q: 'Do I need an account?',
    a: 'No. The app opens straight into your dashboard and everything works without signing in. An account only matters if you choose to turn on cloud sync.'
  },
  {
    q: 'Where is my data stored?',
    a: (
      <>
        In a single file on your PC: <Mono>%APPDATA%\FocusFlow\data.json</Mono>. It holds your tasks, calendar, tools and settings,
        and is written safely on every change with a backup copy beside it. Uninstalling the app leaves that folder in place.
      </>
    )
  },
  {
    q: 'How does manual Supabase sync work?',
    a: 'Cloud sync is optional and off until you sign in from Settings. After that, nothing is uploaded or downloaded in the background: syncing happens when you press Sync now (and once when you sign in or out). The button shows how many local changes are waiting and when you last synced. If two devices changed the same task, the newer change wins. A copy of the app built without a Supabase project simply stays local.'
  },
  {
    q: 'How does Windows auto-startup work?',
    a: 'On first run the installed app registers itself to start when you sign in to Windows. You can turn that off in Settings, or choose to start minimized so it waits in the system tray until you click its icon. Closing the window also sends it to the tray instead of quitting; right-click the tray icon to quit.'
  }
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="relative mx-auto max-w-[820px] px-5 pt-32 sm:pt-44">
      <SectionHeading kicker="faq" title="Questions people ask first." align="center" />
      <motion.div variants={stagger} {...inView} className="mt-12 divide-y divide-white/10 border-y border-white/10">
        {FAQ.map((item, i) => (
          <motion.div key={item.q} variants={rise}>
            <h3 className="font-sans tracking-normal">
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-4 py-5 text-left">
                <span className="flex-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-ink">{item.q}</span>
                <span className={cn('grid size-8 shrink-0 place-items-center rounded-full border border-white/10 text-dim transition-[transform,background-color] duration-200', open === i && 'rotate-180 bg-white/[0.08] text-ink')}>
                  <ChevronDown size={16} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
                  <p className="max-w-[66ch] pb-6 text-[15.5px] leading-relaxed text-dim">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ---------- Footer ---------- */

export function Footer() {
  return (
    <footer className="mx-auto mt-32 max-w-[1160px] px-5 pb-12 sm:mt-44">
      <div className="flex flex-col gap-8 border-t border-white/10 pt-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-display text-[17px] font-bold tracking-[-0.03em]">FocusFlow</span>
          </div>
          <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-faint">One task at a time, on Windows. Free and open source.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2.5 text-[14.5px] sm:items-end">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-dim transition-colors hover:text-ink">
            <GitHubMark size={15} />
            Source on GitHub
          </a>
          <a href={ISSUES_URL} target="_blank" rel="noreferrer" className="text-dim transition-colors hover:text-ink">
            Report a bug or send feedback
          </a>
          <a href={RELEASES_URL} target="_blank" rel="noreferrer" className="text-dim transition-colors hover:text-ink">
            Release notes
          </a>
        </nav>
      </div>
      <p className="mt-10 font-mono text-[11.5px] text-faint">github.com/GG-juniordev/FocusFlow</p>
    </footer>
  )
}
