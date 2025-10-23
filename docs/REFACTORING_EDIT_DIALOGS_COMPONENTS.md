# Refactoring Edit Dialogs - Component Pattern Alignment

## Overview

Refactored employee edit dialogs to match the component patterns used in `AddEmployeeDialog`, ensuring consistent UX and code patterns across add and edit forms.

## Changes Made

### 1. EditJobDataDialog

#### DatePicker Implementation

**Before:**

```typescript
<Input
  type="date"
  value={formData.hire_date}
  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
/>
```

**After:**

```typescript
// State
const [hireDate, setHireDate] = useState<Date | undefined>(undefined);
const [contractEndDate, setContractEndDate] = useState<Date | undefined>(
  undefined
);

// Initialization
useEffect(() => {
  if (employee.hire_date) {
    setHireDate(new Date(employee.hire_date));
  }
  if (employee.contract_end_date) {
    setContractEndDate(new Date(employee.contract_end_date));
  }
}, [employee]);

// Component
<DatePicker date={hireDate} onDateChange={setHireDate} />;

// Submit
hire_date: hireDate ? hireDate.toISOString().split("T")[0] : "";
```

#### Salary Formatting

**Before:**

```typescript
<Input
  type="number"
  value={formData.salary_base}
  onChange={(e) =>
    setFormData({ ...formData, salary_base: parseInt(e.target.value) })
  }
/>
```

**After:**

```typescript
// State
const [salaryDisplay, setSalaryDisplay] = useState("");
const [salaryNumeric, setSalaryNumeric] = useState(0);

// Initialization
useEffect(() => {
  if (employee.salary_base) {
    setSalaryNumeric(employee.salary_base);
    setSalaryDisplay(toRupiah(employee.salary_base));
  }
}, [employee]);

// Handler
const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.replace(/\D/g, "");
  const numericValue = parseInt(value) || 0;
  setSalaryNumeric(numericValue);
  setSalaryDisplay(toRupiah(numericValue));
};

// Component
<Input
  type="text"
  value={salaryDisplay}
  onChange={handleSalaryChange}
  placeholder="Rp 0"
/>;

// Submit
salary_base: salaryNumeric;
```

#### State Management

**Before:**

```typescript
const [formData, setFormData] = useState({
  company_id: employee.company_id,
  department_id: employee.department_id,
  position_id: employee.position_id,
  contract_type: employee.contract_type,
  salary_base: employee.salary_base || 0,
  hire_date: employee.hire_date?.split("T")[0] || "",
  contract_end_date: employee.contract_end_date?.split("T")[0] || "",
});
```

**After:**

```typescript
// Separated concerns
const [formData, setFormData] = useState({
  company_id: employee.company_id.toString(), // String for Select
  department_id: employee.department_id.toString(),
  position_id: employee.position_id.toString(),
  contract_type: employee.contract_type,
});

const [salaryDisplay, setSalaryDisplay] = useState("");
const [salaryNumeric, setSalaryNumeric] = useState(0);
const [hireDate, setHireDate] = useState<Date | undefined>(undefined);
const [contractEndDate, setContractEndDate] = useState<Date | undefined>(
  undefined
);
```

### 2. EditPersonalDataDialog

#### DatePicker for Birth Date

**Before:**

```typescript
const [formData, setFormData] = useState({
  // ...other fields
  birth_date: employee.birth_date?.split("T")[0] || "",
});

<Input
  type="date"
  value={formData.birth_date}
  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
/>;
```

**After:**

```typescript
// State
const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

// Removed birth_date from formData
const [formData, setFormData] = useState({
  // ...other fields (no birth_date)
});

// Initialization
useEffect(() => {
  if (employee.birth_date) {
    setBirthDate(new Date(employee.birth_date));
  }
}, [employee]);

// Component
<DatePicker date={birthDate} onDateChange={setBirthDate} />;

// Submit
birth_date: birthDate ? birthDate.toISOString().split("T")[0] : "";
```

## Pattern Benefits

### 1. Consistent User Experience

- All date inputs use the same DatePicker component
- All currency inputs show formatted values (Rp X.XXX.XXX)
- Matches the UX in AddEmployeeDialog

### 2. Better Type Safety

- Date objects (`Date | undefined`) instead of strings
- Numeric values for currency instead of string parsing
- Clear separation between display and storage values

### 3. Improved Maintainability

- Same patterns across add and edit forms
- Easy to understand state flow
- Clear data transformations (Date → ISO string, number → formatted string)

### 4. Enhanced UX

- DatePicker provides calendar popup instead of browser native date input
- Currency formatting shows thousands separators
- Immediate visual feedback on input changes

## Implementation Pattern

### For Date Fields:

1. Create Date state: `const [date, setDate] = useState<Date | undefined>(undefined)`
2. Initialize in useEffect from employee data
3. Use DatePicker component: `<DatePicker date={date} onDateChange={setDate} />`
4. Convert to ISO string on submit: `date.toISOString().split("T")[0]`

### For Currency Fields:

1. Create display and numeric states
2. Initialize with formatted value in useEffect
3. Create change handler that strips non-numeric and formats
4. Use text input with formatted display value
5. Submit numeric value

### For Dropdown Fields:

1. Store as string in state (Select component works with strings)
2. Convert to number on submit: `parseInt(value)`
3. Pre-populate with current value using `.toString()`

## Files Modified

1. `components/employees/EditJobDataDialog.tsx`

   - Added DatePicker for hire_date and contract_end_date
   - Added salary formatting with toRupiah
   - Separated state management for dates and salary

2. `components/employees/EditPersonalDataDialog.tsx`
   - Added DatePicker for birth_date
   - Removed birth_date from formData state

## Testing Checklist

- [x] All dialogs compile without errors
- [ ] DatePickers show current employee dates correctly
- [ ] Salary displays formatted (Rp X.XXX.XXX)
- [ ] Salary input accepts only numbers
- [ ] Dropdowns show current selected values
- [ ] Save updates all fields correctly
- [ ] Date conversion to ISO string works
- [ ] Currency conversion to number works
- [ ] Page refreshes after successful update

## Notes

- **Import added:** `DatePicker` from `@/components/ui/date-picker`
- **Import added:** `toRupiah` from `@/lib/utils/currency` (in EditJobDataDialog)
- **Import added:** `useEffect` from `react` (in EditPersonalDataDialog)
- All components now match the AddEmployeeDialog pattern for consistency
