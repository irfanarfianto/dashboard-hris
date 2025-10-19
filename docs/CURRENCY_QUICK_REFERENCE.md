# 💰 Currency Utils - Quick Reference

Quick reference untuk currency utilities yang sering dipakai.

---

## 🚀 Quick Import

```typescript
import {
  handleRupiahInput,
  toRupiah,
  formatRupiahCompact,
} from "@/lib/utils/currency";
```

---

## 📖 Most Used Functions

### **1. handleRupiahInput() - For Input Fields**

```typescript
const { formatted, numeric } = handleRupiahInput("5000000");
// formatted: "5.000.000"
// numeric: 5000000

// Usage in component:
const [display, setDisplay] = useState("");
const [value, setValue] = useState(0);

<Input
  value={display}
  onChange={(e) => {
    const { formatted, numeric } = handleRupiahInput(e.target.value);
    setDisplay(formatted);
    setValue(numeric);
  }}
/>;
```

### **2. toRupiah() - Display Full Format**

```typescript
toRupiah(5000000);
// "Rp 5.000.000"

// Usage:
<p>{toRupiah(employee.salary)}</p>
<span>{toRupiah(total)}</span>
```

### **3. formatRupiahCompact() - Compact Display**

```typescript
formatRupiahCompact(5000000);
// "Rp 5 Jt"

formatRupiahCompact(500000);
// "Rp 500 Rb"

// Usage in tables:
<td>{formatRupiahCompact(salary)}</td>;
```

---

## 🎯 Common Patterns

### **Pattern 1: Input Field Component**

```tsx
function SalaryInput({ value, onChange }) {
  const [display, setDisplay] = useState("");

  const handleChange = (e) => {
    const { formatted, numeric } = handleRupiahInput(e.target.value);
    setDisplay(formatted);
    onChange(numeric);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
      <Input
        type="text"
        value={display}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
}
```

### **Pattern 2: Display in Table**

```tsx
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Salary</th>
    </tr>
  </thead>
  <tbody>
    {employees.map((emp) => (
      <tr key={emp.id}>
        <td>{emp.full_name}</td>
        <td>{formatRupiahCompact(emp.salary_base)}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### **Pattern 3: Calculate Percentage**

```tsx
const salary = 5000000;
const taxRate = 10;

// Calculate tax
const tax = calculatePercentage(salary, taxRate);
// 500000

// Display
<p>Gaji: {toRupiah(salary)}</p>
<p>Pajak (10%): {toRupiah(tax)}</p>
<p>Bersih: {toRupiah(salary - tax)}</p>
```

---

## 🎨 UI Examples

### **Card Display**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Gaji Pokok</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">{toRupiah(employee.salary_base)}</p>
    <p className="text-sm text-gray-500">
      {formatRupiahCompact(employee.salary_base)}
    </p>
  </CardContent>
</Card>
```

### **Form Input with Confirmation**

```tsx
<div>
  <Label>Gaji Pokok</Label>
  <div className="relative">
    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
    <Input
      value={salaryDisplay}
      onChange={(e) => {
        const { formatted, numeric } = handleRupiahInput(e.target.value);
        setSalaryDisplay(formatted);
        setSalaryNumeric(numeric);
      }}
      className="pl-10"
    />
  </div>
  {salaryNumeric > 0 && (
    <p className="text-xs text-gray-500 mt-1">{toRupiah(salaryNumeric)}</p>
  )}
</div>
```

### **Summary Display**

```tsx
<div className="space-y-2">
  <div className="flex justify-between">
    <span>Gaji Kotor:</span>
    <span>{toRupiah(grossSalary)}</span>
  </div>
  <div className="flex justify-between text-red-600">
    <span>Potongan:</span>
    <span>({toRupiah(deduction)})</span>
  </div>
  <div className="flex justify-between text-lg font-bold border-t pt-2">
    <span>Gaji Bersih:</span>
    <span>{toRupiah(netSalary)}</span>
  </div>
</div>
```

---

## 🧮 Math Operations

### **Addition**

```typescript
const gajiPokok = 5000000;
const tunjangan = 1500000;
const total = addRupiah(gajiPokok, tunjangan);
// 6500000
```

### **Subtraction**

```typescript
const gajiKotor = 6500000;
const potongan = 650000;
const gajiBersih = subtractRupiah(gajiKotor, potongan);
// 5850000
```

### **Percentage**

```typescript
const salary = 5000000;
const taxRate = 10;
const tax = calculatePercentage(salary, taxRate);
// 500000
```

### **Rounding**

```typescript
roundRupiah(1234567, 1000);
// 1235000 (round to nearest 1000)

roundRupiah(1234567, 100000);
// 1200000 (round to nearest 100k)
```

---

## 🎓 Cheat Sheet

| Function                | Input                | Output                                         | Use Case      |
| ----------------------- | -------------------- | ---------------------------------------------- | ------------- |
| `toRupiah()`            | `5000000`            | `"Rp 5.000.000"`                               | Display full  |
| `formatRupiahCompact()` | `5000000`            | `"Rp 5 Jt"`                                    | Table/compact |
| `handleRupiahInput()`   | `"5000000"`          | `{ formatted: "5.000.000", numeric: 5000000 }` | Input field   |
| `parseRupiah()`         | `"Rp 5.000.000"`     | `5000000`                                      | Parse string  |
| `calculatePercentage()` | `(5000000, 10)`      | `500000`                                       | Calculate %   |
| `formatRupiahRange()`   | `(3000000, 5000000)` | `"Rp 3.000.000 - Rp 5.000.000"`                | Range         |
| `roundRupiah()`         | `(1234567, 1000)`    | `1235000`                                      | Rounding      |

---

## 📦 Import Reference

```typescript
// All functions
import * as CurrencyUtils from "@/lib/utils/currency";

// Named imports (recommended)
import {
  // Core
  formatRupiah,
  toRupiah,
  formatCurrency,
  parseRupiah,

  // Input
  handleRupiahInput,
  formatRupiahInput,

  // Display
  formatRupiahCompact,
  formatRupiahRange,
  formatRupiahWithColor,

  // Math
  calculatePercentage,
  addRupiah,
  subtractRupiah,
  roundRupiah,

  // Helper
  isValidRupiah,
  isPositiveAmount,
} from "@/lib/utils/currency";
```

---

## 🚨 Common Mistakes to Avoid

### ❌ **Mistake 1: Storing formatted string in DB**

```typescript
// BAD
salary_base: "Rp 5.000.000"; // String

// GOOD
salary_base: 5000000; // Number
```

### ❌ **Mistake 2: Not handling numeric value**

```typescript
// BAD
const { formatted } = handleRupiahInput(value);
// Only store formatted, lose numeric!

// GOOD
const { formatted, numeric } = handleRupiahInput(value);
setDisplay(formatted); // For UI
setNumeric(numeric); // For DB
```

### ❌ **Mistake 3: Using number input type**

```tsx
// BAD - Can't format with dots
<Input type="number" value={formData.salary} />

// GOOD - Can format freely
<Input type="text" value={salaryDisplay} />
```

### ❌ **Mistake 4: Parsing formatted string**

```typescript
// BAD
parseFloat("5.000.000"); // NaN (dots confuse parseFloat)

// GOOD
parseRupiah("5.000.000"); // 5000000
// OR use the numeric value from handleRupiahInput()
```

---

## ✅ Best Practices

### ✅ **1. Separate Display & Value**

```typescript
const [display, setDisplay] = useState(""); // "5.000.000"
const [value, setValue] = useState(0); // 5000000
```

### ✅ **2. Use Appropriate Function**

```typescript
// Input fields
handleRupiahInput();

// Display detail
toRupiah();

// Display compact (tables)
formatRupiahCompact();
```

### ✅ **3. Confirm User Input**

```tsx
<Input value={display} />;
{
  value > 0 && <p className="text-xs">{toRupiah(value)}</p>;
}
```

### ✅ **4. Type Safety**

```typescript
interface Employee {
  salary_base: number; // Not string!
}
```

---

## 🔗 Links

- **Full Documentation:** `CURRENCY_UTILS_GUIDE.md`
- **Implementation Guide:** `CURRENCY_INPUT_IMPLEMENTATION.md`
- **Demo:** `CURRENCY_INPUT_DEMO.md`
- **Source Code:** `lib/utils/currency.ts`

---

**Keep this for quick reference!** 📌
