# Security Flow Documentation

## 🔐 3-Layer Security System

Sistem keamanan aplikasi HRIS Bharata menggunakan 3 layer autentikasi:

1. **Email & Password** (Supabase Auth)
2. **Device Registration** (user_devices table)
3. **PIN Verification** (user_pins table)

---

## 📋 Authentication Flow

### Flow untuk User Baru (Pertama kali login)

```
1. User membuka aplikasi
   ↓
2. User klik login → /auth/login
   ↓
3. User input email & password
   ↓
4. Supabase Auth validates credentials
   ↓
5. Login SUCCESS → router.push("/dashboard")
   ↓
6. MIDDLEWARE INTERCEPT:
   - Check: User authenticated? ✅
   - Check: Device registered (cookie device_id)? ❌
   ↓
7. Redirect → /register-device
   ↓
8. User sees device info (auto-detected)
   - Browser: Chrome
   - OS: Windows 10
   - Type: Desktop
   ↓
9. User input device name (or use default)
   ↓
10. Click "Daftarkan Perangkat"
    - Save to user_devices table
    - Set cookie: device_id = [fingerprint]
    ↓
11. Redirect → /setup-pin
    ↓
12. User input PIN (6 digits)
    ↓
13. User confirm PIN (6 digits)
    ↓
14. Validate: PIN match?
    ↓
15. Save to user_pins table (bcrypt hashed)
    - Set cookie: pin_verified = true
    ↓
16. Redirect → /dashboard
    ↓
17. MIDDLEWARE INTERCEPT:
    - Check: User authenticated? ✅
    - Check: Device registered? ✅
    - Check: Device active? ✅
    - Check: User has PIN? ✅
    - Check: PIN verified in session? ✅
    ↓
18. ✅ ALLOW ACCESS to /dashboard
```

---

### Flow untuk User yang Sudah Terdaftar (Login kembali)

```
1. User membuka aplikasi
   ↓
2. User klik login → /auth/login
   ↓
3. User input email & password
   ↓
4. Login SUCCESS → router.push("/dashboard")
   ↓
5. MIDDLEWARE INTERCEPT:
   - Check: User authenticated? ✅
   - Check: Device registered (cookie device_id)? ✅
   - Check: Device active in DB? ✅
   - Check: User has PIN in DB? ✅
   - Check: PIN verified in session (cookie)? ❌
   ↓
6. Redirect → /verify-pin
   ↓
7. User input PIN (6 digits)
   ↓
8. Verify PIN with bcrypt.compare()
   ↓
9. If CORRECT:
   - Set cookie: pin_verified = true
   - Redirect → /dashboard
   ↓
10. If WRONG:
    - Increment attempts counter
    - If attempts < 3: Show error, allow retry
    - If attempts >= 3:
      * Block device (is_active = false)
      * Redirect → /device-blocked
      * Logout user
```

---

### Flow untuk Device Baru dari User yang Sama

```
1. User login dari browser/device baru
   ↓
2. Login SUCCESS → router.push("/dashboard")
   ↓
3. MIDDLEWARE INTERCEPT:
   - Check: Device registered (cookie device_id)? ❌
   ↓
4. Redirect → /register-device
   ↓
5. Register new device (same as first time)
   ↓
6. Check: User has PIN? ✅
   ↓
7. Redirect → /verify-pin (NOT setup-pin)
   ↓
8. User input existing PIN
   ↓
9. Verify → Dashboard
```

---

## 🛡️ Middleware Security Checks

File: `lib/supabase/middleware.ts`

### Check Order:

```typescript
1. Check if env vars exist
   ↓
2. Create Supabase client
   ↓
3. Get authenticated user
   ↓
4. If NO user + protected route → Redirect to /sign-in
   ↓
5. If user authenticated + NOT on security route:

   a. Check device_id cookie
      - No cookie → /register-device

   b. Check device in database
      - Not found → /register-device
      - is_active = false → /device-blocked

   c. Check user_pins table
      - No PIN → /setup-pin

   d. Check pin_verified cookie
      - Not verified → /verify-pin

   e. All checks passed → Allow access
```

---

## 🍪 Cookies Used

### 1. `device_id`

- **Purpose**: Identify registered device
- **Set by**: `/register-device` page
- **Max Age**: 1 year (365 days)
- **Path**: `/`
- **Value**: Device fingerprint hash

### 2. `pin_verified`

- **Purpose**: Mark PIN as verified in current session
- **Set by**: `/setup-pin` and `/verify-pin` pages
- **Max Age**: 24 hours (1 day)
- **Path**: `/`
- **Value**: `"true"`

### 3. Supabase Auth Cookies (auto-managed)

- `sb-[project]-auth-token`
- `sb-[project]-auth-token.0`
- `sb-[project]-auth-token.1`
- etc.

---

## 📁 Database Tables

### `user_devices`

```sql
CREATE TABLE user_devices (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  device_id VARCHAR(100) UNIQUE NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  last_login TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP NULL
);
```

**Fields:**

- `user_id`: Link to Supabase auth user
- `device_id`: Unique device fingerprint
- `device_name`: User-friendly name (e.g., "Chrome on Windows")
- `last_login`: Last login timestamp
- `is_active`: FALSE if device is blocked
- `deleted_at`: Soft delete timestamp

---

### `user_pins`

```sql
CREATE TABLE user_pins (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pin_code CHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expired_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL
);
```

**Fields:**

- `user_id`: Link to Supabase auth user
- `pin_code`: Bcrypt hashed 6-digit PIN
- `created_at`: PIN creation timestamp
- `expired_at`: PIN expiry date (optional)
- `deleted_at`: Soft delete timestamp

---

## 🔧 Key Functions

### Device Fingerprinting

**File**: `lib/utils/deviceFingerprint.ts`

```typescript
getDeviceInfo(): {
  deviceId: string,    // SHA-256 hash of fingerprint
  browser: string,     // Chrome, Firefox, Edge, etc
  os: string,          // Windows, macOS, Android, etc
  type: string         // Desktop, Mobile, Tablet
}
```

**Uses:**

- User Agent
- Screen Resolution
- Color Depth
- Timezone
- Language
- Platform
- Hardware Concurrency
- Device Memory
- Touch Support

---

### Security Actions

**File**: `lib/actions/securityActions.ts`

#### Device Management:

- `registerUserDevice(userId, deviceId, deviceName)`
- `isDeviceRegistered(userId, deviceId)`
- `isDeviceActive(userId, deviceId)`
- `blockDevice(deviceId)`
- `unblockDevice(deviceId)`

#### PIN Management:

- `hasUserPin(userId)`
- `createUserPin(userId, pinCode)`
- `verifyUserPin(userId, pinCode)`
- `isPinExpired(userId)`
- `changeUserPin(userId, oldPin, newPin)`
- `resetUserPin(userId, newPin)`

---

## 🎨 Security Pages

### 1. `/register-device`

- Auto-detect device info
- Show browser, OS, device type
- Input device name
- Save to database + set cookie

### 2. `/setup-pin`

- First-time PIN setup
- Input 6-digit PIN
- Confirm PIN
- Validate: must match, not weak
- Save hashed PIN + set verified cookie

### 3. `/verify-pin`

- Returning user PIN verification
- Input 6-digit PIN
- Max 3 attempts
- Wrong 3x → block device
- Success → set verified cookie

### 4. `/device-blocked`

- Show blocked message
- Display device info
- Contact admin button
- Logout button

---

## 🚨 Security Features

### 1. **Weak PIN Detection**

Rejects common patterns:

- `123456`
- `111111`, `222222`, etc (repeated digits)
- Sequential patterns

### 2. **Brute Force Protection**

- Max 3 PIN attempts
- Auto-block device after 3 fails
- Requires admin to unblock

### 3. **Device Tracking**

- Track all devices per user
- See last login time
- Block/unblock from settings

### 4. **Session Expiry**

- PIN verification expires after 24 hours
- Must re-enter PIN on next day

### 5. **Soft Deletes**

- Never hard-delete security records
- Maintain audit trail
- Can restore if needed

---

## 🎯 Testing Checklist

### First Time User:

- [ ] Login with email/password
- [ ] Redirected to /register-device
- [ ] Device info auto-detected correctly
- [ ] Can register device
- [ ] Redirected to /setup-pin
- [ ] Can create PIN
- [ ] PIN confirmation works
- [ ] Redirected to /dashboard
- [ ] Can access dashboard

### Returning User:

- [ ] Login with email/password
- [ ] Redirected to /verify-pin
- [ ] Can enter PIN
- [ ] Correct PIN → Dashboard
- [ ] Wrong PIN → Error message
- [ ] 3 wrong PINs → Device blocked

### New Device (Same User):

- [ ] Login from new browser
- [ ] Redirected to /register-device
- [ ] Register new device
- [ ] Redirected to /verify-pin (NOT setup-pin)
- [ ] Enter existing PIN
- [ ] Access dashboard

### Edge Cases:

- [ ] Logout → PIN cookie cleared
- [ ] Clear cookies → Re-register device
- [ ] Device blocked → Cannot access
- [ ] Expired PIN → Reset flow

---

## 🐛 Troubleshooting

### Issue: "Stuck in redirect loop"

**Cause**: Middleware keeps redirecting
**Fix**: Check cookie settings and middleware logic

### Issue: "PIN not verifying"

**Cause**: Bcrypt comparison failing
**Fix**: Ensure PIN is hashed before saving

### Issue: "Device not recognized"

**Cause**: Cookie not set or fingerprint changed
**Fix**: Re-register device

### Issue: "Always redirected to setup-pin"

**Cause**: PIN not found in database
**Fix**: Check user_pins table for user_id

---

## 📚 Related Files

```
lib/
  actions/securityActions.ts         ← Server actions
  utils/deviceFingerprint.ts         ← Device detection
  supabase/middleware.ts             ← Security checks

components/
  security/PinInput.tsx              ← Reusable PIN input

app/
  (auth)/
    register-device/page.tsx         ← Device registration
    setup-pin/page.tsx               ← First-time PIN setup
    verify-pin/page.tsx              ← PIN verification
    device-blocked/page.tsx          ← Blocked device error
  auth/
    login/page.tsx                   ← Email/password login

middleware.ts                        ← Main middleware entry
```

---

## 🔄 Future Enhancements

- [ ] Email notification on new device
- [ ] SMS OTP for device verification
- [ ] Biometric authentication
- [ ] PIN expiry enforcement
- [ ] Admin panel for device management
- [ ] Security activity log
- [ ] Two-factor authentication (2FA)
- [ ] Trust device for X days option

---

## 📝 Notes

- All PINs are hashed with bcrypt (10 rounds)
- Device fingerprints use SHA-256 hashing
- Cookies are httpOnly and secure in production
- Soft deletes preserve audit trail
- Session cookies expire after 24 hours
- Device cookies expire after 1 year
