# MEMORY.md - Project Context

## Architectural Decisions

1. **Light creamy theme** - `#FDFCF7` background, `#FBF9F4` elevated surfaces, `#EBE9E0` borders
2. **Playfair Display + Inter** - Serif headings for premium feel, sans-serif body for readability
3. **Native crypto for short IDs** - 6-character URL-safe IDs, no external dependency
4. **Named exports for utilities** - `connectDB`, `generateShortId`, `errorHandler` use named exports
5. **Default exports for routers/models** - Route routers and Mongoose models use default exports
6. **React state at App level** - `shortenedUrls` state managed in App.jsx, passed via callbacks
7. **Vite dev proxy** - `/api` proxied to `http://localhost:5000` in development
8. **Rate limiting** - General: 100 req/15min; Shorten: 30 req/15min
9. **Security headers** - X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin
10. **Dark mode** - class-based strategy with localStorage persistence, respects system preference

## Important File Locations

### Client
| File | Purpose |
|------|---------|
| `client/src/App.jsx` | Root component, holds `shortenedUrls` state, wires all components |
| `client/src/api.js` | API functions, `shortenUrl()`, `getUTMParams()` |
| `client/src/components/Navbar.jsx` | Top nav with logo, links, search, dark mode toggle, mobile menu |
| `client/src/components/Hero.jsx` | Hero section with URL shortening form |
| `client/src/components/ResultsTable.jsx` | Displays shortened URLs with backend links + copy buttons |
| `client/src/components/Stats.jsx` | Watermark-style statistics (#D9D6C6) |
| `client/src/components/Features.jsx` | Feature grid with Lucide React icons |
| `client/src/components/Testimonials.jsx` | Customer testimonials |
| `client/src/components/FAQ.jsx` | Accessible accordion FAQ |
| `client/src/components/Footer.jsx` | Dark-themed footer with CTA, social links, last updated |
| `client/src/components/UrlForm.jsx` | Legacy form (light theme updated) |
| `client/src/components/UrlTable.jsx` | Legacy table (light theme + API URL + copy buttons) |
| `client/src/components/MobileMenu.jsx` | Hamburger menu for mobile |
| `client/src/components/DarkModeToggle.jsx` | Light/dark mode toggle |
| `client/src/components/CookieConsent.jsx` | Cookie consent banner |
| `client/src/components/CopyToClipboard.jsx` | Copy button with feedback |
| `client/src/components/ScrollProgress.jsx` | Top scroll progress bar |
| `client/src/components/BackToTop.jsx` | Back to top button |
| `client/src/components/SiteSearch.jsx` | Site-wide search |
| `client/src/components/ConfirmationModal.jsx` | Reusable confirmation dialog |
| `client/src/components/PrintStyles.jsx` | Print media styles |
| `client/src/components/FloatingContact.jsx` | Floating mailto/tel contact button |
| `client/src/components/LastUpdated.jsx` | Last updated date display |
| `client/src/index.css` | Tailwind directives + all component CSS classes |
| `client/tailwind.config.js` | Design system tokens, darkMode: 'class' |
| `client/vite.config.js` | Vite config with /api proxy |
| `client/index.html` | SEO meta tags, Open Graph, Twitter cards |
| `client/public/robots.txt` | Search engine directives |
| `client/public/sitemap.xml` | XML sitemap |

### Server
| File | Purpose |
|------|---------|
| `server/index.js` | Express app, rate limiting, security headers, routes |
| `server/config/db.js` | MongoDB connection (named export: connectDB) |
| `server/models/Url.js` | Mongoose schema (originalUrl, shortId, clicks, createdAt) |
| `server/routes/url.js` | POST /api/shorten with rate limiting |
| `server/routes/history.js` | GET /api/urls |
| `server/routes/redirect.js` | GET /:shortId (redirect + click increment) |
| `server/middleware/validate.js` | URL validation with express-validator |
| `server/middleware/errorHandler.js` | Global error handler |
| `server/utils/shortId.js` | 6-character ID generator using crypto |
| `server/.env` | Environment variables (MONGODB_URI, PORT, CORS_ORIGIN) |

## Dependencies

### Client
- react, react-dom, lucide-react, tailwindcss, postcss, autoprefixer, vite

### Server
- express, cors, dotenv, mongoose, express-validator, express-rate-limit

## Known Limitations

1. **No user authentication** - Public URL shortener, no accounts
2. **No custom aliases** - Short IDs are auto-generated only
3. **No URL expiration** - Links never expire
4. **No analytics beyond click count** - No geographic/referrer data
5. **Single-page application** - No client-side routing, server handles 404 with JSON
6. **UTM params captured but not stored** - Client-side capture only, backend doesn't persist them

## Implementation Decisions

- Used `import.meta.env.VITE_API_URL` for configurable API base URL
- Used native `fetch()` instead of axios to avoid extra dependency
- Used `lucide-react` for icons (Link, BarChart3, Sliders, QrCode)
- Stats numbers use `text-[#D9D6C6]` for subtle watermark effect on creamy background
- Footer CTA button uses `bg-[#FBF9F4] text-gray-900` for contrast on dark background
- All bordered elements use `border-[#EBE9E0]` for creamy theme consistency
- Rate limiting: 100 req/15min general, 30 req/15min for shorten endpoint
- Dark mode persists via localStorage, respects `prefers-color-scheme`

## Remaining Work

None - all planned features implemented. See TASKS.md for complete checklist.
