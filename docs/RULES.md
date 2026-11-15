# RULES.md - Coding Standards

## General Principles

1. **Maintain clean and reusable code** - Every component should have a single responsibility
2. **Follow existing project conventions** - Match the established patterns in the codebase
3. **Use reusable components** - Extract repeated UI into shared components
4. **Avoid unnecessary dependencies** - Only add packages when they provide clear value
5. **Follow consistent naming conventions** - PascalCase for components, camelCase for variables/functions
6. **Never expose API keys or secrets** - Use environment variables for all sensitive values
7. **Maintain accessibility standards** - WCAG 2.2 AA compliance where practical
8. **Avoid breaking existing functionality** - Test all changes before considering complete
9. **Keep components modular and maintainable** - Small, focused components over large monolithic ones

## File Naming

- Components: `PascalCase.jsx` (e.g., `Navbar.jsx`, `Hero.jsx`)
- Utilities: `camelCase.js` (e.g., `api.js`, `shortId.js`)
- Styles: `index.css` for global styles
- Config: `tailwind.config.js`, `vite.config.js`, `postcss.config.js`

## Component Guidelines

- Export default for all React components
- Use named exports for utility functions and constants
- Props should be clearly typed with meaningful names
- Event handlers should be prefixed with `handle`
- State variables should use descriptive names (e.g., `isLoading`, `errorMessage`)

## CSS/Tailwind Guidelines

- Use Tailwind utility classes for styling
- Custom colors defined in `tailwind.config.js`
- No inline styles unless absolutely necessary
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Dark mode: Not currently implemented; if added, use `dark:` variant

## JavaScript Guidelines

- Use ES6+ modules (`import`/`export`)
- Use `const` by default, `let` only when reassignment needed
- Avoid `var`
- Arrow functions for component methods and callbacks
- Template literals for string interpolation
- Optional chaining (`?.`) for safe property access
- Nullish coalescing (`??`) for default values

## Backend Guidelines

- Express Router for modular route organization
- Async/await for asynchronous operations
- Error handling via `next(err)` pattern
- Named exports for utility functions and middleware
- Default exports for route routers and Mongoose models
- Environment variables via `process.env` with `dotenv`

## Accessibility Guidelines

- All interactive elements must be keyboard navigable
- Visible focus indicators on all focusable elements
- Semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<footer>`, etc.)
- ARIA labels where native HTML is insufficient
- Color contrast ratio of at least 4.5:1 for normal text
- Alt text on all meaningful images
- Skip to content link for keyboard users
- Labels associated with form inputs

## Security Guidelines

- All secrets in `.env` files (never committed)
- `.env.example` provided without real values
- Input validation on all API endpoints
- CORS configured with specific origin in production
- No hardcoded API keys or secrets in source code
- Error messages don't leak sensitive information

## Prohibited Practices

- ❌ Hardcoding secrets or API keys in source files
- ❌ Committing `.env` files with real values
- ❌ Using `any` type in TypeScript (if adopted)
- ❌ Duplicate components with similar functionality
- ❌ Fake buttons or non-functional interactions
- ❌ Placeholder content presented as real content
- ❌ Breaking existing API contracts without versioning
- ❌ Overwriting environment variables in code
