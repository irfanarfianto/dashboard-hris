# Update: Tanggal Bergabung Dipindah ke Step 1

## 🔄 Perubahan

Tanggal Bergabung (Hire Date) telah dipindahkan dari **Step 2: Data Pribadi** ke **Step 1: Data Pekerjaan** karena lebih relevan dengan informasi pekerjaan.

---

## 📋 Detail Perubahan

### Step 1: Data Pekerjaan (UPDATED)

**Urutan Field:**

1. Perusahaan
2. Departemen
3. Posisi
4. Shift Kerja
5. Tipe Kontrak
6. Gaji Pokok
7. **Tanggal Bergabung** ⬅️ DIPINDAHKAN KE SINI
8. Tanggal Berakhir Kontrak (conditional)

### Step 2: Data Pribadi (UPDATED)

**Field yang dihapus:**

- ❌ Tanggal Bergabung (dipindah ke Step 1)

**Field yang tersisa:**

1. Nama Lengkap
2. No. Telepon
3. Email
4. Jenis Kelamin
5. Tanggal Lahir
6. Agama
7. Status Perkawinan (PTKP)
8. Alamat KTP
9. Alamat Domisili
10. NPWP (optional)

---

## 🔧 Files Modified

### 1. `Step1DataPekerjaan.tsx`

**Changes:**

- ✅ Added `onHireDateChange` prop
- ✅ Added Tanggal Bergabung field after Gaji Pokok
- ✅ Fixed TypeScript type (removed `any`, use `FormDataStep1`)

**New Props:**

```typescript
interface FormDataStep1 {
  company_id: string;
  department_id: string;
  position_id: string;
  shift_id: string;
  contract_type: "Probation" | "Contract" | "Permanent";
  contract_end_date: string;
  [key: string]: string;
}

interface Step1DataPekerjaanProps {
  // ... existing props
  onHireDateChange: (date: Date | undefined) => void; // NEW
}
```

### 2. `Step2DataPribadi.tsx`

**Changes:**

- ❌ Removed `hireDate` prop
- ❌ Removed `onHireDateChange` prop
- ❌ Removed Tanggal Bergabung field from UI

**Updated Props:**

```typescript
interface Step2DataPribadiProps {
  // ... existing props
  birthDate: Date | undefined;
  // hireDate: REMOVED
  onBirthDateChange: (date: Date | undefined) => void;
  // onHireDateChange: REMOVED
}
```

### 3. `AddEmployeeDialog.tsx`

**Changes:**

- ✅ Pass `onHireDateChange={setHireDate}` to Step1DataPekerjaan
- ❌ Remove `hireDate` prop from Step2DataPribadi
- ❌ Remove `onHireDateChange` prop from Step2DataPribadi

**Before:**

```typescript
<Step1DataPekerjaan
  // ... props
  onContractEndDateChange={setContractEndDate}
/>

<Step2DataPribadi
  // ... props
  hireDate={hireDate}
  onHireDateChange={setHireDate}
/>
```

**After:**

```typescript
<Step1DataPekerjaan
  // ... props
  onContractEndDateChange={setContractEndDate}
  onHireDateChange={setHireDate} // NEW
/>

<Step2DataPribadi
  // ... props (removed hireDate & onHireDateChange)
/>
```

---

## ✅ Validation Logic (Unchanged)

Step 1 validation tetap sama:

```typescript
case 1: // Data Pekerjaan
  return (
    formData.company_id &&
    formData.department_id &&
    formData.position_id &&
    formData.shift_id &&
    formData.contract_type &&
    salaryNumeric > 0
    // hire_date already validated via DatePicker
  );
```

Step 2 validation tetap sama (hire_date sudah divalidasi di Step 1).

---

## 🎯 Benefits

1. **Logical Grouping**: Hire date is job-related info, not personal info
2. **Better UX**: All employment data in one step
3. **Dependency**: Contract end date can use hire date as minDate (already in same step)

---

## 📊 UI Preview

### Step 1: Data Pekerjaan

```
┌─────────────────────────────────────┐
│ 💼 Data Pekerjaan & Kontrak         │
├─────────────────────────────────────┤
│ [Perusahaan] [Departemen]           │
│ [Posisi]     [Shift Kerja]          │
│ [Tipe Kontrak] [Gaji Pokok]         │
│ [Tanggal Bergabung] ⬅️ NEW HERE    │
│ [Tanggal Berakhir Kontrak] (cond)   │
└─────────────────────────────────────┘
```

### Step 2: Data Pribadi

```
┌─────────────────────────────────────┐
│ 👤 Data Pribadi Karyawan            │
├─────────────────────────────────────┤
│ [Nama Lengkap]                      │
│ [No. Telepon]  [Email]              │
│ [Jenis Kelamin] [Tanggal Lahir]     │
│ [Agama]        [Status PTKP]        │
│ [Alamat KTP]                        │
│ [Alamat Domisili]                   │
│ [NPWP (optional)]                   │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [x] Step 1 shows Tanggal Bergabung field
- [x] Tanggal Bergabung DatePicker works properly
- [x] Step 2 no longer shows Tanggal Bergabung
- [x] Contract end date min validation still works (uses hire date)
- [x] Form submission includes hire_date correctly
- [x] No TypeScript errors
- [x] Validation logic works correctly

---

**Status**: ✅ Complete  
**Date**: October 2024  
**Type**: UI/UX Improvement
