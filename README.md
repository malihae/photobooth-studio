# 📸 Photobooth Studio

A cute, responsive, GitHub-ready web photo booth built from the architecture described in the supplied project documents.

## What is included

- React 18 + TypeScript frontend
- Express + TypeScript backend
- Browser camera access with specific error states
- 3 → 2 → 1 countdown and capture flash
- Canvas-based filters with 0–100% intensity
- Cute pastel/sticker-inspired visual system
- Responsive mobile/tablet/desktop layouts
- Gallery with download and clear-all
- Sharp image optimization, crop, format conversion and metadata APIs
- Optional AI-art integration point
- Accessibility-first controls and reduced-motion support
- Docker and GitHub Actions scaffolding
- Production environment examples

## Design direction

The interface intentionally uses a playful "scrapbook / sticker / pastel photo booth" language: rounded cards, doodle-like stars/hearts, soft shadows, pill controls, playful microcopy and a large camera stage. It is inspired by the visual vocabulary commonly used in Canva-style social/event designs, without copying a specific Canva template.

Typography uses a free web-safe stack by default. The accompanying MyFonts search identified playful display directions such as One Stroke Script, FF Uberhand, Kairengu and Corazon. Commercial fonts should only be added after obtaining the appropriate license.

## Project structure

```text
photobooth-studio/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── styles/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       ├── App.css
│       └── index.tsx
├── server/
│   └── src/
│       ├── routes/
│       └── index.ts
├── docs/
├── .github/workflows/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Local setup

Requirements: Node.js 18+, npm 9+, Git.

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

The supplied setup specification also targets these ports and requires camera permission, gallery capture/download, and a `/health` endpoint.

## Production build

```bash
npm run build
```

Frontend output: `client/build/`  
Backend output: `server/dist/`

## Environment

Copy the examples:

```bash
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
```

For deployment, set `REACT_APP_API_URL` to the public HTTPS backend URL.

## API

- `GET /health`
- `POST /api/images/optimize`
- `POST /api/images/crop`
- `POST /api/images/convert`
- `POST /api/images/metadata`
- `POST /api/ai-art/transform` — optional provider proxy; returns a clear 501 response until an external provider is configured.

## GitHub deployment

```bash
git init
git add .
git commit -m "feat: initial cute photobooth studio"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

Do not commit `.env` files or API secrets.

## Important camera deployment note

Browser camera APIs require a secure context. `localhost` works during development; production should use HTTPS.

## Production checklist

- Set production API URL
- Enable HTTPS
- Configure CORS to the real frontend origin
- Keep secrets server-side
- Add rate limiting and authentication if public image-processing endpoints are exposed
- Add error tracking
- Test camera permission denial, missing camera, slow devices and mobile touch targets

## Credits / source basis

This implementation follows the supplied Photobooth Studio README, analysis and setup documents for the architecture, features, API surface, accessibility goals, responsive behavior and deployment workflow.
