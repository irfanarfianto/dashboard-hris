# Password Change Flow - Updated to Dashboard

## Changes Summary

**Old Flow:**

```
Login → Check is_password_changed → Change Password Dialog (Mandatory) → PIN Setup/Verify → Dashboard
```

**New Flow:**

```
Login → PIN Setup/Verify → Dashboard → Check is_password_changed → Change Password Dialog (Optional)
```

## Why This Change?

1. **Better UX**: User dapat langsung akses dashboard tanpa dipaksa ganti password dulu
2. **Optional**: Dialog ganti password bisa di-skip (tombol "Nanti Saja")
3. **Non-blocking**: Tidak menghambat akses ke aplikasi
4. **Reminder**: Dialog muncul setiap kali masuk dashboard sampai password diganti

## Implementation Details

### 1. Updated Components

#### ChangePasswordDialog.tsx

**New Props:**

```typescript
interface ChangePasswordDialogProps {
  open: boolean;
  userId?: string; // Optional - backward compatibility
  userEmail?: string; // NEW - for updating via employee_id
  onSuccess?: () => void;
  onSkip?: () => void; // NEW - called when user clicks "Nanti Saja"
  optional?: boolean; // NEW - if true, shows skip button
}
```

**Features:**

- ✅ Support update by `userEmail` (via employee_id)
- ✅ Optional mode dengan tombol "Nanti Saja"
- ✅ Different alert message untuk optional vs mandatory mode
- ✅ Can close dialog if optional=true

#### DashboardPasswordCheck.tsx (NEW)

**Purpose:** Check password status saat user masuk dashboard

**Logic:**

```typescript
1. Get current user from Supabase Auth
2. Call checkPasswordChanged(user.email)
3. If needsChange = true → Show ChangePasswordDialog (optional=true)
4. User can change password OR skip
5. If skip → toast info "Anda bisa mengubah password nanti"
```

**Location:** Rendered in `app/dashboard/layout-client.tsx`

### 2. Removed from Login Flow

#### login-form.tsx

**Removed:**

- ❌ `checkPasswordChanged()` call after login
- ❌ `showChangePasswordDialog` state
- ❌ `handlePasswordChangeSuccess()` function
- ❌ ChangePasswordDialog import and render

**Simplified Flow:**

```typescript
Login → Auto-register Device → Check PIN → Setup/Verify PIN → Dashboard
```

### 3. Updated Layout

#### app/dashboard/layout-client.tsx

**Added:**

```tsx
import { DashboardPasswordCheck } from "@/components/dashboard/DashboardPasswordCheck";

return (
  <div>
    <DashboardPasswordCheck /> {/* NEW */}
    <Sidebar />
    <Header />
    <main>{children}</main>
  </div>
);
```

## User Experience Flow

### Scenario 1: New User (is_password_changed = false)

```
1. User login dengan email/password ✅
2. Auto-register device ✅
3. Setup PIN (first time) ✅
4. Redirect ke Dashboard ✅
5. DashboardPasswordCheck runs ✅
6. Dialog muncul: "Rekomendasi Ganti Password" ✅
7. User has 2 options:
   - "Ubah Password" → Change password → is_password_changed = true
   - "Nanti Saja" → Close dialog → Reminder next login
```

### Scenario 2: Returning User (is_password_changed = false)

```
1. User login
2. Verify PIN
3. Masuk Dashboard
4. Dialog muncul lagi (reminder)
5. User can skip or change password
```

### Scenario 3: User Already Changed Password (is_password_changed = true)

```
1. User login
2. Verify PIN
3. Masuk Dashboard
4. No dialog (password already changed) ✅
```

## Dialog Comparison

### Optional Mode (Dashboard)

**Title:** "Rekomendasi Ganti Password"

**Description:** "Untuk keamanan akun, kami merekomendasikan Anda mengganti password"

**Alert:**

```
ℹ️ Untuk keamanan maksimal, kami sarankan Anda mengganti password
   secara berkala. Anda dapat melewati langkah ini.
```

**Buttons:**

- [ Nanti Saja ] (secondary)
- [ Ubah Password ] (primary)

**Can Close:** ✅ Yes (via X button or onSkip)

---

### Mandatory Mode (Login - OLD, now removed)

**Title:** "Ganti Password"

**Description:** "Untuk keamanan akun, silakan ganti password default Anda"

**Alert:**

```
⚠️ Ini adalah login pertama Anda. Harap ganti password sebelum melanjutkan.
```

**Buttons:**

- [ Ubah Password ] (full width, mandatory)

**Can Close:** ❌ No (blocking dialog)

## Database Flow

```sql
-- Check password status
SELECT u.is_password_changed
FROM users u
JOIN employees e ON u.employee_id = e.id
WHERE e.email = 'user@example.com';

-- If false → Show dialog

-- When user changes password:
UPDATE users u
SET is_password_changed = true
FROM employees e
WHERE u.employee_id = e.id
AND e.email = 'user@example.com';
```

## Testing Checklist

### Test 1: New User Flow

- [ ] Login dengan user baru (is_password_changed = false)
- [ ] Verify/Setup PIN berhasil
- [ ] Redirect ke dashboard
- [ ] Dialog "Rekomendasi Ganti Password" muncul
- [ ] Tombol "Nanti Saja" terlihat
- [ ] Click "Nanti Saja" → Dialog close
- [ ] Toast muncul: "Anda bisa mengubah password nanti"

### Test 2: Password Change

- [ ] Dialog muncul
- [ ] Input password baru (8+ chars, uppercase, lowercase, number, special)
- [ ] Password criteria show green checkmarks
- [ ] Confirm password match
- [ ] Click "Ubah Password"
- [ ] Success toast muncul
- [ ] Dialog close
- [ ] is_password_changed updated to true in database

### Test 3: Returning User (Not Changed)

- [ ] Logout
- [ ] Login lagi dengan user yang sama
- [ ] Dialog muncul lagi (reminder)
- [ ] Can skip or change

### Test 4: User Already Changed Password

- [ ] Login dengan user yang is_password_changed = true
- [ ] Verify PIN
- [ ] Masuk dashboard
- [ ] No dialog muncul ✅

### Test 5: Dialog Behavior

- [ ] Optional mode: Can close dengan X button
- [ ] Optional mode: Can close dengan Escape key
- [ ] Optional mode: Can close dengan click outside
- [ ] Mandatory mode (if used elsewhere): Cannot close

## API Reference

### checkPasswordChanged(email: string)

**Server Action:** `lib/actions/securityActions.ts`

**Flow:**

```typescript
1. Query employees table by email → get employee.id
2. Query users table by employee_id → get is_password_changed
3. Return { needsChange: boolean, is_password_changed: boolean, userId: number }
```

**Usage:**

```typescript
const result = await checkPasswordChanged("user@example.com");

if (result.needsChange) {
  // Show dialog
}
```

## Migration Notes

### No Database Changes Required

- ✅ Column `is_password_changed` already exists in users table
- ✅ RLS policies already configured
- ✅ No migration needed

### Code Changes Only

1. ✅ Updated `ChangePasswordDialog.tsx` - add optional props
2. ✅ Created `DashboardPasswordCheck.tsx` - new component
3. ✅ Updated `login-form.tsx` - remove password check
4. ✅ Updated `app/dashboard/layout-client.tsx` - add password check

## Rollback Plan

If you need to revert to mandatory password change on login:

1. Remove `<DashboardPasswordCheck />` from `layout-client.tsx`
2. Restore password check in `login-form.tsx`:
   ```typescript
   const passwordCheck = await checkPasswordChanged(userEmail);
   if (passwordCheck.needsChange) {
     setShowChangePasswordDialog(true);
     return; // Block login
   }
   ```
3. Use `optional={false}` in ChangePasswordDialog

## Security Considerations

### Optional Password Change

**Pros:**

- ✅ Better UX - tidak blocking
- ✅ User masih bisa akses aplikasi
- ✅ Reminder persistent (muncul terus sampai diganti)

**Cons:**

- ⚠️ User bisa skip indefinitely
- ⚠️ Default password bisa tetap digunakan

### Mitigation:

1. **Add expiry date**: Force password change setelah 30/60/90 hari
2. **Email reminder**: Kirim email reminder untuk ganti password
3. **Admin monitoring**: Admin bisa lihat user yang belum ganti password
4. **Periodic prompt**: Bisa ubah interval reminder (setiap 3 hari, dll)

## Future Enhancements

1. **Password Expiry**: Add `password_expires_at` column
2. **Password History**: Prevent reusing last 3 passwords
3. **Force Change After X Days**: Mandatory change setelah periode tertentu
4. **Admin Dashboard**: View users dengan default password
5. **Email Notifications**: Remind via email
6. **Settings Page**: Allow user to change password anytime dari settings

## Related Files

- `components/security/ChangePasswordDialog.tsx` - Updated
- `components/dashboard/DashboardPasswordCheck.tsx` - NEW
- `app/dashboard/layout-client.tsx` - Updated
- `components/login-form.tsx` - Simplified
- `lib/actions/securityActions.ts` - Unchanged (checkPasswordChanged still used)
