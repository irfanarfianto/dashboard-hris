# Fix: User Not Allowed Error When Creating Employee Account

## Problem

Error: `"Gagal membuat akun autentikasi: User not allowed"`

Terjadi saat mencoba membuat akun user untuk karyawan baru.

## Root Cause

Fungsi `supabase.auth.admin.createUser()` memerlukan **Service Role Key** untuk bisa dijalankan, tetapi kode menggunakan **Anon Key** yang tidak memiliki permission untuk operasi admin.

## Solution

### 1. Created Admin Client Function

**File:** `lib/supabase/server.ts`

Menambahkan fungsi `createAdminClient()` yang menggunakan Service Role Key:

```typescript
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or Service Role Key.");
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

### 2. Updated Employee Actions

**File:** `lib/actions/employeeActions.ts`

Update import:

```typescript
import { createClient, createAdminClient } from "@/lib/supabase/server";
```

Update create user logic:

```typescript
// Create admin client for auth operations
const adminClient = createAdminClient();

// Use admin client for creating user
const { data: authUser, error: authError } =
  await adminClient.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      employee_id: employee.id,
    },
  });

// Use admin client for rollback operations
await adminClient.auth.admin.deleteUser(authUserId);
```

## Required Environment Variable

⚠️ **IMPORTANT**: Add this to your `.env.local` file:

```env
# Supabase Service Role Key (Server-side only - NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### How to Get Service Role Key:

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role** key (NOT the anon key)
5. Add to `.env.local`

### Security Notes:

- ⚠️ **NEVER** commit `.env.local` to git
- ⚠️ **NEVER** expose Service Role Key to client-side
- ✅ Only use in Server Actions (files with `"use server"`)
- ✅ Service Role Key bypasses Row Level Security (RLS)
- ✅ Only use for admin operations like creating users

## Testing

After adding the environment variable:

1. Restart your Next.js dev server
2. Go to Add Employee form
3. Fill in all steps including Step 4 (Create User Account)
4. Check "Buat Akun User" checkbox
5. Fill username and select role
6. Complete Step 5 (Verification)
7. Click "Simpan Karyawan"

Expected result:

- ✅ Employee created successfully
- ✅ Auth user created in Supabase Auth
- ✅ User record created in `users` table
- ✅ Temporary password displayed

## Changes Summary

### Files Modified:

1. ✅ `lib/supabase/server.ts` - Added `createAdminClient()` function
2. ✅ `lib/actions/employeeActions.ts` - Use admin client for auth operations

### Environment Variables Required:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` (already exists)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already exists)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NEW - MUST ADD**

## Related Documentation

- [Supabase Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Service Role Key vs Anon Key](https://supabase.com/docs/guides/api/api-keys)
