# Fix Profile Page - Auth User ID Not Linked

## Problem

**Error saat akses `/dashboard/profile`:**

```
Error: Data karyawan tidak ditemukan
Auth User ID: 309ffd66-bf76-42f0-bf84-3f562bd1e549
Email: irfanarfianto92@gmail.com
Found 0 users with this auth_user_id
```

## Root Cause

User berhasil login via **Supabase Auth** (`auth.users`), tapi **tidak ada data** di tabel `users` (public schema) yang ter-link ke `auth_user_id` tersebut.

**Relasi yang seharusnya:**

```
auth.users (Supabase managed)
  └─ id (UUID) = auth_user_id
       ↓
users (Public schema)
  └─ auth_user_id (FK) → links to auth.users.id
  └─ employee_id (FK) → links to employees.id
       ↓
employees (Public schema)
  └─ id → employee data
```

**Current state:**

```
✅ auth.users → User exists (email: irfanarfianto92@gmail.com)
❌ users → NOT FOUND (no record with auth_user_id)
```

## Solution

Ada 2 opsi tergantung kondisi data Anda:

### Option 1: You Already Have Employee Record

**Scenario:** Anda sudah punya data di tabel `employees` tapi belum ada di tabel `users`.

**Steps:**

1. **Buka Supabase SQL Editor**

2. **Check if employee exists:**

   ```sql
   SELECT id, full_name, email FROM employees
   WHERE email = 'irfanarfianto92@gmail.com'
   AND deleted_at IS NULL;
   ```

3. **Get available roles:**

   ```sql
   SELECT id, name, description FROM roles ORDER BY id;
   ```

4. **Create user record:**
   ```sql
   INSERT INTO users (
       auth_user_id,
       employee_id,
       username,
       role_id,
       is_active,
       is_password_changed,
       created_at
   ) VALUES (
       '309ffd66-bf76-42f0-bf84-3f562bd1e549',  -- Your auth_user_id
       1,  -- REPLACE with employee_id from step 2
       'irfanarfianto92@gmail.com',
       1,  -- REPLACE: 1=Super Admin, 2=HR Admin, 3=Manager, 4=Employee
       true,
       true,  -- Set false if you want to force password change
       NOW()
   );
   ```

### Option 2: You DON'T Have Employee Record Yet

**Scenario:** Ini adalah first user/admin, belum ada data employee sama sekali.

**Steps:**

1. **Get master data IDs:**

   ```sql
   -- Get company_id
   SELECT id, name FROM companies WHERE deleted_at IS NULL;

   -- Get department_id (e.g., IT, HR, etc.)
   SELECT id, name FROM departments WHERE deleted_at IS NULL;

   -- Get position_id (e.g., Admin, Manager, etc.)
   SELECT id, name FROM positions WHERE deleted_at IS NULL;

   -- Get role_id
   SELECT id, name FROM roles;
   ```

2. **Create employee:**

   ```sql
   INSERT INTO employees (
       company_id,
       department_id,
       position_id,
       full_name,
       email,
       phone_number,
       gender,
       birth_date,
       hire_date,
       created_at
   ) VALUES (
       1,  -- REPLACE with company_id
       1,  -- REPLACE with department_id
       1,  -- REPLACE with position_id
       'Irfan Arfianto',  -- Your name
       'irfanarfianto92@gmail.com',
       '08123456789',  -- Your phone
       'L',  -- 'L' or 'P'
       '1992-01-01',  -- Your birth date
       CURRENT_DATE,
       NOW()
   ) RETURNING id;  -- Note the returned employee_id
   ```

3. **Create user (use employee_id from step 2):**
   ```sql
   INSERT INTO users (
       auth_user_id,
       employee_id,
       username,
       role_id,
       is_active,
       is_password_changed,
       created_at
   ) VALUES (
       '309ffd66-bf76-42f0-bf84-3f562bd1e549',
       999,  -- REPLACE with employee_id from step 2
       'irfanarfianto92@gmail.com',
       1,  -- 1=Super Admin recommended for first user
       true,
       true,
       NOW()
   );
   ```

## Verification

After running the fix, verify the complete link:

```sql
SELECT
    au.id as auth_user_id,
    au.email,
    u.id as user_id,
    u.username,
    u.employee_id,
    e.full_name,
    r.name as role_name,
    u.is_active
FROM auth.users au
LEFT JOIN users u ON u.auth_user_id = au.id
LEFT JOIN employees e ON e.id = u.employee_id
LEFT JOIN roles r ON r.id = u.role_id
WHERE au.email = 'irfanarfianto92@gmail.com';
```

**Expected result:**

```
auth_user_id: 309ffd66-bf76-42f0-bf84-3f562bd1e549 ✅
email: irfanarfianto92@gmail.com ✅
user_id: (some number) ✅
username: irfanarfianto92@gmail.com ✅
employee_id: (some number) ✅
full_name: (your name) ✅
role_name: Super Admin ✅
is_active: true ✅
```

## Test Profile Page

After verification passes:

1. Refresh browser page `/dashboard/profile`
2. Should see your profile page with:
   - Profile summary (avatar, name, position)
   - Personal information
   - Employment information
   - Account information with role badge
   - Company information

## Files Created

- `migrations/quick_fix_link_user.sql` - Main fix script with both options
- `migrations/simple_check_user_data.sql` - Diagnostic queries
- `migrations/fix_user_irfan_auth_link.sql` - Detailed fix script
- `docs/PROFILE_AUTH_FIX.md` - This documentation

## Related Issues

This issue typically happens when:

1. User created manually in Supabase Auth Dashboard (not via app)
2. Migration order issue (auth.users created before users table link)
3. Data imported without proper auth_user_id mapping
4. Testing with manual sign-up before implementing proper user creation flow

## Prevention

For future users, use the proper flow:

- Use `createEmployeeWithUser()` server action (in `lib/actions/employeeActions.ts`)
- This automatically creates: auth.users → users → employees with proper links
- Never create users directly in auth.users without linking to users table
