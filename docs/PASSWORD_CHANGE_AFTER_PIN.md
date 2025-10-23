# Password Change After PIN Verification

## Overview

Fitur ini menampilkan dialog untuk mengganti password **setelah user berhasil verifikasi PIN**, jika kolom `is_password_changed` di tabel `users` masih bernilai `false`.

## Flow Diagram

```
Login (Email/Password)
  ↓
Device Registration (Auto)
  ↓
PIN Verification
  ↓
Check is_password_changed in users table
  ↓
  ├─ TRUE  → Redirect to Dashboard
  └─ FALSE → Show Password Change Dialog (Optional)
              ↓
              ├─ Change Password → Update Auth & DB → Dashboard
              └─ Skip → Dashboard
```

## Implementation Details

### 1. Database Schema

Tabel: `users` (public schema)

Kolom yang digunakan:

- `auth_user_id` (uuid) - Link ke auth.users, digunakan untuk query
- `is_password_changed` (boolean) - Flag apakah password sudah pernah diganti

Query untuk cek status:

```sql
SELECT id, is_password_changed, auth_user_id
FROM users
WHERE auth_user_id = '{auth_user_id}'
AND deleted_at IS NULL;
```

### 2. Component Architecture

#### ChangePasswordDialog (Dual Mode)

Location: `components/security/ChangePasswordDialog.tsx`

**Props:**

```typescript
interface ChangePasswordDialogProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  autoCheck?: boolean; // true = auto mode, false = controlled mode
  forceOpen?: boolean; // true = force open in controlled mode
}
```

**Mode 1: Auto Mode** (Dashboard)

```tsx
<ChangePasswordDialog />
// or
<ChangePasswordDialog autoCheck={true} />
```

- Component fetch data sendiri via useEffect
- Auto-show jika `is_password_changed = false`
- Digunakan di dashboard untuk cek otomatis

**Mode 2: Controlled Mode** (Verify PIN)

```tsx
<ChangePasswordDialog
  autoCheck={false}
  forceOpen={true}
  onSuccess={handleSuccess}
  onSkip={handleSkip}
/>
```

- Parent component yang kontrol kapan dialog muncul
- Tidak auto-fetch data
- Digunakan di verify-pin page setelah cek manual

### 3. Verify PIN Page Implementation

Location: `app/(auth)/verify-pin/page.tsx`

**State Management:**

```typescript
const [showPasswordDialog, setShowPasswordDialog] = useState(false);
const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
```

**Check Password Status After PIN Verify:**

```typescript
const handleVerify = async () => {
  const result = await verifyUserPin(userId, pin);

  if (result.success) {
    // Set PIN verified cookie
    document.cookie = `pin_verified=true; path=/; max-age=${60 * 60 * 24}`;

    // Check password change status
    const { data: userData } = await supabase
      .from("users")
      .select("id, is_password_changed, auth_user_id")
      .eq("auth_user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (userData?.is_password_changed === false) {
      // Show password dialog
      setNeedsPasswordChange(true);
      setShowPasswordDialog(true);
    } else {
      // Go to dashboard
      router.push("/dashboard");
    }
  }
};
```

**Dialog Handlers:**

```typescript
const handlePasswordChangeSuccess = () => {
  setShowPasswordDialog(false);
  toast.success("Password berhasil diubah!");
  setTimeout(() => router.push("/dashboard"), 1000);
};

const handlePasswordChangeSkip = () => {
  setShowPasswordDialog(false);
  toast.success("Mengalihkan ke dashboard...");
  setTimeout(() => router.push("/dashboard"), 500);
};
```

### 4. Password Change Process

Ketika user klik "Ganti Password":

**Step 1: Update Supabase Auth**

```typescript
const { error: authError } = await supabase.auth.updateUser({
  password: newPassword,
});
```

**Step 2: Update users Table**

```typescript
const { error: dbError } = await supabase
  .from("users")
  .update({ is_password_changed: true })
  .eq("auth_user_id", userId);
```

**Step 3: Success Callback**

```typescript
if (!authError && !dbError) {
  toast.success("Password berhasil diubah!");
  onSuccess?.(); // Call parent callback
}
```

## User Journey

### Scenario 1: First Time Login (is_password_changed = false)

1. User login dengan email/password
2. Device auto-register
3. User diminta setup/verify PIN
4. Setelah PIN benar → **Dialog password change muncul**
5. User pilih:
   - **Ganti Password** → Update auth & DB → Dashboard
   - **Nanti Saja** → Dashboard (bisa ganti nanti)

### Scenario 2: Already Changed Password (is_password_changed = true)

1. User login dengan email/password
2. Device auto-register
3. User verify PIN
4. Setelah PIN benar → **Langsung ke dashboard** (no dialog)

### Scenario 3: Skip Then Change Later

1. User skip password change di verify-pin
2. Masuk dashboard
3. Dashboard juga punya `DashboardPasswordCheck` (optional)
4. Bisa ganti password dari:
   - Profile settings
   - Security menu
   - Auto-check di dashboard (jika diaktifkan)

## Files Modified

### 1. app/(auth)/verify-pin/page.tsx

- Import `ChangePasswordDialog`
- Add state: `showPasswordDialog`, `needsPasswordChange`
- Check `is_password_changed` after PIN verify
- Conditional dialog render
- Add success/skip handlers

### 2. components/security/ChangePasswordDialog.tsx

- Add props: `autoCheck`, `forceOpen`
- Support dual mode (auto/controlled)
- Add useEffect for controlled mode
- Maintain backward compatibility

### 3. app/dashboard/layout-client.tsx

- Remove `DashboardPasswordCheck` component
- Dialog check dipindahkan ke verify-pin page

## Testing Checklist

### Database Setup

```sql
-- ✅ Pastikan auth_user_id sudah populated
UPDATE users
SET auth_user_id = '{uuid_from_auth_users}'
WHERE employee_id = {your_employee_id}
AND deleted_at IS NULL;

-- ✅ Set is_password_changed = false untuk testing
UPDATE users
SET is_password_changed = false
WHERE auth_user_id = '{your_auth_user_id}';
```

### Test Cases

**Test 1: Dialog Shows After PIN**

- [ ] Login dengan user yang `is_password_changed = false`
- [ ] Verify PIN
- [ ] Dialog password change muncul
- [ ] Console log: "User data found" & "Password needs to be changed"

**Test 2: Password Change Success**

- [ ] Masukkan password baru (min 8 char, uppercase, lowercase, number)
- [ ] Confirm password match
- [ ] Klik "Ganti Password"
- [ ] Toast success muncul
- [ ] Redirect ke dashboard
- [ ] Check DB: `is_password_changed = true`
- [ ] Check Auth: password sudah update

**Test 3: Skip Password Change**

- [ ] Verify PIN
- [ ] Dialog muncul
- [ ] Klik "Nanti Saja"
- [ ] Toast muncul
- [ ] Redirect ke dashboard
- [ ] Check DB: `is_password_changed` masih false

**Test 4: Already Changed Password**

- [ ] Set `is_password_changed = true` di DB
- [ ] Login & verify PIN
- [ ] Dialog **tidak muncul**
- [ ] Langsung ke dashboard
- [ ] Console log: "Password already changed"

**Test 5: Login Again After Change**

- [ ] Login dengan password baru
- [ ] Verify PIN
- [ ] Dialog tidak muncul (is_password_changed = true)
- [ ] Langsung ke dashboard

## Troubleshooting

### Dialog Tidak Muncul

**Possible Causes:**

1. `auth_user_id` di tabel users masih NULL

   ```sql
   -- Check
   SELECT id, employee_id, auth_user_id, is_password_changed
   FROM users
   WHERE employee_id = {your_id};

   -- Fix
   UPDATE users SET auth_user_id = '{uuid}' WHERE employee_id = {id};
   ```

2. `is_password_changed` sudah true

   ```sql
   -- Check
   SELECT is_password_changed FROM users WHERE auth_user_id = '{uuid}';

   -- Fix (for testing)
   UPDATE users SET is_password_changed = false WHERE auth_user_id = '{uuid}';
   ```

3. Query tidak return data (RLS policy issue)

   ```sql
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'users';

   -- Should have: users_authenticated_read
   ```

### Error: "User data not found"

```typescript
// Console log shows:
// "Auth user ID: xxx"
// "User data not found in users table for auth_user_id: xxx"

// Solution: Populate auth_user_id
UPDATE users
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = users_email
)
WHERE auth_user_id IS NULL;
```

### Dialog Muncul Tapi Tidak Bisa Update

**Possible Causes:**

1. RLS policy block update

   ```sql
   -- Add policy for update
   CREATE POLICY users_authenticated_update
   ON users FOR UPDATE
   TO authenticated
   USING (auth_user_id = auth.uid())
   WITH CHECK (auth_user_id = auth.uid());
   ```

2. Supabase service role key tidak digunakan untuk update
   - Check: Pastikan menggunakan service_role key untuk update di server action
   - Or: Add RLS policy yang allow authenticated user update sendiri

## Migration Guide

### From Dashboard Check to PIN Check

**Before:**

```tsx
// Dashboard layout
<DashboardPasswordCheck />

// Auto-check on every dashboard page load
```

**After:**

```tsx
// Verify PIN page
{
  showPasswordDialog && needsPasswordChange && (
    <ChangePasswordDialog
      autoCheck={false}
      forceOpen={true}
      onSuccess={handleSuccess}
      onSkip={handleSkip}
    />
  );
}

// Check only once after PIN verification
```

**Benefits:**

- ✅ Less frequent check (hanya sekali setelah PIN, bukan setiap page load)
- ✅ Better UX (dialog muncul di waktu yang tepat)
- ✅ Less database queries
- ✅ Clear separation of concerns

## Best Practices

### 1. Security

- ✅ Password validation (min 8 char, uppercase, lowercase, number)
- ✅ Confirm password match
- ✅ Update both Auth and DB atomically
- ✅ Use RLS policies untuk protect data

### 2. UX

- ✅ Optional change (user bisa skip)
- ✅ Clear error messages
- ✅ Loading states
- ✅ Toast notifications
- ✅ Smooth transitions

### 3. Performance

- ✅ Single query after PIN verify
- ✅ Conditional rendering
- ✅ No auto-check on every page load
- ✅ Efficient database queries

### 4. Maintainability

- ✅ Dual mode component (reusable)
- ✅ Clear prop interface
- ✅ Console logging for debugging
- ✅ Comprehensive documentation

## Future Enhancements

### Optional Features to Consider:

1. **Password Strength Meter**

   - Visual indicator untuk password strength
   - Real-time feedback

2. **Password History**

   - Prevent reusing old passwords
   - Store hash of previous passwords

3. **Force Password Change**

   - Admin bisa force user ganti password
   - Add `force_password_change` column

4. **Password Expiry**

   - Auto-expire password after X days
   - Show warning before expiry

5. **Two-Factor Authentication**
   - Add 2FA after password change
   - Optional enhanced security

## Related Documentation

- [Security Flow](./SECURITY_FLOW.md)
- [Password Hash Fix](./PASSWORD_HASH_FIX.md)
- [Auth User ID Fix](./AUTH_USER_ID_FIX.md)
- [RLS Policy Fix](./RLS_POLICY_FIX.md)

## Summary

Flow baru ini memberikan:

- ✅ **Better timing**: Dialog muncul setelah PIN verify, bukan di dashboard
- ✅ **Better UX**: User bisa langsung ganti password setelah login sukses
- ✅ **Optional**: User tetap bisa skip dan ganti nanti
- ✅ **Efficient**: Query hanya 1x setelah PIN verify
- ✅ **Flexible**: Component support 2 mode (auto/controlled)

User journey lebih smooth dan natural! 🚀
