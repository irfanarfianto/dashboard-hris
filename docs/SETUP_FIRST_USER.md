# Setup First User - Password Change Flow

## Problem

Error: `User not found: PGRST116 - The result contains 0 rows`

**Root Cause:**

- User berhasil login dengan Supabase Auth
- Tapi tidak ada data di tabel `users` yang link ke `employee_id`
- Flow password change tidak bisa jalan karena tidak ada user record

## Solution: Create User Record

### Option 1: Manual Insert (Recommended for Testing)

```sql
-- Step 1: Check if employee exists
SELECT id, email, full_name
FROM employees
WHERE email = 'user@example.com'
AND deleted_at IS NULL;

-- Example result: id = 5

-- Step 2: Check if user already exists for this employee
SELECT * FROM users WHERE employee_id = 5;

-- Step 3: Insert user record (if not exists)
INSERT INTO users (
    employee_id,
    username,
    role_id,
    is_password_changed,
    is_active,
    created_at
) VALUES (
    5,                      -- employee_id from step 1
    'user@example.com',     -- same as employee email
    2,                      -- role_id (1=Admin, 2=User, adjust as needed)
    false,                  -- Force password change on first login
    true,                   -- Active
    NOW()
);

-- Step 4: Verify
SELECT u.id, u.username, u.is_password_changed, e.full_name
FROM users u
JOIN employees e ON u.employee_id = e.id
WHERE u.employee_id = 5;
```

### Option 2: Create via Server Action (Programmatically)

Create new server action to setup user:

```typescript
// lib/actions/userActions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function createUserForEmployee(
  employeeId: number,
  roleId: number = 2
) {
  const supabase = await createClient();

  try {
    // Get employee data
    const { data: employee } = await supabase
      .from("employees")
      .select("email")
      .eq("id", employeeId)
      .single();

    if (!employee) {
      return { success: false, error: "Employee not found" };
    }

    // Create user record
    const { data, error } = await supabase
      .from("users")
      .insert({
        employee_id: employeeId,
        username: employee.email,
        role_id: roleId,
        is_password_changed: false, // Force change on first login
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Unexpected error" };
  }
}
```

## Complete Flow Setup

### 1. Create Employee First

```sql
INSERT INTO employees (
    company_id,
    department_id,
    position_id,
    full_name,
    phone_number,
    email,
    gender,
    birth_date,
    hire_date,
    status
) VALUES (
    1,                          -- company_id
    1,                          -- department_id
    1,                          -- position_id
    'John Doe',
    '081234567890',
    'john@example.com',
    'L',                        -- L = Laki-laki, P = Perempuan
    '1990-01-01',
    '2025-01-01',
    'Active'
);
```

### 2. Create Auth User in Supabase

Via Supabase Dashboard → Authentication → Add User:

- Email: `john@example.com` (SAME as employee email)
- Password: `TempPassword123!` (temporary)
- Email Confirm: ✅ Checked

Or via SQL:

```sql
-- Via Supabase Auth Admin API (run in Supabase SQL editor)
SELECT auth.create_user(
    email => 'john@example.com',
    password => 'TempPassword123!',
    email_confirmed => true
);
```

### 3. Create User Record (Link Employee to Auth)

```sql
-- Get employee id first
SELECT id FROM employees WHERE email = 'john@example.com';
-- Result: id = 10

-- Create user record
INSERT INTO users (
    employee_id,
    username,
    role_id,
    is_password_changed,
    is_active
) VALUES (
    10,                         -- employee_id
    'john@example.com',
    2,                          -- role_id (2 = regular user)
    false,                      -- Must change password on first login
    true
);
```

### 4. Test Login Flow

1. Go to login page
2. Login with: `john@example.com` / `TempPassword123!`
3. System will:
   - ✅ Authenticate with Supabase Auth
   - ✅ Find employee by email
   - ✅ Find user by employee_id
   - ✅ Check `is_password_changed = false`
   - ✅ Show **Change Password Dialog**
4. User changes password
5. System sets `is_password_changed = true`
6. Continue to PIN setup
7. Redirect to dashboard

## Current Error Handling

The code now uses `.maybeSingle()` instead of `.single()`:

```typescript
// ✅ FIXED: Won't throw error if no rows found
const { data: user, error } = await supabase
  .from("users")
  .select("is_password_changed, id")
  .eq("employee_id", employee.id)
  .maybeSingle(); // Returns null if no rows, doesn't throw error

if (!user) {
  // Skip password change dialog
  return { needsChange: false };
}
```

## Quick Test Setup Script

Run this in Supabase SQL Editor:

```sql
-- 1. Get employee id
DO $$
DECLARE
    emp_id INT;
BEGIN
    -- Find employee by email
    SELECT id INTO emp_id FROM employees
    WHERE email = 'your-email@example.com'
    AND deleted_at IS NULL;

    IF emp_id IS NULL THEN
        RAISE NOTICE 'Employee not found!';
    ELSE
        RAISE NOTICE 'Employee ID: %', emp_id;

        -- Create or update user record
        INSERT INTO users (employee_id, username, role_id, is_password_changed, is_active)
        VALUES (emp_id, 'your-email@example.com', 2, false, true)
        ON CONFLICT (employee_id)
        DO UPDATE SET
            is_password_changed = false,
            is_active = true;

        RAISE NOTICE 'User created/updated successfully!';
    END IF;
END $$;
```

## Verification Query

```sql
-- Check complete user setup
SELECT
    u.id as user_id,
    u.username,
    u.is_password_changed,
    u.is_active,
    e.id as employee_id,
    e.full_name,
    e.email as employee_email,
    r.name as role_name
FROM users u
JOIN employees e ON u.employee_id = e.id
JOIN roles r ON u.role_id = r.id
WHERE e.email = 'your-email@example.com'
AND u.deleted_at IS NULL
AND e.deleted_at IS NULL;
```

Expected output:

```
user_id | username              | is_password_changed | is_active | employee_id | full_name | employee_email        | role_name
--------|----------------------|---------------------|-----------|-------------|-----------|----------------------|----------
1       | your-email@example.com | false               | true      | 5           | John Doe  | your-email@example.com | User
```

## Next Steps

1. ✅ Code sudah diperbaiki (menggunakan `.maybeSingle()`)
2. ⚠️ **Buat user record** untuk testing (pilih Option 1 atau 2)
3. ✅ Test login flow
4. 🎯 Setup admin interface untuk create users (future task)
