# Deployment Guide — FlyRank Content Review Assistant

## Vercel Deployment

### Quick Deploy

1. Push `apps/content-review-assistant/` to your GitHub repository
2. Import the project in [Vercel](https://vercel.com)
3. Set the following:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/content-review-assistant`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Environment Variables (Vercel Dashboard)

| Variable | Value | Required |
|---|---|---|
| `VITE_ENABLE_AI_NARRATIVE` | `false` | No (defaults to false) |
| `VITE_AI_API_ENDPOINT` | *(empty)* | No |
| `VITE_PORTFOLIO_URL` | Your portfolio URL | No |
| `VITE_RESEARCH_PAPER_AVAILABLE` | `true` or `false` | No (defaults to true) |

### Research Paper Deployment Status

- Set `VITE_RESEARCH_PAPER_AVAILABLE=false` when the paper URL is not yet live or verified. When false, the Research Paper link displays as "Research Paper — Deployment Pending" with disabled navigation.
- Set `VITE_RESEARCH_PAPER_AVAILABLE=true` only after manually verifying the public research paper deployment page. Do not hardcode deployment success.

## Netlify Deployment

### Quick Deploy

1. Push `apps/content-review-assistant/` to your GitHub repository
2. Import in [Netlify](https://app.netlify.com)
3. Set the following:
   - **Base directory**: `apps/content-review-assistant`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/content-review-assistant/dist`

### Netlify Configuration

Create `netlify.toml` in the project root if needed:

```toml
[build]
  base = "apps/content-review-assistant"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables (Netlify Dashboard)

Same as Vercel — add them in **Site settings → Environment variables**.

## Manual Static Deployment

```bash
cd apps/content-review-assistant
npm install
npm run build
```

The `dist/` folder contains the complete static application.
Upload it to any static hosting service (GitHub Pages, Cloudflare Pages, Surge, etc.).

## Important Notes

- The app is a fully static single-page application — no server required
- No API keys are needed for core functionality
- The optional AI narrative layer is disabled by default
- No API secret may appear in frontend code
- The application does not store any data permanently
- Do not deploy to the repository's `docs/` folder — that belongs to the research paper
