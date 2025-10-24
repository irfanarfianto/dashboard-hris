# Permission System - Quick Reference

## 🚀 Quick Start

### 1. Run Migration

```bash
# Copy migrations/20251024_add_permission_system.sql
# Paste in Supabase SQL Editor
# Click "Run"
```

### 2. Import Permission Helper

```typescript
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
```

### 3. Check Permission

```typescript
const canEdit = await hasPermission(PERMISSIONS.EMPLOYEES_EDIT);
```

---

## 📋 Permission List

### Profile & Dashboard

- `profile.view` - View own profile
- `profile.edit` - Edit own profile
- `dashboard.view` - View dashboard

### Employees

- `employees.view-all` - View all employees
- `employees.view-own` - View only own data
- `employees.view-team` - View team employees (Manager)
- `employees.create` - Create new employee
- `employees.edit` - Edit employee data
- `employees.delete` - Delete/archive employee
- `employees.export` - Export employee data

### Attendance

- `attendance.check-in` - Check-in/check-out
- `attendance.view-own` - View own attendance
- `attendance.view-team` - View team attendance
- `attendance.view-all` - View all attendance
- `attendance.edit` - Edit attendance records
- `attendance.approve` - Approve attendance
- `attendance.export` - Export reports

### Leave

- `leave.request` - Submit leave request
- `leave.view-own` - View own leave
- `leave.view-team` - View team leave
- `leave.view-all` - View all leave
- `leave.approve` - Approve/reject leave
- `leave.cancel` - Cancel leave

### Payroll

- `payroll.view-own` - View own payroll
- `payroll.view-all` - View all payroll
- `payroll.create` - Create payroll records
- `payroll.edit` - Edit payroll
- `payroll.process` - Process payroll run
- `payroll.export` - Export reports

### Shifts

- `shifts.view` - View shifts
- `shifts.create` - Create shifts
- `shifts.edit` - Edit shifts
- `shifts.delete` - Delete shifts
- `shifts.assign` - Assign shifts

### Master Data

- `master-data.view` - View master data
- `master-data.create` - Create master data
- `master-data.edit` - Edit master data
- `master-data.delete` - Delete master data

### System

- `roles.view` - View roles
- `roles.create` - Create roles
- `roles.edit` - Edit roles
- `roles.delete` - Delete roles
- `settings.view` - View settings
- `settings.edit` - Edit settings
- `audit.view` - View audit logs
- `reports.view` - View reports
- `reports.export` - Export reports

---

## 🔒 Permission by Role

| Permission           | Employee | Manager | HR Admin | Super Admin |
| -------------------- | -------- | ------- | -------- | ----------- |
| employees.view-own   | ✅       | ✅      | ✅       | ✅          |
| employees.view-team  | ❌       | ✅      | ✅       | ✅          |
| employees.view-all   | ❌       | ❌      | ✅       | ✅          |
| employees.create     | ❌       | ❌      | ✅       | ✅          |
| employees.edit       | ❌       | ❌      | ✅       | ✅          |
| employees.delete     | ❌       | ❌      | ❌       | ✅          |
| attendance.check-in  | ✅       | ✅      | ✅       | ✅          |
| attendance.view-team | ❌       | ✅      | ✅       | ✅          |
| attendance.approve   | ❌       | ✅      | ✅       | ✅          |
| leave.request        | ✅       | ✅      | ✅       | ✅          |
| leave.approve        | ❌       | ✅      | ✅       | ✅          |
| payroll.view-own     | ✅       | ✅      | ✅       | ✅          |
| payroll.view-all     | ❌       | ❌      | ✅       | ✅          |
| payroll.process      | ❌       | ❌      | ✅       | ✅          |
| roles.edit           | ❌       | ❌      | ❌       | ✅          |
| settings.edit        | ❌       | ❌      | ❌       | ✅          |

---

## 💻 Code Examples

### Server Component (Page)

```typescript
// app/dashboard/employees/page.tsx
import { requirePermission, PERMISSIONS } from "@/lib/permissions";

export default async function EmployeesPage() {
  // Require permission (redirect if no access)
  await requirePermission(PERMISSIONS.EMPLOYEES_VIEW_ALL);

  // Load data
  const employees = await getEmployees();

  return <EmployeeTable data={employees} />;
}
```

### Conditional Loading

```typescript
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function AttendancePage() {
  const canViewAll = await hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL);
  const canViewTeam = await hasPermission(PERMISSIONS.ATTENDANCE_VIEW_TEAM);

  let data;
  if (canViewAll) {
    data = await getAllAttendance();
  } else if (canViewTeam) {
    data = await getTeamAttendance();
  } else {
    data = await getOwnAttendance();
  }

  return <AttendanceTable data={data} />;
}
```

### Client Component (UI)

```typescript
// components/EmployeeActions.tsx
"use client";
import { Can } from "@/components/providers/PermissionProvider";
import { PERMISSIONS } from "@/lib/permissions";

export function EmployeeActions() {
  return (
    <div className="flex gap-2">
      <Can permission={PERMISSIONS.EMPLOYEES_EDIT}>
        <EditButton />
      </Can>

      <Can permission={PERMISSIONS.EMPLOYEES_DELETE}>
        <DeleteButton />
      </Can>
    </div>
  );
}
```

### Hook Usage

```typescript
"use client";
import { usePermissions } from "@/components/providers/PermissionProvider";
import { PERMISSIONS } from "@/lib/permissions";

export function ActionMenu() {
  const { hasPermission } = usePermissions();

  if (!hasPermission(PERMISSIONS.EMPLOYEES_EDIT)) {
    return <p>View Only</p>;
  }

  return <EditForm />;
}
```

### Server Action

```typescript
// lib/actions/employeeActions.ts
"use server";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function deleteEmployee(id: number) {
  // Check permission
  const canDelete = await hasPermission(PERMISSIONS.EMPLOYEES_DELETE);

  if (!canDelete) {
    return {
      success: false,
      error: "Permission denied: You cannot delete employees",
    };
  }

  // Perform delete
  await supabase.from("employees").delete().eq("id", id);

  return { success: true };
}
```

---

## 📊 Testing Checklist

### Employee

- [ ] Can view dashboard
- [ ] Can view own profile
- [ ] Can check-in/out
- [ ] Can view own attendance
- [ ] Can request leave
- [ ] Cannot view other employees
- [ ] Cannot create/edit employees
- [ ] Cannot approve leave
- [ ] Cannot view payroll of others

### Manager

- [ ] All Employee checks pass
- [ ] Can view team employees
- [ ] Can view team attendance
- [ ] Can approve team leave
- [ ] Can approve team attendance
- [ ] Cannot create/edit employees
- [ ] Cannot view/edit payroll
- [ ] Cannot delete employees

### HR Admin

- [ ] All Employee checks pass
- [ ] Can view all employees
- [ ] Can create/edit employees
- [ ] Can view all attendance
- [ ] Can process payroll
- [ ] Can manage shifts
- [ ] Cannot delete employees (unless granted)
- [ ] Cannot edit roles
- [ ] Cannot edit system settings

### Super Admin

- [ ] ALL permissions work
- [ ] Can delete employees
- [ ] Can edit roles
- [ ] Can edit system settings
- [ ] Can view audit logs
- [ ] Access dev documentation

---

## 🐛 Troubleshooting

### Permission Check Returns False

```typescript
// Debug: Get all user permissions
const permissions = await getUserPermissions();
console.log("User permissions:", permissions);

// Check specific permission
const hasPerm = await hasPermission("employees.edit");
console.log("Has employees.edit:", hasPerm);
```

### Check Database Assignment

```sql
-- Get user's role and permissions
SELECT
    u.username,
    r.name as role_name,
    p.name as permission_name
FROM users u
JOIN roles r ON r.id = u.role_id
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE u.auth_user_id = 'your-auth-uuid'
ORDER BY p.module, p.action;
```

### Permission Not Found

```sql
-- Check if permission exists
SELECT * FROM permissions WHERE name = 'employees.edit';

-- Check if role has permission
SELECT
    r.name,
    p.name
FROM roles r
JOIN role_permissions rp ON rp.role_id = r.id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'HR Admin'
  AND p.name = 'employees.edit';
```

---

## 🔗 Related Files

- `lib/permissions.ts` - Server-side helper functions
- `components/providers/PermissionProvider.tsx` - Client components
- `migrations/20251024_add_permission_system.sql` - Database setup
- `docs/PERMISSION_SYSTEM_GUIDE.md` - Full documentation

---

## ⚡ Common Patterns

### Pattern 1: Page with Actions

```typescript
export default async function Page() {
  await requirePermission(PERMISSIONS.MODULE_VIEW);

  const canCreate = await hasPermission(PERMISSIONS.MODULE_CREATE);
  const canEdit = await hasPermission(PERMISSIONS.MODULE_EDIT);
  const canDelete = await hasPermission(PERMISSIONS.MODULE_DELETE);

  return (
    <PermissionProvider permissions={await getUserPermissions()}>
      <PageContent
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </PermissionProvider>
  );
}
```

### Pattern 2: Conditional UI

```typescript
<Can permission="employees.create">
  <AddButton />
</Can>

<Can permission="employees.edit" fallback={<ViewOnlyBadge />}>
  <EditButton />
</Can>
```

### Pattern 3: Multiple Permissions

```typescript
// Require ANY of these
await requireAnyPermission([
  "employees.view-all",
  "employees.view-team",
  "employees.view-own",
]);

// Check if has ALL of these
const hasFullAccess = await hasAllPermissions([
  "employees.view-all",
  "employees.edit",
  "employees.delete",
]);
```
