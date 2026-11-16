import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import {
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  CodeXml,
  Coffee,
  FileText,
  ListTodo,
  Minus,
  Pause,
  Play,
  RotateCcw,
  Square,
  Target,
  TvMinimalPlay,
  X
} from 'lucide-react'
import { themeVars, useTheme } from '../lib/theme'
import { cn, Logo } from './ui'

/**
 * A working miniature of the FocusFlow window. It is a demo, not the app: state
 * lives in this component and resets on reload. What it shows is real though:
 * the timer, tasks with steps and tools, and the calendar's Flexible row.
 */

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string }>
type View = 'focus' | 'tasks' | 'calendar'

interface Tool {
  label: string
  icon: IconType
  color: string
}

const TOOLS = {
  vscode: { label: 'VS Code', icon: CodeXml, color: '#2f8fe0' },
  netbeans: { label: 'NetBeans', icon: Coffee, color: '#4a8fe0' },
  youtube: { label: 'YouTube', icon: TvMinimalPlay, color: '#ff4d42' },
  docs: { label: 'Google Docs', icon: FileText, color: '#4c8df6' }
} satisfies Record<string, Tool>

interface Task {
  id: string
  title: string
  minutes: number
  color: string
  tools: Tool[]
  steps: { id: string; title: string; done: boolean }[]
  /** Hour it is blocked for on the calendar, or null while it is "flexible". */
  hour: number | null
  done: boolean
}

const INITIAL: Task[] = [
  {
    id: 'api',
    title: 'Build the login API',
    minutes: 50,
    color: '#4c8df6',
    tools: [TOOLS.vscode, TOOLS.docs],
    steps: [
      { id: 'a', title: 'Sketch the endpoints', done: true },
      { id: 'b', title: 'Write the handler', done: true },
      { id: 'c', title: 'Add tests', done: false },
      { id: 'd', title: 'Open the pull request', done: false }
    ],
    hour: 10,
    done: false
  },
  {
    id: 'java',
    title: 'Java lab: linked lists',
    minutes: 45,
    color: '#8b6cf0',
    tools: [TOOLS.netbeans, TOOLS.youtube],
    steps: [
      { id: 'a', title: 'Watch the lecture recap', done: false },
      { id: 'b', title: 'Implement insert and remove', done: false },
      { id: 'c', title: 'Run the provided tests', done: false }
    ],
    hour: null,
    done: false
  },
  {
    id: 'essay',
    title: 'Outline the history essay',
    minutes: 25,
    color: '#23b5a6',
    tools: [TOOLS.docs],
    steps: [
      { id: 'a', title: 'Pick three sources', done: false },
      { id: 'b', title: 'Draft the thesis', done: false }
    ],
    hour: null,
    done: false
  }
]

const HOURS = [9, 10, 11, 12, 13]
const clock = (seconds: number): string => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

function ToolBadge({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  return (
    <span className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full border border-[var(--m-line)] bg-[var(--m-surface)] px-2 text-[11px] font-medium text-[var(--m-muted)]">
      <Icon size={11.5} color={tool.color} strokeWidth={2.3} />
      {tool.label}
    </span>
  )
}

function Progress({ task }: { task: Task }) {
  const done = task.steps.filter((s) => s.done).length
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10.5px] text-[var(--m-muted)]">
      {done}/{task.steps.length}
      <span className="h-1 w-9 overflow-hidden rounded-full bg-[var(--m-line)]">
        <motion.span className="block h-full rounded-full bg-[var(--m-accent)]" animate={{ width: `${(done / task.steps.length) * 100}%` }} />
      </span>
    </span>
  )
}

function Steps({ task, onToggle }: { task: Task; onToggle(stepId: string): void }) {
  return (
    <ul className="space-y-0.5">
      {task.steps.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            role="checkbox"
            aria-checked={s.done}
            onClick={() => onToggle(s.id)}
            className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-[12px] hover:bg-[color-mix(in_oklab,var(--m-ink)_6%,transparent)]"
          >
            <span
              className={cn(
                'grid size-[15px] shrink-0 place-items-center rounded-[4px] border-[1.5px] transition-colors',
                s.done ? 'border-[var(--m-accent)] bg-[var(--m-accent)] text-[var(--m-accent-ink)]' : 'border-[var(--m-muted)] text-transparent'
              )}
            >
              <Check size={10} strokeWidth={3.5} />
            </span>
            <span className={cn('truncate transition-colors', s.done ? 'text-[var(--m-muted)] line-through' : 'text-[var(--m-ink)]')}>{s.title}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** The countdown ring: sixty ticks, going dark clockwise as time passes. */
function Dial({ fraction, running, children }: { fraction: number; running: boolean; children: ReactNode }) {
  const spent = Math.floor((1 - fraction) * 60 + 1e-6)
  return (
    <div className="relative size-[150px] shrink-0 sm:size-[172px]">
      <svg viewBox="0 0 200 200" className="size-full" aria-hidden="true">
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2
          const r1 = i % 5 === 0 ? 76 : 82
          return (
            <line
              key={i}
              x1={100 + r1 * Math.sin(a)}
              y1={100 - r1 * Math.cos(a)}
              x2={100 + 93 * Math.sin(a)}
              y2={100 - 93 * Math.cos(a)}
              stroke={i >= spent ? 'var(--m-accent)' : 'var(--m-line)'}
              strokeOpacity={i >= spent && !running ? 0.55 : 1}
              strokeWidth={i % 5 === 0 ? 3 : 2.2}
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s' }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function AppMockup({ className, startView = 'focus' }: { className?: string; startView?: View }) {
  const { theme } = useTheme()
  const [view, setView] = useState<View>(startView)
  const [tasks, setTasks] = useState<Task[]>(INITIAL)
  const [focusId, setFocusId] = useState('api')
  const [open, setOpen] = useState<string | null>('java')
  const [running, setRunning] = useState(true)
  const focus = tasks.find((t) => t.id === focusId) ?? tasks[0]
  const total = focus.minutes * 60
  const [left, setLeft] = useState(total - 6 * 60 - 18)

  // A real countdown, one second per second, while it is running.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setLeft((s) => (s <= 1 ? total : s - 1)), 1000)
    return () => clearInterval(id)
  }, [running, total])

  const toggleStep = (taskId: string, stepId: string): void =>
    setTasks((list) => list.map((t) => (t.id === taskId ? { ...t, steps: t.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) } : t)))

  const focusOn = (id: string): void => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    setFocusId(id)
    setLeft(task.minutes * 60)
    setRunning(false)
    setView('focus')
  }

  // Flexible -> first free hour; scheduled -> back to flexible.
  const toggleSchedule = (id: string): void =>
    setTasks((list) => {
      const taken = new Set(list.map((t) => t.hour))
      return list.map((t) => (t.id !== id ? t : { ...t, hour: t.hour === null ? (HOURS.find((h) => !taken.has(h)) ?? null) : null }))
    })

  const nav: { id: View; label: string; icon: IconType }[] = [
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays }
  ]

  return (
    <LayoutGroup id={`mock-${startView}`}>
      <div
        style={{ ...themeVars(theme), boxShadow: '0 40px 120px -20px rgb(0 0 0 / 0.75), 0 0 0 1px rgb(255 255 255 / 0.08)' }}
        className={cn(
          'flex h-[430px] select-none flex-col overflow-hidden rounded-[14px] bg-[var(--m-bg)] text-left font-sans text-[var(--m-ink)] transition-colors duration-300 sm:h-[460px]',
          className
        )}
      >
        {/* Title bar with Windows caption buttons */}
        <div className="flex h-9 shrink-0 items-center bg-[var(--m-rail)] pl-3 transition-colors duration-300">
          <Logo size={15} />
          <span className="ml-2 text-[11.5px] font-medium text-[var(--m-muted)]">FocusFlow</span>
          <span className="ml-3 hidden items-center gap-1.5 rounded-full border border-[var(--m-line)] px-2 py-0.5 font-mono text-[10px] text-[var(--m-muted)] sm:inline-flex">
            <span className={cn('size-1.5 rounded-full', running ? 'bg-[var(--m-accent)]' : 'bg-[var(--m-muted)]')} />
            {clock(left)}
          </span>
          <span className="flex-1" />
          {[Minus, Square, X].map((Glyph, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn('grid h-9 w-11 place-items-center text-[var(--m-muted)] transition-colors', i === 2 ? 'hover:bg-[#e81123] hover:text-white' : 'hover:bg-[color-mix(in_oklab,var(--m-ink)_10%,transparent)]')}
            >
              <Glyph size={i === 1 ? 10 : 13} strokeWidth={1.8} />
            </span>
          ))}
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Sidebar */}
          <div className="flex w-[58px] shrink-0 flex-col items-center gap-1 bg-[var(--m-rail)] pt-2 transition-colors duration-300 sm:w-[68px]" role="tablist" aria-label="Demo views">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={cn('relative flex w-[48px] flex-col items-center gap-0.5 rounded-lg py-1.5 text-[9.5px] font-medium sm:w-[56px]', view === id ? 'text-[var(--m-accent)]' : 'text-[var(--m-muted)] hover:text-[var(--m-ink)]')}
              >
                {view === id && <motion.span layoutId="mock-nav" className="absolute inset-0 rounded-lg bg-[var(--m-accent-soft)]" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
                <Icon size={16} className="relative" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mock-scroll absolute inset-0 overflow-y-auto p-4 sm:p-5"
              >
                {view === 'focus' && (
                  <div className="flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <Dial fraction={left / total} running={running}>
                      <div className="text-center">
                        <div className="font-mono text-[30px] font-semibold leading-none tracking-tight sm:text-[34px]">{clock(left)}</div>
                        <div className="mt-1.5 text-[10.5px] text-[var(--m-muted)]">{running ? 'Focusing' : 'Paused'}</div>
                      </div>
                    </Dial>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[19px] font-bold leading-tight tracking-[-0.02em] sm:text-[22px]">{focus.title}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {focus.tools.map((t) => (
                          <ToolBadge key={t.label} tool={t} />
                        ))}
                        <Progress task={focus} />
                      </div>
                      <div className="mt-2.5 max-w-[300px]">
                        <Steps task={focus} onToggle={(id) => toggleStep(focus.id, id)} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRunning((r) => !r)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--m-accent)] px-3 text-[12px] font-semibold text-[var(--m-accent-ink)] transition-transform active:scale-95"
                        >
                          {running ? <Pause size={13} /> : <Play size={13} />}
                          {running ? 'Pause' : 'Start'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLeft(total)
                            setRunning(false)
                          }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--m-surface)] px-3 text-[12px] font-medium transition-transform active:scale-95"
                        >
                          <RotateCcw size={12} />
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {view === 'tasks' && (
                  <div>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="font-display text-[18px] font-bold tracking-[-0.02em]">Tasks</span>
                      <span className="text-[11px] text-[var(--m-muted)]">{tasks.filter((t) => !t.done).length} to do</span>
                    </div>
                    <ul className="border-t border-[var(--m-line)]">
                      {tasks.map((task) => (
                        <li key={task.id} className="border-b border-[var(--m-line)] py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label={`Mark "${task.title}" as ${task.done ? 'to do' : 'done'}`}
                              onClick={() => setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))}
                              className={cn('grid size-[18px] shrink-0 place-items-center rounded-full border-[1.5px] transition-colors', task.done ? 'border-[var(--m-accent)] bg-[var(--m-accent)] text-[var(--m-accent-ink)]' : 'border-[var(--m-muted)] text-transparent hover:border-[var(--m-accent)]')}
                            >
                              <Check size={11} strokeWidth={3.2} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className={cn('truncate text-[13px] font-medium', task.done && 'text-[var(--m-muted)] line-through')}>{task.title}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  aria-expanded={open === task.id}
                                  onClick={() => setOpen(open === task.id ? null : task.id)}
                                  className="inline-flex h-[22px] items-center gap-1 rounded-full border border-[var(--m-line)] pl-1 pr-2 hover:border-[var(--m-muted)]"
                                >
                                  <ChevronRight size={11} className={cn('text-[var(--m-muted)] transition-transform', open === task.id && 'rotate-90')} />
                                  <Progress task={task} />
                                </button>
                                {task.tools.map((t) => (
                                  <ToolBadge key={t.label} tool={t} />
                                ))}
                              </div>
                            </div>
                            <span className="hidden font-mono text-[10.5px] text-[var(--m-muted)] sm:block">{task.minutes}m</span>
                            <button
                              type="button"
                              onClick={() => focusOn(task.id)}
                              className={cn('shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors', task.id === focusId ? 'text-[var(--m-accent)]' : 'text-[var(--m-ink)] hover:bg-[var(--m-surface)]')}
                            >
                              {task.id === focusId ? 'In focus' : 'Focus now'}
                            </button>
                          </div>
                          <AnimatePresence initial={false}>
                            {open === task.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="pb-1 pl-[26px] pt-1.5">
                                  <Steps task={task} onToggle={(id) => toggleStep(task.id, id)} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {view === 'calendar' && (
                  <div className="flex h-full flex-col">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="font-display text-[18px] font-bold tracking-[-0.02em]">Today</span>
                      <span className="text-[10.5px] text-[var(--m-muted)]">Click a flexible task to give it a time</span>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-[var(--m-line)] bg-[var(--m-surface)]">
                      <div className="flex min-h-[40px] items-center gap-2 border-b-2 border-[var(--m-line)] px-2 py-1.5">
                        <span className="w-12 shrink-0 font-mono text-[9.5px] text-[var(--m-muted)]">Flexible</span>
                        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                          {tasks.filter((t) => t.hour === null).map((t) => (
                            <motion.button
                              key={t.id}
                              layoutId={`cal-${t.id}`}
                              type="button"
                              onClick={() => toggleSchedule(t.id)}
                              style={{ borderLeftColor: t.color, borderLeftStyle: 'solid' }}
                              className="inline-flex h-6 max-w-full items-center gap-1.5 rounded-md border border-dashed border-[var(--m-line)] border-l-[3px] bg-[var(--m-bg)] px-2 text-[11px] font-medium"
                            >
                              <Circle size={10} className="shrink-0 text-[var(--m-muted)]" />
                              <span className="truncate">{t.title}</span>
                            </motion.button>
                          ))}
                          {tasks.every((t) => t.hour !== null) && <span className="text-[11px] text-[var(--m-muted)]">Everything has a time.</span>}
                        </div>
                      </div>
                      {HOURS.map((h) => {
                        const task = tasks.find((t) => t.hour === h)
                        return (
                          <div key={h} className="flex h-[46px] items-stretch gap-2 border-b border-[var(--m-line)] px-2 py-1 last:border-b-0">
                            <span className="w-12 shrink-0 pt-0.5 font-mono text-[9.5px] text-[var(--m-muted)]">{String(h).padStart(2, '0')}:00</span>
                            {task && (
                              <motion.button
                                layoutId={`cal-${task.id}`}
                                type="button"
                                onClick={() => toggleSchedule(task.id)}
                                style={{ borderLeftColor: task.color, background: `color-mix(in oklab, ${task.color} 22%, var(--m-surface))` }}
                                className="flex min-w-0 flex-1 flex-col justify-center rounded-md border-l-[3px] px-2 text-left"
                              >
                                <span className="truncate text-[11.5px] font-semibold">{task.title}</span>
                                <span className="font-mono text-[9.5px] text-[var(--m-muted)]">
                                  {String(h).padStart(2, '0')}:00 · {task.minutes}m
                                </span>
                              </motion.button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LayoutGroup>
  )
}
