# Refactoring: Remove Employee Status Column

## 📋 Ringkasan Perubahan

Telah dilakukan refactoring besar-besaran untuk **menghapus redundansi** antara `employees.status` dan `employee_contracts.contract_type`.

### ❌ Masalah Sebelumnya:

```
employees.status = 'PROBATION'
employee_contracts.contract_type = 'Permanent'
❓ Konflik! Mana yang benar?
```

### ✅ Solusi:

- **Single Source of Truth**: Status karyawan sekarang **di-derive dari kontrak aktif**
- **Tidak ada duplikasi data**
- **Konsisten dengan business logic**

---

## 🔄 Status Flow yang Baru

```
New Employee
    ↓
[Create Contract: Probation]
    → Status: PROBATION (masa percobaan)
    ↓ (after 3 months, convert)
[Update Contract: Permanent]
    → Status: ACTIVE (karyawan tetap)
    ↓ (or)
[Update Contract: Contract]
    → Status: ACTIVE (karyawan kontrak)
    ↓ (contract expired)
[No Active Contract]
    → Status: INACTIVE (tidak ada kontrak)
    ↓ (or resigned/fired)
[Set Termination Date]
    → Status: TERMINATED (berhenti bekerja)
```

---

## 📝 Perubahan File

### 1. **Database Migration**

📄 `migrations/remove_employee_status_column.sql`

```sql
-- Drop status column
ALTER TABLE employees DROP COLUMN IF EXISTS status;

-- Add termination_date (untuk track resign/fired)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS termination_date DATE;

-- Create helper function
CREATE FUNCTION get_employee_status(emp_id INT) RETURNS VARCHAR(20);
```

**Cara Jalankan:**

```bash
# Connect ke Supabase SQL Editor dan jalankan migration
psql -h <host> -U postgres -d postgres -f migrations/remove_employee_status_column.sql
```

---

### 2. **Server Action - employeeActions.ts**

#### Perubahan Interface:

```typescript
// ❌ BEFORE
export async function createEmployeeWithUser(data: {
  // ...
  status: "ACTIVE" | "INACTIVE" | "PROBATION" | "TERMINATED";
  // ...
});

// ✅ AFTER
export async function createEmployeeWithUser(data: {
  // ... (status dihapus)
  contract_type?: "Probation" | "Contract" | "Permanent";
  salary_base?: number;
  contract_end_date?: string;
});
```

#### Perubahan Logic:

```typescript
// ❌ BEFORE: Insert employee dengan status
.insert({
  // ...
  status: data.status,
})

// ✅ AFTER: Insert employee tanpa status
.insert({
  // ... (status tidak ada)
})

// ✅ NEW: Create contract setelah employee
if (data.contract_type && data.salary_base) {
  await supabase.from("employee_contracts").insert({
    employee_id: employee.id,
    contract_type: data.contract_type,
    salary_base: data.salary_base,
    start_date: data.hire_date,
    end_date: data.contract_end_date || null,
  });
}
```

---

### 3. **UI Component - AddEmployeeDialog.tsx**

#### Form State Changes:

```typescript
// ❌ BEFORE
const [formData, setFormData] = useState({
  // ...
  status: "PROBATION",
  contract_type: "Probation",
  // ↑ Redundant!
});

// ✅ AFTER
const [formData, setFormData] = useState({
  // ...
  contract_type: "Probation", // Single source
  salary_base: "",
  contract_end_date: "",
});
```

#### UI Changes:

```tsx
{
  /* ❌ REMOVED: Status dropdown */
}
<select name="status">
  <option value="PROBATION">Probation</option>
  <option value="ACTIVE">Active</option>
</select>;

{
  /* ✅ NEW: Info box explaining status derivation */
}
<div className="info-box">
  ℹ️ Status Karyawan otomatis ditentukan dari Tipe Kontrak: • Masa Percobaan →
  Status: PROBATION • Kontrak / Tetap → Status: ACTIVE • Tidak ada kontrak →
  Status: INACTIVE
</div>;
```

---

### 4. **Utility Functions - employeeStatus.ts** (NEW!)

📄 `lib/utils/employeeStatus.ts`

Helper functions untuk compute status dari contract:

```typescript
// Get status from contract type
getStatusFromContractType("Probation"); // → "PROBATION"
getStatusFromContractType("Permanent"); // → "ACTIVE"

// Get status from contracts array
getEmployeeStatus(contracts, terminationDate); // → "ACTIVE" | "PROBATION" | etc

// Get active contract
getActiveContract(contracts); // → EmployeeContract | null

// UI helpers
getStatusBadgeClasses("ACTIVE"); // → "bg-green-100 text-green-800..."
getStatusLabel("PROBATION"); // → "Masa Percobaan"
getContractTypeLabel("Permanent"); // → "Tetap"

// Contract expiry check
isContractExpiringSoon(contract); // → true if < 30 days
```

---

## 🎯 Cara Pakai Status Sekarang

### Di Backend (Server Actions):

```typescript
import { createClient } from "@/lib/supabase/server";
import { getEmployeeStatus } from "@/lib/utils/employeeStatus";

// Fetch employee dengan contracts
const { data: employee } = await supabase
  .from("employees")
  .select(
    `
    *,
    contracts:employee_contracts(*)
  `
  )
  .eq("id", employeeId)
  .single();

// Compute status
const status = getEmployeeStatus(employee.contracts, employee.termination_date);

console.log(status); // "PROBATION" | "ACTIVE" | "INACTIVE" | "TERMINATED"
```

### Di Frontend (Components):

```tsx
import {
  getEmployeeStatus,
  getStatusBadgeClasses,
} from "@/lib/utils/employeeStatus";

function EmployeeCard({ employee }) {
  const status = getEmployeeStatus(
    employee.contracts,
    employee.termination_date
  );

  return (
    <span className={`badge ${getStatusBadgeClasses(status)}`}>{status}</span>
  );
}
```

### Di Database (SQL):

```sql
-- Using helper function
SELECT
  id,
  full_name,
  get_employee_status(id) as status
FROM employees
WHERE deleted_at IS NULL;
```

---

## 🔍 Status Mapping Logic

| Contract Type | End Date       | Termination Date | → Status   |
| ------------- | -------------- | ---------------- | ---------- |
| Probation     | NULL or future | NULL             | PROBATION  |
| Contract      | NULL or future | NULL             | ACTIVE     |
| Permanent     | NULL or future | NULL             | ACTIVE     |
| (any)         | past           | NULL             | INACTIVE   |
| (none)        | -              | NULL             | INACTIVE   |
| (any)         | (any)          | set              | TERMINATED |

---

## ✅ Testing Checklist

- [ ] Jalankan migration SQL
- [ ] Test create employee baru dengan contract
- [ ] Verify status ditampilkan dengan benar di UI
- [ ] Test employee tanpa contract (status = INACTIVE)
- [ ] Test employee dengan termination_date (status = TERMINATED)
- [ ] Test contract expiry (end_date passed → INACTIVE)
- [ ] Check employee list menampilkan status yang benar
- [ ] Test filter/search by status

---

## 📦 Files Changed

### Modified:

1. ✅ `lib/actions/employeeActions.ts` - Remove status parameter
2. ✅ `components/employees/AddEmployeeDialog.tsx` - Remove status field
3. ✅ `lib/actions/masterDataActions.ts` - Delete employment_types CRUD
4. ✅ `components/layout/Sidebar.tsx` - Remove employment_types menu

### Deleted:

1. ❌ `components/master-data/EmploymentTypeDialog.tsx`
2. ❌ `components/master-data/EmploymentTypeTable.tsx`
3. ❌ `app/dashboard/employment-types/` (directory)

### Created:

1. ✨ `migrations/remove_employee_status_column.sql`
2. ✨ `lib/utils/employeeStatus.ts`

---

## 🚀 Next Steps

1. **Jalankan Migration**:

   ```bash
   # Via Supabase Dashboard → SQL Editor
   # Copy-paste isi file: migrations/remove_employee_status_column.sql
   ```

2. **Update Employee Table Component** (jika ada):

   ```typescript
   // Import helper
   import {
     getEmployeeStatus,
     getStatusBadgeClasses,
   } from "@/lib/utils/employeeStatus";

   // Compute status saat render
   const status = getEmployeeStatus(
     employee.contracts,
     employee.termination_date
   );
   ```

3. **Update Employee Detail Page** (jika ada):

   - Tampilkan contract history
   - Highlight active contract
   - Show status derived from active contract

4. **Create Contract Management Feature**:
   - CRUD untuk employee_contracts
   - Dialog untuk convert Probation → Permanent
   - Alert untuk contract expiring soon

---

## 💡 Benefits

✅ **Single Source of Truth** - Contract adalah sumber status
✅ **No Redundancy** - Tidak ada duplikasi data
✅ **Konsisten** - Status selalu match dengan contract
✅ **Flexible** - Mudah track history kontrak
✅ **Industry Standard** - Sesuai best practice HR system

---

## 🆘 Troubleshooting

### Q: Bagaimana jika employee belum punya contract?

A: Status akan otomatis `INACTIVE`. Create contract untuk mengaktifkan.

### Q: Bagaimana cara set employee jadi TERMINATED?

A: Set `employees.termination_date` dengan tanggal resign/fired.

### Q: Contract expired tapi employee masih kerja?

A: Create contract baru (renewal) atau extend `end_date` contract lama.

### Q: Bisa punya multiple active contracts?

A: Secara logic tidak (1 employee = 1 active contract), tapi database tidak prevent. Frontend harus validate.

---

**🎉 Refactoring Complete!**

Status employee sekarang fully derived dari contract system, eliminasi redundancy dan konflik data! 🚀
