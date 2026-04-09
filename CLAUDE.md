# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Start development server (Turbopack)
pnpm dev

# Production build
pnpm build

# Run tests
pnpm test

# Run single test file
pnpm test -- tests/utils.test.ts
```

## Architecture

Gitfolio Online is a Next.js App Router application that generates GitHub portfolio pages for any GitHub user.

### Data Flow

```
Request → /[username]/page.tsx (Server Component)
              → lib/github.ts → GitHub GraphQL API
              → lib/theme.ts → Theme CSS injection
              → React Components → HTML output
```

### Core Modules

| File | Purpose |
|------|---------|
| `src/app/[username]/page.tsx` | Dynamic route Server Component, fetches data and renders page |
| `src/app/layout.tsx` | Root layout with fonts, global CSS, CDN resources |
| `src/lib/github.ts` | GitHub GraphQL API client with token rotation (PAT_1~PAT_8) |
| `src/lib/theme.ts` | Theme resolution (auto/dark/light/dracula) and CSS injection |
| `src/lib/utils.ts` | Utility functions (escapeHtml, sanitizeUrl, kFormatter, etc.) |
| `src/lib/colors.ts` | Language color mappings (250+ colors) |

### Components

| Component | Purpose |
|-----------|---------|
| `components/profile-panel.tsx` | Left panel: avatar, bio, followers, stars, etc. |
| `components/project-card.tsx` | Single repository card with language color dot |
| `components/project-grid.tsx` | Renders Work and Forks sections with card grid |
| `components/github-corner.tsx` | SVG GitHub corner widget |

### Theming

Themes are resolved via `lib/theme.ts` and injected as inline `<style>` tags. The base styles live in `src/styles/globals.css`. Theme CSS files in `src/styles/themes/` provide per-theme overrides.

### Token Configuration

Requires `PAT_1` environment variable (GitHub Personal Access Token). Supports PAT_1 through PAT_8 for rotation when rate limited.

## Testing

Tests use Jest with ts-jest. Test files are `tests/*.test.ts`.

## Deployment

Deployed to Vercel. `vercel.json` configures rewrites for `/u/:username` and `/:username` routes.
