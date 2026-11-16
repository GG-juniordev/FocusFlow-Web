import { useEffect, useState, useSyncExternalStore, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDownToLine, CircleAlert, LoaderCircle } from 'lucide-react'
import { RELEASES_URL, formatSize, resolveRelease, useRepo, type ReleaseInfo } from '../lib/github'
import { Magnetic, WindowsGlyph, cn } from './ui'

/* ---------- "Starting download…" message, shared by every button ---------- */

interface Notice {
  id: number
  kind: 'download' | 'fallback'
  detail: string
}

let notice: Notice | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function announce(kind: Notice['kind'], detail: string): void {
  notice = { id: Date.now(), kind, detail }
  listeners.forEach((l) => l())
  clearTimeout(timer)
  timer = setTimeout(() => {
    notice = null
    listeners.forEach((l) => l())
  }, 4200)
}

const subscribe = (l: () => void): (() => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Bottom-centre confirmation that a download has begun. Rendered once, near the page root. */
export function DownloadToast() {
  const current = useSyncExternalStore(subscribe, () => notice)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {current && (
          <motion.div
            key="download-toast"
            role="status"
            data-testid="download-toast"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="flex max-w-full items-center gap-3 rounded-2xl border border-white/15 py-3 pl-3.5 pr-5"
            style={{ background: '#17191f', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.85)' }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
              {current.kind === 'download' ? <ArrowDownToLine size={17} /> : <CircleAlert size={17} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-ink">
                {current.kind === 'download' ? 'Starting download…' : 'Opening the releases page'}
              </span>
              <span className="block truncate font-mono text-[11.5px] text-dim">{current.detail}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- starting the download ---------- */

export const describe = (release: ReleaseInfo): string =>
  [release.fileName, release.tag, release.sizeBytes ? formatSize(release.sizeBytes) : null].filter(Boolean).join(' · ')

/**
 * Start downloading a file without leaving the page: a temporary link with the
 * `download` attribute is clicked for the visitor. GitHub serves release assets
 * as attachments, so the browser saves the file instead of navigating to it.
 */
function saveFile(url: string, fileName: string | null): void {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName ?? ''
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

/* ---------- the button ---------- */

interface Props {
  size?: 'md' | 'lg'
  label: string
  /** Replaces `label` on narrow screens so the button stays on one line. */
  shortLabel?: string
  className?: string
}

/**
 * Downloads the installer directly. The link's href is the .exe itself as soon as
 * GitHub has answered; a click before that waits for the answer and then starts
 * the download. Only if no release has an .exe does it open the releases page.
 */
export function DownloadButton({ size = 'md', label, shortLabel, className }: Props) {
  const { release } = useRepo()
  const [starting, setStarting] = useState(false)
  const url = release?.downloadUrl ?? null

  useEffect(() => {
    if (!starting) return
    const id = setTimeout(() => setStarting(false), 2600)
    return () => clearTimeout(id)
  }, [starting])

  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (starting) {
      event.preventDefault() // a second click while one download is starting
      return
    }
    setStarting(true)
    if (url && release) {
      // The href already is the file: let the browser download it.
      announce('download', describe(release))
      return
    }
    // Clicked before GitHub answered (or nothing was found): wait, then decide.
    event.preventDefault()
    void resolveRelease().then((found) => {
      if (found?.downloadUrl) {
        announce('download', describe(found))
        saveFile(found.downloadUrl, found.fileName)
      } else {
        announce('fallback', 'No installer is attached to a release yet')
        window.location.assign(RELEASES_URL)
      }
    })
  }

  const large = size === 'lg'
  return (
    <Magnetic className={className}>
      <a
        href={url ?? RELEASES_URL}
        // `download` plus the direct file URL: the browser saves the .exe and stays on this page.
        {...(url ? { download: release?.fileName ?? '' } : {})}
        onClick={onClick}
        aria-busy={starting}
        data-testid="download"
        data-size={size}
        className={cn(
          'group relative isolate inline-flex select-none items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full bg-amber font-semibold leading-none text-[#1a1206] transition-[filter,transform] duration-200 [transform:translateZ(0)] hover:brightness-110 active:scale-[0.97]',
          large ? 'h-14 px-6 text-[15px] sm:px-7 sm:text-[16px]' : 'h-10 px-4 text-[13.5px]'
        )}
        style={{ boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.25), 0 10px 40px -8px rgb(245 169 59 / 0.55)' }}
      >
        {/* Shimmer: clipped by the pill (overflow-hidden + isolate), so it never spills past the rounded ends. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/55 to-transparent" />

        <span className="grid size-[1.1em] shrink-0 place-items-center">
          {starting ? <LoaderCircle className="size-full animate-spin" strokeWidth={2.6} /> : <WindowsGlyph size={large ? 16 : 14} />}
        </span>

        {/* Both labels occupy the same grid cell, so the button keeps one width while the text changes. */}
        <span className="grid items-center justify-items-center">
          <span className={cn('col-start-1 row-start-1 transition-opacity duration-150', starting && 'opacity-0')} aria-hidden={starting}>
            <span className={cn(shortLabel && 'hidden sm:inline')}>{label}</span>
            {shortLabel && <span className="sm:hidden">{shortLabel}</span>}
          </span>
          <span className={cn('col-start-1 row-start-1 transition-opacity duration-150', !starting && 'opacity-0')} aria-hidden={!starting}>
            {large ? 'Starting download…' : 'Starting…'}
          </span>
        </span>

        {large && <ArrowDownToLine className="size-[1.15em] shrink-0 transition-transform duration-200 group-hover:translate-y-0.5" />}
      </a>
    </Magnetic>
  )
}

/**
 * File name, version and size under the main buttons. It always occupies the same
 * height, so nothing shifts when the details arrive from GitHub.
 */
export function DownloadMeta({ className }: { className?: string }) {
  const { release, loading } = useRepo()
  const text = loading
    ? 'Checking the latest release…'
    : release?.downloadUrl
      ? describe(release)
      : 'No installer published yet · opens the GitHub releases page'
  return (
    <p data-testid="download-meta" className={cn('flex min-h-[2.6em] items-start justify-center font-mono text-[12px] leading-[1.3] text-faint sm:min-h-[1.3em]', className)}>
      <span className={cn('transition-opacity duration-300', loading && 'opacity-60')}>{text}</span>
    </p>
  )
}
