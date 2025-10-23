# Employee Detail & Edit Feature Implementation

## Overview

Implementasi halaman detail karyawan dengan **edit per section**. Setiap bagian (Data Pekerjaan, Data Pribadi, Data Pendidikan) memiliki tombol edit sendiri yang membuka dialog edit spesifik.

## Architecture Change

### Previous (Single Dialog)

```
Employee Detail → Edit Button → One Large Dialog → Edit All Data
```

### Current (Sectional Edit)

```
Employee Detail
  ├─ Data Pekerjaan → Edit Button → EditJobDataDialog
  ├─ Data Pribadi → Edit Button → EditPersonalDataDialog
  ├─ Data Pendidikan → Edit Button → EditEducationDataDialog
  └─ Akun User → No Edit (as requested)
```

## Features

### 1. Employee Detail Page

**Route:** `/dashboard/employees/[id]`

Menampilkan informasi lengkap karyawan dalam 4 section:

#### 📋 Data Pekerjaan (Editable)

- Perusahaan, Departemen, Jabatan, Level
- Status Kontrak (Probation/Contract/Permanent)
- Gaji Pokok (formatted Rupiah)
- Tanggal Bergabung & Akhir Kontrak
- **✏️ Edit Button**: Opens EditJobDataDialog

#### 👤 Data Pribadi (Editable)

- Email, No. Telepon
- Jenis Kelamin, Tanggal Lahir
- Agama, Status Pernikahan, PTKP
- NPWP
- Alamat KTP & Domisili
- **✏️ Edit Button**: Opens EditPersonalDataDialog

#### 🎓 Data Pendidikan (Editable)

- List semua riwayat pendidikan
- Jenjang, Institusi, Jurusan, Tahun Lulus
- **✏️ Edit Button**: Opens EditEducationDataDialog

#### 🔐 Akun User (Read-Only)

- Username & Role
- Status Aktif/Nonaktif
- Quick Info (ID, Created, Updated)
- **❌ No Edit Button** (as per requirement)

---

## Components

### 1. EditJobDataDialog.tsx

**Purpose:** Edit data pekerjaan karyawan

**Fields:**

- Status Kontrak (Dropdown: Probation/Contract/Permanent) \*
- Gaji Pokok (Number input)
- Tanggal Bergabung (Date picker) \*
- Akhir Kontrak (Date picker, conditional)

**Features:**

- ✅ Conditional field: contract_end_date only shows when contract_type = "Contract"
- ✅ Number input with proper formatting
- ✅ Validation for required fields
- ✅ Loading state during save

**Server Action:**

```typescript
updateEmployee(employeeId, {
  contract_type,
  salary_base,
  hire_date,
  contract_end_date,
});
```

---

### 2. EditPersonalDataDialog.tsx

**Purpose:** Edit data pribadi karyawan

**Fields:**

- Email (Email input) \*
- No. Telepon (Tel input) \*
- Jenis Kelamin (Dropdown: L/P) \*
- Tanggal Lahir (Date picker) \*
- Agama (Dropdown) \*
- Status Pernikahan (Dropdown) \*
- Status PTKP (Dropdown) \*
- NPWP (Text input, optional)
- Alamat KTP (Textarea) \*
- Alamat Domisili (Textarea) \*

**Features:**

- ✅ Grid layout (2 columns)
- ✅ Textarea for addresses
- ✅ Multiple dropdowns with options
- ✅ Two server actions (basic + personnel details)

**Server Actions:**

```typescript
// 1. Update basic employee data
await updateEmployee(employeeId, {
  email,
  phone_number,
  gender,
  birth_date,
});

// 2. Update personnel details
await updateEmployeePersonnelDetails(employeeId, {
  religion,
  marital_status,
  ptkp_status,
  ktp_address,
  domicile_address,
  npwp_number,
});
```

---

### 3. EditEducationDataDialog.tsx

**Purpose:** Edit data pendidikan karyawan (multiple records)

**Fields per Education:**

- Jenjang Pendidikan (Dropdown: SD/SMP/SMA/SMK/D3/D4/S1/S2/S3) \*
- Nama Institusi (Text input) \*
- Jurusan (Text input) \*
- Tahun Lulus (Dropdown: current year - 50 years) \*

**Features:**

- ✅ Multiple education entries support
- ✅ Add new education (Plus button)
- ✅ Remove education (Trash button, minimum 1 entry)
- ✅ Grid layout per entry
- ✅ Dynamic year dropdown

**Server Action:**

```typescript
updateEmployeeEducations(employeeId, [
  {
    degree: "S1",
    institution: "Universitas Indonesia",
    major: "Teknik Informatika",
    graduation_year: "2020",
  },
  // ... more educations
]);
```

**Logic:**

1. Soft delete all existing educations
2. Insert new educations array
3. Ensures clean state

---

## Server Actions

### Modified: updateEmployee

**Location:** `lib/actions/employeeActions.ts`

**Changes:**

- Now accepts `Partial<>` type
- Only updates provided fields
- Supports sectional updates

```typescript
export async function updateEmployee(
  employeeId: number,
  data: Partial<{
    company_id: number;
    department_id: number;
    position_id: number;
    full_name: string;
    phone_number: string;
    email: string;
    gender: "L" | "P";
    birth_date: string;
    hire_date: string;
    contract_type: "Probation" | "Contract" | "Permanent";
    salary_base: number;
    contract_end_date: string;
    personnel_details: { ... };
  }>
)
```

---

### New: updateEmployeePersonnelDetails

**Location:** `lib/actions/employeeActions.ts`

```typescript
export async function updateEmployeePersonnelDetails(
  employeeId: number,
  data: {
    religion: string;
    marital_status: string;
    ptkp_status: string;
    ktp_address: string;
    domicile_address: string;
    npwp_number?: string;
  }
);
```

**Logic:**

1. Check if personnel_details exist
2. If exists → UPDATE
3. If not → INSERT new record

---

### New: updateEmployeeEducations

**Location:** `lib/actions/employeeActions.ts`

```typescript
export async function updateEmployeeEducations(
  employeeId: number,
  educations: Array<{
    id?: number;
    degree: string;
    institution: string;
    major: string;
    graduation_year: string;
  }>
);
```

**Logic:**

1. Soft delete all existing educations (set deleted_at)
2. Insert new educations array
3. Clean replacement strategy

---

## User Flows

### Flow 1: Edit Data Pekerjaan

```
1. User views employee detail
2. Click "Edit" in Data Pekerjaan section
3. EditJobDataDialog opens with current data
4. Modify fields (contract_type, salary_base, hire_date, etc.)
5. If contract_type = Contract, contract_end_date field appears
6. Click "Simpan Perubahan"
7. Loading state shown
8. Success → Toast notification → Dialog closes → Page refreshes
9. Error → Toast error → Dialog stays open
```

### Flow 2: Edit Data Pribadi

```
1. User views employee detail
2. Click "Edit" in Data Pribadi section
3. EditPersonalDataDialog opens with current data
4. Modify fields (email, phone, addresses, etc.)
5. Click "Simpan Perubahan"
6. Two API calls sequentially:
   a. updateEmployee (basic data)
   b. updateEmployeePersonnelDetails (personnel data)
7. Both success → Toast → Dialog closes → Refresh
8. Any error → Toast error → Dialog stays open
```

### Flow 3: Edit Data Pendidikan

```
1. User views employee detail
2. Click "Edit" in Data Pendidikan section
3. EditEducationDataDialog opens with existing educations
4. Options:
   - Modify existing education fields
   - Click "Tambah Pendidikan" to add new entry
   - Click trash icon to remove entry (if > 1)
5. Click "Simpan Perubahan"
6. Validation: all fields in all entries must be filled
7. Success → Replace all educations → Toast → Refresh
8. Error → Toast error → Dialog stays open
```

---

## Benefits

### ✅ Better User Experience

- **Focused editing**: User only edits what they need
- **Less overwhelming**: Smaller, targeted forms
- **Faster**: No need to scroll through large forms
- **Clearer**: Each dialog has specific purpose

### ✅ Better Performance

- **Partial updates**: Only update changed section
- **Smaller payloads**: Less data transferred
- **Faster API calls**: Targeted updates
- **Less validation**: Only validate relevant fields

### ✅ Better Code Organization

- **Separation of concerns**: Each dialog handles one section
- **Reusable components**: Can be used elsewhere
- **Easier maintenance**: Debug and modify per section
- **Type safety**: Better TypeScript types per dialog

### ✅ Better Data Integrity

- **Independent sections**: Error in one doesn't affect others
- **Atomic updates**: Each section updates atomically
- **Easier rollback**: Can rollback per section
- **Audit trail**: Track changes per section

---

## Validation Rules

### Data Pekerjaan

```
Required:
- contract_type ✓
- hire_date ✓

Conditional:
- contract_end_date (required if contract_type = "Contract")

Optional:
- salary_base
```

### Data Pribadi

```
Required:
- email ✓ (valid email format)
- phone_number ✓
- gender ✓
- birth_date ✓
- religion ✓
- marital_status ✓
- ptkp_status ✓
- ktp_address ✓
- domicile_address ✓

Optional:
- npwp_number
```

### Data Pendidikan

```
Required per entry:
- degree ✓
- institution ✓
- major ✓
- graduation_year ✓

Constraints:
- Minimum 1 education entry
- All fields must be filled for all entries
```

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
