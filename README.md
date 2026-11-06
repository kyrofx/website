# kyro.cat

Next.js application with a bilingual static portfolio, the existing dashboard, and authentication API routes.

The `preview` branch is intended for **preview-net.kyro.cat**. Production `main` is separate.

## Run

```sh
npm ci
npm run dev
```

Production build and startup:

```sh
npm run build
npm start -- --port 3007
```

The existing Dockerfile builds the standalone Next.js server and includes the public portfolio assets. There are no new runtime dependencies.

In a managed cloud environment with a TLS proxy, Next's existing Google Fonts build requests may require `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build` to use the system trust store. Keep certificate verification enabled.

## Portfolio

`next.config.ts` maps `/`, `/projects`, `/about`, `/contact` and their `/ca` equivalents to generated documents in `public/portfolio/`. Navigation, language switches, canonical URLs and the sitemap use these clean routes. Old `.html` and `/index` URLs redirect permanently, preserving query strings and fragments. Other routes, including `/dashboard` and `/api/*`, keep their existing behavior and styles.

- Shared markup and translated content: `scripts/build_site.py`
- Styles: `public/portfolio/css/site.css`
- Interactive typography, navigation and filtering: `public/portfolio/js/site.js`
- ASCII loading and document transitions: `public/portfolio/js/ascii.js`

After changing shared content, run `python3 scripts/build_site.py` and commit the generated HTML and sitemap with it. Python is an editing tool; deployment uses the committed output and does not require Python.

Keep visible content to names, genuine facts, functional labels and links. Do not add eyebrows, taglines, project blurbs or decorative descriptions. Content is curated from the existing public kyro.cat site and the user's supplied facts; see [content sources](docs/content-sources.md). Keep privately shared identities, affiliations, URLs and career details out of this public site and repository. Project rows are numbered placeholders without real project details or links. About combines compact public facts with the supplied location and homelab figures; the onboard memory figure is not labelled as VRAM.

The initial ASCII entrance lasts about 1.85 seconds; internal transitions use a 180 ms exit and 800 ms arrival. Background tabs defer the entrance until visible, and resizing rebuilds its character grid without cancelling playback. Interaction skips the entrance, and failed enhancement scripts restore the underlying HTML. The footer’s replay button restarts the intro. Per the site owner's instruction, the portfolio's animations play regardless of the system's reduced-motion setting. Generated CSS and script URLs include content hashes so deployments refresh cached assets.

## Check

```sh
python3 -m unittest discover -s tests
node --check public/portfolio/js/site.js
node --check public/portfolio/js/ascii.js
npm run build
```

With Python Playwright, Chromium at `/usr/bin/chromium`, and the application running:

```sh
PORTFOLIO_BASE_URL=http://127.0.0.1:3007 python3 tests/browser_smoke.py
PORTFOLIO_BASE_URL=http://127.0.0.1:3007 python3 tests/ascii_smoke.py
PORTFOLIO_BROWSER=webkit python3 tests/ascii_smoke.py
```

Without `PORTFOLIO_BASE_URL`, those scripts serve and check the generated static pages in isolation. The WebKit run requires `python3 -m playwright install --with-deps webkit`; `WEBKIT_EXECUTABLE_PATH` optionally selects a custom launcher. They cover all eight pages, mobile widths, keyboard navigation, language switching, filters, clipboard feedback, visible ASCII paint, transitions, replay, hidden tabs, resizing, delayed scripts, history and failure recovery. The browser suite also verifies permanent legacy redirects and unchanged dashboard/API access when pointed at the Next.js server. Animation checks cover loading, reloading and navigation with reduced motion enabled.

## Existing application configuration

The dashboard/authentication configuration remains in `.env.example`. Public portfolio pages need no secrets. Authenticated dashboard operation uses the existing auth-server, client, redirect and API-key bindings supplied by the hosting environment; these are not embedded in the portfolio.

See [the .cat notes](docs/cat-domain.md) for the supplied registration policy and Catalan content implementation. Canonical portfolio URLs remain on `https://kyro.cat`.
