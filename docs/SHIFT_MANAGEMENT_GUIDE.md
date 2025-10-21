# Shift Management Feature - Implementation Guide

## 📋 Overview

Fitur Shift Management memungkinkan admin untuk mengelola jadwal shift kerja yang terikat dengan departemen. Setiap departemen dapat memiliki beberapa shift dengan konfigurasi waktu dan toleransi yang berbeda.

---

## 🗂️ Schema Database

### Table: `work_shifts`

```sql
CREATE TABLE work_shifts (
    id SERIAL PRIMARY KEY,
    department_id INT NOT NULL REFERENCES departments(id),
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(5,2) NOT NULL,
    is_regular BOOLEAN NOT NULL,
    tolerance_minutes INT NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT unique_shift_name_per_department UNIQUE (department_id, name)
);
```

###⚠️ **Penting: Perubahan dari Schema Lama**

**DIHAPUS dari `employees` table:**

```sql
-- ❌ shift_id INT NOT NULL REFERENCES work_shifts(id)
```

**DIHAPUS table:**

```sql
-- ❌ employee_shift_schedules
```

**Alasan**: Shift sekarang ditentukan **dinamis saat check-in** berdasarkan waktu, bukan di-assign ke karyawan.

---

## 🏗️ Architecture

### Files Created:

1. **Server Actions**  
   📄 `lib/actions/shiftActions.ts`

   - `getWorkShifts()` - Get all shifts with department info
   - `getShiftsByDepartment(departmentId)` - Get shifts by department
   - `upsertWorkShift(formData)` - Create/Update shift
   - `deleteWorkShift(shiftId)` - Soft delete shift
   - `getDepartments()` - Get departments for dropdown

2. **Page Component**  
   📄 `app/dashboard/shifts/page.tsx`

   - Display shifts grouped by department
   - Stats cards (Total, Regular, Non-Regular)
   - CRUD operations

3. **Dialog Component**  
   📄 `components/shifts/ShiftDialog.tsx`
   - Form for add/edit shift
   - Auto-calculate duration based on start_time & end_time
   - Department dropdown
   - Validation

---

## 🎯 Features

### 1. **Shift Management (CRUD)**

#### Create Shift:

- Select Department
- Input Shift Name (e.g., Shift Pagi, Siang, Malam)
- Set Start Time & End Time
- Duration auto-calculated
- Set Tolerance (minutes)
- Mark as Regular/Non-Regular

#### Update Shift:

- Edit existing shift details
- Cannot change if used in attendance records

#### Delete Shift:

- Soft delete (set `deleted_at`)
- Check if shift is used in attendance
- Prevent delete if in use

#### View Shifts:

- Grouped by Department
- Table with all shift details
- Stats summary

### 2. **Shift Grouping by Department**

Setiap departemen dapat memiliki multiple shifts:

```
Finance Department:
  - Shift Pagi (08:00 - 17:00)
  - Shift Siang (13:00 - 22:00)

Production Department:
  - Shift 1 (06:00 - 14:00)
  - Shift 2 (14:00 - 22:00)
  - Shift 3 (22:00 - 06:00)
```

### 3. **Unique Constraint**

Tidak boleh ada nama shift yang sama dalam satu departemen:

```sql
CONSTRAINT unique_shift_name_per_department UNIQUE (department_id, name)
```

✅ **Valid:**

- Finance: "Shift Pagi"
- Production: "Shift Pagi"

❌ **Invalid:**

- Finance: "Shift Pagi"
- Finance: "Shift Pagi" (duplicate)

---

## 🔄 Flow Diagram

### Shift Management Flow:

```
┌──────────────────────────────────────┐
│ Admin masuk halaman Shifts           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Load all shifts grouped by dept      │
│ getWorkShifts()                      │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Display Stats & Table                │
│ - Total Shifts                       │
│ - Regular/Non-Regular count          │
│ - Grouped by Department              │
└────────────┬─────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────┐
│  Add    │      │  Edit   │
│  Shift  │      │  Shift  │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              │
              ▼
     ┌────────────────┐
     │  ShiftDialog   │
     │  - Department  │
     │  - Name        │
     │  - Time Range  │
     │  - Tolerance   │
     │  - Is Regular  │
     └────┬───────────┘
          │
          ▼
     ┌────────────────┐
     │ upsertWorkShift│
     │ Validation     │
     │ - Check dupli  │
     │ - Save to DB   │
     └────┬───────────┘
          │
          ▼
     ┌────────────────┐
     │ Refresh List   │
     │ Toast Success  │
     └────────────────┘
```

### Delete Flow:

```
┌──────────────────────────────────────┐
│ Admin klik Delete Shift              │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Show DeleteConfirmDialog             │
│ "Yakin hapus shift [nama]?"          │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ deleteWorkShift(shiftId)             │
│ 1. Check usage in attendances        │
│ 2. If used → ERROR                   │
│ 3. If not → Soft delete              │
└────────────┬─────────────────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
    ┌───────┐ ┌───────┐
    │Success│ │ Error │
    │Delete │ │Cannot │
    └───────┘ └───────┘
```

---

## 💻 Usage Examples

### Example 1: Create Shift Pagi for Finance

```typescript
const formData = new FormData();
formData.append("department_id", "3"); // Finance
formData.append("name", "Shift Pagi");
formData.append("start_time", "08:00:00");
formData.append("end_time", "17:00:00");
formData.append("duration_hours", "9.00");
formData.append("is_regular", "true");
formData.append("tolerance_minutes", "15");

const result = await upsertWorkShift(formData);
// ✅ Success: Shift berhasil dibuat
```

### Example 2: Get Shifts for Production Department

```typescript
const result = await getShiftsByDepartment(5); // Production
// Returns:
// [
//   { id: 1, name: "Shift 1", start_time: "06:00", ... },
//   { id: 2, name: "Shift 2", start_time: "14:00", ... },
//   { id: 3, name: "Shift 3", start_time: "22:00", ... }
// ]
```

### Example 3: Auto-Calculate Duration

```typescript
// User input:
start_time: "08:00"
end_time: "17:00"

// Auto-calculated:
duration_hours = (17 - 8) + (0 - 0)/60 = 9.00

// Overnight shift:
start_time: "22:00"
end_time: "06:00"

// Auto-calculated:
duration_hours = (6 - 22 + 24) + (0 - 0)/60 = 8.00
```

---

## 🔧 Integration with Attendance

### How Shifts Work with Attendance (Check-in):

```typescript
// Saat karyawan check-in:
const checkInTime = "08:15:00"; // 08:15 pagi
const departmentId = employee.department_id;

// 1. Get all shifts dari department karyawan
const shifts = await getShiftsByDepartment(departmentId);

// 2. Tentukan shift mana yang cocok dengan waktu check-in
const matchedShift = shifts.find((shift) => {
  const startTime = parseTime(shift.start_time);
  const tolerance = shift.tolerance_minutes;
  const earliestStart = subtractMinutes(startTime, tolerance);
  const latestStart = addMinutes(startTime, tolerance * 2); // contoh: 2x tolerance

  return checkInTime >= earliestStart && checkInTime <= latestStart;
});

// 3. Assign shift_id ke attendance record
await createAttendance({
  employee_id: employee.id,
  shift_id: matchedShift.id, // ✅ Shift ditentukan saat check-in
  check_in: checkInTime,
  location_id: locationId,
  ...
});
```

**Key Point**: Shift **TIDAK di-assign ke employee**, melainkan **ditentukan saat check-in** berdasarkan waktu dan departemen.

---

## 📊 Stats & Reports

### Stats Available:

1. **Total Shifts**: Total semua shift aktif
2. **Shift Regular**: Shift untuk karyawan tetap (Senin-Jumat)
3. **Shift Non-Regular**: Shift untuk karyawan kontrak/shift

### Group by Department:

Shifts dikelompokkan berdasarkan departemen untuk memudahkan management:

```
Finance (3 shifts):
  - Shift Pagi (08:00-17:00)
  - Shift Siang (12:00-21:00)
  - Shift Malam (21:00-06:00)

Production (2 shifts):
  - Shift 1 (06:00-14:00)
  - Shift 2 (14:00-22:00)
```

---

## ✅ Testing Checklist

### Create Shift:

- [ ] Select department
- [ ] Input shift name
- [ ] Set start & end time
- [ ] Duration auto-calculated correctly
- [ ] Set tolerance minutes
- [ ] Toggle Regular/Non-Regular
- [ ] Submit → Success toast
- [ ] Data appears in table

### Edit Shift:

- [ ] Click Edit button
- [ ] Form pre-filled with existing data
- [ ] Modify fields
- [ ] Submit → Success toast
- [ ] Data updated in table

### Delete Shift:

- [ ] Click Delete button
- [ ] Confirmation dialog appears
- [ ] Confirm → Success toast (if not used)
- [ ] Error toast (if used in attendance)

### Validation:

- [ ] Cannot create shift without department
- [ ] Cannot create shift without name
- [ ] Cannot create shift without times
- [ ] Cannot create duplicate name in same department
- [ ] Duration must be > 0

### UI/UX:

- [ ] Stats cards show correct numbers
- [ ] Shifts grouped by department
- [ ] Table shows all shift details
- [ ] Responsive on mobile

---

## 🚨 Important Notes

1. **No More `employees.shift_id`**  
   Schema terbaru TIDAK memiliki kolom `shift_id` di tabel `employees`. Shift ditentukan dinamis saat check-in.

2. **Department-based Shifts**  
   Setiap shift harus terikat dengan department. Saat check-in, sistem akan mencari shift dari department karyawan.

3. **Unique Constraint**  
   Nama shift harus unik per department (tidak boleh duplikat dalam satu department).

4. **Soft Delete**  
   Shift yang dihapus hanya di-soft delete (set `deleted_at`). Data tetap ada di database untuk histori.

5. **Cannot Delete if Used**  
   Shift yang sudah digunakan dalam attendance record tidak bisa dihapus untuk menjaga integritas data.

---

## 📚 Related Documentation

- [HRIS Schema Documentation](./hris_schema_documentation.md) - Complete database schema
- [Attendance Feature](./ATTENDANCE_FEATURE.md) - How shifts integrate with attendance
- [Employee Feature](./EMPLOYEE_FEATURE_GUIDE.md) - Employee management (no shift assignment)

---

## 🎉 Summary

Fitur Shift Management sekarang:

- ✅ Terikat dengan Departemen
- ✅ CRUD lengkap dengan validation
- ✅ Auto-calculate duration
- ✅ Group by department display
- ✅ Soft delete dengan usage check
- ✅ Ready for dynamic shift assignment saat check-in

**Next Steps**:

1. Implement attendance check-in dengan dynamic shift assignment
2. Update employee form (remove shift_id field)
3. Create reports: shift utilization, attendance by shift, etc.
