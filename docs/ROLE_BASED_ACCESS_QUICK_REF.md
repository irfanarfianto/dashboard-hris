# Role-Based Access - Quick Reference

## Roles & Access Matrix

| Menu Item            | Employee  | Manager   | HR Admin | Super Admin |
| -------------------- | --------- | --------- | -------- | ----------- |
| Dashboard            | ✅        | ✅        | ✅       | ✅          |
| Profil Saya          | ✅        | ✅        | ✅       | ✅          |
| **Manajemen SDM**    | ❌        | ❌        | ✅       | ✅          |
| └─ Karyawan          | ❌        | ❌        | ✅       | ✅          |
| └─ Perusahaan        | ❌        | ❌        | ✅       | ✅          |
| └─ Departemen        | ❌        | ❌        | ✅       | ✅          |
| └─ Level Jabatan     | ❌        | ❌        | ✅       | ✅          |
| └─ Posisi            | ❌        | ❌        | ✅       | ✅          |
| **Presensi & Shift** | ✅        | ✅        | ✅       | ✅          |
| └─ Presensi          | ✅ (self) | ✅ (team) | ✅ (all) | ✅ (all)    |
| └─ Shift Kerja       | ✅        | ✅        | ✅       | ✅          |
| └─ Lokasi & WiFi     | ✅        | ✅        | ✅       | ✅          |
| Cuti & Dinas         | ✅        | ✅        | ✅       | ✅          |
| Penggajian           | ❌        | ❌        | ✅       | ✅          |
| **Dokumentasi Dev**  | ❌        | ❌        | ❌       | ✅          |
| **Sistem**           | ❌        | ❌        | ✅       | ✅          |
| └─ Role & Akses      | ❌        | ❌        | ✅       | ✅          |
| └─ Notifikasi        | ❌        | ❌        | ✅       | ✅          |
| └─ Audit Log         | ❌        | ❌        | ✅       | ✅          |
| └─ Pengaturan        | ❌        | ❌        | ✅       | ✅          |

## Role Descriptions

### 👤 Employee

- View personal data
- Check-in/out attendance
- Request leave
- View own payslip

### 👔 Manager

- All Employee access +
- View team attendance
- Approve team leave requests
- View team reports

### 🎓 HR Admin

- All Manager access +
- Manage all employees
- Manage company structure
- Manage payroll
- System configuration

### 🔐 Super Admin

- All HR Admin access +
- Access developer documentation
- Full system control
- Can assign roles

## Adding New Menu with Role Access

```typescript
// In components/layout/Sidebar.tsx
const navigationItems: NavigationItem[] = [
  // ... existing items
  {
    title: "New Feature",
    href: "/dashboard/new-feature",
    icon: IconName,
    description: "Description here",
    allowedRoles: ["HR Admin", "Super Admin"], // Only these can access
  },
];
```

## Route Protection Example

```typescript
// app/dashboard/your-page/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default async function YourPage() {
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Get user role
  const { data: userRecord } = await supabase
    .from("users")
    .select(
      `
      role:roles(name)
    `
    )
    .eq("auth_user_id", user.id)
    .single();

  // Define allowed roles
  const allowedRoles = ["HR Admin", "Super Admin"];

  // Check access
  if (!allowedRoles.includes(userRecord?.role?.name)) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            Anda tidak memiliki akses ke halaman ini. Diperlukan role:{" "}
            {allowedRoles.join(" atau ")}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Page content here
  return <div>Your protected content</div>;
}
```

## Testing

1. **Setup test users:**

```sql
-- Check existing roles
SELECT * FROM roles ORDER BY id;

-- Assign different roles to test users
UPDATE users SET role_id = 1 WHERE username = 'admin@test.com';      -- Super Admin
UPDATE users SET role_id = 2 WHERE username = 'hr@test.com';         -- HR Admin
UPDATE users SET role_id = 3 WHERE username = 'manager@test.com';    -- Manager
UPDATE users SET role_id = 4 WHERE username = 'employee@test.com';   -- Employee
```

2. **Test scenarios:**

- [ ] Login as Employee → Should see limited menu
- [ ] Login as Manager → Should see same as Employee
- [ ] Login as HR Admin → Should see Manajemen SDM + Sistem
- [ ] Login as Super Admin → Should see ALL menus
- [ ] Try accessing restricted URL directly → Should show access denied

3. **Verify sidebar:**

- [ ] Role badge shows correct role
- [ ] Tips change based on role
- [ ] Menu items filtered correctly
- [ ] Submenu items hidden for restricted roles

## Files Modified

✅ `components/layout/Sidebar.tsx` - Added role filtering
✅ `app/dashboard/layout.tsx` - Fetch user role from DB
✅ `app/dashboard/layout-client.tsx` - Pass role to Sidebar
✅ `docs/ROLE_BASED_SIDEBAR.md` - Full documentation
✅ `docs/ROLE_BASED_ACCESS_QUICK_REF.md` - This file
