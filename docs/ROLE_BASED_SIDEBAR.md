# Role-Based Sidebar Navigation

## Overview

Sidebar navigation sekarang sudah dilengkapi dengan **role-based access control**. Menu yang ditampilkan akan disesuaikan berdasarkan role user yang sedang login.

## Role Hierarchy

Sistem memiliki 4 role dengan tingkat akses berbeda:

### 1. 👤 Employee (Karyawan)

**Deskripsi:** Akses dasar untuk melihat data pribadi

**Menu yang bisa diakses:**

- ✅ Dashboard (ringkasan pribadi)
- ✅ Profil Saya
- ✅ Presensi & Shift (melihat & check-in/out sendiri)
  - Presensi
  - Shift Kerja
  - Lokasi & WiFi
- ✅ Cuti & Dinas (mengajukan cuti)

**Menu yang TIDAK bisa diakses:**

- ❌ Manajemen SDM (semua sub-menu)
- ❌ Penggajian
- ❌ Dokumentasi Dev
- ❌ Sistem (Role, Notifikasi, Audit, Pengaturan)

---

### 2. 👔 Manager

**Deskripsi:** Akses untuk melihat data tim

**Menu yang bisa diakses:**

- ✅ Dashboard (statistik tim)
- ✅ Profil Saya
- ✅ Presensi & Shift (melihat tim)
  - Presensi (approve/monitoring tim)
  - Shift Kerja
  - Lokasi & WiFi
- ✅ Cuti & Dinas (approve permohonan tim)

**Menu yang TIDAK bisa diakses:**

- ❌ Manajemen SDM
- ❌ Penggajian
- ❌ Dokumentasi Dev
- ❌ Sistem

**Catatan:** Manager memiliki akses yang sama dengan Employee, tapi dengan kemampuan untuk melihat dan approve data tim mereka.

---

### 3. 🎓 HR Admin

**Deskripsi:** Akses penuh untuk mengelola data karyawan

**Menu yang bisa diakses:**

- ✅ Dashboard (statistik perusahaan)
- ✅ Profil Saya
- ✅ **Manajemen SDM** (full access)
  - Karyawan
  - Perusahaan
  - Departemen
  - Level Jabatan
  - Posisi
- ✅ Presensi & Shift (kelola semua karyawan)
  - Presensi
  - Shift Kerja
  - Lokasi & WiFi
- ✅ Cuti & Dinas
- ✅ **Penggajian** (kelola payroll)
- ✅ **Sistem**
  - Role & Akses
  - Notifikasi
  - Audit Log
  - Pengaturan

**Menu yang TIDAK bisa diakses:**

- ❌ Dokumentasi Dev

---

### 4. 🔐 Super Admin

**Deskripsi:** Akses penuh ke seluruh sistem

**Menu yang bisa diakses:**

- ✅ **SEMUA MENU**
- ✅ Dashboard
- ✅ Profil Saya
- ✅ Manajemen SDM
- ✅ Presensi & Shift
- ✅ Cuti & Dinas
- ✅ Penggajian
- ✅ **Dokumentasi Dev** (exclusive untuk Super Admin)
  - Index Docs
  - Developer Guide
  - Create CRUD
  - Search & Pagination
  - Migration Guide
- ✅ Sistem

---

## Implementation Details

### File Structure

```
app/dashboard/
├── layout.tsx                    # Server component: fetch user role
└── layout-client.tsx             # Client component: pass role to Sidebar

components/layout/
└── Sidebar.tsx                   # Role-based navigation filtering
```

### How It Works

#### 1. **layout.tsx** (Server Component)

```typescript
// Fetch user role from database
const { data: userRecord } = await supabase
  .from("users")
  .select("role_id")
  .eq("auth_user_id", user.id)
  .maybeSingle();

const { data: roleData } = await supabase
  .from("roles")
  .select("name")
  .eq("id", userRecord.role_id)
  .single();

// Pass role to client component
<DashboardLayoutClient userRole={roleData.name} />;
```

#### 2. **Sidebar.tsx** (Navigation Filtering)

```typescript
// Define allowed roles for each menu
const navigationItems: NavigationItem[] = [
  {
    title: "Manajemen SDM",
    allowedRoles: ["HR Admin", "Super Admin"], // Only these roles can access
    submenu: [...]
  },
  {
    title: "Dashboard",
    // No allowedRoles = accessible to all
  }
];

// Filter based on user role
function filterNavigationByRole(items, userRole) {
  return items.filter(item => {
    if (!item.allowedRoles) return true; // Show to all
    return item.allowedRoles.includes(userRole);
  });
}
```

### Navigation Item Configuration

```typescript
interface NavigationItem {
  title: string;
  href?: string;
  icon: React.ComponentType;
  description: string;
  allowedRoles?: RoleType[]; // ["Employee", "Manager", "HR Admin", "Super Admin"]
  submenu?: Array<{...}>;
}
```

**Rules:**

- If `allowedRoles` is **undefined** or **empty array** → Accessible to **ALL roles**
- If `allowedRoles` has values → Only specified roles can access

---

## User Experience

### Role Badge in Sidebar Footer

Sidebar menampilkan role badge di footer dengan warna gradient teal-lime:

```
┌─────────────────────┐
│  Your Role          │
│  HR Admin      🛡️   │
└─────────────────────┘
```

### Dynamic Tips

Tips di sidebar footer berubah sesuai role:

- **Employee:** "Gunakan menu Presensi untuk check-in/out."
- **Manager:** "Lihat data tim Anda di menu Presensi."
- **HR Admin:** "Kelola semua data karyawan melalui Manajemen SDM."
- **Super Admin:** "Anda memiliki akses penuh ke seluruh sistem."

---

## Route Protection

⚠️ **IMPORTANT:** Sidebar filtering hanya menyembunyikan menu dari UI. Anda masih perlu menambahkan **route protection** di setiap page untuk security.

### Example Route Protection

```typescript
// app/dashboard/employees/page.tsx
export default async function EmployeesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user role
  const { data: userRecord } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("auth_user_id", user.id)
    .single();

  // Check if role is allowed
  const allowedRoles = ["HR Admin", "Super Admin"];
  if (!allowedRoles.includes(userRecord.role.name)) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Anda tidak memiliki akses ke halaman ini.
        </AlertDescription>
      </Alert>
    );
  }

  // ... rest of page
}
```

---

## Testing

### Test Cases

1. **Login as Employee**

   - ✅ Should see: Dashboard, Profil, Presensi, Cuti
   - ❌ Should NOT see: Manajemen SDM, Penggajian, Sistem, Docs

2. **Login as Manager**

   - ✅ Same as Employee
   - ✅ Presensi shows team data (not just personal)

3. **Login as HR Admin**

   - ✅ Should see: All except Dokumentasi Dev
   - ✅ Can access Manajemen SDM, Penggajian, Sistem

4. **Login as Super Admin**
   - ✅ Should see: ALL menus including Dokumentasi Dev

### How to Test

1. Create users with different roles in Supabase:

   ```sql
   -- Ensure roles exist
   SELECT * FROM roles;

   -- Create test users with different roles
   INSERT INTO users (auth_user_id, employee_id, username, role_id, is_active)
   VALUES
     ('auth-uuid-1', 1, 'employee@test.com', 4, true),  -- Employee
     ('auth-uuid-2', 2, 'manager@test.com', 3, true),   -- Manager
     ('auth-uuid-3', 3, 'hr@test.com', 2, true),        -- HR Admin
     ('auth-uuid-4', 4, 'admin@test.com', 1, true);     -- Super Admin
   ```

2. Login with each user
3. Check sidebar navigation
4. Verify role badge shows correct role
5. Test accessing restricted pages directly via URL

---

## Future Enhancements

### Planned Features

1. **Granular Permissions**

   - Not just role-based, but permission-based (view, create, edit, delete)
   - Permission matrix for each module

2. **Dynamic Menu Loading**

   - Load menu structure from database
   - Admin can customize menu visibility per role

3. **Audit Logging**

   - Log when user tries to access restricted pages
   - Track permission changes

4. **Role Switching** (for Super Admin)
   - Test how other roles see the system
   - Impersonate user functionality

---

## Related Documentation

- `docs/ROLE_FEATURE_GUIDE.md` - Role management features
- `docs/SECURITY_FLOW.md` - Security & authentication flow
- `docs/PROFILE_AUTH_FIX.md` - Auth user linking guide

---

## Summary

✅ **Implemented:**

- Role-based sidebar filtering
- 4 role levels with different access
- Role badge in sidebar footer
- Dynamic tips based on role
- Server-side role fetching

⏳ **TODO:**

- Add route protection middleware
- Implement permission-based access control
- Add role switching for testing
- Create admin panel for role-menu mapping
