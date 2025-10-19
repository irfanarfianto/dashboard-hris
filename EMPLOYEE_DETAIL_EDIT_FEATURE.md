# Employee Detail & Edit Feature Implementation

## Overview

Implementasi halaman detail karyawan dan fitur edit data karyawan dengan multi-step form.

## Features

### 1. Employee Detail Page

**Route:** `/dashboard/employees/[id]`

Menampilkan informasi lengkap karyawan dalam 4 section:

#### 📋 Data Pekerjaan

- Perusahaan, Departemen, Jabatan, Level
- Shift Kerja dengan jam
- Status Kontrak (Probation/Contract/Permanent)
- Gaji Pokok (formatted Rupiah)
- Tanggal Bergabung & Akhir Kontrak

#### 👤 Data Pribadi

- Email, No. Telepon
- Jenis Kelamin, Tanggal Lahir
- Agama, Status Pernikahan, PTKP
- NPWP
- Alamat KTP & Domisili

#### 🎓 Data Pendidikan

- List semua riwayat pendidikan
- Jenjang, Institusi, Jurusan, Tahun Lulus

#### 🔐 Akun User

- Username & Role
- Status Aktif/Nonaktif
- Quick Info (ID, Created, Updated)

### 2. Edit Employee Dialog

**Component:** `EditEmployeeDialog.tsx`

Multi-step form untuk edit data karyawan:

- **Step 1**: Data Pekerjaan (editable)
- **Step 2**: Data Pribadi (editable)
- **Step 3**: Data Pendidikan (read-only, use education dialog)
- **Step 4**: Akun User (read-only dengan informasi)
- **Step 5**: Verifikasi Data

## Files Created

### 1. **app/dashboard/employees/[id]/page.tsx**

Server component untuk fetch employee detail dari database.

```tsx
async function getEmployeeDetail(id: number) {
  const { data: employee } = await supabase
    .from("employees")
    .select(
      `
      *,
      companies:company_id (id, name),
      departments:department_id (id, name),
      positions:position_id (id, name, level_id, position_levels:level_id (id, name)),
      work_shifts:shift_id (id, name, start_time, end_time),
      employee_personnel_details (*),
      employee_education (*),
      users (id, username, is_active, roles:role_id (id, name))
    `
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  return employee;
}
```

**Features:**

- Dynamic route dengan parameter `[id]`
- Deep join untuk semua relasi
- Auto return 404 jika employee tidak ditemukan
- Exclude soft deleted employees

### 2. **components/employees/EmployeeDetailView.tsx**

Client component untuk render detail employee dengan layout yang menarik.

**Features:**

- ✅ Responsive layout (3 columns on desktop)
- ✅ Icon-based sections dengan warna berbeda
- ✅ Badge untuk status (Contract Type, User Status)
- ✅ Format tanggal Indonesia
- ✅ Format Rupiah untuk gaji
- ✅ Tombol Edit yang membuka dialog
- ✅ Tombol "Kembali" ke list employees
- ✅ Dark mode support

### 3. **components/employees/EditEmployeeDialog.tsx**

Client component untuk edit employee dengan stepper.

**Features:**

- ✅ Multi-step form (5 steps)
- ✅ Pre-filled dengan data employee
- ✅ Reuse existing step components
- ✅ Toast notifications
- ✅ Validation per step
- ✅ Auto-refresh after save
- ✅ Loading states

**Special Handling:**

- Step 4 (Akun User): Read-only dengan informasi
  - Tidak bisa edit username/role dari sini
  - Harus gunakan menu user management
- Step 3 (Pendidikan): Tetap editable
  - Bisa tambah/hapus pendidikan
  - Data existing ditampilkan

### 4. **lib/actions/employeeActions.ts - updateEmployee()**

Server action untuk update employee data.

```typescript
export async function updateEmployee(
  employeeId: number,
  data: {
    company_id, department_id, position_id, shift_id,
    full_name, phone_number, email, gender,
    birth_date, hire_date,
    contract_type, salary_base, contract_end_date,
    personnel_details: { ... }
  }
)
```

**Logic:**

1. Update employee table
2. Update/Insert personnel_details table
3. Revalidate paths untuk refresh data
4. Return success/error dengan message

## User Flow

### Viewing Employee Detail

```
Employee List Page
  ↓ Click "Detail" button
Employee Detail Page
  ↓ Display all info in 4 sections
  ↓ Option: Edit or Back
```

### Editing Employee

```
Employee Detail Page
  ↓ Click "Edit Data" button
Edit Dialog Opens
  ↓ Step 1: Edit Data Pekerjaan
  ↓ Step 2: Edit Data Pribadi
  ↓ Step 3: View/Edit Pendidikan
  ↓ Step 4: View Akun User (read-only)
  ↓ Step 5: Verify Changes
  ↓ Click "Simpan Perubahan"
Loading Toast → Success Toast
  ↓ Page refreshes
  ↓ Dialog closes
Updated Data Displayed
```

## UI/UX Highlights

### Detail Page Design

- **Header**: Name + Position/Department
- **Action Buttons**: Back & Edit dengan icons
- **Card Layout**: Shadows + borders
- **Icon System**: Different color per section
  - 🟢 Teal: Data Pekerjaan
  - 🔵 Blue: Data Pribadi
  - 🟣 Purple: Data Pendidikan
  - 🟠 Amber: Akun User
- **Badges**: Visual status indicators
- **Sidebar**: Quick info card dengan gradient

### Edit Dialog Design

- **Stepper**: Visual progress indicator
- **Validation**: Per-step dengan disabled state
- **Toast**: Loading → Success/Error
- **Responsive**: Works on mobile
- **Keyboard**: Enter prevented except last step

## API Endpoints (Server Actions)

### Get Employee Detail

```typescript
// In page.tsx (Server Component)
const employee = await getEmployeeDetail(employeeId);
```

### Update Employee

```typescript
// In EditEmployeeDialog.tsx (Client Component)
const result = await updateEmployee(employeeId, {
  // employee data
  // personnel details
});
```

## Database Tables Involved

1. **employees** - Main employee data
2. **employee_personnel_details** - Personal details (1:1)
3. **employee_education** - Education history (1:many)
4. **companies** - Company reference
5. **departments** - Department reference
6. **positions** - Position reference
7. **position_levels** - Level reference
8. **work_shifts** - Shift reference
9. **users** - User account (1:1 optional)
10. **roles** - Role reference

## Validation Rules

### Step 1 (Data Pekerjaan):

- ✅ Company, Department, Position, Shift required
- ✅ Contract type required
- ✅ Salary > 0

### Step 2 (Data Pribadi):

- ✅ Full name, phone, email required
- ✅ Birth date, hire date required
- ✅ Religion required
- ✅ KTP address, domicile address required

### Step 3 (Data Pendidikan):

- ✅ Optional - can be skipped

### Step 4 (Akun User):

- ✅ Read-only display

### Step 5 (Verifikasi):

- ✅ Always can proceed to save

## Testing Checklist

- [ ] Navigate to employee detail page
- [ ] All employee data displays correctly
- [ ] Icons and badges show properly
- [ ] "Kembali" button works
- [ ] Click "Edit Data" opens dialog
- [ ] Form pre-filled with employee data
- [ ] Step navigation works
- [ ] Edit data in Step 1 & 2
- [ ] View education in Step 3
- [ ] See user info in Step 4 (if exists)
- [ ] Review all changes in Step 5
- [ ] Save shows loading toast
- [ ] Success toast appears
- [ ] Page refreshes with updated data
- [ ] Dialog closes automatically
- [ ] Dark mode works properly
- [ ] Responsive on mobile

## Next Steps (Optional Enhancements)

1. **Activity Log**: Show edit history
2. **Photo Upload**: Employee profile picture
3. **Document Upload**: KTP, ijazah, etc.
4. **Print/Export**: PDF employee profile
5. **Quick Actions**: Dari detail page (email, call)
6. **Bulk Edit**: Edit multiple employees
7. **Change Log**: Track who edited what & when

## Related Documentation

- [Employee Add Feature](./EMPLOYEE_FEATURE_GUIDE.md)
- [Toast Implementation](./TOAST_IMPLEMENTATION.md)
- [Stepper Component](./EMPLOYEE_STEPPER_IMPLEMENTATION.md)
