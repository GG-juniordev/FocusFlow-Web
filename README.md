# FocusFlow website

The landing page for [FocusFlow](https://github.com/GG-juniordev/FocusFlow). React, TypeScript, Tailwind CSS and Motion (the library formerly published as Framer Motion), built with Vite. It is separate from the desktop app in the parent folder and has its own dependencies.

## Run it locally

```powershell
cd website
npm install
npm run dev        # http://localhost:5180
```

`npm run build` writes the finished site to `website/dist`; `npm run preview` serves that build.

## How the download button works

The page asks the GitHub API for the repository's releases. If the newest release has an `.exe` attached, the download buttons link straight to it and show its version and size. If there is no release yet, or GitHub cannot be reached, they link to the releases page instead.

To make the button a direct download: on GitHub open **Releases → Draft a new release**, create a tag such as `v1.0.0`, attach `dist\FocusFlow-Setup-1.0.0.exe` from the app build, and publish.

The repository name lives in one place, `src/lib/github.ts`.

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
