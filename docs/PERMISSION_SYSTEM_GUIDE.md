# Permission-Based Access Control (PBAC) System

## Overview

Sistem HRIS sekarang menggunakan **Permission-Based Access Control** yang lebih granular daripada hanya role-based access. Setiap role memiliki set permissions yang menentukan apa yang bisa dilakukan user.

## Konsep: Role vs Permission

### Role (Jabatan)

- Menentukan **posisi/jabatan** user dalam organisasi
- Contoh: Employee, Manager, HR Admin, Super Admin

### Permission (Hak Akses)

- Menentukan **aksi spesifik** yang bisa dilakukan
- Format: `module.action` (e.g., `employees.create`, `attendance.approve`)
- Lebih granular dan fleksibel

### Keuntungan Permission System

```
❌ Role-only:
"HR Admin bisa akses semua fitur HR"
→ Terlalu broad, tidak bisa customize

✅ Role + Permission:
"HR Admin bisa:
  - ✅ View all employees
  - ✅ Create/Edit employees
  - ❌ Delete employees (hanya Super Admin)
  - ✅ Process payroll
  - ✅ Approve leave"
→ Granular, flexible, customizable
```

---

## Permission Structure

### Format

```
module.action
```

- **module**: Feature/area (employees, attendance, payroll, etc.)
- **action**: Operation (view, create, edit, delete, approve, etc.)

### Examples

```typescript
"employees.view-all"; // View all employees
"employees.create"; // Create new employee
"attendance.check-in"; // Check-in/out attendance
"attendance.approve"; // Approve attendance adjustments
"leave.approve"; // Approve leave requests
"payroll.process"; // Process payroll run
```

---

## Role Permission Matrix

### 👤 Employee (Basic User)

| Module     | Permissions                              |
| ---------- | ---------------------------------------- |
| Profile    | ✅ view, ✅ edit                         |
| Dashboard  | ✅ view                                  |
| Employees  | ✅ view-own (hanya lihat profil sendiri) |
| Attendance | ✅ check-in, ✅ view-own                 |
| Leave      | ✅ request, ✅ view-own                  |
| Payroll    | ✅ view-own                              |
| Shifts     | ✅ view                                  |

**Total:** ~10 permissions

---

### 👔 Manager (Team Leader / Supervisor)

**Includes all Employee permissions +**

| Module     | Additional Permissions              |
| ---------- | ----------------------------------- |
| Employees  | ✅ view-team                        |
| Attendance | ✅ view-team, ✅ approve, ✅ export |
| Leave      | ✅ view-team, ✅ approve, ✅ cancel |
| Reports    | ✅ view, ✅ export                  |

**Key Differences:**

- ❌ TIDAK bisa create/edit/delete employee master data
- ✅ Bisa approve attendance & leave tim sendiri
- ✅ Bisa lihat data tim (filtered by department/team)

**Total:** ~18 permissions

---

### 🎓 HR Admin (Human Resource Administrator)

**Includes all Employee permissions +**

| Module      | Permissions                                               |
| ----------- | --------------------------------------------------------- |
| Employees   | ✅ view-all, ✅ create, ✅ edit, ✅ delete, ✅ export     |
| Attendance  | ✅ view-all, ✅ view-team, ✅ edit, ✅ approve, ✅ export |
| Leave       | ✅ view-all, ✅ approve, ✅ cancel                        |
| Payroll     | ✅ view-all, ✅ create, ✅ edit, ✅ process, ✅ export    |
| Shifts      | ✅ create, ✅ edit, ✅ delete, ✅ assign                  |
| Master Data | ✅ view, ✅ create, ✅ edit, ✅ delete                    |
| Roles       | ✅ view (read-only)                                       |

**Key Differences:**

- ✅ Full access to HR operations
- ✅ Manage employees, payroll, attendance
- ❌ TIDAK bisa edit/delete roles (protection)
- ❌ TIDAK bisa edit system settings

**Total:** ~40 permissions

---

### 🔐 Super Admin (System Administrator)

**ALL PERMISSIONS** (~50+ permissions)

Including exclusive permissions:

- ✅ `roles.create`, `roles.edit`, `roles.delete`
- ✅ `settings.edit`
- ✅ `audit.view`
- ✅ Access to developer documentation

---

## Database Schema

### Tables

#### 1. `permissions`

```sql
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,        -- e.g., 'employees'
    action VARCHAR(50) NOT NULL,        -- e.g., 'view-all'
    name VARCHAR(100) NOT NULL UNIQUE,  -- e.g., 'employees.view-all'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

#### 2. `role_permissions` (Junction Table)

```sql
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id),
    permission_id INT NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);
```

### Relationships

```
roles (1) ←→ (N) role_permissions (N) ←→ (1) permissions
```

---

## Implementation

### 1. Database Functions

#### Check Permission

```sql
SELECT user_has_permission(
    'auth-user-uuid',  -- User's auth UUID
    'employees.edit'   -- Permission to check
); -- Returns: true/false
```

#### Get All User Permissions

```sql
SELECT * FROM get_user_permissions('auth-user-uuid');
-- Returns:
-- | permission_name    | module     | action    | description          |
-- |--------------------|------------|-----------|----------------------|
-- | employees.view-all | employees  | view-all  | View all employees   |
-- | attendance.approve | attendance | approve   | Approve attendance   |
```

---

### 2. Server-Side Usage (Next.js Server Components)

#### Check Permission

```typescript
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function EmployeesPage() {
  // Check if user can view all employees
  const canViewAll = await hasPermission(PERMISSIONS.EMPLOYEES_VIEW_ALL);

  if (!canViewAll) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view all employees.
        </AlertDescription>
      </Alert>
    );
  }

  // ... load and display employees
}
```

#### Require Permission (with redirect)

```typescript
import { requirePermission, PERMISSIONS } from "@/lib/permissions";

export default async function CreateEmployeePage() {
  // Will redirect to /dashboard if no permission
  await requirePermission(PERMISSIONS.EMPLOYEES_CREATE, {
    redirectTo: "/dashboard",
    errorMessage: "You cannot create employees",
  });

  // ... show create employee form
}
```

#### Require Any Permission

```typescript
import { requireAnyPermission, PERMISSIONS } from "@/lib/permissions";

export default async function AttendancePage() {
  // Need at least one of these permissions
  await requireAnyPermission([
    PERMISSIONS.ATTENDANCE_VIEW_OWN,
    PERMISSIONS.ATTENDANCE_VIEW_TEAM,
    PERMISSIONS.ATTENDANCE_VIEW_ALL,
  ]);

  // ... show attendance based on user's permission level
}
```

#### Conditional Data Loading

```typescript
import {
  hasPermission,
  hasAnyPermission,
  PERMISSIONS,
} from "@/lib/permissions";

export default async function AttendancePage() {
  const canViewAll = await hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL);
  const canViewTeam = await hasPermission(PERMISSIONS.ATTENDANCE_VIEW_TEAM);

  let query = supabase.from("attendance").select("*");

  if (canViewAll) {
    // Load all attendance
    // No additional filter
  } else if (canViewTeam) {
    // Load only team attendance
    query = query.eq("department_id", userDepartmentId);
  } else {
    // Load only own attendance
    query = query.eq("employee_id", employeeId);
  }

  const { data: attendanceRecords } = await query;
  // ...
}
```

---

### 3. Client-Side Usage (React Components)

#### PermissionProvider (Layout)

```typescript
// app/dashboard/layout-client.tsx
import { PermissionProvider } from "@/components/providers/PermissionProvider";

export default function LayoutClient({
  children,
  userPermissions, // Array of permission names
}: {
  children: ReactNode;
  userPermissions: string[];
}) {
  return (
    <PermissionProvider permissions={userPermissions}>
      {children}
    </PermissionProvider>
  );
}
```

#### Can Component

```typescript
import { Can } from "@/components/providers/PermissionProvider";
import { PERMISSIONS } from "@/lib/permissions";

export function EmployeeActions() {
  return (
    <div className="flex gap-2">
      {/* Show edit button only if user has permission */}
      <Can permission={PERMISSIONS.EMPLOYEES_EDIT}>
        <Button variant="outline">Edit</Button>
      </Can>

      {/* Show delete button only if user has permission */}
      <Can permission={PERMISSIONS.EMPLOYEES_DELETE}>
        <Button variant="destructive">Delete</Button>
      </Can>

      {/* Show fallback if no permission */}
      <Can
        permission={PERMISSIONS.EMPLOYEES_EDIT}
        fallback={<p className="text-sm text-gray-500">View only</p>}
      >
        <Button>Edit</Button>
      </Can>
    </div>
  );
}
```

#### CanAny Component

```typescript
import { CanAny } from "@/components/providers/PermissionProvider";

export function EmployeeList() {
  return (
    <CanAny
      permissions={[
        "employees.view-all",
        "employees.view-team",
        "employees.view-own",
      ]}
    >
      <EmployeeTable />
    </CanAny>
  );
}
```

#### usePermissions Hook

```typescript
"use client";
import { usePermissions } from "@/components/providers/PermissionProvider";
import { PERMISSIONS } from "@/lib/permissions";

export function EmployeeCard() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const canEdit = hasPermission(PERMISSIONS.EMPLOYEES_EDIT);
  const canView = hasAnyPermission([
    PERMISSIONS.EMPLOYEES_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_VIEW_TEAM,
  ]);

  return (
    <Card>
      <CardContent>
        {/* Conditional rendering */}
        {canView && <EmployeeDetails />}
        {canEdit && <EditButton />}
      </CardContent>
    </Card>
  );
}
```

---

## Migration & Setup

### Run Migration

```bash
# In Supabase SQL Editor, run:
# migrations/20251024_add_permission_system.sql
```

This will:

1. ✅ Create `permissions` table
2. ✅ Create `role_permissions` junction table
3. ✅ Insert ~50 permissions
4. ✅ Assign permissions to existing roles
5. ✅ Create helper functions
6. ✅ Enable RLS policies

### Verify Installation

```sql
-- Check permissions count
SELECT COUNT(*) FROM permissions WHERE deleted_at IS NULL;
-- Expected: ~50 permissions

-- Check role assignments
SELECT
    r.name as role_name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON rp.role_id = r.id
GROUP BY r.id, r.name
ORDER BY r.id;
-- Expected:
-- Employee: ~10
-- Manager: ~18
-- HR Admin: ~40
-- Super Admin: ~50+
```

---

## Real-World Examples

### Example 1: Employee Management Page

```typescript
// app/dashboard/employees/page.tsx
import {
  requireAnyPermission,
  hasPermission,
  PERMISSIONS,
} from "@/lib/permissions";

export default async function EmployeesPage() {
  // Require at least view permission
  await requireAnyPermission([
    PERMISSIONS.EMPLOYEES_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_VIEW_TEAM,
    PERMISSIONS.EMPLOYEES_VIEW_OWN,
  ]);

  // Check specific permissions for UI
  const canCreate = await hasPermission(PERMISSIONS.EMPLOYEES_CREATE);
  const canEdit = await hasPermission(PERMISSIONS.EMPLOYEES_EDIT);
  const canDelete = await hasPermission(PERMISSIONS.EMPLOYEES_DELETE);
  const canViewAll = await hasPermission(PERMISSIONS.EMPLOYEES_VIEW_ALL);

  // Load data based on permission level
  let employees;
  if (canViewAll) {
    employees = await getAllEmployees();
  } else {
    employees = await getOwnEmployeeData();
  }

  return (
    <PermissionProvider permissions={await getUserPermissions()}>
      <div>
        <div className="flex justify-between">
          <h1>Employees</h1>
          <Can permission={PERMISSIONS.EMPLOYEES_CREATE}>
            <AddEmployeeButton />
          </Can>
        </div>

        <EmployeeTable
          employees={employees}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </PermissionProvider>
  );
}
```

### Example 2: Attendance Check-In

```typescript
// components/attendance/CheckInButton.tsx
"use client";
import { Can } from "@/components/providers/PermissionProvider";
import { PERMISSIONS } from "@/lib/permissions";

export function CheckInButton() {
  return (
    <Can
      permission={PERMISSIONS.ATTENDANCE_CHECK_IN}
      fallback={
        <Alert>
          <AlertDescription>
            You don't have permission to check-in. Please contact HR.
          </AlertDescription>
        </Alert>
      }
    >
      <Button onClick={handleCheckIn}>Check In Now</Button>
    </Can>
  );
}
```

### Example 3: Leave Approval

```typescript
// app/dashboard/leave/page.tsx
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function LeavePage() {
  const canApprove = await hasPermission(PERMISSIONS.LEAVE_APPROVE);
  const canViewAll = await hasPermission(PERMISSIONS.LEAVE_VIEW_ALL);
  const canViewTeam = await hasPermission(PERMISSIONS.LEAVE_VIEW_TEAM);

  let leaveRequests;
  if (canViewAll) {
    // HR Admin: all leave requests
    leaveRequests = await getAllLeaveRequests();
  } else if (canViewTeam) {
    // Manager: team leave requests
    leaveRequests = await getTeamLeaveRequests();
  } else {
    // Employee: own leave requests
    leaveRequests = await getOwnLeaveRequests();
  }

  return (
    <div>
      <LeaveTable requests={leaveRequests} canApprove={canApprove} />
    </div>
  );
}
```

---

## Testing

### Test Cases

#### 1. Employee Login

- ✅ Can view dashboard
- ✅ Can check-in/out
- ✅ Can view own attendance
- ✅ Can request leave
- ✅ Can view own payroll
- ❌ Cannot view other employees
- ❌ Cannot create/edit/delete employees
- ❌ Cannot approve leave

#### 2. Manager Login

- ✅ All Employee permissions
- ✅ Can view team attendance
- ✅ Can approve team attendance
- ✅ Can approve team leave
- ✅ Can view team employee list
- ❌ Cannot create/edit/delete employees
- ❌ Cannot view/edit payroll

#### 3. HR Admin Login

- ✅ All Employee permissions
- ✅ Can create/edit employees
- ✅ Can view all attendance
- ✅ Can process payroll
- ✅ Can manage shifts
- ❌ Cannot delete employees (unless granted)
- ❌ Cannot edit roles
- ❌ Cannot edit system settings

#### 4. Super Admin Login

- ✅ ALL permissions
- ✅ Can manage roles
- ✅ Can edit system settings
- ✅ Access developer documentation

---

## Best Practices

### 1. Always Use Permission Checks

```typescript
// ❌ Bad: Using role check
if (userRole === "HR Admin") {
  showEditButton();
}

// ✅ Good: Using permission check
if (hasPermission("employees.edit")) {
  showEditButton();
}
```

### 2. Check Permission at Multiple Layers

```
1. Server Component (page.tsx) → requirePermission()
2. Server Action → Check permission before DB operation
3. Client Component (UI) → <Can permission="...">
4. API Route → Verify permission
```

### 3. Use Descriptive Permission Names

```typescript
// ❌ Bad
"emp.v";
"emp.a";

// ✅ Good
"employees.view-all";
"employees.approve";
```

### 4. Group Related Permissions

```typescript
// For a feature, check all required permissions
await hasAllPermissions([
  "payroll.view-all",
  "payroll.process",
  "payroll.export",
]);
```

---

## Future Enhancements

1. **Dynamic Permission Assignment**

   - Admin UI to assign/revoke permissions per role
   - Permission inheritance

2. **Resource-Level Permissions**

   - Check ownership: `canEdit(employee, currentUser)`
   - Department-scoped permissions

3. **Audit Trail**

   - Log permission checks
   - Track permission changes

4. **Permission Groups**
   - Bundle related permissions
   - Easier bulk assignment

---

## Related Documentation

- `docs/ROLE_BASED_SIDEBAR.md` - Sidebar menu filtering
- `docs/ROLE_FEATURE_GUIDE.md` - Role management
- `migrations/20251024_add_permission_system.sql` - Database migration

---

## Summary

✅ **Implemented:**

- Permission system with ~50 permissions
- Database tables and functions
- TypeScript helper functions
- React components for UI protection
- Role-permission assignments

⏳ **Next Steps:**

1. Run migration in Supabase
2. Update existing pages to use permission checks
3. Test with different roles
4. Add permission UI in admin panel (optional)
