# Refactoring: Remove shift_id from Employees

## Overview

This document describes the refactoring performed to remove the `shift_id` field from the employees table and all related components. This change aligns with the new database schema where shifts are determined dynamically at check-in time based on the employee's department and the current time, rather than being pre-assigned to employees.

## Database Schema Changes

The new schema removes the static shift assignment:

- **REMOVED**: `employees.shift_id` column
- **REMOVED**: `employee_shift_schedules` table
- **NEW LOGIC**: Shift is determined dynamically at check-in based on:
  - Employee's department
  - Check-in time
  - Available shifts for that department

## Files Modified

### 1. Server Actions

#### `lib/actions/employeeActions.ts`

**Changes:**

- Removed `shift_id: number` from `createEmployeeWithUser` interface parameter
- Removed `shift_id` from employee INSERT query
- Removed `shift_id: number` from `updateEmployee` interface parameter
- Removed `shift_id` from employee UPDATE query

**Before:**

```typescript
export async function createEmployeeWithUser(data: {
  company_id: number;
  department_id: number;
  position_id: number;
  shift_id: number; // ❌ REMOVED
  full_name: string;
  // ...
});
```

**After:**

```typescript
export async function createEmployeeWithUser(data: {
  company_id: number;
  department_id: number;
  position_id: number;
  full_name: string;
  // ...
});
```

### 2. Form Components

#### `components/employees/add-employee-steps/Step1DataPekerjaan.tsx`

**Changes:**

- Removed `shift_id: string` from `FormDataStep1` interface
- Removed entire "Shift Kerja" select field from JSX (~25 lines)
- Removed `workShifts` from component props interface
- Removed `workShifts` from function parameters

**Removed Field:**

```tsx
{
  /* ❌ REMOVED - Shift Kerja field */
}
<div>
  <Label htmlFor="shift_id">
    Shift Kerja <span className="text-red-500">*</span>
  </Label>
  <Select
    value={formData.shift_id}
    onValueChange={(value) => onFormDataChange({ shift_id: value })}
  >
    {/* ... */}
  </Select>
</div>;
```

#### `components/employees/add-employee-steps/useAddEmployeeForm.ts`

**Changes:**

- Removed `shift_id: ""` from formData initial state
- Removed `shift_id: parseInt(formData.shift_id)` from `createEmployeeWithUser` call
- Removed `shift_id: ""` from `resetForm` function
- Removed `formData.shift_id &&` from Step 1 validation in `canGoNext`

**Before (Validation):**

```typescript
case 1:
  return (
    formData.company_id &&
    formData.department_id &&
    formData.position_id &&
    formData.shift_id &&  // ❌ REMOVED
    formData.contract_type &&
    salaryNumeric > 0
  );
```

**After:**

```typescript
case 1:
  return (
    formData.company_id &&
    formData.department_id &&
    formData.position_id &&
    formData.contract_type &&
    salaryNumeric > 0
  );
```

#### `components/employees/add-employee-steps/Step5Verifikasi.tsx`

**Changes:**

- Removed `shift_id: string` from FormData interface
- Removed `workShifts` from props interface
- Removed `workShifts` from function parameters
- Removed `getShiftName()` helper function
- Removed "Shift Kerja" display section from verification UI

**Removed Code:**

```tsx
{
  /* ❌ REMOVED - Shift Kerja display */
}
<div>
  <span className="text-gray-600 dark:text-gray-400">Shift Kerja:</span>
  <p className="font-medium text-gray-900 dark:text-gray-100">
    {getShiftName()}
  </p>
</div>;
```

### 3. Dialog Components

#### `components/employees/AddEmployeeDialog.tsx`

**Changes:**

- Removed `workShifts` from destructured values
- Removed `workShifts={workShifts}` prop from `Step1DataPekerjaan`
- Removed `workShifts={workShifts}` prop from `Step5Verifikasi`

#### `components/employees/EditEmployeeDialog.tsx`

**Changes:**

- Removed `shift_id: number` from Employee interface
- Removed `shift_id: ""` from formData initial state
- Removed `shift_id: employee.shift_id?.toString() || ""` from form initialization
- Removed `shift_id: parseInt(formData.shift_id)` from `updateEmployee` call
- Removed `formData.shift_id &&` from Step 1 validation
- Removed `workShifts` state declaration
- Removed `workShifts={workShifts}` prop from `Step1DataPekerjaan`
- Removed `workShifts={workShifts}` prop from `Step5Verifikasi`

### 4. Display Components

#### `components/employees/EmployeeDetailView.tsx`

**Changes:**

- Removed `shift_id: number` from Employee interface
- Removed `work_shifts: { name: string; start_time: string; end_time: string }` from interface
- Removed entire "Shift Kerja" display section from UI
- Removed unused `Clock` icon import

**Removed UI Section:**

```tsx
{
  /* ❌ REMOVED - Shift Kerja display */
}
<div>
  <label className="text-sm text-gray-600 dark:text-gray-400">
    Shift Kerja
  </label>
  <div className="flex items-center gap-2 mt-1">
    <Clock className="h-4 w-4 text-gray-400" />
    <p className="font-medium text-gray-900 dark:text-gray-100">
      {employee.work_shifts?.name} ({employee.work_shifts?.start_time} -{" "}
      {employee.work_shifts?.end_time})
    </p>
  </div>
</div>;
```

## Impact Summary

### What Changed

1. **Employee Creation**: No longer requires shift selection during employee creation
2. **Employee Editing**: Shift field removed from edit form
3. **Employee Details**: Shift information no longer displayed on detail pages
4. **Validation**: Step 1 validation no longer checks for shift_id

### What Remains the Same

1. **Shift Management**: Shift CRUD operations still work via `/dashboard/shifts`
2. **Department Association**: Shifts are still associated with departments
3. **Database**: `work_shifts` table still exists with all shift data

### Benefits

1. **Flexibility**: Employees can work different shifts based on check-in time
2. **Simplified Onboarding**: One less field to fill during employee creation
3. **Schema Alignment**: Code now matches the updated database schema
4. **Dynamic Assignment**: Supports rotating shifts and flexible scheduling

## Testing Checklist

- [x] ✅ TypeScript compilation passes (no errors)
- [ ] ⏳ Create new employee without shift field
- [ ] ⏳ Edit existing employee (shift field not shown)
- [ ] ⏳ View employee details (no shift displayed)
- [ ] ⏳ Verify database records (shift_id column should not be set)
- [ ] ⏳ Check attendance system (shift determined at check-in)
- [ ] ⏳ Verify shift management UI still works

## Migration Notes

### For Existing Data

If there is existing data with `shift_id` values in the employees table:

1. The database column may still exist but will no longer be used
2. Consider running a migration to drop the column:
   ```sql
   ALTER TABLE employees DROP COLUMN IF EXISTS shift_id;
   ```
3. Verify no other code references `employees.shift_id`

### For Attendance System

The attendance check-in logic should now:

1. Get employee's department
2. Get current check-in time
3. Query `work_shifts` for shifts matching:
   - `department_id = employee.department_id`
   - Current time falls within shift's time range
4. Assign the matching shift to the attendance record

## Related Documentation

- [Shift Management Guide](./SHIFT_MANAGEMENT_GUIDE.md)
- [Database Schema Documentation](./hris_schema_documentation.md)
- [Employee Feature Guide](./EMPLOYEE_FEATURE_GUIDE.md)

## Completion Date

**Completed:** December 2024

## Contributors

- GitHub Copilot
- Development Team
