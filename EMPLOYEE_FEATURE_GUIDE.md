# Employee Registration Feature - Setup Guide

## 🎯 Fitur Yang Telah Ditambahkan

### 1. **Employee Registration dengan Auto User Creation**

Fitur untuk mendaftarkan karyawan baru sekaligus membuat akun user untuk akses aplikasi mobile HRIS.

**File yang dibuat/diupdate:**

- ✅ `components/employees/AddEmployeeDialog.tsx` - Dialog form pendaftaran karyawan
- ✅ `lib/actions/employeeActions.ts` - Server Actions untuk create employee + user
- ✅ `migrations/add_auth_user_id_to_users.sql` - Database migration
- ✅ `app/dashboard/employees/page.tsx` - Integrasi button Tambah Karyawan

### 2. **Delete Confirmation Dialog**

Dialog konfirmasi yang user-friendly untuk semua proses penghapusan data.

**File yang diupdate:**

- ✅ `components/ui/delete-confirm-dialog.tsx` - Reusable dialog component
- ✅ `components/master-data/CompanyTable.tsx`
- ✅ `components/master-data/DepartmentTable.tsx`
- ✅ `components/master-data/PositionTable.tsx`
- ✅ `components/master-data/PositionLevelTable.tsx`
- ✅ `components/master-data/WorkShiftTable.tsx`

---

## 📋 Langkah Setup Database

### Step 1: Jalankan Migration SQL

Anda perlu menjalankan migration SQL untuk menambahkan kolom `auth_user_id` ke tabel `users`.

**Opsi 1: Via Supabase Dashboard**

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy isi file `migrations/add_auth_user_id_to_users.sql`
6. Paste ke SQL Editor
7. Klik **Run** atau tekan `Ctrl+Enter`

**Opsi 2: Via Terminal (Supabase CLI)**

```bash
# Pastikan Supabase CLI terinstall
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan migration
supabase db push
```

### Step 2: Verifikasi Migration

Cek apakah kolom `auth_user_id` sudah ditambahkan:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'auth_user_id';
```

Expected result:

```
column_name  | data_type | is_nullable
-------------+-----------+-------------
auth_user_id | uuid      | YES
```

---

## 🚀 Cara Menggunakan Fitur

### A. Tambah Karyawan Baru

1. **Buka halaman Daftar Karyawan**

   - Navigate ke `/dashboard/employees`
   - Klik tombol **"Tambah Karyawan"**

2. **Isi Data Perusahaan & Jabatan**

   - Pilih **Perusahaan** (dropdown akan load semua perusahaan)
   - Pilih **Departemen** (auto-filter berdasarkan perusahaan)
   - Pilih **Posisi/Jabatan** (auto-filter berdasarkan departemen)
   - Pilih **Tipe Kepegawaian** (Kontrak/Tetap/dll)
   - Pilih **Shift Kerja**
   - Pilih **Status** (Probation/Active/Inactive)

3. **Isi Data Pribadi**

   - **Nama Lengkap** (required)
   - **Email** (required, akan divalidasi unique)
   - **Nomor Telepon** (required)
   - **Jenis Kelamin**
   - **Tanggal Lahir**
   - **Tanggal Masuk** (default: hari ini)

4. **Buat Akun User (Opsional)**

   - ✅ **Centang checkbox** "🔐 Buat Akun User untuk Karyawan"
   - **Username** akan auto-generate dari nama (bisa diedit)
     - Contoh: "Budi Prakoso" → "budi.prakoso"
   - **Pilih Role Akses** (Employee/Manager/HR/Admin)

5. **Simpan**
   - Klik tombol **"Simpan Karyawan"**
   - Loading state akan muncul
   - Jika berhasil dan akun user dibuat, akan muncul **Success Screen**

### B. Success Screen - Kredensial User

Setelah karyawan berhasil ditambahkan dengan akun user, akan muncul layar sukses yang menampilkan:

**Informasi yang ditampilkan:**

- ✅ Email karyawan
- ✅ Username untuk login
- ✅ **Password Sementara** (auto-generated 12 karakter)
- 📋 Tombol **Copy Password** untuk salin ke clipboard

**⚠️ PENTING:**

- Password ini **HANYA DITAMPILKAN SEKALI**
- Salin password dan kirimkan ke karyawan dengan aman (email/WhatsApp)
- Karyawan harus mengganti password saat pertama kali login

**Template Pesan untuk Karyawan:**

```
Halo [Nama Karyawan],

Akun HRIS Anda telah dibuat! 🎉

📱 Silakan download aplikasi HRIS Mobile
📧 Email: [email]
👤 Username: [username]
🔑 Password: [temp_password]

⚠️ Penting: Segera ganti password Anda setelah login pertama kali.

Terima kasih!
HR Bharata
```

### C. Delete Data dengan Confirmation

Semua tabel master data sekarang menggunakan **Delete Confirmation Dialog** yang lebih user-friendly:

**Fitur Dialog:**

- ⚠️ Warning icon dan pesan amber
- 📝 Menampilkan nama item yang akan dihapus
- ✅ Button "Batal" dan "Hapus"
- 🔄 Loading state saat proses delete
- 🎨 Gradient red button untuk delete action

**Cara menggunakan:**

1. Klik tombol **Hapus** pada row data
2. Dialog konfirmasi akan muncul
3. Baca peringatan dengan teliti
4. Klik **"Hapus"** untuk konfirmasi atau **"Batal"** untuk batalkan

---

## 🔐 Arsitektur Hybrid Auth

### Skema Database

```
┌─────────────────┐           ┌──────────────────┐
│  auth.users     │           │  users (custom)  │
│  (Supabase)     │◄─────────┤                  │
├─────────────────┤           ├──────────────────┤
│ id (PK)         │           │ id (PK)          │
│ email           │           │ auth_user_id FK  │
│ encrypted_pwd   │           │ employee_id FK   │
│ created_at      │           │ username         │
│ ...             │           │ role_id          │
└─────────────────┘           │ is_active        │
                              └──────────────────┘
                                     │
                                     ▼
                              ┌──────────────────┐
                              │  employees       │
                              ├──────────────────┤
                              │ id (PK)          │
                              │ full_name        │
                              │ email            │
                              │ ...              │
                              └──────────────────┘
```

### Alur Kerja

**1. Pendaftaran Karyawan TANPA User Account:**

```
Input Form → Validate Data → Insert ke employees → Done ✅
```

**2. Pendaftaran Karyawan DENGAN User Account:**

```
Input Form → Validate Data → Insert ke employees
                          ↓
                  Create Supabase Auth User (auth.admin.createUser)
                          ↓
                  Insert ke users table (dengan auth_user_id & employee_id)
                          ↓
                  Return temporary password → Display to HR ✅
```

**3. Rollback on Error:**

```
Jika Insert users table GAGAL:
  → Delete Supabase Auth User
  → Delete Employee Record
  → Return Error to User ❌
```

### Keuntungan Hybrid Approach

✅ **Keamanan Maksimal** - Password management handled by Supabase
✅ **Flexibilitas** - Custom roles & permissions di tabel users
✅ **Skalabilitas** - Bisa add admin/HR tanpa employee record
✅ **Data Integrity** - Foreign key constraint + ON DELETE CASCADE
✅ **Row Level Security** - Bisa gunakan RLS Supabase untuk proteksi data

---

## 🧪 Testing Guide

### Test Case 1: Tambah Karyawan Tanpa User Account

**Steps:**

1. Buka `/dashboard/employees`
2. Klik "Tambah Karyawan"
3. Isi semua field required
4. **JANGAN centang** "Buat Akun User"
5. Klik "Simpan Karyawan"

**Expected Result:**

- ✅ Employee record ter-create di tabel `employees`
- ✅ Tidak ada record di `users` table
- ✅ Tidak ada user di `auth.users`
- ✅ Dialog otomatis close setelah sukses

### Test Case 2: Tambah Karyawan Dengan User Account

**Steps:**

1. Buka `/dashboard/employees`
2. Klik "Tambah Karyawan"
3. Isi semua field required
4. ✅ **Centang** "Buat Akun User untuk Karyawan"
5. Pilih Role (misal: Employee)
6. Username auto-generated (bisa edit)
7. Klik "Simpan Karyawan"

**Expected Result:**

- ✅ Employee record ter-create
- ✅ Supabase Auth user ter-create di `auth.users`
- ✅ Users record ter-create dengan `auth_user_id` dan `employee_id` terisi
- ✅ Success screen muncul dengan temp password
- ✅ Bisa copy password ke clipboard

### Test Case 3: Email Duplicate Validation

**Steps:**

1. Tambah karyawan dengan email "test@example.com"
2. Coba tambah karyawan lagi dengan email yang sama

**Expected Result:**

- ❌ Error: "Email sudah terdaftar dalam sistem"
- ❌ Tidak ada data yang tersimpan

### Test Case 4: Username Duplicate Validation

**Steps:**

1. Tambah karyawan dengan username "john.doe" + create user
2. Coba tambah karyawan lain dengan username yang sama + create user

**Expected Result:**

- ❌ Error: "Username sudah digunakan"
- ❌ Tidak ada data yang tersimpan
- ✅ Rollback: Auth user deleted, Employee record deleted

### Test Case 5: Delete Confirmation

**Steps:**

1. Buka table master data (Company/Department/Position/PositionLevel/WorkShift)
2. Klik tombol "Hapus" pada row manapun
3. Dialog konfirmasi muncul

**Expected Result:**

- ✅ Dialog menampilkan nama item
- ✅ Peringatan warning amber muncul
- ✅ Klik "Batal" → dialog close, data tidak terhapus
- ✅ Klik "Hapus" → loading state → data terhapus → dialog close

---

## 🛠️ Troubleshooting

### Problem 1: Migration Error - "relation already exists"

**Solution:**

```sql
-- Cek apakah kolom sudah ada
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'auth_user_id';

-- Jika sudah ada, skip migration atau drop dulu
-- ALTER TABLE users DROP COLUMN auth_user_id CASCADE;
```

### Problem 2: "Cannot create user - admin API error"

**Kemungkinan Penyebab:**

1. Service Role Key tidak di-set di environment variable
2. RLS policy block admin API

**Solution:**

```bash
# Check .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← PENTING!
```

### Problem 3: Dropdown kosong (Company/Department/Position)

**Kemungkinan Penyebab:**

1. Belum ada master data
2. RLS policy block read

**Solution:**

```sql
-- Cek data master
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM departments;
SELECT COUNT(*) FROM positions;

-- Tambah sample data atau disable RLS temporary
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
```

### Problem 4: "Username sudah digunakan" padahal belum pernah create

**Kemungkinan Penyebab:**
Failed transaction yang tidak rollback sempurna

**Solution:**

```sql
-- Cari orphan records
SELECT * FROM users WHERE auth_user_id IS NULL;
SELECT * FROM users WHERE employee_id IS NULL;

-- Clean up manual
DELETE FROM users WHERE auth_user_id IS NULL AND employee_id IS NULL;
```

---

## 📊 Monitoring & Logs

### Check Employee + User Creation

```sql
-- Cek employee terbaru
SELECT id, full_name, email, created_at
FROM employees
ORDER BY created_at DESC
LIMIT 10;

-- Cek user terbaru dengan join
SELECT
  u.id,
  u.username,
  u.auth_user_id,
  u.employee_id,
  e.full_name,
  e.email,
  r.name as role_name,
  u.created_at
FROM users u
LEFT JOIN employees e ON u.employee_id = e.id
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.created_at DESC
LIMIT 10;

-- Cek Supabase Auth users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

### Check Orphan Records

```sql
-- Users tanpa auth_user_id (seharusnya tidak ada kecuali legacy data)
SELECT * FROM users WHERE auth_user_id IS NULL;

-- Users tanpa employee_id (ini OK untuk admin/HR)
SELECT u.*, r.name as role
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.employee_id IS NULL;

-- Auth users tanpa users record (potential rollback incomplete)
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN users u ON au.id = u.auth_user_id
WHERE u.id IS NULL;
```

---

## 🎨 UI/UX Features

### Theme Colors (Bharata Branding)

- **Primary (Teal):** `#20A39E` / `hsl(178, 68%, 38%)`
- **Secondary (Lime):** `#99D84C` / `hsl(82, 63%, 57%)`
- **Gradients:** `from-teal-500 to-lime-500` untuk accent

### Component Highlights

**AddEmployeeDialog:**

- 📱 Responsive (mobile cards + desktop table)
- 🎨 Gradient teal/lime accents
- ✅ Real-time validation
- 🔄 Cascade dropdowns (Company → Department → Position)
- 🤖 Auto-generate username from full name
- 📋 Copy to clipboard untuk password
- 🌙 Dark mode support

**DeleteConfirmDialog:**

- ⚠️ Warning amber untuk visual impact
- 🔴 Gradient red button untuk delete action
- 🔄 Loading spinner saat proses delete
- 🎯 Item name highlighted dalam pesan
- 🌙 Dark mode support

---

## 📚 Next Steps / Future Enhancements

### 1. Email Notification

Kirim email welcome dengan credentials saat user dibuat:

```typescript
// lib/actions/emailActions.ts
import { Resend } from "resend";

export async function sendWelcomeEmail({
  email,
  username,
  tempPassword,
  fullName,
}: {
  email: string;
  username: string;
  tempPassword: string;
  fullName: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "HR HRIS <hr@bharata.com>",
    to: email,
    subject: "Welcome to HRIS Bharata! 🎉",
    html: `
      <h1>Halo ${fullName}!</h1>
      <p>Akun HRIS Anda telah dibuat.</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${tempPassword}</p>
      <p>Silakan ganti password setelah login pertama.</p>
    `,
  });
}
```

### 2. Batch Import Employees

Upload CSV/Excel untuk import banyak karyawan sekaligus.

### 3. Employee Profile Page

Detail page untuk view/edit employee data lengkap.

### 4. Change Password Feature

Allow users to change their own password dari mobile app.

### 5. Audit Log

Track semua perubahan data (create/update/delete) untuk compliance.

---

## ✅ Checklist Completion

- [x] Database migration untuk `auth_user_id`
- [x] Server Action `createEmployeeWithUser` dengan rollback
- [x] Helper functions untuk dropdown data
- [x] AddEmployeeDialog component dengan form lengkap
- [x] Success screen dengan temp password display
- [x] Copy to clipboard functionality
- [x] Integrate ke halaman `/dashboard/employees`
- [x] DeleteConfirmDialog untuk semua master data tables
- [x] Dark mode support untuk semua component
- [x] TypeScript strict mode compliance
- [x] Responsive design (mobile + desktop)

---

**🎉 Fitur Employee Registration siap digunakan!**

Jika ada pertanyaan atau butuh bantuan, silakan hubungi development team.
