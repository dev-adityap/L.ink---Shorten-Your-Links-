# ARCHITECTURE.md - System Architecture

## Technology Stack

### Backend
- **Runtime:** Node.js (ES6 modules, `"type": "module"`)
- **Framework:** Express.js 4.x
- **Database:** MongoDB with Mongoose ODM
- **Validation:** express-validator
- **Environment:** dotenv
- **CORS:** cors package
- **ID Generation:** Native Node.js `crypto` module (6-character URL-safe ID)

### Frontend
- **Framework:** React 18.x
- **Build Tool:** Vite 5.x
- **Styling:** Tailwind CSS 3.x
- **Icons:** lucide-react
- **HTTP:** Native Fetch API
- **Fonts:** Playfair Display (headings), Inter (body) via Google Fonts

## Project Structure

```
url-shortener/
├── client/                          # React frontend
│   ├── index.html                   # Entry HTML with Google Fonts
│   ├── vite.config.js               # Vite config with proxy
│   ├── tailwind.config.js           # Tailwind design system
│   ├── postcss.config.js            # PostCSS config
│   ├── package.json                 # Dependencies
│   ├── src/
│   │   ├── main.jsx                 # React DOM entry point
│   │   ├── App.jsx                  # Root component with state
│   │   ├── index.css                # Tailwind directives + base styles
│   │   ├── api.js                   # API functions (shortenUrl)
│   │   └── components/
│   │       ├── Navbar.jsx           # Top navigation
│   │       ├── Hero.jsx             # Hero section with URL form
│   │       ├── ResultsTable.jsx     # Shortened links table
│   │       ├── Stats.jsx            # Watermark-style stats
│   │       ├── Features.jsx         # Feature grid with Lucide icons
│   │       ├── Testimonials.jsx     # Customer testimonials
│   │       ├── FAQ.jsx              # Accordion FAQ
│   │       ├── Footer.jsx           # Dark-themed footer with CTA
│   │       ├── UrlForm.jsx          # Legacy URL form (dark theme)
│   │       └── UrlTable.jsx         # Legacy URL table (dark theme)
├── server/                          # Express backend
│   ├── index.js                     # Express app entry point
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Example env file
│   ├── package.json                 # Dependencies
│   ├── config/
│   │   └── db.js                    # MongoDB connection (named export connectDB)
│   ├── models/
│   │   └── Url.js                   # Mongoose schema
│   ├── routes/
│   │   ├── url.js                   # POST /api/shorten
│   │   ├── history.js               # GET /api/urls
│   │   └── redirect.js              # GET /:shortId
│   ├── middleware/
│   │   ├── errorHandler.js          # Global error handler
│   │   └── validate.js              # URL validation middleware
│   └── utils/
│       └── shortId.js               # 6-character ID generator
├── docs/                            # Project documentation
└── README.md
```

## Frontend Architecture

- **State Management:** React `useState` hooks at App level
- **Data Flow:** App → Hero (form submission) → API → Backend → App state update
- **Component Pattern:** Functional components with hooks, props drilling for callbacks
- **Styling:** Tailwind CSS utility classes with custom design system tokens
- **API Integration:** Fetch API with configurable base URL via `import.meta.env.VITE_API_URL`

## Backend Architecture

- **Server:** Express.js with ES6 module imports
- **Middleware Stack:** CORS → json body parser → Routes → 404 handler → Error handler
- **Route Pattern:** Express Router with modular route files
- **Database:** Mongoose with connection established before server start
- **Error Handling:** Async errors passed to `next()`, caught by global errorHandler middleware

## Database Structure

### Url Collection (Mongoose Schema)

| Field | Type | Required | Default | Index |
|-------|------|----------|---------|-------|
| originalUrl | String | Yes | - | No |
| shortId | String | Yes | - | Yes (unique) |
| clicks | Number | No | 0 | No |
| createdAt | Date | No | Date.now | No |
| updatedAt | Date | No | Date.now | No (timestamps) |

## API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/shorten` | Create or retrieve short URL | `{ originalUrl: string }` | `{ success, data: { originalUrl, shortId, shortUrl, clicks, createdAt } }` |
| GET | `/api/urls` | Get all shortened URLs (newest first) | None | `{ success, data: [Url] }` |
| GET | `/:shortId` | Redirect to original URL, increment clicks | None | HTTP 302 redirect |

## Authentication Flow

**None implemented.** The application is a public URL shortener without user accounts or authentication.

## Component Relationships

```
App.jsx
├── Navbar.jsx (navigation)
├── Hero.jsx (URL shortening form)
│   └── Form submission → api.shortenUrl() → onShortened callback
├── ResultsTable.jsx (displays shortened URLs)
├── Stats.jsx (watermark statistics)
├── Features.jsx (feature grid with icons)
├── Testimonials.jsx (customer reviews)
├── FAQ.jsx (accordion questions)
└── Footer.jsx (CTA + links + social icons)
```

## Third-Party Integrations

- **Google Fonts:** Playfair Display, Inter
- **Lucide React:** Link, BarChart3, Sliders, QrCode icons
- **MongoDB:** Database hosting (connection string via MONGODB_URI env var)
- **Vite Dev Proxy:** `/api` → `http://localhost:5000` in development
