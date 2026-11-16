# FocusFlow website

The landing page for [FocusFlow](https://github.com/GG-juniordev/FocusFlow). React, TypeScript, Tailwind CSS and Motion (the library formerly published as Framer Motion), built with Vite. It is separate from the desktop app in the parent folder and has its own dependencies.

## Run it locally

```powershell
cd website
npm install
npm run dev        # http://localhost:5180
```

`npm run build` writes the finished site to `website/dist`; `npm run preview` serves that build.

## How the download buttons work

All three Download buttons (navbar, hero, download card) download the installer itself; they do not send visitors to a GitHub page.

On page load the site asks the GitHub API for `releases/latest`. If that is missing, is a pre-release, or has no installer, it looks through the releases list for the newest release with an `.exe` attached. The button's link is that asset's `browser_download_url` with the `download` attribute, so the browser saves the file and stays on the page. A click before GitHub has answered waits for the answer and then starts the download. Only when no release has an `.exe`, or GitHub cannot be reached, does the button open the releases page.

To publish a new version: on GitHub open **Releases → Draft a new release**, create a tag such as `v1.0.1`, attach the installer built by `npm run dist` in the app folder, and publish. The site picks it up by itself.

The repository name lives in one place, `src/lib/github.ts`.

## Check it

```powershell
npm run dev            # in one terminal
npm run audit          # in another: tests the download buttons and the layout
```

The audit drives the page in headless Chrome. It uses stand-in GitHub responses to test the download cases (direct download, slow lookup, missing release, API failure), then checks the layout at 1440, 1280, 768 and 375 px for overflow, clipped text, misaligned or uneven elements and low-contrast text. Screenshots are saved to `.audit/`. It needs Chrome and the `playwright-core` package installed in the parent app folder.

## Deploy

**GitHub Pages** (workflow included at `.github/workflows/website.yml`):

1. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Commit and push. Each push to `main` that changes `website/` rebuilds and publishes the site at `https://gg-juniordev.github.io/FocusFlow/`.

**Vercel or Netlify**: import the repository and set

| Setting | Value |
| --- | --- |
| Root / base directory | `website` |
| Build command | `npm run build` |
| Output / publish directory | `dist` |

Asset paths are relative, so the same build works at a domain root and under a sub-path.
