# Loading Component with react-loading-skeleton

## 📦 Package Used

**react-loading-skeleton** - Modern skeleton loading with shimmer effect

```bash
npm i react-loading-skeleton
```

## ✨ Features

✅ **Shimmer effect** - Smooth animated gradient  
✅ **Auto sizing** - Follows container width  
✅ **Theme support** - Light/dark mode automatic  
✅ **Zero config** - Works out of the box  
✅ **Accessible** - Built-in ARIA labels  
✅ **Lightweight** - Only 2.3kb gzipped  
✅ **Customizable** - Colors, duration, border radius

---

## 🎨 Components Created

### 1. **TableSkeleton**

```tsx
<TableSkeleton rows={8} />
```

- Header with title + button
- 6-column table header
- Configurable row count

### 2. **DetailSkeleton**

```tsx
<DetailSkeleton />
```

- Page header with title, subtitle, button
- 4 info cards (2x2 grid)
- Multiple field skeletons per card

### 3. **DashboardSkeleton**

```tsx
<DashboardSkeleton />
```

- 4 stats cards (responsive grid)
- 2 chart placeholders
- Perfect for landing/dashboard pages

### 4. **LoadingSkeleton**

```tsx
<LoadingSkeleton />
```

- General purpose content skeleton

---

## 🌓 Dark Mode Support

### SkeletonThemeProvider

Location: `components/providers/skeleton-theme-provider.tsx`

**Configuration:**

- **Light Mode:** baseColor `#e5e7eb`, highlightColor `#f3f4f6`
- **Dark Mode:** baseColor `#1f2937`, highlightColor `#374151`
- **Border Radius:** `0.5rem` (8px)
- **Duration:** `1.5s`

**Wrapped in layout.tsx:**

```tsx
<ThemeProvider>
  <SkeletonThemeProvider>{children}</SkeletonThemeProvider>
</ThemeProvider>
```

---

## 📄 Loading Pages

All routes now have skeleton loading:

| Route                                       | Component              |
| ------------------------------------------- | ---------------------- |
| `app/loading.tsx`                           | DashboardSkeleton      |
| `app/dashboard/loading.tsx`                 | DashboardSkeleton      |
| `app/dashboard/employees/loading.tsx`       | TableSkeleton (8 rows) |
| `app/dashboard/employees/[id]/loading.tsx`  | DetailSkeleton         |
| `app/dashboard/companies/loading.tsx`       | TableSkeleton          |
| `app/dashboard/departments/loading.tsx`     | TableSkeleton          |
| `app/dashboard/positions/loading.tsx`       | TableSkeleton          |
| `app/dashboard/position-levels/loading.tsx` | TableSkeleton          |
| `app/dashboard/roles/loading.tsx`           | TableSkeleton          |
| `app/dashboard/work-shifts/loading.tsx`     | TableSkeleton          |

---

## 💡 Usage Examples

### Basic

```tsx
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

{
  isLoading ? <Skeleton count={3} /> : <Content />;
}
```

### Custom Size

```tsx
<Skeleton height={40} width={200} />
```

### Circle (Avatar)

```tsx
<Skeleton circle height={50} width={50} />
```

### Inline

```tsx
<h1>{user?.name || <Skeleton width={200} />}</h1>
```

---

## 📊 Component Previews

### TableSkeleton

```
┌──────────────────────────────────┐
│ [Title]            [Button]      │
├──────────────────────────────────┤
│ ▭ | ▭ | ▭ | ▭ | ▭ | ▭           │ Header
│ ▭ | ▭ | ▭ | ▭ | ▭ | ▭           │ Row 1
│ ▭ | ▭ | ▭ | ▭ | ▭ | ▭           │ Row 2
└──────────────────────────────────┘
```

### DetailSkeleton

```
┌──────────────────────────────────┐
│ [Title]            [Button]      │
├────────────────┬─────────────────┤
│ Card 1         │ Card 2          │
│ ▭▭▭▭▭         │ ▭▭▭▭▭          │
├────────────────┼─────────────────┤
│ Card 3         │ Card 4          │
└────────────────┴─────────────────┘
```

### DashboardSkeleton

```
┌────┬────┬────┬────┐ Stats
│ ▭  │ ▭  │ ▭  │ ▭  │
├──────────┬─────────┤
│ Chart 1  │ Chart 2 │
└──────────┴─────────┘
```

---

## 🚀 Benefits Over Custom Skeletons

| Feature       | Custom    | react-loading-skeleton |
| ------------- | --------- | ---------------------- |
| Shimmer       | ❌ Manual | ✅ Built-in            |
| Dark Mode     | ❌ Manual | ✅ Automatic           |
| Accessibility | ❌ Manual | ✅ Built-in            |
| Maintenance   | ❌ High   | ✅ Low                 |

**Result:** Better UX with less code! 🎉
