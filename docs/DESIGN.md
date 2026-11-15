# DESIGN.md - Design System

## Existing Design System

### Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Background | `#FDFCF7` | Main application body (creamy white) |
| Elevated Surface | `#FBF9F4` | Cards, tables, form containers |
| Elevated Surface (alt) | `#EFEBE2` | Active states, open accordions, icon backgrounds |
| Border | `#EBE9E0` | Card borders, table dividers, input borders |
| Border (hover) | `#D9D6C6` | Hover states on bordered elements |
| Primary Text | `#111111` (gray-900) | Headings, body text, primary labels |
| Secondary Text | `#6b7280` (gray-500) | Captions, descriptions, muted text |
| Watermark Text | `#D9D6C6` | Large background stats numbers |
| Quote Mark | `#EBE9E0` | Large decorative quotation marks |
| Dark Footer | `#1A1A18` | Footer background (warmer dark) |
| Dark Footer Border | `#2A2A24` | Footer border color |
| CTA Button | `#FBF9F4` with `#111111` text | Primary action buttons in dark sections |
| CTA Button Hover | `#EFEBE2` | Button hover state |
| Error Text | `#dc2626` (red-500) | Error messages |
| Error Background | `#fef2f2` (red-50) | Error container background |
| Success/Accent | Stone gradient | Avatar placeholders, decorative elements |

### Typography

| Role | Font Family | Weight | Size |
|------|-------------|--------|------|
| Headings | Playfair Display (serif) | 400-800 | 3xl-7xl |
| Body | Inter (sans-serif) | 300-700 | xs-xl |
| Labels | Inter (sans-serif) | 500-600 | xs-sm |
| Captions | Inter (sans-serif) | 400-500 | xs |
| Mono | font-mono | 400 | sm |

### Font Sizes (Tailwind scale)

- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)
- `text-5xl`: 3rem (48px)
- `text-6xl`: 3.75rem (60px)
- `text-7xl`: 4.5rem (72px)

### Spacing System

Uses Tailwind default spacing scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96).

Common values:
- `px-4 py-3`: Component padding
- `px-6 py-4`: Section padding
- `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`: Element spacing
- `mb-4`, `mb-6`, `mb-8`, `mb-10`, `mb-16`, `mb-20`: Bottom margins
- `mt-12`, `mt-20`: Top margins

### Border Radius

- `rounded-xl`: 0.75rem (12px) - Cards, containers
- `rounded-2xl`: 1rem (16px) - Feature cards, testimonial cards
- `rounded-full`: Pill shapes - Badges, avatar placeholders
- `rounded-lg`: 0.5rem (8px) - Smaller elements

### Shadows

- `shadow-sm`: Subtle shadow for elevated surfaces
- `shadow-xl`: Stronger shadow for hero/form containers

### Component Styling

**Cards:** `bg-[#FBF9F4] border border-[#EBE9E0] rounded-2xl p-8 shadow-sm`
**Form Container:** `bg-[#FBF9F4] border border-[#EBE9E0] rounded-xl shadow-sm overflow-hidden`
**Table Row:** `border-b border-[#EBE9E0] hover:bg-[#EFEBE2] transition-colors`
**Buttons:** `px-6 py-3 text-xs font-bold uppercase tracking-tighter transition-colors`

### Responsive Breakpoints (Tailwind)

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small mobile adjustments |
| `md` | 768px | Tablet layouts |
| `lg` | 1024px | Laptop/desktop layouts |
| `xl` | 1280px | Large desktop |

### Dark Mode Behavior

**Not implemented.** The application uses a light creamy theme only. If dark mode is added in the future, use Tailwind `dark:` variant with a toggle component.

### UI/UX Guidelines

- Creamy white background reduces eye strain vs pure white
- Serif headings (Playfair Display) for premium editorial feel
- Sans-serif body (Inter) for readability
- Subtle borders instead of heavy shadows
- Warm dark footer (`#1A1A18`) instead of pure black
- Gradient avatar placeholders instead of empty divs
- Consistent 8px-ish spacing grid
- Smooth transitions (200ms) on hover states
- No excessive animations
- No random colors outside the defined palette
