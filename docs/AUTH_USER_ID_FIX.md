# Fix: Add auth_user_id Column to Users Table

## Problem

Error: `invalid input syntax for type integer: "309ffd66-bf76-42f0-bf84-3f562bd1e549"`

**Root Cause:**

- Tabel `users` menggunakan `id` bertipe `INTEGER` (auto-increment)
- Supabase Auth menggunakan `UUID` untuk user ID
- Tidak ada kolom untuk link antara `users` table dan `auth.users`

## Solution

Tambahkan kolom `auth_user_id` (UUID) ke tabel `users` untuk link dengan Supabase Auth.

## Migration Steps

### 1. Run Migration SQL

Buka Supabase Dashboard → SQL Editor → Run migration:

```bash
migrations/add_auth_user_id_to_users.sql
```

### 2. Verify Migration

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'auth_user_id';

-- Expected result:
-- column_name    | data_type | is_nullable
-- auth_user_id   | uuid      | YES
```

### 3. Update Existing Users (If Any)

Jika ada user yang sudah ada, link mereka dengan auth.users:

```sql
-- Example: Link existing user by email
UPDATE users u
SET auth_user_id = au.id
FROM auth.users au
WHERE u.username = au.email;

-- Or manually:
UPDATE users
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE id = 1; -- your user id
```

### 4. Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- Check policies exist
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

## Code Changes

### ✅ Already Updated:

- `lib/actions/securityActions.ts` - `checkPasswordChanged()` now uses `auth_user_id`
- Migration file ready with RLS policies

## Testing

### Test 1: Login Flow

1. Login dengan email/password
2. System cek `is_password_changed` via `auth_user_id`
3. Jika `false` → show Change Password Dialog
4. Jika `true` → continue to PIN setup/verify

### Test 2: New User Creation

When creating new user:

```typescript
// 1. Create auth user
const { data: authData } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
});

// 2. Create users table record with auth link
await supabase.from("users").insert({
  auth_user_id: authData.user.id, // Link to auth.users
  username: "user@example.com",
  role_id: 2,
  is_password_changed: false, // Force password change on first login
  is_active: true,
});
```

## Table Structure After Migration

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,  -- ✅ NEW
    employee_id INT UNIQUE REFERENCES employees(id),  -- NULLABLE
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),  -- NULLABLE (optional if using Supabase Auth)
    role_id INT NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    is_password_changed BOOLEAN DEFAULT FALSE,  -- ✅ Used for first login
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

## Flow After Fix

```
LOGIN EMAIL/PASSWORD (Supabase Auth)
        ↓
   Get auth_user_id (UUID)
        ↓
Query users table by auth_user_id  ← ✅ FIXED
        ↓
Check is_password_changed
        ↓
    FALSE → Change Password Dialog
    TRUE → Check PIN → Setup/Verify PIN Dialog
        ↓
    DASHBOARD
```

## Rollback (If Needed)

```sql
-- Remove RLS policies
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_service_role_all ON users;

-- Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Remove column
ALTER TABLE users DROP COLUMN IF EXISTS auth_user_id;
```
