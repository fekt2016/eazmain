# EazMain Infinite Reload Loop Analysis & Fixes

## 🔍 ROOT CAUSES IDENTIFIED

### **PRIMARY ISSUES:**

1. **TopupSuccessPage.jsx** - Multiple useEffect hooks with unstable dependencies causing re-render loops
2. **useAuth.js** - `refetchAuth` function in dependency array (unstable reference)
3. **useNotifications.js** - Aggressive refetch configuration (`refetchOnWindowFocus: true` + `refetchInterval`)
4. **useAutoSyncCart** - Nested `syncCart` calls causing infinite loops
5. **ProtectedRoute.jsx** - Unnecessary state updates triggering re-renders
6. **useDynamicPageTitle** - All props in dependency array causing frequent updates

---

## 📋 DETAILED ISSUES & FIXES

### **1. TopupSuccessPage.jsx** ⚠️ CRITICAL

**File:** `eazmain/src/features/wallet/TopupSuccessPage.jsx`

**Problem:**
- `refetchAuth` in dependency array (line 33) - function reference changes on every render
- Multiple useEffect hooks with overlapping dependencies causing cascading re-renders
- `navigate` function in dependency array (line 54) - stable but unnecessary
- Complex state management with multiple flags causing race conditions

**Why it causes reloads:**
- `refetchAuth` is recreated on every `useAuth` call, triggering useEffect repeatedly
- State updates in one useEffect trigger another, creating a loop
- Multiple timers and state checks create race conditions

**Fix:**
```javascript
// Use useCallback to stabilize refetchAuth
// Use refs to prevent duplicate calls
// Consolidate useEffect hooks where possible
```

---

### **2. useAuth.js** ⚠️ HIGH PRIORITY

**File:** `eazmain/src/shared/hooks/useAuth.js`

**Problem:**
- `refetchAuth` returned from useQuery is a stable function, BUT if used in dependency arrays elsewhere, it can cause issues
- `navigate` from `useNavigate()` is stable, but should be wrapped in useCallback if used in effects

**Why it causes reloads:**
- If `refetchAuth` is used in dependency arrays in other components, it can trigger re-renders
- The auth query itself is well-configured (refetchOnWindowFocus: false), but consumers may misuse it

**Fix:**
- Document that `refetchAuth` is stable
- Ensure consumers use refs or guards when calling it in useEffect

---

### **3. useNotifications.js** ⚠️ HIGH PRIORITY

**File:** `eazmain/src/shared/hooks/notifications/useNotifications.js`

**Problem:**
- Line 18: `refetchOnWindowFocus: true` - refetches every time user switches tabs/windows
- Line 30: `refetchInterval: 30000` - refetches every 30 seconds
- Combined, this causes constant refetching

**Why it causes reloads:**
- Every window focus triggers a refetch
- Every 30 seconds triggers a refetch
- If notifications query is used in multiple components, this multiplies

**Fix:**
```javascript
refetchOnWindowFocus: false, // Prevent refetch on tab switch
refetchInterval: false, // Or increase to 60+ seconds if needed
```

---

### **4. useAutoSyncCart** ⚠️ CRITICAL

**File:** `eazmain/src/shared/hooks/useCart.js` (lines 382-413)

**Problem:**
- Nested `syncCart` calls inside `onSuccess` callback (lines 393-409)
- `syncCart` and `queryClient` in dependency array - both can change
- No guard to prevent multiple sync attempts

**Why it causes reloads:**
- First `syncCart` succeeds → triggers nested `syncCart` → creates infinite loop
- `syncCart` function reference may change, retriggering useEffect
- `queryClient.invalidateQueries` triggers refetch, which may trigger sync again

**Fix:**
```javascript
// Use ref to track if sync has been attempted
// Remove nested syncCart call
// Add guard to prevent duplicate syncs
```

---

### **5. ProtectedRoute.jsx** ⚠️ MEDIUM PRIORITY

**File:** `eazmain/src/routes/ProtectedRoute.jsx`

**Problem:**
- Line 24-29: `useEffect` updates `localAuthCheck` state based on `userData`
- This causes an extra re-render cycle
- `localAuthCheck` is redundant - can use `userData` directly

**Why it causes reloads:**
- State update in useEffect triggers re-render
- Re-render may cause useAuth to refetch (if refetchOnMount is true)
- Creates unnecessary render cycles

**Fix:**
- Remove `localAuthCheck` state
- Use `userData` and `isLoading` directly

---

### **6. useDynamicPageTitle** ⚠️ LOW PRIORITY

**File:** `eazmain/src/shared/hooks/useDynamicPageTitle.js`

**Problem:**
- Line 46: All props in dependency array (`dynamicTitle, title, description, defaultTitle, defaultDescription`)
- If any of these change frequently (e.g., from parent re-renders), it updates DOM repeatedly

**Why it causes reloads:**
- Frequent DOM updates can trigger layout recalculations
- Not a direct reload cause, but contributes to performance issues

**Fix:**
- Use `useMemo` to compute final values
- Only include computed values in dependency array

---

## ✅ FIXES TO APPLY

### Fix 1: TopupSuccessPage.jsx

**Changes:**
1. Use `useRef` to track if auth refetch has been attempted
2. Remove `refetchAuth` from dependency array (use ref guard instead)
3. Consolidate auth check logic
4. Remove `navigate` from dependency array (it's stable)

### Fix 2: useNotifications.js

**Changes:**
1. Set `refetchOnWindowFocus: false`
2. Increase `refetchInterval` to 60000 (60 seconds) or disable if not needed
3. Add `staleTime` to reduce unnecessary refetches

### Fix 3: useAutoSyncCart

**Changes:**
1. Add `useRef` guard to prevent duplicate syncs
2. Remove nested `syncCart` call
3. Use `useCallback` for syncCart if needed
4. Remove `queryClient` from dependency array (it's stable)

### Fix 4: ProtectedRoute.jsx

**Changes:**
1. Remove `localAuthCheck` state
2. Use `userData` and `isLoading` directly in render logic

### Fix 5: useDynamicPageTitle

**Changes:**
1. Use `useMemo` to compute final title/description
2. Only depend on memoized values

---

## 🎯 MAIN ROOT CAUSES SUMMARY

1. **TopupSuccessPage.jsx** - Unstable function references in useEffect dependencies
2. **useAutoSyncCart** - Nested async callbacks creating infinite loops
3. **useNotifications.js** - Aggressive refetch configuration causing constant API calls
4. **ProtectedRoute.jsx** - Unnecessary state updates causing re-render cycles

---

## 📝 BEST PRACTICES RECOMMENDATIONS

### For Auth Guards:
- Use refs to track auth check attempts
- Avoid state updates in useEffect for auth checks
- Use `useMemo` for derived auth state

### For React Query:
- Set `refetchOnWindowFocus: false` for most queries
- Use `staleTime` to control cache freshness
- Only use `refetchInterval` for real-time features (increase interval)
- Use `refetchOnMount: true` only when needed

### For Global Hooks:
- Use `useRef` to prevent duplicate operations
- Wrap functions in `useCallback` if used in dependency arrays
- Use `useMemo` for computed values

### For SEO Meta Hooks:
- Memoize computed values
- Minimize dependency arrays
- Use refs to track if meta has been set

---

## 🚀 IMPLEMENTATION ORDER

1. **Fix useAutoSyncCart** (highest impact - infinite loop)
2. **Fix TopupSuccessPage** (high impact - payment flow)
3. **Fix useNotifications** (medium impact - constant refetches)
4. **Fix ProtectedRoute** (low impact - optimization)
5. **Fix useDynamicPageTitle** (low impact - performance)

