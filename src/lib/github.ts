import { useEffect, useState } from 'react'

/** The one place the repository is named. Every link and API call derives from it. */
export const REPO = 'GG-juniordev/FocusFlow'
export const REPO_URL = `https://github.com/${REPO}`
export const RELEASES_URL = `${REPO_URL}/releases`
export const ISSUES_URL = `${REPO_URL}/issues`
const API = `https://api.github.com/repos/${REPO}`

export interface ReleaseInfo {
  /** e.g. "v1.0.0" */
  tag: string
  /**
   * The installer's `browser_download_url`: a direct link to the .exe file itself
   * (github.com/<repo>/releases/download/<tag>/<file>.exe), never a web page.
   * Null only if no release has an .exe attached.
   */
  downloadUrl: string | null
  fileName: string | null
  sizeBytes: number | null
  /** The release's page on GitHub, for "release notes" links only. */
  pageUrl: string
}

export interface RepoInfo {
  /** null while loading or if GitHub could not be reached. */
  stars: number | null
  /** null while loading, if there is no release yet, or on error. */
  release: ReleaseInfo | null
  loading: boolean
}

interface Loaded {
  at: number
  stars: number | null
  release: ReleaseInfo | null
}

type Json = Record<string, unknown>

const CACHE_KEY = 'focusflow-site:github:v2'
/** A found installer is remembered for ten minutes; "nothing found" only for one, so a new release shows up quickly. */
const ttl = (loaded: Loaded): number => (loaded.release?.downloadUrl ? 10 : 1) * 60 * 1000

function readCache(): Loaded | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Loaded
    return Date.now() - parsed.at < ttl(parsed) ? parsed : null
  } catch {
    return null
  }
}

async function getJson(url: string): Promise<unknown> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    // 404 (no release yet) and 403 (rate limit) both mean "nothing usable here".
    if (!response.ok) return null
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

/** The .exe attached to a release, preferring one named like an installer. */
function installerOf(release: Json): Json | undefined {
  const assets = Array.isArray(release.assets) ? (release.assets as Json[]) : []
  const exes = assets.filter(
    (a) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.exe') && typeof a.browser_download_url === 'string'
  )
  return exes.find((a) => /setup|install/i.test(a.name as string)) ?? exes[0]
}

function toInfo(release: Json): ReleaseInfo | null {
  if (typeof release.tag_name !== 'string') return null
  const asset = installerOf(release)
  return {
    tag: release.tag_name,
    downloadUrl: asset ? (asset.browser_download_url as string) : null,
    fileName: asset ? (asset.name as string) : null,
    sizeBytes: asset && typeof asset.size === 'number' ? asset.size : null,
    pageUrl: typeof release.html_url === 'string' ? release.html_url : RELEASES_URL
  }
}

const isRelease = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Find the installer to offer.
 * 1. /releases/latest, if it is a full release with an .exe attached.
 * 2. Otherwise the releases list: the newest full release with an .exe, then the
 *    newest pre-release with one.
 * If no release anywhere has an .exe, returns the newest release without a
 * download link (so the version can still be shown), or null.
 */
async function findRelease(): Promise<ReleaseInfo | null> {
  const latest = await getJson(`${API}/releases/latest`)
  if (isRelease(latest) && latest.prerelease !== true && installerOf(latest)) return toInfo(latest)

  const listJson = await getJson(`${API}/releases?per_page=20`)
  const list = Array.isArray(listJson) ? listJson.filter(isRelease).filter((r) => r.draft !== true) : []
  const withInstaller = list.filter((r) => installerOf(r))
  const best = withInstaller.find((r) => r.prerelease !== true) ?? withInstaller[0] ?? (isRelease(latest) ? latest : list[0])
  return best ? toInfo(best) : null
}

let inFlight: Promise<Loaded> | null = null

function load(): Promise<Loaded> {
  const cached = readCache()
  if (cached) return Promise.resolve(cached)
  inFlight ??= Promise.all([getJson(API), findRelease()])
    .then(([repo, release]) => {
      const loaded: Loaded = {
        at: Date.now(),
        stars: isRelease(repo) && typeof repo.stargazers_count === 'number' ? repo.stargazers_count : null,
        release
      }
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(loaded))
      } catch {
        // Private browsing: just skip the cache.
      }
      return loaded
    })
    .finally(() => {
      inFlight = null
    })
  return inFlight
}

/** Resolves once the release lookup has finished. Used when Download is clicked before it has. */
export const resolveRelease = (): Promise<ReleaseInfo | null> => load().then((loaded) => loaded.release)

/**
 * Live star count and latest release, fetched on page load and cached briefly
 * (GitHub allows 60 anonymous requests an hour per visitor).
 */
export function useRepo(): RepoInfo {
  const [info, setInfo] = useState<RepoInfo>(() => {
    const cached = readCache()
    return cached ? { stars: cached.stars, release: cached.release, loading: false } : { stars: null, release: null, loading: true }
  })

  useEffect(() => {
    if (!info.loading) return
    let alive = true
    void load().then((r) => alive && setInfo({ stars: r.stars, release: r.release, loading: false }))
    return () => {
      alive = false
    }
  }, [info.loading])

  return info
}

export function formatSize(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`
}

export function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n)
}
