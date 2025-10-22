# Migration: User Devices & User PINs Tables

## 📋 Overview

Migration ini membuat 2 tabel baru untuk fitur security (Device Registration & PIN):

1. **user_devices** - Menyimpan device yang terdaftar per user
2. **user_pins** - Menyimpan PIN security (bcrypt hashed)

---

## 🔧 Schema Details

### Table: `user_devices`

```sql
CREATE TABLE user_devices (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  device_id VARCHAR(100) UNIQUE NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

**Columns:**

- `id`: Primary key (auto-increment)
- `user_id`: **UUID** (bukan integer!) - Reference ke `auth.users(id)`
- `device_id`: Unique device fingerprint (max 100 chars)
- `device_name`: User-friendly name (e.g., "Chrome on Windows")
- `last_login`: Timestamp login terakhir
- `is_active`: TRUE = aktif, FALSE = blocked
- `deleted_at`: Soft delete (NULL = active)

**Indexes:**

- `idx_user_devices_user_id` on `user_id`
- `idx_user_devices_device_id` on `device_id`
- `idx_user_devices_deleted_at` on `deleted_at`

---

### Table: `user_pins`

```sql
CREATE TABLE user_pins (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pin_code VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expired_at TIMESTAMP WITH TIME ZONE NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

**Columns:**

- `id`: Primary key (auto-increment)
- `user_id`: **UUID** (bukan integer!) - Reference ke `auth.users(id)`
- `pin_code`: **VARCHAR(255)** (bukan CHAR(6)!) - Bcrypt hash (~60 chars)
- `created_at`: Timestamp pembuatan PIN
- `expired_at`: Tanggal kadaluarsa PIN (optional)
- `deleted_at`: Soft delete (NULL = active)

**Indexes:**

- `idx_user_pins_user_id` on `user_id`
- `idx_user_pins_deleted_at` on `deleted_at`

---

## ⚠️ Perbedaan Penting

### ❌ Schema Lama (SALAH):

```sql
user_id INTEGER             -- SALAH! Supabase auth pakai UUID
pin_code CHAR(6)            -- SALAH! Bcrypt hash panjangnya 60 chars
```

### ✅ Schema Baru (BENAR):

```sql
user_id UUID                -- BENAR! Match dengan auth.users(id)
pin_code VARCHAR(255)       -- BENAR! Cukup untuk bcrypt hash
```

---

## 🚀 Cara Menjalankan Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Copy paste isi file `create_user_devices_table.sql`
5. Klik **Run**
6. Ulangi untuk `create_user_pins_table.sql`

### Option 2: Via Supabase CLI

```bash
# Jalankan migration user_devices
supabase db push migrations/create_user_devices_table.sql

# Jalankan migration user_pins
supabase db push migrations/create_user_pins_table.sql
```

### Option 3: Via psql

```bash
# Connect ke database
psql -h [DB_HOST] -U [DB_USER] -d [DB_NAME]

# Jalankan migration
\i migrations/create_user_devices_table.sql
\i migrations/create_user_pins_table.sql
```

---

## ✅ Verify Migration

Setelah migration berhasil, cek dengan query ini:

```sql
-- Cek table user_devices
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'user_devices';

-- Expected output:
-- user_id      | uuid          | NULL
-- device_id    | varchar       | 100
-- pin_code     | varchar       | 255

-- Cek table user_pins
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'user_pins';

-- Expected output:
-- user_id      | uuid          | NULL
-- pin_code     | varchar       | 255
```

---

## 🔄 Rollback (Jika Perlu)

Jika perlu rollback:

```sql
-- Drop tables (hati-hati!)
DROP TABLE IF EXISTS user_pins CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
```

---

## 📝 Notes

1. **user_id adalah UUID**: Karena Supabase Auth menggunakan UUID, bukan integer
2. **pin_code adalah VARCHAR(255)**: Karena bcrypt menghasilkan hash 60 karakter
3. **Soft Delete**: Kedua tabel menggunakan `deleted_at` untuk soft delete
4. **Foreign Key Cascade**: `ON DELETE CASCADE` - Jika user dihapus, devices & pins juga terhapus

---

## 🐛 Troubleshooting

### Error: "relation auth.users does not exist"

**Cause**: Table `auth.users` belum ada (jarang terjadi di Supabase)

**Fix**: Pastikan Supabase Auth sudah diaktifkan di project settings

### Error: "column user_id already exists with type integer"

**Cause**: Table sudah ada dengan schema lama

**Fix**: Drop dan recreate table:

```sql
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS user_pins CASCADE;
-- Kemudian jalankan migration lagi
```

### Error: "permission denied for schema auth"

**Cause**: User tidak punya permission untuk reference auth.users

**Fix**: Gunakan service role key atau postgres role untuk menjalankan migration

---

## ✨ After Migration

Setelah migration berhasil:

1. ✅ Restart development server
2. ✅ Test login flow
3. ✅ Test device registration
4. ✅ Test PIN setup
5. ✅ Check database records

---

## 📚 Related Files

```
migrations/
  ├── create_user_devices_table.sql    ← Migration file
  └── create_user_pins_table.sql       ← Migration file

lib/actions/
  └── securityActions.ts               ← Uses these tables

components/security/
  ├── SetupPinDialog.tsx               ← Creates PIN
  └── VerifyPinDialog.tsx              ← Verifies PIN
```
