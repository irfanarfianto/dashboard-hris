# Debug Guide: Password Change Dialog After PIN Verification

## Overview

Panduan debugging untuk memastikan dialog ganti password muncul setelah verifikasi PIN berdasarkan user yang sedang login.

## Console Debug Flow

### Expected Console Output (Success Case)

Ketika PIN verify berhasil dan `is_password_changed = false`, console output harus seperti ini:

```
============================================================
🔐 VERIFY PIN - DEBUGGING START
============================================================

1️⃣ PIN Verification Result: { success: true }
✅ PIN Verified Successfully!
🍪 Cookie 'pin_verified' set for 24 hours

2️⃣ Checking Password Change Status...
Auth User ID: 309ffd66-bf76-42f0-bf84-3f562bd1e549

3️⃣ Database Query Result:
Query Error: null
User Data: {
  id: 1,
  is_password_changed: false,
  auth_user_id: "309ffd66-bf76-42f0-bf84-3f562bd1e549",
  username: "user@example.com",
  employee_id: 8
}

4️⃣ User Data Details:
- User ID (internal): 1
- Employee ID: 8
- Username: user@example.com
- Auth User ID: 309ffd66-bf76-42f0-bf84-3f562bd1e549
- is_password_changed: false

5️⃣ Password Change Decision:
🔑 Password NEEDS to be changed (is_password_changed = false)
📋 Setting state to show password dialog...
✅ State updated:
   - needsPasswordChange: true
   - showPasswordDialog: true
🎭 Password Change Dialog should now appear!

============================================================
🔐 VERIFY PIN - DEBUGGING END
============================================================

🔍 Dialog State Changed:
  - showPasswordDialog: true
  - needsPasswordChange: true
  - Should Render Dialog: true

🎭 RENDER CHECK:
  - showPasswordDialog: true
  - needsPasswordChange: true
  - Should Render: true
✅ Rendering ChangePasswordDialog with props:
  - autoCheck: false
  - forceOpen: true
  - onSuccess: defined
  - onSkip: defined

============================================================
🎨 ChangePasswordDialog MOUNTED
============================================================
Props received:
  - autoCheck: false
  - forceOpen: true
  - onSuccess: function
  - onSkip: function
============================================================

🔄 ChangePasswordDialog State:
  - open: false
  - userId: null
  - isCheckingPassword: true

🎮 Controlled Mode Check:
  - autoCheck: false
  - forceOpen: true
  - Should activate controlled mode: true
✅ Activating controlled mode...
🔍 Fetching authenticated user...
User fetched: 309ffd66-bf76-42f0-bf84-3f562bd1e549
✅ Setting userId and opening dialog...
✅ Dialog should now be open!

🔄 ChangePasswordDialog State:
  - open: false
  - userId: null
  - isCheckingPassword: false

🔄 ChangePasswordDialog State:
  - open: false
  - userId: 309ffd66-bf76-42f0-bf84-3f562bd1e549
  - isCheckingPassword: false

🔄 ChangePasswordDialog State:
  - open: true
  - userId: 309ffd66-bf76-42f0-bf84-3f562bd1e549
  - isCheckingPassword: false

============================================================
✅ ChangePasswordDialog: RENDERING DIALOG!
============================================================
State:
  - open: true
  - userId: 309ffd66-bf76-42f0-bf84-3f562bd1e549
  - isCheckingPassword: false
============================================================
```

## Troubleshooting Checklist

### ❌ Issue 1: No Console Logs at All

**Symptom:**

- Tidak ada log sama sekali setelah verify PIN

**Possible Causes:**

1. Console filter aktif (pastikan "All levels" dipilih)
2. Browser console tidak dibuka
3. Code tidak jalan karena error sebelumnya

**Solution:**

```bash
# Check browser console
1. Buka Developer Tools (F12)
2. Pilih tab "Console"
3. Clear filter, set ke "All levels"
4. Refresh halaman dan coba lagi
```

---

### ❌ Issue 2: Query Error

**Symptom:**

```
3️⃣ Database Query Result:
Query Error: { code: "PGRST116", message: "..." }
```

**Possible Causes:**

1. RLS policy blocking query
2. Auth user tidak authenticated
3. Table users tidak accessible

**Solution:**

```sql
-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Should have:
-- users_authenticated_read (SELECT to authenticated)

-- If not exists, create it:
CREATE POLICY users_authenticated_read
ON users FOR SELECT
TO authenticated
USING (true);
```

---

### ❌ Issue 3: User Data Not Found

**Symptom:**

```
⚠️ No user data found in users table for auth_user_id: 309ffd66-...
```

**Possible Causes:**

1. `auth_user_id` is NULL in users table
2. `deleted_at` is NOT NULL
3. Wrong auth_user_id

**Solution:**

```sql
-- 1. Check if user exists
SELECT
  id,
  employee_id,
  username,
  auth_user_id,
  is_password_changed,
  deleted_at
FROM users
WHERE employee_id = 8; -- Your employee ID

-- 2. If auth_user_id is NULL, update it:
UPDATE users
SET auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549'
WHERE employee_id = 8
AND deleted_at IS NULL;

-- 3. Verify update
SELECT * FROM users WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
```

---

### ❌ Issue 4: is_password_changed is TRUE

**Symptom:**

```
5️⃣ Password Change Decision:
✅ Password already changed (is_password_changed = true)
➡️ Redirecting to dashboard...
```

**Expected:**
Dialog tidak muncul karena password sudah pernah diganti

**For Testing:**

```sql
-- Reset flag to false for testing
UPDATE users
SET is_password_changed = false
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';

-- Verify
SELECT is_password_changed
FROM users
WHERE auth_user_id = '309ffd66-bf76-42f0-bf84-3f562bd1e549';
-- Should return: false
```

---

### ❌ Issue 5: State Not Updated

**Symptom:**

```
🔍 Dialog State Changed:
  - showPasswordDialog: false
  - needsPasswordChange: false
  - Should Render Dialog: false
```

**Possible Causes:**

1. `userData.is_password_changed` bukan `false` (mungkin `null` atau `undefined`)
2. State setter tidak jalan
3. Component unmounted sebelum state update

**Solution:**

```typescript
// Check database value
console.log("is_password_changed value:", userData?.is_password_changed);
console.log("is_password_changed type:", typeof userData?.is_password_changed);
console.log("Strict equals false:", userData?.is_password_changed === false);

// Expected output:
// is_password_changed value: false
// is_password_changed type: boolean
// Strict equals false: true
```

---

### ❌ Issue 6: Dialog Component Not Rendering

**Symptom:**

```
🎭 RENDER CHECK:
  - Should Render: true
✅ Rendering ChangePasswordDialog with props: ...

(But no "ChangePasswordDialog MOUNTED" log appears)
```

**Possible Causes:**

1. Component import error
2. Component crashed on mount
3. React render issue

**Solution:**

```typescript
// Check import
import { ChangePasswordDialog } from "@/components/security/ChangePasswordDialog";

// Check for errors in browser console
// Look for: "Error: ..." or "Uncaught ..."
```

---

### ❌ Issue 7: Controlled Mode Not Activated

**Symptom:**

```
🎮 Controlled Mode Check:
  - Should activate controlled mode: false
⏭️ Skipping controlled mode
```

**Expected Values:**

- `autoCheck: false`
- `forceOpen: true`

**Solution:**

```tsx
// Verify props in verify-pin page
<ChangePasswordDialog
  autoCheck={false} // ✅ Must be false
  forceOpen={true} // ✅ Must be true
  onSuccess={handlePasswordChangeSuccess}
  onSkip={handlePasswordChangeSkip}
/>
```

---

### ❌ Issue 8: Dialog Opens but Immediately Closes

**Symptom:**

```
🔄 ChangePasswordDialog State:
  - open: true
... (then immediately)
🔄 ChangePasswordDialog State:
  - open: false
```

**Possible Causes:**

1. `onOpenChange` triggered immediately
2. `handleSkip` called automatically
3. React strict mode double render

**Solution:**

```typescript
// Check Dialog component
<Dialog
  open={open}
  onOpenChange={(newOpen) => {
    console.log("Dialog onOpenChange:", newOpen);
    if (!newOpen) handleSkip();
  }}
>
```

---

### ❌ Issue 9: isCheckingPassword Always True

**Symptom:**

```
🔄 ChangePasswordDialog State:
  - isCheckingPassword: true
⏳ ChangePasswordDialog: Still checking password status, not rendering...
```

**Possible Causes:**

1. Auto mode active (autoCheck = true)
2. useEffect not setting isCheckingPassword to false

**Solution:**

```typescript
// In ChangePasswordDialog, check:
useEffect(() => {
  if (!autoCheck) {
    console.log("Controlled mode: setting isCheckingPassword to false");
    setIsCheckingPassword(false); // ✅ Should execute
    return;
  }
  // ...
}, [autoCheck]);
```

---

## Step-by-Step Testing Guide

### Test 1: Database Setup

```sql
-- 1. Verify user exists with auth_user_id
SELECT
  id,
  employee_id,
  username,
  auth_user_id,
  is_password_changed,
  deleted_at
FROM users
WHERE employee_id = 8;

-- Expected: 1 row with auth_user_id populated

-- 2. Set is_password_changed to false
UPDATE users
SET is_password_changed = false
WHERE employee_id = 8
AND deleted_at IS NULL;

-- 3. Verify
SELECT is_password_changed FROM users WHERE employee_id = 8;
-- Expected: false
```

### Test 2: Login & Verify PIN

1. Open browser console (F12 → Console tab)
2. Clear console (Ctrl/Cmd + L)
3. Login dengan email/password
4. Masukkan PIN (6 digit)
5. Watch console untuk debugging logs

### Test 3: Expected Console Flow

Monitor console untuk sequence ini:

1. ✅ `VERIFY PIN - DEBUGGING START`
2. ✅ `PIN Verified Successfully!`
3. ✅ `Checking Password Change Status...`
4. ✅ `Database Query Result` → userData found
5. ✅ `Password NEEDS to be changed`
6. ✅ `Setting state to show password dialog...`
7. ✅ `ChangePasswordDialog MOUNTED`
8. ✅ `Controlled Mode Check` → activated
9. ✅ `RENDERING DIALOG!`

### Test 4: Dialog Interaction

1. ✅ Dialog appears with form
2. ✅ Enter new password (min 8 char, uppercase, lowercase, number)
3. ✅ Enter confirm password (matching)
4. ✅ Click "Ubah Password" atau "Nanti Saja"
5. ✅ Success → redirect to dashboard

### Test 5: Verify Password Changed

```sql
-- Check if flag updated
SELECT
  id,
  username,
  is_password_changed,
  updated_at
FROM users
WHERE employee_id = 8;

-- Expected after password change: is_password_changed = true
```

## Quick Diagnostic Commands

### Get Current User Status

```sql
SELECT
  u.id,
  u.employee_id,
  u.username,
  u.auth_user_id,
  u.is_password_changed,
  u.deleted_at,
  au.email AS auth_email
FROM users u
LEFT JOIN auth.users au ON au.id = u.auth_user_id
WHERE u.employee_id = 8;
```

### Get All Users Status

```sql
SELECT
  id,
  employee_id,
  username,
  auth_user_id IS NOT NULL AS has_auth_id,
  is_password_changed,
  deleted_at IS NULL AS is_active
FROM users
ORDER BY id;
```

### Check RLS Policies

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

## Common Patterns

### ✅ Success Pattern

```
VERIFY PIN → Query Success → Data Found → is_password_changed = false
→ State Updated → Dialog Mounted → Controlled Mode → Dialog Opens
```

### ❌ Failure Pattern 1: No Data

```
VERIFY PIN → Query Success → No Data Found → Redirect to Dashboard
Fix: Populate auth_user_id in users table
```

### ❌ Failure Pattern 2: Already Changed

```
VERIFY PIN → Query Success → Data Found → is_password_changed = true
→ Redirect to Dashboard
Fix: Set is_password_changed = false for testing
```

### ❌ Failure Pattern 3: RLS Block

```
VERIFY PIN → Query Error → Redirect to Dashboard
Fix: Add RLS policy for authenticated users
```

## Debug Shortcuts

### Quick Reset for Testing

```sql
-- Reset password change flag
UPDATE users
SET is_password_changed = false
WHERE employee_id = 8;

-- Logout and login again to test
```

### Check Console for Keywords

Search console for these keywords to quickly find issues:

- `❌` - Errors or failed checks
- `⚠️` - Warnings
- `✅` - Success confirmations
- `🔍` - Data queries
- `🎭` - Render checks

## Summary

**Debug flow membantu identify:**

1. ✅ Apakah PIN verify berhasil
2. ✅ Apakah database query success
3. ✅ Apakah user data found
4. ✅ Apakah is_password_changed value correct
5. ✅ Apakah state di-update dengan benar
6. ✅ Apakah component mounted
7. ✅ Apakah controlled mode activated
8. ✅ Apakah dialog opened

**Jika dialog tidak muncul, check:**

1. ❌ Console errors
2. ❌ Database query result
3. ❌ is_password_changed value
4. ❌ State values (showPasswordDialog, needsPasswordChange)
5. ❌ Component props (autoCheck, forceOpen)
6. ❌ Dialog state (open, userId, isCheckingPassword)

Happy debugging! 🐛🔍
