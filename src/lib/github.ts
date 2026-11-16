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
  /** Direct link to the .exe, or null if the release has no installer attached. */
  downloadUrl: string | null
  fileName: string | null
  sizeBytes: number | null
  pageUrl: string
  publishedAt: string | null
}

export interface RepoInfo {
  /** null while loading or if GitHub could not be reached. */
  stars: number | null
  /** null while loading, if there is no release yet, or on error. */
  release: ReleaseInfo | null
  loading: boolean
}

const CACHE_KEY = 'focusflow-site:github:v1'
const CACHE_MS = 10 * 60 * 1000

interface Cached {
  at: number
  stars: number | null
  release: ReleaseInfo | null
}

function readCache(): Cached | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Cached
    return Date.now() - parsed.at < CACHE_MS ? parsed : null
  } catch {
    return null
  }
}

async function getJson(url: string): Promise<unknown> {
  try {
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    // Rate limits answer 403; treat any failure as "unknown" and fall back to plain links.
    if (!response.ok) return null
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

function parseRelease(list: unknown): ReleaseInfo | null {
  // Newest first. Skip drafts and pre-releases.
  const json = Array.isArray(list)
    ? (list as Record<string, unknown>[]).find((r) => r && r.draft !== true && r.prerelease !== true)
    : undefined
  if (!json || typeof json.tag_name !== 'string') return null
  const assets = Array.isArray(json.assets) ? (json.assets as Record<string, unknown>[]) : []
  const installers = assets.filter((a) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.exe'))
  // Prefer the file named like the installer if several .exe files are attached.
  const asset = installers.find((a) => /setup|install/i.test(a.name as string)) ?? installers[0]
  return {
    tag: json.tag_name,
    downloadUrl: asset && typeof asset.browser_download_url === 'string' ? asset.browser_download_url : null,
    fileName: asset ? (asset.name as string) : null,
    sizeBytes: asset && typeof asset.size === 'number' ? asset.size : null,
    pageUrl: typeof json.html_url === 'string' ? json.html_url : RELEASES_URL,
    publishedAt: typeof json.published_at === 'string' ? json.published_at : null
  }
}

let inFlight: Promise<Cached> | null = null

function load(): Promise<Cached> {
  inFlight ??= Promise.all([getJson(API), getJson(`${API}/releases?per_page=5`)]).then(([repoJson, latest]) => {
    const repo = repoJson && typeof repoJson === 'object' ? (repoJson as Record<string, unknown>) : null
    const result: Cached = {
      at: Date.now(),
      stars: repo && typeof repo.stargazers_count === 'number' ? repo.stargazers_count : null,
      release: parseRelease(latest)
    }
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(result))
    } catch {
      // Private browsing: just skip the cache.
    }
    return result
  })
  return inFlight
}

/**
 * Live star count and latest release, fetched once per visit and cached for ten
 * minutes (GitHub allows 60 anonymous requests an hour per visitor). Everything
 * on the page works without it: links fall back to the releases page.
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
