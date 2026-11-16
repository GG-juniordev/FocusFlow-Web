import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  BellRing,
  Check,
  Circle,
  CloudUpload,
  CodeXml,
  Coffee,
  FileText,
  GripVertical,
  HardDrive,
  Maximize2,
  Pause,
  PictureInPicture2,
  Play,
  Plus,
  Power,
  RefreshCw,
  TvMinimalPlay
} from 'lucide-react'
import { ACCENTS, PRESETS, themeVars, useTheme } from '../lib/theme'
import { Logo, Mono, SectionHeading, SpotlightCard, cn, inView, stagger } from './ui'

const clock = (s: number): string => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function useCountdown(start: number, running: boolean): number {
  const [left, setLeft] = useState(start)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setLeft((s) => (s <= 1 ? start : s - 1)), 1000)
    return () => clearInterval(id)
  }, [running, start])
  return left
}

function Copy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-6 sm:p-7">
      <h3 className="text-[21px] font-bold leading-tight text-ink">{title}</h3>
      <p className="mt-2 max-w-[52ch] text-[14.5px] leading-relaxed text-dim">{children}</p>
    </div>
  )
}

/* ---------- 1. Focus and Zen mode ---------- */

function ZenPreview() {
  const { theme } = useTheme()
  const [zen, setZen] = useState(false)
  const [running, setRunning] = useState(true)
  const left = useCountdown(18 * 60 + 42, running)

  return (
    <div className="relative mx-6 mb-6 flex min-h-[250px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#07080b] sm:mx-7 sm:mb-7" style={themeVars(theme)}>
      {/* A stand-in for whatever else is on screen */}
      <div aria-hidden="true" className="absolute inset-0 p-4 opacity-70">
        <div className="h-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-[10.5px] leading-[1.7] text-white/25">
          <div>function insert(node, value) {'{'}</div>
          <div className="pl-4">if (!node) return create(value)</div>
          <div className="pl-4">node.next = insert(node.next, value)</div>
          <div className="pl-4">return node</div>
          <div>{'}'}</div>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-4">
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          style={{ borderRadius: zen ? 999 : 12, boxShadow: '0 18px 50px -10px rgb(0 0 0 / 0.8), 0 0 0 1px rgb(255 255 255 / 0.1)' }}
          className={cn('overflow-hidden bg-[var(--m-surface)] text-[var(--m-ink)]', zen ? 'h-11 w-[300px] max-w-full self-start' : 'h-[200px] w-full max-w-[460px]')}
        >
          <AnimatePresence mode="wait" initial={false}>
            {zen ? (
              <motion.div key="bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="flex h-11 items-center gap-2.5 pl-4 pr-1.5">
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">Java lab: linked lists</span>
                <span className="font-mono text-[14px] font-semibold">{clock(left)}</span>
                <button type="button" aria-label={running ? 'Pause' : 'Start'} onClick={() => setRunning((r) => !r)} className="grid size-7 place-items-center rounded-full text-[var(--m-muted)] hover:bg-[var(--m-line)]">
                  {running ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <span className="inline-flex h-8 items-center gap-1 rounded-full bg-[var(--m-accent)] px-3 text-[11.5px] font-semibold text-[var(--m-accent-ink)]">
                  <Check size={12} strokeWidth={3} />
                  Complete
                </span>
              </motion.div>
            ) : (
              <motion.div key="window" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="flex h-[200px] flex-col">
                <div className="flex h-7 shrink-0 items-center gap-2 bg-[var(--m-rail)] px-2.5 text-[10.5px] text-[var(--m-muted)]">
                  <Logo size={12} />
                  FocusFlow
                </div>
                <div className="flex flex-1 items-center gap-4 px-5">
                  <div className="grid size-[104px] shrink-0 place-items-center rounded-full border-[5px] border-[var(--m-accent)] border-l-[var(--m-line)]">
                    <span className="font-mono text-[19px] font-semibold">{clock(left)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-[16px] font-bold tracking-[-0.02em]">Java lab: linked lists</div>
                    <div className="mt-1 text-[11px] text-[var(--m-muted)]">1 of 3 steps · NetBeans, YouTube</div>
                    <div className="mt-3 flex gap-1.5">
                      <span className="h-6 w-14 rounded-md bg-[var(--m-accent)]" />
                      <span className="h-6 w-12 rounded-md bg-[var(--m-line)]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="relative flex items-center justify-between border-t border-white/10 bg-black/40 px-3 py-2">
        <span className="font-mono text-[11px] text-faint">{zen ? 'always on top · drag it anywhere' : 'full dashboard'}</span>
        <button
          type="button"
          aria-pressed={zen}
          onClick={() => setZen((z) => !z)}
          className="inline-flex h-8 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/[0.12]"
        >
          {zen ? <Maximize2 size={13} /> : <PictureInPicture2 size={14} />}
          {zen ? 'Back to dashboard' : 'Shrink to Zen bar'}
        </button>
      </div>
    </div>
  )
}

/* ---------- 2. Toolkits and checklists ---------- */

const PALETTE = [
  { id: 'vscode', label: 'VS Code', node: <CodeXml size={12} color="#2f8fe0" strokeWidth={2.3} /> },
  { id: 'netbeans', label: 'NetBeans', node: <Coffee size={12} color="#4a8fe0" strokeWidth={2.3} /> },
  { id: 'youtube', label: 'YouTube', node: <TvMinimalPlay size={12} color="#ff4d42" strokeWidth={2.3} /> },
  { id: 'docs', label: 'Google Docs', node: <FileText size={12} color="#4c8df6" strokeWidth={2.3} /> },
  { id: 'anki', label: 'Anki', node: <span className="text-[12px] leading-none">🧠</span> }
]

function ToolkitPreview() {
  const [picked, setPicked] = useState<string[]>(['netbeans', 'youtube'])
  const [steps, setSteps] = useState([
    { id: 1, title: 'Watch the lecture recap', done: true },
    { id: 2, title: 'Implement insert and remove', done: false },
    { id: 3, title: 'Run the provided tests', done: false }
  ])
  const done = steps.filter((s) => s.done).length

  return (
    <div className="mx-6 mb-6 mt-auto rounded-2xl border border-white/10 bg-panel p-4 sm:mx-7 sm:mb-7">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[14px] font-semibold text-ink">Java lab: linked lists</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-dim">
          {done}/{steps.length}
          <span className="h-1 w-9 overflow-hidden rounded-full bg-white/10">
            <motion.span className="block h-full rounded-full bg-amber" animate={{ width: `${(done / steps.length) * 100}%` }} />
          </span>
        </span>
      </div>

      <div className="mt-2.5 flex min-h-[26px] flex-wrap gap-1.5">
        <AnimatePresence initial={false}>
          {PALETTE.filter((p) => picked.includes(p.id)).map((p) => (
            <motion.span
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex h-[24px] items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 text-[11.5px] text-dim"
            >
              {p.node}
              {p.label}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <ul className="mt-3 space-y-0.5">
        {steps.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={s.done}
              onClick={() => setSteps((list) => list.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))}
              className="flex w-full items-center gap-2.5 rounded-md px-1 py-1.5 text-left text-[13px] hover:bg-white/[0.04]"
            >
              <span className={cn('grid size-4 shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors', s.done ? 'border-amber bg-amber text-[#1a1206]' : 'border-white/30 text-transparent')}>
                <Check size={11} strokeWidth={3.4} />
              </span>
              <span className={cn('truncate transition-colors', s.done ? 'text-faint line-through' : 'text-ink')}>{s.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="mb-1.5 text-[11px] text-faint">Tools for this task</div>
        <div className="flex flex-wrap gap-1.5">
          {PALETTE.map((p) => {
            const on = picked.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked((list) => (on ? list.filter((x) => x !== p.id) : [...list, p.id]))}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] transition-[color,background-color,border-color,transform] active:scale-95',
                  on ? 'border-amber/70 bg-amber/15 text-ink' : 'border-white/10 text-dim hover:border-white/25'
                )}
              >
                {on ? <Check size={11} className="text-amber" /> : <Plus size={11} />}
                {p.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- 3. Calendar ---------- */

interface Block {
  id: string
  title: string
  color: string
  hour: number | null
}
const CAL_HOURS = [9, 10, 11, 12]

function CalendarPreview() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'a', title: 'History essay', color: '#23b5a6', hour: null },
    { id: 'b', title: 'Java lab', color: '#8b6cf0', hour: null },
    { id: 'c', title: 'Login API', color: '#4c8df6', hour: 10 }
  ])
  const slots = useRef<Record<number, HTMLDivElement | null>>({})
  const flexibleRow = useRef<HTMLDivElement>(null)
  const [over, setOver] = useState<number | 'flex' | null>(null)

  const target = (x: number, y: number): number | 'flex' | null => {
    const inside = (el: HTMLElement | null): boolean => {
      if (!el) return false
      const r = el.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    }
    if (inside(flexibleRow.current)) return 'flex'
    return CAL_HOURS.find((h) => inside(slots.current[h])) ?? null
  }

  const drop = (id: string, where: number | 'flex' | null): void => {
    setOver(null)
    if (where === null) return
    setBlocks((list) => {
      if (where !== 'flex' && list.some((b) => b.hour === where && b.id !== id)) return list // slot taken
      return list.map((b) => (b.id === id ? { ...b, hour: where === 'flex' ? null : where } : b))
    })
  }

  const chip = (b: Block, scheduled: boolean): ReactNode => (
    <motion.div
      key={b.id}
      layoutId={`bento-cal-${b.id}`}
      drag
      dragSnapToOrigin
      dragElastic={0.9}
      whileDrag={{ scale: 1.05, zIndex: 20, boxShadow: '0 12px 30px rgb(0 0 0 / 0.5)' }}
      onDrag={(_e, info) => setOver(target(info.point.x - window.scrollX, info.point.y - window.scrollY))}
      onDragEnd={(_e, info) => drop(b.id, target(info.point.x - window.scrollX, info.point.y - window.scrollY))}
      style={{ borderLeftColor: b.color, background: scheduled ? `color-mix(in oklab, ${b.color} 24%, #14161c)` : '#14161c' }}
      className={cn(
        'relative flex cursor-grab touch-none items-center gap-1.5 rounded-md border-l-[3px] px-2 text-[12px] font-medium text-ink active:cursor-grabbing',
        scheduled ? 'h-full flex-1' : 'h-7 border border-dashed border-white/15'
      )}
    >
      <GripVertical size={12} className="shrink-0 text-faint" />
      {!scheduled && <Circle size={10} className="shrink-0 text-faint" />}
      <span className="truncate">{b.title}</span>
    </motion.div>
  )

  return (
    <div className="mx-6 mb-6 mt-auto overflow-hidden rounded-2xl border border-white/10 bg-panel sm:mx-7 sm:mb-7">
      <div ref={flexibleRow} className={cn('flex min-h-[46px] items-center gap-2 border-b-2 border-white/10 px-3 py-2 transition-colors', over === 'flex' && 'bg-amber/10')}>
        <span className="w-14 shrink-0 font-mono text-[10.5px] text-faint">Flexible</span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {blocks.filter((b) => b.hour === null).map((b) => chip(b, false))}
          {blocks.every((b) => b.hour !== null) && <span className="text-[12px] text-faint">Drag a block back up to free its time.</span>}
        </div>
      </div>
      {CAL_HOURS.map((h) => {
        const b = blocks.find((x) => x.hour === h)
        return (
          <div
            key={h}
            ref={(el) => {
              slots.current[h] = el
            }}
            className={cn('flex h-11 items-stretch gap-2 border-b border-white/[0.07] px-3 py-1 transition-colors last:border-b-0', over === h && !b && 'bg-amber/10')}
          >
            <span className="w-14 shrink-0 pt-1 font-mono text-[10.5px] text-faint">{String(h).padStart(2, '0')}:00</span>
            {b && chip(b, true)}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- 4. Colours ---------- */

function ColorPreview() {
  const { theme, presetId, setPreset, set } = useTheme()
  return (
    <div className="mx-6 mb-6 mt-auto sm:mx-7 sm:mb-7">
      <div style={themeVars(theme)} className="rounded-2xl border border-white/10 bg-[var(--m-bg)] p-3 transition-colors duration-300">
        <div className="rounded-xl bg-[var(--m-surface)] p-3 transition-colors duration-300" style={{ border: '1px solid var(--m-line)' }}>
          <div className="text-[13.5px] font-semibold text-[var(--m-ink)]">Write the project summary</div>
          <div className="mt-0.5 text-[12px] text-[var(--m-muted)]">Text colours adjust to stay readable.</div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex h-7 items-center rounded-lg bg-[var(--m-accent)] px-3 text-[11.5px] font-semibold text-[var(--m-accent-ink)]">Start</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--m-line)]">
              <span className="block h-full w-3/5 rounded-full bg-[var(--m-accent)]" />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Background preset">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={presetId === p.id}
            aria-label={p.name}
            title={p.name}
            onClick={() => setPreset(p.id)}
            className="relative grid size-8 place-items-center rounded-full transition-transform hover:scale-110"
          >
            {presetId === p.id && <motion.span layoutId="bento-preset" className="absolute inset-[-3px] rounded-full border-2 border-amber" />}
            <span className="size-full rounded-full border border-white/20" style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.surface} 50%)` }} />
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-white/10" />
        {ACCENTS.slice(0, 5).map((accent) => (
          <button
            key={accent}
            type="button"
            aria-label={`Accent ${accent}`}
            aria-pressed={theme.accent === accent}
            onClick={() => set({ accent })}
            className={cn('size-5 rounded-full transition-transform hover:scale-125', theme.accent === accent && 'ring-2 ring-white ring-offset-2 ring-offset-canvas')}
            style={{ background: accent }}
          />
        ))}
      </div>
      <p className="mt-2.5 text-[12px] text-faint">This also recolours the live demo at the top of the page.</p>
    </div>
  )
}

/* ---------- 5. Windows integration ---------- */

function NativePreview() {
  const [startup, setStartup] = useState(true)
  const [toast, setToast] = useState(false)
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(false), 3200)
    return () => clearTimeout(id)
  }, [toast])

  return (
    <div className="relative mx-6 mb-6 mt-auto overflow-hidden rounded-2xl border border-white/10 bg-panel sm:mx-7 sm:mb-7">
      <div className="space-y-1 p-3">
        <button type="button" role="switch" aria-checked={startup} onClick={() => setStartup((s) => !s)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/[0.04]">
          <Power size={15} className="shrink-0 text-dim" />
          <span className="flex-1 text-[13px] text-ink">Launch when Windows starts</span>
          <span className={cn('relative h-5 w-9 rounded-full transition-colors', startup ? 'bg-amber' : 'bg-white/15')}>
            <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 32 }} className={cn('absolute top-0.5 size-4 rounded-full bg-white', startup ? 'right-0.5' : 'left-0.5')} />
          </span>
        </button>
        <button type="button" onClick={() => setToast(true)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/[0.04]">
          <BellRing size={15} className="shrink-0 text-dim" />
          <span className="flex-1 text-[13px] text-ink">Show a sample notification</span>
          <Mono>5 min before</Mono>
        </button>
      </div>

      {/* Taskbar with the tray icon */}
      <div className="flex h-10 items-center justify-end gap-3 border-t border-white/10 bg-black/50 px-3">
        <span className="font-mono text-[10.5px] text-faint">closing the window keeps it here →</span>
        <span className="relative grid size-6 place-items-center rounded-md bg-white/[0.06]" title="FocusFlow in the system tray">
          <Logo size={15} />
        </span>
        <span className="text-right font-mono text-[10px] leading-tight text-dim">
          14:25
          <br />
          16/11
        </span>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="absolute bottom-12 right-2 flex w-[250px] gap-2.5 rounded-xl border border-white/15 bg-[#1f2128] p-3 shadow-2xl"
          >
            <Logo size={28} />
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold text-ink">Starting in 5 min</div>
              <div className="text-[12px] leading-snug text-dim">Java lab: linked lists starts at 14:30.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- 6. Local first, manual sync ---------- */

function SyncPreview() {
  const [unsynced, setUnsynced] = useState(2)
  const [syncing, setSyncing] = useState(false)
  const [last, setLast] = useState('09:12')

  const sync = (): void => {
    if (syncing) return
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setUnsynced(0)
      setLast(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 1100)
  }

  return (
    <div className="mx-6 mb-6 mt-auto rounded-2xl border border-white/10 bg-panel p-4 sm:mx-7 sm:mb-7">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-amber">
          <HardDrive size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-ink">Saved on this PC</div>
          <div className="truncate font-mono text-[11px] text-faint">%APPDATA%\FocusFlow\data.json</div>
        </div>
        <button type="button" onClick={() => setUnsynced((n) => n + 1)} className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11.5px] text-dim transition-colors hover:border-white/25 hover:text-ink">
          Edit a task
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-dim">
          <CloudUpload size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-ink">Cloud copy (optional)</div>
          <div className="font-mono text-[11px] text-faint">last synced {last}</div>
        </div>
        <button
          type="button"
          onClick={sync}
          className={cn(
            'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors',
            unsynced > 0 ? 'border-amber/70 bg-amber/15 text-ink' : 'border-white/10 text-dim'
          )}
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : undefined} />
          {syncing ? 'Syncing…' : 'Sync now'}
          {!syncing && unsynced > 0 && <span className="rounded-full bg-amber px-1.5 font-mono text-[10.5px] font-semibold text-[#1a1206]">{unsynced}</span>}
        </button>
      </div>
      <p className="mt-3 text-[12px] text-faint">
        {unsynced > 0 ? `${unsynced} local ${unsynced === 1 ? 'change has' : 'changes have'} not been uploaded. Nothing leaves the PC until you press Sync now.` : 'Everything is uploaded. Nothing syncs again until you ask.'}
      </p>
    </div>
  )
}

/* ---------- grid ---------- */

export function Bento() {
  return (
    <section id="features" className="relative mx-auto max-w-[1160px] px-5 pt-32 sm:pt-44">
      <SectionHeading
        kicker="features"
        title="Six things it does, each one you can try here."
        lead="No screenshots. Every card below is a small working piece of the app's behaviour."
      />

      <motion.div variants={stagger} {...inView} className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <SpotlightCard className="md:col-span-2 lg:col-span-4">
          <Copy title="Active focus, then a floating Zen bar">
            One task on screen with its own countdown. When you switch to your code or your notes, shrink FocusFlow to a
            small always-on-top bar: task, time left, and a Complete button.
          </Copy>
          <ZenPreview />
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2 lg:col-span-2">
          <Copy title="Tasks that bring their tools">
            Break a task into steps, and attach the apps and links it needs. Tools with a link open on click, and you can
            give any tool an emoji or your own icon.
          </Copy>
          <ToolkitPreview />
        </SpotlightCard>

        <SpotlightCard className="lg:col-span-3">
          <Copy title="A calendar that allows “sometime today”">
            Tasks with a day but no time wait in a Flexible row. Drag one onto an hour to block time for it, or drag a block
            back up to free it.
          </Copy>
          <CalendarPreview />
        </SpotlightCard>

        <SpotlightCard className="lg:col-span-3">
          <Copy title="Your colours, down to the background">
            Pick the accent, the app background and the card colour, from presets or any HEX value. Text contrast is worked
            out for you.
          </Copy>
          <ColorPreview />
        </SpotlightCard>

        <SpotlightCard className="lg:col-span-3">
          <Copy title="Behaves like a Windows app">
            Starts with Windows if you want it to, closes to the system tray without quitting, and uses native
            notifications before a time block and when a timer ends.
          </Copy>
          <NativePreview />
        </SpotlightCard>

        <SpotlightCard className="lg:col-span-3">
          <Copy title="Local first, cloud only when you say so">
            It opens instantly and works offline, with no account. Cloud sync through Supabase is optional, and it runs
            when you press Sync now, not in the background.
          </Copy>
          <SyncPreview />
        </SpotlightCard>
      </motion.div>
    </section>
  )
}
