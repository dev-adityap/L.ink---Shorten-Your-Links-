# L.ink — Full-Stack URL Shortener, Custom QR & Analytics

A full-stack URL shortening, custom QR code generation, and link analytics platform built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB**, and **Firebase Authentication**.

**Live Demo:** [https://url-shortener-hazel-eight.vercel.app](https://url-shortener-hazel-eight.vercel.app)

---

## Features

* **Instant Link Shortening:** Convert long URLs into clean short links with optional custom aliases, titles/labels, expiration timestamps, and active/paused toggles.
* **Guest-First Flow & Auth-Gated Insights:** Visitors can shorten links right away without signing in, while signing in unlocks the analytics dashboard, link management, guest-link claiming, and protected controls.
* **Click, Device & Referrer Analytics:** Tracks total clicks alongside device breakdown (`Mobile`, `Desktop`, `Tablet`) and top referrer sources on a dedicated dashboard.
* **Customizable QR Codes:** Generate and download styled QR codes directly from links with live customization options.
* **Dashboard Productivity:** Filter and search links across routes, edit existing links, bulk-select and delete links, and export link data as CSV.
* **Production Hardening:** Includes Express rate limiting, strict `http:`/`https:` URL and alias validation, Firebase ID token verification, and React Error Boundaries.

---

## Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, React Router, Lucide React, Recharts, `qr-code-styling`
* **Backend:** Node.js, Express.js, Mongoose, `express-rate-limit`, Firebase Admin SDK
* **Database & Auth:** MongoDB Atlas, Firebase Authentication
* **Deployment:** Vercel (Frontend) & Render (Backend API)

---

## Project Structure

```text
├── client/                 # React + Vite frontend
│   ├── public/             # Static assets (favicon, OG preview)
│   └── src/                # Pages, components, routes, and styles
├── server/                 # Node.js + Express backend
│   ├── middleware/         # Auth & rate-limiting middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # URL creation, redirect, and management routes
│   └── utils/              # Validation helpers
└── README.md
