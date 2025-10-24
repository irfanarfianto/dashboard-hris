# Implementation Guide - Permission System

## 📋 Checklist Implementasi

### Phase 1: Database Setup

- [ ] **Run migration** di Supabase SQL Editor
  - File: `migrations/20251024_add_permission_system.sql`
  - Verify: `SELECT COUNT(*) FROM permissions;` (harus ~50)
  - Verify: Role assignments sudah ada

### Phase 2: Layout Setup (DONE ✅)

- [x] **Update `app/dashboard/layout.tsx`**
  - Fetch user permissions dengan `get_user_permissions()`
  - Pass `userPermissions` ke DashboardLayoutClient
- [x] **Update `app/dashboard/layout-client.tsx`**
  - Import PermissionProvider
  - Wrap children dengan `<PermissionProvider permissions={userPermissions}>`

### Phase 3: Update Existing Pages

- [ ] **Attendance Page** (sebagian sudah done ✅)

  - [x] Import permission helpers
  - [x] Add requireAnyPermission check
  - [x] Replace role checks dengan permission checks
  - [ ] Test dengan berbagai role

- [ ] **Employees Page**

  - [ ] Add permission checks
  - [ ] Conditional data loading berdasarkan permission
  - [ ] Hide/show actions based on permissions

- [ ] **Other Pages**
  - [ ] Payroll
  - [ ] Leave
  - [ ] Shifts
  - [ ] Master Data pages

### Phase 4: Update Components

- [ ] **Employee Components**

  - [ ] AddEmployeeDialog - check create permission
  - [ ] EditEmployeeDialog - check edit permission
  - [ ] DeleteButton - check delete permission

- [ ] **Attendance Components**

  - [ ] CheckInOutCard - check check-in permission
  - [ ] ApprovalButtons - check approve permission

- [ ] **Other Components**
  - [ ] Leave approval buttons
  - [ ] Export buttons
  - [ ] Settings forms

### Phase 5: Server Actions

- [ ] **Add permission checks in all server actions**
  - [ ] employeeActions.ts
  - [ ] attendanceActions.ts
  - [ ] payrollActions.ts
  - [ ] Other action files

### Phase 6: Testing

- [ ] Test dengan role Employee
- [ ] Test dengan role Manager
- [ ] Test dengan role HR Admin
- [ ] Test dengan role Super Admin
- [ ] Verify redirect pada unauthorized access
- [ ] Verify UI elements hide/show correctly

---

## 🚀 Quick Implementation Steps

### Step 1: Run Database Migration

```bash
# 1. Buka Supabase Dashboard
# 2. Go to SQL Editor
# 3. Copy isi file: migrations/20251024_add_permission_system.sql
# 4. Paste dan Run
# 5. Verify dengan query:

SELECT
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON rp.role_id = r.id
GROUP BY r.id, r.name
ORDER BY r.id;

-- Expected result:
-- Employee: ~10 permissions
-- Manager: ~18 permissions
-- HR Admin: ~40 permissions
-- Super Admin: ~50+ permissions
```

### Step 2: Test Permission System

```bash
# Test di browser console (F12)
# Setelah login, cek permissions:

# Query untuk cek user permissions Anda:
SELECT
    u.username,
    r.name as role_name,
    p.name as permission_name
FROM users u
JOIN roles r ON r.id = u.role_id
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE u.auth_user_id = 'your-auth-uuid-here'
ORDER BY p.module, p.action;
```

### Step 3: Implement di Page (Template)

```typescript
// app/dashboard/[module]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  hasPermission,
  requireAnyPermission,
  PERMISSIONS,
} from "@/lib/permissions";

export default async function ModulePage() {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // 2. Permission check (redirect if no access)
  await requireAnyPermission([
    PERMISSIONS.MODULE_VIEW_ALL,
    PERMISSIONS.MODULE_VIEW_OWN,
  ]);

  // 3. Check specific permissions
  const canCreate = await hasPermission(PERMISSIONS.MODULE_CREATE);
  const canEdit = await hasPermission(PERMISSIONS.MODULE_EDIT);
  const canDelete = await hasPermission(PERMISSIONS.MODULE_DELETE);

  // 4. Load data based on permission
  let data;
  if (await hasPermission(PERMISSIONS.MODULE_VIEW_ALL)) {
    data = await loadAllData();
  } else {
    data = await loadOwnData(user.id);
  }

  // 5. Render with permissions
  return (
    <div>
      <h1>Module Page</h1>

      {canCreate && <CreateButton />}

      <DataTable data={data} canEdit={canEdit} canDelete={canDelete} />
    </div>
  );
}
```

### Step 4: Implement di Component (Template)

```typescript
// components/ModuleActions.tsx
"use client";
import { Can } from "@/components/providers/PermissionProvider";
import { PERMISSIONS } from "@/lib/permissions";

export function ModuleActions({ itemId }: { itemId: number }) {
  return (
    <div className="flex gap-2">
      <Can permission={PERMISSIONS.MODULE_EDIT}>
        <button>Edit</button>
      </Can>

      <Can permission={PERMISSIONS.MODULE_DELETE}>
        <button>Delete</button>
      </Can>
    </div>
  );
}
```

### Step 5: Implement di Server Action (Template)

```typescript
// lib/actions/moduleActions.ts
"use server";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function deleteItem(id: number) {
  // Check permission
  const canDelete = await hasPermission(PERMISSIONS.MODULE_DELETE);

  if (!canDelete) {
    return {
      success: false,
      error: "Permission denied: You cannot delete items",
    };
  }

  // Perform action
  await supabase.from("table").delete().eq("id", id);

  return { success: true };
}
```

---

## 📝 Common Patterns

### Pattern 1: View-Only vs Full Access

```typescript
// Page level
const canViewAll = await hasPermission(PERMISSIONS.EMPLOYEES_VIEW_ALL);
const canEdit = await hasPermission(PERMISSIONS.EMPLOYEES_EDIT);

return (
  <div>
    {canViewAll ? (
      <AllEmployeesTable canEdit={canEdit} />
    ) : (
      <OwnEmployeeProfile canEdit={canEdit} />
    )}
  </div>
);
```

### Pattern 2: Conditional Rendering

```typescript
// Component level
<Can permission={PERMISSIONS.EMPLOYEES_CREATE}>
  <AddButton />
</Can>

<Can
  permission={PERMISSIONS.EMPLOYEES_EDIT}
  fallback={<ViewOnlyBadge />}
>
  <EditButton />
</Can>
```

### Pattern 3: Multiple Permission Check

```typescript
// Check if has ANY
const canViewEmployees = await hasAnyPermission([
  PERMISSIONS.EMPLOYEES_VIEW_ALL,
  PERMISSIONS.EMPLOYEES_VIEW_TEAM,
  PERMISSIONS.EMPLOYEES_VIEW_OWN,
]);

// Check if has ALL
const hasFullAccess = await hasAllPermissions([
  PERMISSIONS.EMPLOYEES_VIEW_ALL,
  PERMISSIONS.EMPLOYEES_EDIT,
  PERMISSIONS.EMPLOYEES_DELETE,
]);
```

### Pattern 4: Role + Permission Combined

```typescript
// Sometimes you need both role and permission
const canApproveLeave =
  (userRole === "Manager" || userRole === "HR Admin") &&
  (await hasPermission(PERMISSIONS.LEAVE_APPROVE));
```

---

## 🐛 Troubleshooting

### Issue 1: Permission always returns false

**Check:**

```sql
-- Verify user has role
SELECT u.username, r.name as role
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE u.auth_user_id = 'your-uuid';

-- Verify role has permissions
SELECT r.name, p.name
FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'Your Role';
```

### Issue 2: Function not found

**Error:** `function get_user_permissions does not exist`

**Solution:** Run migration lagi, pastikan functions created.

### Issue 3: RLS blocking queries

**Check RLS policies:**

```sql
SELECT * FROM pg_policies
WHERE tablename IN ('permissions', 'role_permissions');
```

---

## 📚 Reference Files

### Created Files:

- ✅ `lib/permissions.ts` - Server-side helpers
- ✅ `components/providers/PermissionProvider.tsx` - Client-side components
- ✅ `migrations/20251024_add_permission_system.sql` - Database setup
- ✅ `app/dashboard/employees/page-example-with-permissions.tsx` - Example page
- ✅ `components/examples/PermissionExamples.tsx` - Example components

### Modified Files:

- ✅ `app/dashboard/layout.tsx` - Added permission fetching
- ✅ `app/dashboard/layout-client.tsx` - Added PermissionProvider
- ✅ `app/dashboard/attendance/page.tsx` - Added permission checks

### Documentation:

- ✅ `docs/PERMISSION_SYSTEM_GUIDE.md` - Full guide
- ✅ `docs/PERMISSION_QUICK_REF.md` - Quick reference

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] User dapat login
- [ ] User permissions ter-load di layout
- [ ] PermissionProvider wraps semua pages
- [ ] `<Can>` components work
- [ ] `usePermissions()` hook accessible
- [ ] Server permission checks work
- [ ] Redirect works jika no permission
- [ ] UI elements hide/show correctly
- [ ] Different roles see different menus
- [ ] Server actions check permissions

---

## 🎯 Next Steps

1. **Run Migration** (5 min)
2. **Test Current Implementation** (10 min)
   - Login dengan different users
   - Check attendance page
3. **Update 1-2 More Pages** (30 min)
   - Start with employees or leave page
4. **Update Key Components** (30 min)
   - Add/Edit/Delete buttons
5. **Test Thoroughly** (30 min)
   - All roles
   - All features

**Total Time Estimate:** 2 hours untuk implementasi penuh

---

## 💡 Tips

1. **Start with high-traffic pages** (attendance, employees)
2. **Test frequently** dengan different roles
3. **Use examples** dari `PermissionExamples.tsx`
4. **Keep permissions granular** - better to have more specific permissions
5. **Log permission checks** during development untuk debugging

```typescript
const canEdit = await hasPermission(PERMISSIONS.EMPLOYEES_EDIT);
console.log("Can edit employees:", canEdit); // Debug
```

6. **Use TypeScript autocomplete** - `PERMISSIONS.` akan show semua options
7. **Document custom permissions** jika add new ones
