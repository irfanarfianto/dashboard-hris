# Implementasi Shift Schedule System - Hybrid (Shift Tetap & Rolling)

## ✅ Status Implementasi

### **COMPLETED:**

1. ✅ Migration SQL (`migrations/create_employee_shift_schedules.sql`)
2. ✅ Utility Functions (`lib/utils/shiftSchedule.ts`)
3. ✅ Server Actions (`lib/actions/shiftScheduleActions.ts`)
4. ✅ UI Component: WeeklyShiftPlanner (`components/schedules/WeeklyShiftPlanner.tsx`)

### **PENDING:**

- ⏳ ShiftScheduleDialog component (optional)
- ⏳ Shift Schedules page (`app/dashboard/shift-schedules/page.tsx`)
- ⏳ Update Sidebar menu

---

## 🎯 Cara Kerja System

### **Konsep Hybrid:**

```
┌─────────────────────────────────────────────────────────┐
│ OFFICE WORKERS (Shift Tetap)                           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ employees.shift_id = 1 (Regular 08:00-17:00)           │
│ Tidak perlu entry di employee_shift_schedules          │
│ Setiap hari pakai shift yang sama                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SHIFT WORKERS (Shift Rolling)                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ employees.shift_id = 1 (Default: Pagi)                 │
│                                                         │
│ employee_shift_schedules:                              │
│   { date: '2025-10-20', shift_id: 2 } → Siang         │
│   { date: '2025-10-21', shift_id: 3 } → Malam         │
│   { date: '2025-10-22', shift_id: 1 } → Pagi          │
│   [2025-10-23 tidak ada schedule] → Pakai default (1) │
└─────────────────────────────────────────────────────────┘
```

### **Priority Logic:**

```typescript
function getShiftOnDate(employeeId, date) {
  // 1. Cek employee_shift_schedules (PRIORITY 1)
  const scheduled = query(
    "SELECT shift_id FROM employee_shift_schedules WHERE ..."
  );
  if (scheduled) return scheduled.shift_id; // ✅ Dari schedule

  // 2. Fallback ke employees.shift_id (PRIORITY 2)
  const employee = query("SELECT shift_id FROM employees WHERE ...");
  return employee.shift_id; // ❌ Default shift
}
```

---

## 📋 Files Created

### 1. **Migration SQL**

📄 `migrations/create_employee_shift_schedules.sql`

- ✅ Table `employee_shift_schedules` dengan columns:
  - `employee_id`, `shift_id`, `date`, `notes`
  - Soft delete (`deleted_at`)
  - Unique constraint: `(employee_id, date)`
- ✅ Indexes untuk performance:
  - `idx_employee_shift_schedule_emp_date`
  - `idx_shift_schedule_date_range`
  - `idx_shift_schedule_shift_id`
- ✅ SQL Functions:
  - `get_employee_shift_on_date(emp_id, date)` → Returns shift_id
  - `get_employee_shift_details_on_date(emp_id, date)` → Returns full shift details

**Cara Jalankan:**

```bash
# Via Supabase Dashboard → SQL Editor
# Copy-paste file content dan Run
```

### 2. **Utility Functions**

📄 `lib/utils/shiftSchedule.ts`

**Functions:**

- `getEmployeeShiftOnDate(employeeId, date)` → Get shift for specific date
- `getEmployeeShiftSchedule(employeeId, startDate, endDate)` → Get range schedule
- `getScheduledShifts(employeeId, startDate?, endDate?)` → Only scheduled (not default)
- `hasScheduledShift(employeeId, date)` → Check if has custom schedule
- `generateDateRange(start, end)` → Generate array of dates
- `getMonday(date)` → Get Monday of week
- `getWeekRange(date)` → Get week start/end
- `formatTime(time)` → Format HH:MM:SS to HH:MM
- `getShiftBadgeColor(shiftName)` → Tailwind classes for badge
- `getDayName(date)` → Indonesian day name
- `formatDateIndonesian(date)` → Indonesian date format

**Usage:**

```typescript
import { getEmployeeShiftOnDate } from "@/lib/utils/shiftSchedule";

const shift = await getEmployeeShiftOnDate(123, "2025-10-20");
// Returns: { shift_id, shift_name, start_time, end_time, is_scheduled }
```

### 3. **Server Actions**

📄 `lib/actions/shiftScheduleActions.ts`

**CREATE:**

- `createShiftSchedule(input)` → Single schedule
- `createBulkShiftSchedules(inputs[])` → Multiple schedules
- `createWeeklySchedule(input)` → Week schedule (Mon-Sun)

**READ:**

- `getShiftSchedules(params?)` → List with filters
- `getShiftScheduleById(id)` → Single schedule

**UPDATE:**

- `updateShiftSchedule(id, input)` → Update schedule

**DELETE:**

- `deleteShiftSchedule(id)` → Soft delete single
- `deleteBulkShiftSchedules(ids[])` → Delete multiple
- `deleteEmployeeSchedulesInRange(employeeId, start, end)` → Clear range

**UTILITY:**

- `copyWeeklySchedule(employeeId, sourceWeek, targetWeek)` → Copy schedule

**Usage:**

```typescript
import { createWeeklySchedule } from "@/lib/actions/shiftScheduleActions";

await createWeeklySchedule({
  employee_id: 123,
  week_start: "2025-10-21", // Monday
  shifts: {
    monday: 1, // Shift Pagi
    tuesday: 2, // Shift Siang
    wednesday: 3, // Shift Malam
    // thursday-sunday: undefined (pakai default)
  },
});
```

### 4. **UI Component**

📄 `components/schedules/WeeklyShiftPlanner.tsx`

**Features:**

- ✅ Week navigation (prev/next/current)
- ✅ 7-day shift selection (Mon-Sun)
- ✅ Visual shift badges dengan color
- ✅ Notes field
- ✅ Actions:
  - Save weekly schedule
  - Copy from previous week
  - Clear current week
- ✅ Info: Shows date for each day
- ✅ Auto-fallback to default shift

**Usage:**

```tsx
import WeeklyShiftPlanner from "@/components/schedules/WeeklyShiftPlanner";

<WeeklyShiftPlanner
  employeeId={123}
  employeeName="Budi (Security)"
  workShifts={shifts}
  onSuccess={() => {
    // Refresh data
  }}
/>;
```

---

## 🚀 Cara Pakai

### **Step 1: Jalankan Migration**

```sql
-- Buka Supabase Dashboard → SQL Editor
-- Copy-paste isi migrations/create_employee_shift_schedules.sql
-- Klik "Run"
```

### **Step 2: Input Jadwal Shift (Weekly)**

```tsx
// Di halaman employee detail atau shift management page
<WeeklyShiftPlanner
  employeeId={employee.id}
  employeeName={employee.full_name}
  workShifts={shifts}
/>
```

### **Step 3: Get Shift saat Check-in/Attendance**

```typescript
// Server Action untuk attendance
import { getEmployeeShiftOnDate } from "@/lib/utils/shiftSchedule";

export async function checkIn(employeeId: number) {
  const today = new Date().toISOString().split("T")[0];

  // Auto-detect shift
  const shift = await getEmployeeShiftOnDate(employeeId, today);

  if (!shift) {
    return { error: "Tidak ada jadwal shift hari ini" };
  }

  // Create attendance dengan shift yang benar
  await supabase.from("attendances").insert({
    employee_id: employeeId,
    shift_id: shift.shift_id,
    check_in: new Date().toISOString(),
    status: "Hadir",
  });
}
```

---

## 📊 Use Cases

### **Case A: Office Worker (No Schedule)**

```sql
-- Employee: Andi (Admin)
employees: { id: 1, shift_id: 1 (Regular) }

-- Tidak ada entry di employee_shift_schedules
-- Setiap hari pakai shift_id = 1

-- Query:
SELECT get_employee_shift_on_date(1, '2025-10-20'); -- Returns: 1
SELECT get_employee_shift_on_date(1, '2025-10-21'); -- Returns: 1
```

### **Case B: Shift Worker (With Schedule)**

```sql
-- Employee: Budi (Security)
employees: { id: 2, shift_id: 1 (Pagi - default) }

-- Schedule:
employee_shift_schedules:
  { employee_id: 2, shift_id: 2, date: '2025-10-20' } -- Siang
  { employee_id: 2, shift_id: 3, date: '2025-10-21' } -- Malam

-- Query:
SELECT get_employee_shift_on_date(2, '2025-10-20'); -- Returns: 2 (Siang - scheduled)
SELECT get_employee_shift_on_date(2, '2025-10-21'); -- Returns: 3 (Malam - scheduled)
SELECT get_employee_shift_on_date(2, '2025-10-22'); -- Returns: 1 (Pagi - default)
```

---

## ⏭️ Next Steps

### **Optional: Create Shift Schedules Page**

```typescript
// app/dashboard/shift-schedules/page.tsx
- List all employees with rolling shifts
- Filter by department/shift
- Bulk edit schedules
- Calendar view (monthly)
```

### **Update Sidebar**

```tsx
// components/layout/Sidebar.tsx
{
  title: "Jadwal Shift",
  href: "/dashboard/shift-schedules",
  icon: Calendar,
}
```

### **Integration dengan Attendance**

- Auto-populate shift_id saat check-in
- Validate check-in time sesuai shift
- Alert jika check-in di luar jam shift

---

## ✅ Benefits

| Feature          | Before                          | After                                 |
| ---------------- | ------------------------------- | ------------------------------------- |
| Office Workers   | ✅ Shift tetap di employees     | ✅ Tetap sama (backward compatible)   |
| Shift Workers    | ❌ Tidak support rolling        | ✅ Full support dengan schedule table |
| Flexibility      | ❌ 1 employee = 1 shift forever | ✅ Shift bisa berubah per hari        |
| History Tracking | ❌ Tidak ada history            | ✅ Full history di schedule table     |
| Performance      | ✅ Fast (1 join)                | ✅ Fast (indexed queries)             |

---

## 🎉 Implementasi Sukses!

System sekarang mendukung:

- ✅ **Shift Tetap** (Office) → Pakai `employees.shift_id`
- ✅ **Shift Rolling** (Pabrik/Security) → Pakai `employee_shift_schedules`
- ✅ **Priority Logic** → Schedule > Default
- ✅ **Backward Compatible** → Existing data tidak berubah
- ✅ **Full CRUD** → Server Actions lengkap
- ✅ **UI Ready** → WeeklyShiftPlanner component

**Selesai!** 🚀
