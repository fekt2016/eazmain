# Saiisaiweb Design Tokens

Design tokens are CSS custom properties defined in `src/shared/styles/GlobalStyles.js`. Always use tokens instead of hardcoded values so theme changes apply consistently.

## How to Use

In styled-components or CSS:

```css
/* Prefer semantic tokens */
color: var(--color-primary-500);
background: var(--color-button-primary);

/* Use raw scale tokens when semantic ones don't exist */
padding: var(--spacing-md);
font-size: var(--font-size-sm);
border-radius: var(--border-radius-md);
```

## Colors

### Brand
| Token | Value | Use |
|-------|-------|-----|
| `--color-gold` | #D4882A | Primary brand color |
| `--color-gold-hover` | #B8711F | Brand hover state |
| `--color-navy` | #1A1F2E | Dark accent |

### Primary (Amber / Brand Gold)
| Token | Use |
|-------|-----|
| `--primary-50` to `--primary-700` | Primary palette |
| `--color-primary-50` to `--color-primary-900` | Aliases |
| `--color-button-primary` | Button background |
| `--color-button-primary-hover` | Button hover |
| `--primary` | Semantic primary |

### Grey Scale
| Token | Use |
|-------|-----|
| `--color-grey-50` to `--color-grey-900` | Grey palette |
| `--text-secondary` | Secondary text |
| `--gray-50`, `--gray-200`, etc. | Aliases |

### Semantic (Success, Warning, Error)
| Token | Use |
|-------|-----|
| `--success` | Success state (green-700) |
| `--success-hover` | Success button hover |
| `--warning` | Warning state |
| `--warning-hover` | Warning button hover |
| `--error` | Error / danger state |
| `--error-hover` | Error button hover |
| `--error-light` | Error focus ring |

### Raw Color Scales
- **Green**: `--color-green-100`, `--color-green-500`, `--color-green-600`, `--color-green-700`
- **Red**: `--color-red-100`, `--color-red-500`, `--color-red-600`, `--color-red-650`, `--color-red-700`, `--color-red-800`, `--color-red-900`
- **Yellow / Amber**: `--color-yellow-100`, `--color-yellow-700`, `--color-amber-600`
- **Blue**: `--color-blue-100`, `--color-blue-700`

### Neutral
| Token | Use |
|-------|-----|
| `--color-white-0` | White |
| `--white` | Alias |
| `--color-black-100` to `--color-black-950` | Black/grey variants |

## Spacing

| Token | Value |
|-------|-------|
| `--spacing-xs` | 0.4rem |
| `--spacing-sm` | 0.8rem |
| `--spacing-md` | 1.6rem |
| `--spacing-lg` | 2.4rem |
| `--spacing-xl` | 3.2rem |
| `--spacing-2xl` | 4.8rem |
| `--spacing-3xl` | 6.4rem |

Aliases: `--space-xs` … `--space-2xl`.

## Typography

| Token | Use |
|-------|-----|
| `--font-size-xs` to `--font-size-4xl` | Fixed sizes |
| `--text-xs` to `--text-4xl` | Aliases; some are fluid (clamp) |
| `--font-primary` | Body font stack |
| `--font-semibold`, `--font-bold` | Weights |

## Border Radius

| Token | Use |
|-------|-----|
| `--border-radius-tiny` | 3px |
| `--border-radius-sm` | 5px |
| `--border-radius-md` | 7px |
| `--border-radius-lg` | 9px |
| `--border-radius-xl` | 12px |
| `--radius-card`, `--radius-button`, `--radius-input` | Semantic |

## Shadows

| Token | Use |
|-------|-----|
| `--shadow-sm` | Subtle |
| `--shadow-md` | Cards, raised UI |
| `--shadow-lg` | Modals |
| `--shadow-float` | Floating elements |
| `--shadow-gold` | Accent highlights |

## Transitions

| Token | Value |
|-------|-------|
| `--transition-fast` | 0.15s ease |
| `--transition-base` | 0.3s ease |
| `--transition-normal` | 0.3s ease |
| `--transition-slow` | 0.5s ease |

## Layout

| Token | Use |
|-------|-----|
| `--sidebar-width` | 240px |
| `--header-height` | 64px |

## Breakpoints

Breakpoints live in `src/shared/styles/breakpoint.js`. Use:

```js
import { devicesMax, devicesMin } from '../styles/breakpoint';

@media ${devicesMax.sm} { /* max-width: 1024px */ }
@media ${devicesMin.md} { /* min-width: 1228.8px */ }
```

## Gradients

| Token | Use |
|-------|-----|
| `--gradient-primary` | Primary buttons |
| `--gradient-accent` | Accent CTAs |

## Button Component

Use `Button` from `src/shared/components/Button.jsx` (single source of truth):

```jsx
<Button variant="primary" size="md">Submit</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="danger" loading={isSubmitting}>Delete</Button>
```

Variants: `primary` | `secondary` | `outline` | `danger` | `ghost` | `success` | `link`  
Sizes: `xs` | `sm` | `md` | `lg`

## Variant API (shared components)

Use `variant` or `$variant` (transient) for consistent styling:

**Text** (`common/Text`): `body` | `caption` | `muted` | `primary` | `error` | `success`

```jsx
<Text $variant="caption">Small caption</Text>
<Text $variant="error">Error message</Text>
```

**Input** (`common/Input`): `default` | `error` | `success`

```jsx
<Input $variant="error" />
```

**Card** (`ui/Cards`): `default` | `elevated` | `glass` | `stats`

```jsx
<Card $variant="elevated">...</Card>
```

Variant definitions live in `src/shared/styles/variants.js`.
