# Employee Education Input Feature

## Overview

Fitur ini memungkinkan HR untuk menginput data pendidikan karyawan saat membuat karyawan baru melalui dialog `AddEmployeeDialog`.

## Implementation Summary

### 1. Backend Changes (`lib/actions/employeeActions.ts`)

#### Modified Function: `createEmployeeWithUser`

Ditambahkan parameter baru untuk menerima data pendidikan:

```typescript
export async function createEmployeeWithUser(data: {
  // ... existing parameters ...

  // Education data
  education_data?: Array<{
    degree: string;
    institution: string;
    major: string;
    graduation_year: string;
  }>;
});
```

#### Logic Added:

Setelah employee berhasil dibuat, sistem akan membuat records pendidikan:

```typescript
// 4. Create education records if provided
if (data.education_data && data.education_data.length > 0) {
  for (const education of data.education_data) {
    const { error: educationError } = await supabase
      .from("employee_educations")
      .insert({
        employee_id: employee.id,
        degree: education.degree,
        institution: education.institution,
        major: education.major,
        graduation_year: parseInt(education.graduation_year),
      });

    if (educationError) {
      console.error("Error creating education record:", educationError);
      // Don't fail the whole operation, just log the error
    }
  }
}
```

**Note:** Jika terjadi error saat membuat education record, operasi pembuatan employee tetap dianggap sukses (graceful degradation).

---

### 2. Frontend Changes (`components/employees/AddEmployeeDialog.tsx`)

#### A. State Management

Ditambahkan state untuk mengelola data pendidikan:

```typescript
// Education data interface
interface EducationData {
  degree: string;
  institution: string;
  major: string;
  graduation_year: string;
}

// States
const [educationList, setEducationList] = useState<EducationData[]>([]);
const [showEducationForm, setShowEducationForm] = useState(false);
const [currentEducation, setCurrentEducation] = useState<EducationData>({
  degree: "",
  institution: "",
  major: "",
  graduation_year: "",
});
```

#### B. UI Section

Ditambahkan section baru "Data Pendidikan" yang berisi:

1. **Education List Display**

   - Menampilkan daftar pendidikan yang sudah ditambahkan
   - Setiap item memiliki tombol "Hapus" untuk menghapus dari list
   - Format: `[Jenjang] - [Jurusan]` dan `[Institusi] ([Tahun Lulus])`

2. **Education Form (Collapsible)**

   - **Jenjang Pendidikan**: Input text (contoh: SD, SMP, SMA, D3, S1, S2)
   - **Nama Institusi**: Input text (nama sekolah/universitas)
   - **Jurusan/Program Studi**: Input text (contoh: IPA, Teknik Informatika)
   - **Tahun Lulus**: Input number (range: 1950 - tahun sekarang)
   - **Tombol Simpan**: Menambahkan ke educationList (dengan validasi all fields required)
   - **Tombol Batal**: Menutup form dan clear input

3. **Add Button**
   - Muncul ketika form tidak ditampilkan
   - Icon: GraduationCap (dari lucide-react)
   - Style: Dashed border, outline variant
   - Action: Menampilkan form pendidikan

#### C. Form Submission

Modified `handleSubmit` untuk mengirim data pendidikan:

```typescript
const result = await createEmployeeWithUser({
  // ... existing data ...

  // Education data
  education_data: educationList.length > 0 ? educationList : undefined,
});
```

#### D. Form Reset

Modified `resetForm` untuk clear education states:

```typescript
const resetForm = () => {
  // ... existing reset logic ...

  // Reset education states
  setEducationList([]);
  setShowEducationForm(false);
  setCurrentEducation({
    degree: "",
    institution: "",
    major: "",
    graduation_year: "",
  });
};
```

---

## User Flow

### Adding Education Data

1. HR membuka "Tambah Karyawan Baru" dialog
2. HR mengisi data karyawan (perusahaan, departemen, dll)
3. Pada section "Data Pendidikan", HR klik tombol **"Tambah Data Pendidikan"**
4. Form pendidikan muncul dengan 4 field
5. HR mengisi semua field:
   - Jenjang: S1
   - Institusi: Universitas Indonesia
   - Jurusan: Teknik Informatika
   - Tahun Lulus: 2020
6. HR klik **"Simpan Pendidikan"**
7. Data pendidikan ditambahkan ke list dan ditampilkan di atas form
8. HR bisa mengulangi langkah 3-7 untuk menambah pendidikan lain (multiple records)
9. HR bisa klik **"Hapus"** pada item pendidikan untuk menghapusnya dari list
10. Saat submit form, semua pendidikan di list akan disimpan ke database

### Validation

- **Frontend Validation**: Semua 4 field harus diisi sebelum bisa disimpan ke list
- **Backend Validation**: Education data bersifat optional (boleh tidak diisi)
- **Data Type**: `graduation_year` akan dikonversi dari string ke integer di backend

---

## Database Schema

Table: `employee_educations`

| Column          | Type      | Description              |
| --------------- | --------- | ------------------------ |
| id              | integer   | Primary key (auto)       |
| employee_id     | integer   | Foreign key ke employees |
| degree          | text      | Jenjang pendidikan       |
| institution     | text      | Nama institusi           |
| major           | text      | Jurusan/Program studi    |
| graduation_year | integer   | Tahun lulus              |
| created_at      | timestamp | Auto timestamp           |

**Relationship**: One employee can have many education records (one-to-many)

---

## Features

✅ Multiple education records per employee
✅ Optional (tidak wajib diisi)
✅ Inline form dengan preview list
✅ Validation all fields required per record
✅ Delete education from list before submit
✅ Graceful error handling (education creation failure doesn't fail employee creation)
✅ Auto-clear form setelah submit atau cancel

---

## Testing Checklist

- [ ] Buat karyawan baru tanpa data pendidikan → Success
- [ ] Buat karyawan dengan 1 data pendidikan → Success, 1 record created
- [ ] Buat karyawan dengan multiple pendidikan → Success, all records created
- [ ] Hapus pendidikan dari list sebelum submit → Success, removed from list
- [ ] Submit form tanpa mengisi semua field pendidikan → Alert "Mohon lengkapi semua field"
- [ ] Form reset setelah sukses → All education states cleared
- [ ] Cancel education form → Form closed, input cleared

---

## Future Enhancements

1. **Dropdown untuk Jenjang**: Bisa diganti dari free text ke dropdown dengan options tetap
2. **Year Picker**: Bisa diganti dari input number ke year picker component
3. **File Upload**: Tambah field untuk upload sertifikat/ijazah
4. **Sorting**: Auto-sort education by graduation_year (descending)
5. **Edit Mode**: Tambah kemampuan edit education yang sudah di-add ke list (sebelum submit)

---

## Related Files

- `lib/actions/employeeActions.ts` - Backend logic
- `components/employees/AddEmployeeDialog.tsx` - Frontend form
- `components/employees/EmployeeEducationDialog.tsx` - Edit mode dialog (existing)
- Database migration: `migrations/create_employee_educations.sql` (if exists)

---

**Created**: 2024
**Author**: AI Assistant
**Status**: ✅ Complete & Ready for Testing
