# Design System Refactoring Guide

## ✅ Completed Foundation

1. **GlobalStyles.js** - Updated with:
   - Inter font for body text
   - Poppins font for headings (h1-h6)
   - Spacing scale (--spacing-xs to --spacing-3xl)
   - Typography scale (--font-size-xs to --font-size-4xl)
   - Transition tokens

2. **theme.js** - Aligned with CSS variables:
   - All colors reference CSS variables
   - Added font families (heading, body, mono)
   - Added font weights, sizes, spacing, shadows, radii, transitions

3. **App.jsx** - Fixed ThemeProvider wrapper order

4. **Shared Component Library** (`src/shared/components/common/`):
   - Heading.jsx
   - Text.jsx
   - Card.jsx
   - Grid.jsx
   - Flex.jsx
   - SectionWrapper.jsx
   - IconWrapper.jsx
   - Input.jsx
   - Select.jsx
   - Modal.jsx

## 🎯 Refactoring Pattern

### 1. Replace Hardcoded Colors

**Before:**
```jsx
color: #000;
background: #fff;
border: 1px solid #e5e7eb;
```

**After:**
```jsx
color: var(--color-grey-900);
background: var(--color-white-0);
border: 1px solid var(--color-grey-200);
// OR using theme:
color: ${({ theme }) => theme.colors.gray[900]};
```

### 2. Replace Hardcoded Spacing

**Before:**
```jsx
padding: 2rem;
margin: 1.5rem;
gap: 1rem;
```

**After:**
```jsx
padding: var(--spacing-lg);
margin: var(--spacing-md);
gap: var(--spacing-sm);
// OR using theme:
padding: ${({ theme }) => theme.spacing.lg};
```

### 3. Replace Media Queries

**Before:**
```jsx
@media (max-width: 768px) {
  padding: 1rem;
}
```

**After:**
```jsx
import { devicesMax } from '../styles/breakpoint';

@media ${devicesMax.sm} {
  padding: var(--spacing-sm);
}
```

### 4. Replace Hardcoded Fonts

**Before:**
```jsx
font-family: "Arial", sans-serif;
```

**After:**
```jsx
font-family: ${({ theme }) => theme.fonts.body}; // For body text
font-family: ${({ theme }) => theme.fonts.heading}; // For headings
```

### 5. Replace Hardcoded Shadows/Radii

**Before:**
```jsx
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
border-radius: 8px;
```

**After:**
```jsx
box-shadow: var(--shadow-md);
border-radius: var(--border-radius-md);
// OR using theme:
box-shadow: ${({ theme }) => theme.shadows.md};
border-radius: ${({ theme }) => theme.radii.md};
```

## 📋 Files to Refactor

### Priority 1: Layout Components
- [x] Header.jsx (needs breakpoint updates)
- [x] Footer.jsx (needs breakpoint updates)
- [x] Sidebar.jsx (needs breakpoint updates)
- [ ] MainLayout.jsx

### Priority 2: Auth Pages
- [ ] loginPage.jsx
- [ ] SignupPage.jsx
- [ ] ForgotPasswordPage.jsx

### Priority 3: Product Pages
- [ ] HomePage.jsx
- [ ] ProductDetail.jsx
- [ ] CategoryPage.jsx
- [ ] SearchResult.jsx

### Priority 4: Cart & Checkout
- [ ] CartPage.jsx
- [ ] CheckoutPage.jsx
- [ ] OrderConfirmationPage.jsx

### Priority 5: Profile Pages
- [ ] profilePage.jsx
- [ ] AddressPage.jsx
- [ ] PaymentMethodPage.jsx
- [ ] All other profile pages

### Priority 6: Shared Components
- [ ] ProductCard.jsx
- [ ] All other shared components

## 🔍 Search & Replace Patterns

### Find hardcoded colors:
```bash
grep -r "#[0-9a-fA-F]\{3,6\}" src/
```

### Find hardcoded spacing:
```bash
grep -r "padding:\s*[0-9]" src/
grep -r "margin:\s*[0-9]" src/
```

### Find old media queries:
```bash
grep -r "@media (max-width:" src/
```

## 📝 Example Refactoring

See `Header.jsx` for a complete example of:
- Using breakpoint system
- Using theme colors
- Using spacing tokens
- Using font families

## ✅ Checklist for Each File

- [ ] Replace all hardcoded colors with CSS variables or theme
- [ ] Replace all hardcoded spacing with tokens
- [ ] Replace all media queries with breakpoint system
- [ ] Use Inter for body text, Poppins for headings
- [ ] Replace hardcoded shadows/radii with tokens
- [ ] Use shared components where possible
- [ ] Test responsive breakpoints
- [ ] Verify theme consistency

