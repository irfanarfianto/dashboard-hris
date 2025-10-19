# Fix: Password Hash NOT NULL Constraint Error

## Problem

Error: `"Gagal membuat user: null value in column "password_hash" of relation "users" violates not-null constraint"`

Terjadi saat insert user ke tabel `users`.

## Root Cause

Kolom `password_hash` di tabel `users` memiliki constraint NOT NULL, tetapi saat insert, kita tidak menyimpan password hash (hanya membuat user di Supabase Auth).

## Solution: Hash Password dengan bcrypt

### 1. Install Dependencies

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Updated employeeActions.ts

**Import bcrypt:**

```typescript
import bcrypt from "bcryptjs";
```

**Hash password sebelum insert:**

```typescript
// 3. Jika diminta create user account
if (data.create_user_account && data.username && data.role_id) {
  // Generate temporary password
  tempPassword = generateTemporaryPassword();

  // Hash password untuk disimpan di database
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Create user di Supabase Auth
  const { data: authUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email: data.email,
      password: tempPassword, // ← Plain password untuk Auth
      email_confirm: true,
      user_metadata: { ... },
    });

  // ...error handling...

  // Insert ke tabel users dengan hashed password
  const { error: userError } = await supabase.from("users").insert({
    auth_user_id: authUserId,
    employee_id: employee.id,
    username: data.username,
    password_hash: hashedPassword, // ← Hashed password untuk DB
    role_id: data.role_id,
    is_active: true,
  });
}
```

## Why This Works

### Dual Password Storage:

1. **Supabase Auth**: Stores encrypted password for authentication

   - Used when user logs in via Supabase Auth
   - Handled by `auth.admin.createUser()`

2. **Database Table**: Stores bcrypt hashed password
   - Satisfies NOT NULL constraint
   - Can be used for custom authentication logic if needed
   - Hashed with bcrypt (salt rounds: 10)

### Security:

- ✅ Password never stored in plain text
- ✅ Bcrypt hash is one-way (cannot be reversed)
- ✅ Different from Supabase Auth encryption
- ✅ Temp password only shown once to admin

## Flow Diagram

```
User Created
    ↓
Generate Random Password (12 chars)
    ↓
┌─────────────────────────────────┐
│  Hash with bcrypt (10 rounds)  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  Create Auth User (Supabase encrypts it)   │
│  email: user@example.com                    │
│  password: plainPassword                    │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  Insert to users table                      │
│  auth_user_id: uuid                         │
│  username: john_doe                         │
│  password_hash: $2a$10$... (bcrypt hash)    │
│  role_id: 2                                 │
└─────────────────────────────────────────────┘
    ↓
Display Temp Password to Admin
```

## Testing

1. Restart dev server (if needed)
2. Go to Add Employee form
3. Complete all steps including Step 4 (check "Buat Akun User")
4. Review at Step 5
5. Click "Simpan Karyawan"

**Expected Result:**

- ✅ Employee created
- ✅ Auth user created in Supabase Auth (encrypted password)
- ✅ User record created in `users` table (bcrypt hashed password)
- ✅ Temporary password displayed to admin
- ✅ User can login with temp password

## Alternative: Make password_hash Nullable

If you want to rely 100% on Supabase Auth and not use custom auth:

```sql
-- Run this migration in Supabase SQL Editor
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;
```

Then you can remove the bcrypt hashing and just insert `NULL`:

```typescript
const { error: userError } = await supabase.from("users").insert({
  auth_user_id: authUserId,
  employee_id: employee.id,
  username: data.username,
  password_hash: null, // ← NULL allowed after migration
  role_id: data.role_id,
  is_active: true,
});
```

## Files Modified

1. ✅ `package.json` - Added bcryptjs dependencies
2. ✅ `lib/actions/employeeActions.ts` - Hash password before insert

## Dependencies Added

- `bcryptjs` - For hashing passwords
- `@types/bcryptjs` - TypeScript types for bcryptjs
