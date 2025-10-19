# Loading Component Implementation

## Komponen yang Dibuat

### 1. **Loading Component** (`components/ui/loading.tsx`)

Komponen loading reusable dengan beberapa varian:

#### a. Loading (Main Component)

```tsx
<Loading
  fullScreen={true} // Fullscreen overlay
  size="lg" // sm | md | lg | xl
  text="Memuat..." // Custom text
/>
```

**Props:**

- `size`: Ukuran spinner (`sm`, `md`, `lg`, `xl`)
- `text`: Teks yang ditampilkan di bawah spinner
- `fullScreen`: Jika `true`, akan menutupi seluruh layar dengan backdrop blur

**Features:**

- ✅ Spinner dengan animasi smooth menggunakan Lucide's Loader2
- ✅ Backdrop blur untuk fullscreen mode
- ✅ Dark mode support
- ✅ Responsive sizing
- ✅ Animated pulse text

#### b. LoadingSpinner

Spinner sederhana untuk inline use:

```tsx
<LoadingSpinner className="h-6 w-6" />
```

#### c. LoadingDots

Animasi dots yang bouncing:

```tsx
<LoadingDots />
```

#### d. LoadingSkeleton

Placeholder skeleton untuk content:

```tsx
<LoadingSkeleton />
```

---

## 2. **Loading Pages**

File `loading.tsx` untuk Next.js App Router:

### File yang Dibuat:

1. ✅ `app/loading.tsx` - Root loading (ukuran xl)
2. ✅ `app/dashboard/loading.tsx` - Dashboard loading (ukuran lg)
3. ✅ `app/dashboard/employees/loading.tsx` - Employee list loading
4. ✅ `app/dashboard/employees/[id]/loading.tsx` - Employee detail loading

---

## Cara Kerja

Next.js akan otomatis menampilkan `loading.tsx` ketika:

- Navigasi antar halaman sedang berlangsung
- Data sedang di-fetch di Server Component
- Suspense boundary triggered

**Sebelumnya:** Logo Next.js di pojok kiri atas
**Sekarang:** Loading spinner di tengah dengan backdrop blur

---

## Styling

### Light Mode:

- Background: `bg-white/80` dengan `backdrop-blur-sm`
- Spinner: `text-blue-600`
- Border: `border-gray-200`

### Dark Mode:

- Background: `bg-gray-900/80` dengan `backdrop-blur-sm`
- Spinner: `text-blue-400`
- Border: `border-gray-700`

---

## Penggunaan di Komponen Lain

### 1. Inline Loading

```tsx
import { LoadingSpinner } from "@/components/ui/loading";

{
  isLoading && <LoadingSpinner className="h-5 w-5" />;
}
```

### 2. Fullscreen Loading

```tsx
import { Loading } from "@/components/ui/loading";

{
  isLoading && <Loading fullScreen text="Menyimpan data..." />;
}
```

### 3. Loading Dots

```tsx
import { LoadingDots } from "@/components/ui/loading";

<button disabled={isLoading}>Simpan {isLoading && <LoadingDots />}</button>;
```

### 4. Skeleton Placeholder

```tsx
import { LoadingSkeleton } from "@/components/ui/loading";

{
  !data ? <LoadingSkeleton /> : <DataView data={data} />;
}
```

---

## Preview Ukuran

- **sm**: 24px (h-6 w-6) - untuk button/inline
- **md**: 40px (h-10 w-10) - default
- **lg**: 64px (h-16 w-16) - untuk halaman
- **xl**: 96px (h-24 w-24) - untuk splash screen

---

## Benefits

✅ Konsisten di seluruh aplikasi
✅ Dark mode support otomatis
✅ Smooth animations
✅ Backdrop blur untuk fokus
✅ Multiple variants untuk berbagai use case
✅ Fully typed dengan TypeScript
✅ Responsive dan accessible
