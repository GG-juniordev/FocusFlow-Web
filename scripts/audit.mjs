// Website audit. Builds nothing itself: point it at a running copy of the site.
//   node scripts/audit.mjs http://localhost:5180/
// It checks (1) that every Download button downloads the .exe directly, including
// the slow-network and failure cases, using stand-in GitHub responses, and
// (2) layout at 1440, 1280, 768 and 375 px: overflow, clipping, alignment,
// button sizes, equal card heights and text contrast. Screenshots go to .audit/.
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '..', '.audit')
mkdirSync(out, { recursive: true })
// playwright-core is installed with the desktop app in the parent folder.
const { chromium } = createRequire(resolve(here, '..', '..', 'package.json'))('playwright-core')
const url = process.argv[2] ?? 'http://localhost:5180/'
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const REPO = 'GG-juniordev/FocusFlow'
const RELEASES = `https://github.com/${REPO}/releases`
const EXE = `https://github.com/${REPO}/releases/download/v9.9.9/FocusFlow-Setup-9.9.9.exe`
const release = (over = {}) => ({
  tag_name: 'v9.9.9',
  draft: false,
  prerelease: false,
  html_url: `${RELEASES}/tag/v9.9.9`,
  assets: [
    { name: 'latest.yml', size: 300, browser_download_url: `${RELEASES}/download/v9.9.9/latest.yml` },
    { name: 'FocusFlow-Setup-9.9.9.EXE'.replace('EXE', 'exe'), size: 121_634_816, browser_download_url: EXE }
  ],
  ...over
})

const problems = []
const check = (ok, msg) => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${msg}`)
  if (!ok) problems.push(msg)
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

/** A fresh visitor (empty cache) with GitHub answered by `api`. */
async function visit({ width = 1440, height = 900, api, live = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, acceptDownloads: true })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)))
  page.on('pageerror', (e) => errors.push(e.message))
  if (!live) {
    await page.route('https://api.github.com/**', async (route) => {
      const path = new URL(route.request().url()).pathname
      const answer = await api(path)
      if (answer === 'abort') return route.abort()
      return route.fulfill({ status: answer.status ?? 200, contentType: 'application/json', body: JSON.stringify(answer.body ?? {}) })
    })
  }
  // The installer itself: answer like GitHub does, as an attachment, without fetching 116 MB.
  await page.route('https://github.com/**/releases/download/**', (route) =>
    route.fulfill({ status: 200, headers: { 'content-type': 'application/octet-stream', 'content-disposition': 'attachment; filename=FocusFlow-Setup.exe' }, body: 'stub' })
  )
  await page.route(RELEASES, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>releases page</title>' }))
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  return { page, context, errors }
}

const normal = (path) => (path.endsWith('/releases/latest') ? { body: release() } : path.endsWith('/releases') ? { body: [release()] } : { body: { stargazers_count: 42 } })
const links = (page) => page.getByTestId('download').evaluateAll((els) => els.map((e) => ({ href: e.getAttribute('href'), download: e.getAttribute('download'), target: e.getAttribute('target') })))

/* ================= 1. download behaviour ================= */
console.log('Download: release with an .exe')
{
  const { page, context, errors } = await visit({ api: normal })
  await page.waitForFunction(() => document.querySelector('[data-testid=download]')?.getAttribute('href')?.endsWith('.exe'))
  const found = await links(page)
  check(found.length === 3, `three Download buttons (navbar, hero, download card): found ${found.length}`)
  check(found.every((l) => l.href === EXE), 'each href is the asset browser_download_url (the .exe itself, not a release page)')
  check(found.every((l) => l.download === 'FocusFlow-Setup-9.9.9.exe' && l.target === null), 'each has the download attribute with the file name, and no target=_blank')
  const meta = await page.getByTestId('download-meta').first().innerText()
  check(meta.includes('FocusFlow-Setup-9.9.9.exe') && meta.includes('v9.9.9') && meta.includes('116 MB'), `file name, version and size are shown ("${meta.trim()}")`)

  for (const [i, where] of ['navbar', 'hero', 'download card'].entries()) {
    const button = page.getByTestId('download').nth(i)
    await button.scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
    const pagesBefore = context.pages().length
    const [download] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), button.click()])
    check(download.url() === EXE, `${where}: clicking downloads the .exe`)
    check(page.url() === url && context.pages().length === pagesBefore, `${where}: the visitor stays on the landing page, no new tab`)
    if (i === 1) {
      check(await page.getByTestId('download-toast').getByText('Starting download…').isVisible(), 'a "Starting download…" message appears')
      check((await button.getAttribute('aria-busy')) === 'true' && (await button.getByText('Starting download…').isVisible()), 'the button itself shows "Starting download…"')
      await page.screenshot({ path: resolve(out, 'download-starting.png') })
    }
    await page.waitForTimeout(3000)
  }
  check(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await context.close()
}

console.log('Download: clicked before GitHub has answered')
{
  const slow = async (path) => {
    await new Promise((r) => setTimeout(r, 2500))
    return normal(path)
  }
  const { page, context } = await visit({ api: slow })
  const button = page.getByTestId('download').nth(1)
  await button.waitFor()
  check((await button.getAttribute('href')) === RELEASES, 'while loading, the href is only a fallback')
  const started = Date.now()
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 12000 }), button.click()])
  check(download.url() === EXE && Date.now() - started > 900, `the click waits for the lookup, then downloads the .exe (${Date.now() - started} ms later)`)
  check(page.url() === url, 'still on the landing page')
  await context.close()
}

console.log('Download: /releases/latest is missing or a pre-release')
{
  const { page, context } = await visit({ api: (p) => (p.endsWith('/releases/latest') ? { status: 404, body: { message: 'Not Found' } } : p.endsWith('/releases') ? { body: [release({ draft: true }), release()] } : { body: {} }) })
  await page.waitForFunction(() => document.querySelector('[data-testid=download]')?.getAttribute('href')?.endsWith('.exe')).catch(() => {})
  check((await links(page)).every((l) => l.href === EXE), 'falls back to the releases list and still links the .exe')
  await context.close()
  const pre = await visit({ api: (p) => (p.endsWith('/releases/latest') ? { body: release({ assets: [] }) } : p.endsWith('/releases') ? { body: [release({ assets: [] }), release({ prerelease: true })] } : { body: {} }) })
  await pre.page.waitForFunction(() => document.querySelector('[data-testid=download]')?.getAttribute('href')?.endsWith('.exe')).catch(() => {})
  check((await links(pre.page)).every((l) => l.href === EXE), 'finds an .exe on an older or pre-release when the latest has none')
  await pre.context.close()
}

console.log('Download: no installer anywhere, or GitHub unreachable')
for (const [label, api] of [['no .exe in any release', (p) => (p.endsWith('/releases/latest') ? { body: release({ assets: [] }) } : p.endsWith('/releases') ? { body: [release({ assets: [] })] } : { body: {} })], ['API request fails', () => 'abort']]) {
  const { page, context } = await visit({ api })
  await page.waitForFunction(() => /No installer|releases page/.test(document.querySelector('[data-testid=download-meta]')?.textContent ?? ''))
  await Promise.all([page.waitForURL(RELEASES, { timeout: 8000 }).catch(() => {}), page.getByTestId('download').nth(1).click()])
  check(page.url() === RELEASES, `${label}: falls back to ${RELEASES}`)
  await context.close()
}

console.log('Download: live GitHub data')
{
  const { page, context } = await visit({ live: true })
  await page.waitForFunction(() => !/Checking/.test(document.querySelector('[data-testid=download-meta]')?.textContent ?? ''), null, { timeout: 15000 }).catch(() => {})
  const found = await links(page)
  const meta = (await page.getByTestId('download-meta').first().innerText()).trim()
  console.log(`      live: ${found[0]?.href}\n      live: ${meta}`)
  check(found.every((l) => /^https:\/\/github\.com\/GG-juniordev\/FocusFlow\/releases\/download\/.+\.exe$/i.test(l.href ?? '')), 'with the real repository, every button links the published .exe')
  await context.close()
}

/* ================= 2. layout at four widths ================= */
const measure = () => {
  const out = []
  const vw = document.documentElement.clientWidth
  const rgb = (c) => (c.match(/[\d.]+/g) ?? []).map(Number)
  const lum = ([r, g, b]) => [r, g, b].map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0)
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
  const label = (el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 28)}"`
  const truncates = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.textOverflow === 'ellipsis' || /auto|scroll/.test(cs.overflowX + cs.overflowY)) return true
    }
    return false
  }
  if (document.documentElement.scrollWidth > vw + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth} > ${vw})`)

  for (const el of document.querySelectorAll('header *, main *, footer *')) {
    if (el.closest('[aria-hidden=true], svg, [style*="--m-bg"]')) continue // decoration and the demo windows
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const cs = getComputedStyle(el)
    if (r.right > vw + 1 && cs.position !== 'fixed' && !truncates(el)) out.push(`outside the right edge: ${label(el)}`)
    if (r.left < -1 && !truncates(el)) out.push(`outside the left edge: ${label(el)}`)
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!ownText) continue
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && !truncates(el)) out.push(`clipped text: ${label(el)}`)
    // Contrast against the page canvas, for text that sits on it or on near-transparent glass.
    if (cs.backgroundClip === 'text' || el.closest('[data-testid=download], [data-testid=download-toast]')) continue
    let solid = false
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const [, , , a = 1] = rgb(getComputedStyle(n).backgroundColor)
      if (a > 0.35) solid = true
    }
    const [r1, g1, b1, alpha = 1] = rgb(cs.color)
    if (!solid && alpha === 1 && ratio([r1, g1, b1], [9, 9, 11]) < 4.5) out.push(`low contrast (${ratio([r1, g1, b1], [9, 9, 11]).toFixed(1)}:1): ${label(el)}`)
  }

  // Download buttons: one line, the right height, icon and label on one centre line.
  for (const b of document.querySelectorAll('[data-testid=download]')) {
    const r = b.getBoundingClientRect()
    const want = b.dataset.size === 'lg' ? 56 : 40
    if (Math.abs(r.height - want) > 0.6) out.push(`download button height ${r.height.toFixed(1)}, expected ${want}`)
    const mid = r.top + r.height / 2
    for (const part of b.querySelectorAll(':scope > span:not([aria-hidden]), :scope > svg')) {
      const p = part.getBoundingClientRect()
      if (p.height && Math.abs(p.top + p.height / 2 - mid) > 1.5) out.push(`download button content off-centre by ${(p.top + p.height / 2 - mid).toFixed(1)}px`)
      if (p.left < r.left + 8 || p.right > r.right - 8) out.push('download button content touches its edge')
    }
  }
  const secondary = document.querySelector('#top a[href$="/FocusFlow"].glass')
  const primary = document.querySelector('#top main [data-testid=download], #top [data-size=lg]')
  if (secondary && primary && Math.abs(secondary.getBoundingClientRect().height - primary.getBoundingClientRect().height) > 0.6) out.push('hero buttons differ in height')

  // The navbar must fit its pill.
  const nav = document.querySelector('header nav')
  if (nav && nav.scrollWidth > nav.clientWidth + 1) out.push(`navbar content overflows (${nav.scrollWidth} > ${nav.clientWidth})`)
  for (const a of nav?.querySelectorAll('a') ?? []) if (a.getBoundingClientRect().height > 44) out.push(`navbar item wraps: ${label(a)}`)

  // Cards that share a row must be the same height.
  const cards = [...document.querySelectorAll('#features .spot')].map((c) => c.getBoundingClientRect())
  for (const a of cards) for (const b of cards) if (a !== b && Math.abs(a.top - b.top) < 2 && Math.abs(a.height - b.height) > 1.5) out.push(`bento cards in one row differ in height (${a.height.toFixed(0)} vs ${b.height.toFixed(0)})`)
  // No bento card should be too narrow for its content.
  for (const c of cards) if (c.width < 300) out.push(`bento card only ${c.width.toFixed(0)}px wide`)
  return [...new Set(out)]
}

for (const [width, height] of [[1440, 900], [1280, 800], [768, 1024], [375, 812]]) {
  console.log(`Layout at ${width}px`)
  const { page, context, errors } = await visit({ width, height, api: normal })
  await page.waitForFunction(() => document.querySelector('[data-testid=download]')?.getAttribute('href')?.endsWith('.exe'))

  // Nothing may move when the release details arrive: compare with a visitor still waiting for them.
  const yOf = (p) => p.evaluate(() => document.querySelector('#top a.glass[href$="/FocusFlow"]').getBoundingClientRect().bottom + window.scrollY)
  const waiting = await visit({ width, height, api: () => new Promise(() => {}) })
  await waiting.page.waitForTimeout(1200)
  await page.waitForTimeout(1200)
  const [a, b] = [await yOf(waiting.page), await yOf(page)]
  const metaY = (p) => p.evaluate(() => { const r = document.querySelector('[data-testid=download-meta]').getBoundingClientRect(); return r.bottom + window.scrollY })
  check(Math.abs(a - b) < 1 && Math.abs((await metaY(waiting.page)) - (await metaY(page))) < 1, 'no layout shift when the version and size load')
  await waiting.context.close()

  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(140)
  }
  await page.waitForTimeout(600)
  const found = await page.evaluate(measure)
  check(found.length === 0, found.length ? found.slice(0, 8).join('\n        ') : 'no overflow, clipping, misalignment, uneven cards or low-contrast text')
  // FAQ and SmartScreen open, to audit their expanded state too.
  await page.getByRole('button', { name: 'Windows SmartScreen tip' }).click()
  await page.getByRole('button', { name: 'How does manual Supabase sync work?' }).click()
  await page.waitForTimeout(500)
  const open = await page.evaluate(measure)
  check(open.length === 0, open.length ? 'expanded: ' + open.slice(0, 6).join('\n        ') : 'accordions expanded: still clean')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.screenshot({ path: resolve(out, `${width}-top.png`) })
  await page.screenshot({ path: resolve(out, `${width}-full.png`), fullPage: true })
  check(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await context.close()
}

await browser.close()
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nAudit passed.')
process.exit(problems.length ? 1 : 0)
