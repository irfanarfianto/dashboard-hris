# Sidebar Navigation Restructure

## Overview

Sidebar navigation telah direstrukturisasi dengan pengelompokan yang lebih logis dan user-friendly. Semua halaman yang belum diimplementasikan telah dibuat dengan placeholder "Coming Soon" untuk menghindari error 404.

## Changes Made

### 1. Sidebar Grouping

#### Before:

- Menu datar tanpa pengelompokan yang jelas
- Data Master terpisah dari Karyawan
- Shift Kerja dan Role tercampur dengan master data lainnya

#### After (New Structure):

**Dashboard**

- Landing page dengan statistik dan ringkasan

**Manajemen SDM** (Submenu)

- Karyawan
- Perusahaan
- Departemen
- Level Jabatan
- Posisi

**Presensi & Shift** (Submenu)

- Presensi
- Shift Kerja
- Lokasi & WiFi

**Cuti & Dinas** (Single menu)

- Manajemen cuti, izin, dan perjalanan dinas

**Penggajian** (Single menu)

- Payroll dan komponen gaji

**Sistem** (Submenu)

- Role & Akses
- Notifikasi
- Audit Log
- Pengaturan

### 2. New Pages Created

All pages created with "Coming Soon" placeholder to prevent 404 errors:

1. **app/dashboard/attendance/page.tsx**

   - Placeholder untuk modul presensi
   - Features preview: Geofencing, Real-time Tracking, Laporan Absensi, Overtime Tracking

2. **app/dashboard/locations/page.tsx**

   - Placeholder untuk manajemen lokasi & WiFi
   - Features preview: GPS Coordinates, Radius Setting, WiFi Network, Geofencing

3. **app/dashboard/leaves/page.tsx**

   - Placeholder untuk cuti & dinas
   - Features preview: Pengajuan Cuti, Approval Multi Level, Sisa Cuti, Riwayat Cuti

4. **app/dashboard/payroll/page.tsx**

   - Placeholder untuk penggajian
   - Features preview: Komponen Gaji, Slip Gaji, Pajak & BPJS, Laporan Payroll

5. **app/dashboard/notifications/page.tsx**

   - Placeholder untuk notifikasi
   - Features preview: Email Template, Push Notification, Broadcast, Log Notifikasi

6. **app/dashboard/audit/page.tsx**

   - Placeholder untuk audit log
   - Features preview: Activity Log, Filter & Search, Real-time Monitor, Security Alert

7. **app/dashboard/settings/page.tsx**
   - Placeholder untuk pengaturan
   - Features preview: Konfigurasi Umum, Lokalisasi, API Keys, Backup & Restore

### 3. Loading States

Loading files created for all new pages:

- `app/dashboard/attendance/loading.tsx`
- `app/dashboard/locations/loading.tsx`
- `app/dashboard/leaves/loading.tsx`
- `app/dashboard/payroll/loading.tsx`
- `app/dashboard/notifications/loading.tsx`
- `app/dashboard/audit/loading.tsx`
- `app/dashboard/settings/loading.tsx`

All use `LoadingSkeleton` component for consistent UX.

## Navigation Structure

```
📊 Dashboard
👥 Manajemen SDM
   ├─ 👤 Karyawan
   ├─ 🏢 Perusahaan
   ├─ 🏢 Departemen
   ├─ 💼 Level Jabatan
   └─ 💼 Posisi
⏰ Presensi & Shift
   ├─ ⏰ Presensi
   ├─ ⏲️ Shift Kerja
   └─ 📍 Lokasi & WiFi
📅 Cuti & Dinas
💰 Penggajian
⚙️ Sistem
   ├─ 🛡️ Role & Akses
   ├─ 🔔 Notifikasi
   ├─ 🛡️ Audit Log
   └─ ⚙️ Pengaturan
```

## Benefits

### 1. Better Organization

- Related features grouped together
- Clear hierarchy with submenu
- Reduced menu clutter

### 2. No More 404 Errors

- All routes have placeholder pages
- Clear indication of features in development
- Better user experience

### 3. Scalability

- Easy to add new features to existing groups
- Consistent structure for future modules

### 4. User Experience

- Intuitive navigation
- Visual feedback with icons
- Feature previews on placeholder pages

## Implementation Details

### Sidebar Component Updates

**File:** `components/layout/Sidebar.tsx`

**Key Changes:**

1. Removed unused `Database` icon import
2. Restructured `navigationItems` array with logical grouping
3. Submenu support with expand/collapse functionality
4. Active state detection for parent and child items

### Placeholder Page Pattern

All placeholder pages follow this pattern:

```tsx
import { Icon, ... } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PageName() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
        <p className="text-muted-foreground">Description</p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500">
            <Icon className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fitur Dalam Pengembangan</CardTitle>
          <CardDescription className="text-base">
            Module description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Feature previews */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Next Steps

When implementing actual features:

1. Replace placeholder page with actual implementation
2. Keep the same route structure
3. Update feature list in documentation
4. Remove "Coming Soon" indication

## Testing

To test the changes:

1. Start dev server: `npm run dev`
2. Navigate to dashboard
3. Click on each menu item
4. Verify:
   - ✅ No 404 errors
   - ✅ Submenu expand/collapse works
   - ✅ Active state highlighting works
   - ✅ Placeholder pages display correctly
   - ✅ Loading states work

## Files Modified

### Modified:

- `components/layout/Sidebar.tsx`

### Created:

- `app/dashboard/attendance/page.tsx`
- `app/dashboard/attendance/loading.tsx`
- `app/dashboard/locations/page.tsx`
- `app/dashboard/locations/loading.tsx`
- `app/dashboard/leaves/page.tsx`
- `app/dashboard/leaves/loading.tsx`
- `app/dashboard/payroll/page.tsx`
- `app/dashboard/payroll/loading.tsx`
- `app/dashboard/notifications/page.tsx`
- `app/dashboard/notifications/loading.tsx`
- `app/dashboard/audit/page.tsx`
- `app/dashboard/audit/loading.tsx`
- `app/dashboard/settings/page.tsx`
- `app/dashboard/settings/loading.tsx`

## Related Documentation

- [SKELETON_LOADING_GUIDE.md](./SKELETON_LOADING_GUIDE.md) - Loading state patterns
- [hris_full_feature_flows.md](./hris_full_feature_flows.md) - Complete feature overview
- [INDEX.md](./INDEX.md) - Documentation index
