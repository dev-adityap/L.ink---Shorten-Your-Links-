# PRD.md - Product Requirements Document

## Project Overview

**Project Name:** L.ink - URL Shortener  
**Version:** 1.0.0  
**Last Updated:** 2026-11-07  

## Website Purpose

L.ink is a premium, production-ready URL shortener that transforms long, messy URLs into short, trackable links. The platform provides link shortening, click tracking, and a clean landing page with a creamy white editorial aesthetic.

## Target Audience

- Digital marketers needing trackable short links
- Content creators sharing links on social media
- Developers integrating link shortening into applications
- General users who need simple URL shortening

## Core Functionalities

1. **URL Shortening** - POST `/api/shorten` accepts a long URL and returns a 6-character short ID
2. **URL Redirect** - GET `/:shortId` finds the URL, increments click count, and redirects
3. **URL History** - GET `/api/urls` returns all shortened URLs sorted by newest
4. **Landing Page** - Premium marketing page with hero form, stats, features, testimonials, FAQ

## Existing Features

- Backend: Express.js + MongoDB + Mongoose (ES6 modules)
- Frontend: React + Vite + Tailwind CSS
- Light-themed creamy white design system
- URL shortening form with validation and loading states
- Results table showing shortened links with click counts
- Stats section with watermark-style numbers
- Features grid with Lucide React icons
- Testimonials carousel
- FAQ accordion
- Dark-themed footer CTA
- Lucide React icons in Features section
- Configurable API base URL via environment variables

## Planned Improvements

- Dark mode toggle with persistence
- Cookie consent banner
- Site search functionality
- Back to top button
- Mobile hamburger navigation menu
- Loading animations and skeleton loaders
- Enhanced hover/focus states
- Scroll progress bar
- Copy to clipboard for short links
- Print stylesheet
- Skip to content link
- Password visibility toggle (if auth forms added)
- UTM tracking parameter capture
- Form success/error states
- Confirmation modals for destructive actions
- Last updated dates
- Floating contact button
- Custom 404 page
- Favicon
- SEO meta tags and Open Graph
- Accessibility improvements (WCAG 2.2 AA)

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | User can submit a long URL to get a shortened link | High |
| FR-02 | Shortened link redirects to original URL when visited | High |
| FR-03 | Click count increments on each redirect | High |
| FR-04 | User can view history of shortened URLs | Medium |
| FR-05 | Form validates URL input before submission | High |
| FR-06 | Loading state shown during API calls | Medium |
| FR-07 | Error messages displayed for invalid submissions | High |
| FR-08 | API base URL configurable via environment variable | Medium |

## Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NF-01 | Page loads in under 3 seconds on 4G | High |
| NF-02 | WCAG 2.2 AA accessibility compliance | High |
| NF-03 | Responsive on 320px to 1440px+ screens | High |
| NF-04 | No console errors or warnings | Medium |
| NF-05 | No exposed secrets or API keys | High |
| NF-06 | Production build completes successfully | High |

## User Expectations

- Short links work immediately after creation
- Click counts are accurate and update in real-time
- Form provides clear feedback on success and error
- Site is visually consistent with creamy white editorial aesthetic
- Mobile experience is fully functional
