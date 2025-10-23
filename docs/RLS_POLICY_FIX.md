# Fix RLS Policy Issue - Users Table

## Problem

Error: `User not found: PGRST116 - The result contains 0 rows`

**Root Cause:**

- User berhasil login dengan Supabase Auth ✅
- Employee record ada di database ✅
- Server action `checkPasswordChanged()` dipanggil
- **RLS Policy memblokir akses ke tabel `users`** ❌

## Why RLS Blocking?

### Original Policy (WRONG):

```sql
CREATE POLICY users_select_own
ON users FOR SELECT
USING (auth.uid() = auth_user_id);
```

**Problem:**

1. Kolom `auth_user_id` di tabel `users` masih **NULL** (karena kita pakai `employee_id` bukan `auth_user_id`)
2. `auth.uid() = NULL` → always FALSE
3. Query gagal karena tidak ada row yang pass policy

### Service Role Policy (ALSO WRONG):

```sql
CREATE POLICY users_service_role_all
ON users FOR ALL
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);
```

**Problem:**

- Server actions dari Next.js tidak set `request.jwt.claims` dengan benar
- Policy ini tidak jalan untuk server-side queries

## Solution

### Fix 1: Allow Authenticated Users to Read

```sql
CREATE POLICY users_authenticated_read
ON users
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read
```

**Why this works:**

- User sudah authenticated saat login
- Mereka perlu baca tabel `users` untuk cek `is_password_changed`
- Read-only access (SELECT) → aman

### Fix 2: Service Role Policy

```sql
CREATE POLICY users_service_role_all
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

**Why this works:**

- `TO service_role` → explicit role assignment
- Service role bypasses RLS by default
- Server actions use service role connection

## Migration Steps

### Option 1: Run Full Migration (Recommended)

```bash
# Run updated migration file
migrations/add_auth_user_id_to_users.sql
```

This includes the fixed RLS policies.

### Option 2: Apply Fix Only

If you already ran the old migration, just run:

```bash
migrations/fix_users_table_rls_policy.sql
```

### Option 3: Manual SQL

Copy-paste ini ke Supabase SQL Editor:

```sql
-- Drop old policies
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_service_role_all ON users;
DROP POLICY IF EXISTS users_authenticated_read ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policy for authenticated reads
CREATE POLICY users_authenticated_read
ON users
FOR SELECT
TO authenticated
USING (true);

-- Create policy for service role (server actions)
CREATE POLICY users_service_role_all
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'users';
```

## Security Considerations

### Current Approach (Permissive):

```sql
USING (true)  -- All authenticated users can read
```

**Pros:**

- ✅ Simple, works immediately
- ✅ Allows login flow to work
- ✅ Server actions work properly

**Cons:**

- ⚠️ Any authenticated user can read entire `users` table
- ⚠️ Less secure for multi-tenant apps

### Stricter Alternative (Recommended for Production):

```sql
CREATE POLICY users_authenticated_read_own
ON users
FOR SELECT
TO authenticated
USING (
    employee_id IN (
        SELECT id FROM employees
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);
```

**Pros:**

- ✅ Users can only read their own record
- ✅ More secure

**Cons:**

- ⚠️ More complex query
- ⚠️ Requires employee.email = auth.users.email

## Testing

### Test 1: Verify Policies Exist

```sql
SELECT
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';
```

Expected output:

```
policyname              | cmd    | roles          | qual | with_check
------------------------|--------|----------------|------|------------
users_authenticated_read| SELECT | authenticated  | true | NULL
users_service_role_all  | ALL    | service_role   | true | true
```

### Test 2: Test as Authenticated User

```sql
-- Login sebagai authenticated user via Supabase Auth
-- Then run:
SELECT id, username, is_password_changed
FROM users
WHERE employee_id = 8;
```

Should return data (no RLS error).

### Test 3: Test Login Flow

1. Logout dari aplikasi
2. Login dengan email yang valid
3. System akan:
   - ✅ Authenticate with Supabase Auth
   - ✅ Query employees by email (should work)
   - ✅ Query users by employee_id (should work now!)
   - ✅ Check is_password_changed
   - ✅ Show dialog if needed

## Flow Diagram

```
┌──────────────────────────────────────────────────┐
│ LOGIN WITH EMAIL/PASSWORD                        │
│ Status: authenticated ✅                         │
└────────────────┬─────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────┐
│ SERVER ACTION: checkPasswordChanged(email)       │
│ Context: service_role connection                 │
└────────────────┬─────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────┐
│ Query: SELECT id FROM employees WHERE email=...  │
│ RLS: employees table policy (should allow)       │
│ Result: employee_id = 8 ✅                       │
└────────────────┬─────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────┐
│ Query: SELECT * FROM users WHERE employee_id=8   │
│ RLS: users_authenticated_read → USING (true)     │
│ Role: authenticated ✅                           │
│ Result: user record returned ✅                  │
└────────────────┬─────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────────────┐
│ Check is_password_changed                        │
│ Show dialog if false                             │
└──────────────────────────────────────────────────┘
```

## Rollback (If Needed)

```sql
-- Disable RLS completely (NOT RECOMMENDED for production)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or remove policies
DROP POLICY IF EXISTS users_authenticated_read ON users;
DROP POLICY IF EXISTS users_service_role_all ON users;
```

## Next Steps

1. ✅ Run migration dengan fixed RLS policies
2. ✅ Verify policies dengan SQL query
3. ✅ Test login flow
4. 🎯 Consider stricter policy for production
5. 🎯 Apply same pattern to other sensitive tables

## Files

- ✅ `migrations/add_auth_user_id_to_users.sql` - Updated with correct policies
- ✅ `migrations/fix_users_table_rls_policy.sql` - Standalone fix
- ✅ `docs/RLS_POLICY_FIX.md` - This documentation
