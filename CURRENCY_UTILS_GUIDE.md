# Currency Utilities - Format Rupiah

Utility functions untuk format dan manipulasi nominal Rupiah (IDR).

## 📦 Location

`lib/utils/currency.ts`

---

## 🎯 Functions Overview

### **Core Functions:**

1. `formatRupiah()` - Format number ke Rupiah dengan options
2. `toRupiah()` - Shorthand format Rupiah
3. `formatCurrency()` - Format tanpa prefix "Rp"
4. `parseRupiah()` - Parse string Rupiah ke number
5. `formatRupiahInput()` - Format untuk input field
6. `isValidRupiah()` - Validasi format Rupiah

### **Display Functions:**

7. `formatRupiahCompact()` - Format compact (1,2 Jt, 500 Rb)
8. `formatRupiahRange()` - Format range min-max
9. `formatRupiahWithColor()` - Format dengan color class

### **Math Functions:**

10. `calculatePercentage()` - Hitung persentase
11. `formatPercentageAmount()` - Persentase + format
12. `addRupiah()` - Tambah 2 nilai
13. `subtractRupiah()` - Kurangi nilai
14. `roundRupiah()` - Pembulatan
15. `absoluteRupiah()` - Nilai absolut

### **Helper Functions:**

16. `handleRupiahInput()` - Handle onChange input
17. `getRupiahSymbol()` - Get "Rp" symbol
18. `isPositiveAmount()` - Check positif

---

## 📖 Usage Examples

### **1. Basic Formatting**

```typescript
import { formatRupiah, toRupiah, formatCurrency } from "@/lib/utils/currency";

// Full format dengan options
formatRupiah(1234567);
// "Rp 1.234.567"

formatRupiah(1234567.89);
// "Rp 1.234.567,89"

formatRupiah(1234567, { withPrefix: false });
// "1.234.567"

formatRupiah(1234567, { withDecimals: false });
// "Rp 1.234.567"

// Shorthand
toRupiah(5000000);
// "Rp 5.000.000"

formatCurrency(5000000);
// "5.000.000" (no prefix)
```

### **2. Parsing Rupiah String**

```typescript
import { parseRupiah } from "@/lib/utils/currency";

parseRupiah("Rp 1.234.567");
// 1234567

parseRupiah("5.000.000");
// 5000000

parseRupiah("Rp 1.234.567,89");
// 1234567.89

parseRupiah("invalid");
// 0
```

### **3. Input Field Formatting (Real-time)**

```tsx
import { formatRupiahInput, handleRupiahInput } from "@/lib/utils/currency";

// Component example
function SalaryInput() {
  const [salary, setSalary] = useState("");
  const [numericValue, setNumericValue] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formatted, numeric } = handleRupiahInput(e.target.value);
    setSalary(formatted);
    setNumericValue(numeric);
  };

  return (
    <div>
      <input
        type="text"
        value={salary}
        onChange={handleChange}
        placeholder="0"
      />
      <p>Numeric value: {numericValue}</p>
    </div>
  );
}

// Or simpler version
const handleChange = (e) => {
  const formatted = formatRupiahInput(e.target.value);
  setSalary(formatted);
};
```

### **4. Display Compact Format**

```typescript
import { formatRupiahCompact } from "@/lib/utils/currency";

formatRupiahCompact(500000);
// "Rp 500 Rb"

formatRupiahCompact(1234567);
// "Rp 1,2 Jt"

formatRupiahCompact(5000000);
// "Rp 5 Jt"

formatRupiahCompact(5000000000);
// "Rp 5 M"

formatRupiahCompact(1000000000000);
// "Rp 1 T"
```

### **5. Salary Range Display**

```typescript
import { formatRupiahRange } from "@/lib/utils/currency";

formatRupiahRange(3000000, 5000000);
// "Rp 3.000.000 - Rp 5.000.000"

// Usage in component
<p className="text-sm text-gray-600">
  Salary Range: {formatRupiahRange(position.min_salary, position.max_salary)}
</p>;
```

### **6. Calculate Percentage**

```typescript
import {
  calculatePercentage,
  formatPercentageAmount,
} from "@/lib/utils/currency";

// PPh21 10% dari gaji
const salary = 5000000;
const tax = calculatePercentage(salary, 10);
// 500000

// Format langsung
formatPercentageAmount(5000000, 10);
// "Rp 500.000"

// Tunjangan 20% dari gaji pokok
const allowance = calculatePercentage(salary, 20);
formatRupiah(allowance);
// "Rp 1.000.000"
```

### **7. Math Operations**

```typescript
import { addRupiah, subtractRupiah, roundRupiah } from "@/lib/utils/currency";

// Addition
const gajiPokok = 5000000;
const tunjangan = 1500000;
const total = addRupiah(gajiPokok, tunjangan);
// 6500000

// Subtraction
const gajiBersih = subtractRupiah(total, 650000); // potong pajak
// 5850000

// Rounding
roundRupiah(1234567, 1000);
// 1235000

roundRupiah(1234567, 100000);
// 1200000
```

### **8. Display with Color**

```tsx
import { formatRupiahWithColor } from '@/lib/utils/currency';

function BalanceDisplay({ amount }: { amount: number }) {
  const { formatted, colorClass, isPositive } = formatRupiahWithColor(amount);

  return (
    <div>
      <span className={colorClass}>{formatted}</span>
      {isPositive ? " ↑" : " ↓"}
    </div>
  );
}

// Usage
<BalanceDisplay amount={5000000} />
// <span class="text-green-600">Rp 5.000.000</span> ↑

<BalanceDisplay amount={-500000} />
// <span class="text-red-600">Rp -500.000</span> ↓
```

### **9. Validation**

```typescript
import { isValidRupiah, isPositiveAmount } from "@/lib/utils/currency";

isValidRupiah("Rp 1.234.567");
// true

isValidRupiah("1.234.567,89");
// true

isValidRupiah("abc123");
// false

isPositiveAmount(5000000);
// true

isPositiveAmount(-1000);
// false
```

---

## 🎨 UI Components Examples

### **Salary Input Component**

```tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleRupiahInput, toRupiah } from "@/lib/utils/currency";

export function SalaryInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? toRupiah(value).replace("Rp ", "") : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formatted, numeric } = handleRupiahInput(e.target.value);
    setDisplayValue(formatted);
    onChange(numeric);
  };

  return (
    <div>
      <Label htmlFor="salary">Gaji Pokok</Label>
      <div className="relative">
        <span className="absolute left-3 top-2 text-gray-500">Rp</span>
        <Input
          id="salary"
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className="pl-10"
        />
      </div>
      {value > 0 && (
        <p className="text-xs text-gray-500 mt-1">{toRupiah(value)}</p>
      )}
    </div>
  );
}
```

### **Salary Display Card**

```tsx
import { toRupiah, formatRupiahCompact } from "@/lib/utils/currency";

export function SalaryCard({ employee }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm text-gray-500">Gaji Pokok</h3>
      <p className="text-2xl font-bold text-gray-900">
        {toRupiah(employee.salary_base)}
      </p>
      <p className="text-xs text-gray-500">
        atau {formatRupiahCompact(employee.salary_base)}
      </p>
    </div>
  );
}
```

### **Payroll Summary**

```tsx
import { toRupiah, formatRupiahWithColor } from "@/lib/utils/currency";

export function PayrollSummary({ payroll }) {
  const netSalary = payroll.gross_salary - payroll.total_deductions;
  const netDisplay = formatRupiahWithColor(netSalary);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Gaji Kotor:</span>
        <span className="font-medium">{toRupiah(payroll.gross_salary)}</span>
      </div>
      <div className="flex justify-between text-red-600">
        <span>Potongan:</span>
        <span>({toRupiah(payroll.total_deductions)})</span>
      </div>
      <div className="flex justify-between text-lg font-bold border-t pt-2">
        <span>Gaji Bersih:</span>
        <span className={netDisplay.colorClass}>{netDisplay.formatted}</span>
      </div>
    </div>
  );
}
```

---

## 📊 Use Cases

### **1. Employee Management**

```typescript
// AddEmployeeDialog.tsx
const [salaryBase, setSalaryBase] = useState(0);

<SalaryInput value={salaryBase} onChange={setSalaryBase} />;
```

### **2. Payroll Calculation**

```typescript
// Calculate salary components
const gajiPokok = 5000000;
const tunjanganTransport = calculatePercentage(gajiPokok, 10); // 500000
const tunjanganMakan = calculatePercentage(gajiPokok, 15); // 750000
const pph21 = calculatePercentage(gajiPokok, 5); // 250000

const gajiKotor = addRupiah(
  gajiPokok,
  addRupiah(tunjanganTransport, tunjanganMakan)
); // 6250000

const gajiBersih = subtractRupiah(gajiKotor, pph21); // 6000000
```

### **3. Contract Management**

```typescript
// Display contract salary range
<p>
  Salary Range: {formatRupiahRange(contract.min_salary, contract.max_salary)}
</p>

// Compact display for table
<td>{formatRupiahCompact(contract.salary_base)}</td>
```

### **4. Reports & Dashboard**

```typescript
// Format untuk chart labels
const labels = [
  formatRupiahCompact(1000000), // "Rp 1 Jt"
  formatRupiahCompact(5000000), // "Rp 5 Jt"
  formatRupiahCompact(10000000), // "Rp 10 Jt"
];

// Summary cards
<StatCard
  title="Total Gaji"
  value={toRupiah(totalSalary)}
  compactValue={formatRupiahCompact(totalSalary)}
/>;
```

---

## ✅ Benefits

- ✅ **Consistent Formatting** - Format Rupiah seragam di seluruh aplikasi
- ✅ **Easy to Use** - Simple API, tinggal import & pakai
- ✅ **Type Safe** - Full TypeScript support
- ✅ **Flexible** - Banyak options & variations
- ✅ **Input Ready** - Langsung bisa untuk form input
- ✅ **Display Ready** - Format untuk UI/UX
- ✅ **Math Operations** - Built-in calculations
- ✅ **Validation** - Check format validity

---

## 🎓 Best Practices

### **1. Store as Number, Display as Rupiah**

```typescript
// ✅ GOOD
interface Employee {
  salary_base: number; // Store as number in DB
}

// Display
<p>{toRupiah(employee.salary_base)}</p>;

// ❌ BAD
interface Employee {
  salary_base: string; // "Rp 5.000.000"
}
```

### **2. Use handleRupiahInput for Forms**

```tsx
// ✅ GOOD
const { formatted, numeric } = handleRupiahInput(e.target.value);
setDisplayValue(formatted); // For display
setNumericValue(numeric); // For submission

// ❌ BAD
setDisplayValue(e.target.value); // Raw value, not formatted
```

### **3. Choose Right Format Function**

```typescript
// Table/List → Compact
<td>{formatRupiahCompact(salary)}</td>

// Detail/Form → Full
<p>{toRupiah(salary)}</p>

// Input Field → formatRupiahInput
<input value={formatRupiahInput(value)} />

// Chart/Summary → Range
<label>{formatRupiahRange(min, max)}</label>
```

---

**Currency utilities siap digunakan!** 💰🚀
