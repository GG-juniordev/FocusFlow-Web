import { createContext, useContext, useMemo, useState, type CSSProperties, type ReactNode } from 'react'

/** Colours of the mock FocusFlow window. The real app lets you change the same three. */
export interface MockTheme {
  bg: string
  surface: string
  accent: string
}

export interface Preset extends MockTheme {
  id: string
  name: string
}

export const PRESETS: Preset[] = [
  { id: 'slate', name: 'Deep Slate', bg: '#161a24', surface: '#1d2230', accent: '#f0a63a' },
  { id: 'oled', name: 'Pure Black', bg: '#000000', surface: '#111216', accent: '#5dbb63' },
  { id: 'midnight', name: 'Midnight Blue', bg: '#0d1430', surface: '#172045', accent: '#4c8df6' },
  { id: 'forest', name: 'Night Forest', bg: '#101a17', surface: '#1a2723', accent: '#23b5a6' },
  { id: 'paper', name: 'Warm Paper', bg: '#f3ede1', surface: '#fffaf0', accent: '#8b6cf0' },
  { id: 'gray', name: 'Soft Gray', bg: '#e4e6ea', surface: '#f6f7f9', accent: '#ef6f5e' }
]

export const ACCENTS = ['#f0a63a', '#ef6f5e', '#e0569b', '#8b6cf0', '#4c8df6', '#23b5a6', '#5dbb63']

function channels(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const isHex = (v: string): boolean => /^#[0-9a-f]{6}$/i.test(v)

/** CSS variables for a mock window. Text colours follow the background so they stay readable. */
export function themeVars(theme: MockTheme): CSSProperties {
  const light = luminance(theme.bg) > 0.4
  const ink = light ? '#171a22' : '#eceff5'
  return {
    '--m-bg': theme.bg,
    '--m-surface': theme.surface,
    '--m-accent': theme.accent,
    '--m-ink': ink,
    '--m-muted': `color-mix(in oklab, ${ink} 58%, ${theme.surface})`,
    '--m-line': `color-mix(in oklab, ${ink} 14%, ${theme.surface})`,
    '--m-rail': `color-mix(in oklab, ${theme.bg} ${light ? 94 : 76}%, #000)`,
    '--m-accent-ink': luminance(theme.accent) > 0.36 ? '#15171d' : '#ffffff',
    '--m-accent-soft': `color-mix(in oklab, ${theme.accent} 18%, transparent)`
  } as CSSProperties
}

interface ThemeApi {
  theme: MockTheme
  presetId: string | null
  setPreset(id: string): void
  set(patch: Partial<MockTheme>): void
}

const ThemeContext = createContext<ThemeApi | null>(null)

/** One theme shared by every mock window on the page, so changing it anywhere changes them all. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<MockTheme>(PRESETS[0])
  const api = useMemo<ThemeApi>(() => {
    const match = PRESETS.find((p) => p.bg === theme.bg && p.surface === theme.surface && p.accent === theme.accent)
    return {
      theme,
      presetId: match?.id ?? null,
      setPreset: (id) => {
        const preset = PRESETS.find((p) => p.id === id)
        if (preset) setTheme({ bg: preset.bg, surface: preset.surface, accent: preset.accent })
      },
      set: (patch) =>
        setTheme((current) => {
          const next = { ...current, ...patch }
          return isHex(next.bg) && isHex(next.surface) && isHex(next.accent) ? next : current
        })
    }
  }, [theme])
  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeApi {
  const api = useContext(ThemeContext)
  if (!api) throw new Error('useTheme must be used inside ThemeProvider')
  return api
}
