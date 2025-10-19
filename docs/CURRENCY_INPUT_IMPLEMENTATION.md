# Currency Input Implementation - Gaji Pokok

Implementasi auto-format Rupiah pada input field salary (gaji).

## ✅ Perubahan yang Dilakukan

### **1. AddEmployeeDialog.tsx**

#### **Import Currency Utilities**

```typescript
import { handleRupiahInput, toRupiah } from "@/lib/utils/currency";
```

#### **State Management**

Menambahkan state untuk handle display vs numeric value:

```typescript
// State for salary display (formatted) vs numeric value
const [salaryDisplay, setSalaryDisplay] = useState("");
const [salaryNumeric, setSalaryNumeric] = useState(0);
```

**Alasan:**

- `salaryDisplay`: Untuk display di input field (formatted dengan titik separator)
- `salaryNumeric`: Untuk store nilai numerik yang akan disimpan ke database

#### **Update Input Field**

**BEFORE:**

```tsx
<Input
  id="salary_base"
  type="number"
  value={formData.salary_base}
  onChange={(e) =>
    setFormData({
      ...formData,
      salary_base: e.target.value,
    })
  }
  required
  placeholder="0"
  min="0"
  step="1000"
  className="mt-1"
/>
```

**AFTER:**

```tsx
<div className="relative mt-1">
  <span className="absolute left-3 top-2.5 text-sm text-gray-500 dark:text-gray-400">
    Rp
  </span>
  <Input
    id="salary_base"
    type="text"
    value={salaryDisplay}
    onChange={(e) => {
      const { formatted, numeric } = handleRupiahInput(e.target.value);
      setSalaryDisplay(formatted);
      setSalaryNumeric(numeric);
    }}
    required
    placeholder="0"
    className="pl-10"
  />
</div>;
{
  salaryNumeric > 0 && (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {toRupiah(salaryNumeric)}
    </p>
  );
}
```

**Perubahan:**

1. ✅ Type `number` → `text` (agar bisa format dengan titik)
2. ✅ Tambah prefix "Rp" fixed di sebelah kiri
3. ✅ Auto-format saat user mengetik dengan `handleRupiahInput()`
4. ✅ Display full format di bawah input untuk konfirmasi
5. ✅ Padding left untuk space prefix "Rp"

#### **Update Submit Handler**

**BEFORE:**

```typescript
salary_base: formData.salary_base
  ? parseFloat(formData.salary_base)
  : undefined,
```

**AFTER:**

```typescript
salary_base: salaryNumeric > 0 ? salaryNumeric : undefined,
```

**Alasan:** Langsung pakai `salaryNumeric` yang sudah dalam bentuk number, tidak perlu parse lagi.

#### **Update Reset Form**

**BEFORE:**

```typescript
const resetForm = () => {
  setFormData({ ... });
  setShowSuccess(false);
  setTempPassword("");
  setCopiedPassword(false);
};
```

**AFTER:**

```typescript
const resetForm = () => {
  setFormData({ ... });
  setSalaryDisplay("");
  setSalaryNumeric(0);
  setShowSuccess(false);
  setTempPassword("");
  setCopiedPassword(false);
};
```

---

## 🎯 Hasil Implementasi

### **User Experience:**

1. **User mengetik:** `5000000`

   - Display: `5.000.000`
   - Prefix: `Rp` (fixed di sebelah kiri)
   - Konfirmasi: `Rp 5.000.000` (di bawah input)

2. **User mengetik:** `12345678`

   - Display: `12.345.678`
   - Auto-format saat mengetik
   - Real-time formatting

3. **User paste:** `Rp 3.500.000`

   - Otomatis clean dan format ulang
   - Handle berbagai format input

4. **User hapus angka:**
   - Format otomatis update
   - Tidak perlu manual format

### **Developer Benefits:**

- ✅ **Single Source of Truth:** `salaryNumeric` → Database
- ✅ **Type Safety:** Number type untuk database
- ✅ **Consistent Format:** Rupiah format seragam
- ✅ **User Friendly:** Real-time formatting
- ✅ **Validation Ready:** Built-in number validation

---

## 📊 Input Field Features

### **1. Auto-Format Saat Mengetik**

```
User types: 5000000
Display:     5.000.000
```

### **2. Prefix "Rp" Fixed**

```
┌─────────────────────────┐
│ Rp 5.000.000           │
└─────────────────────────┘
   ↑ Fixed position
```

### **3. Confirmation Display**

```
Gaji Pokok *
┌─────────────────────────┐
│ Rp 5.000.000           │
└─────────────────────────┘
Rp 5.000.000  ← Full format konfirmasi
```

### **4. Smart Parsing**

Bisa handle berbagai input format:

- `5000000` → `5.000.000`
- `5.000.000` → `5.000.000`
- `Rp 5.000.000` → `5.000.000`
- `5,000,000` → `5.000.000`
- `5 juta` → Clean input only

---

## 🧪 Testing Scenarios

### **Test Case 1: Input Normal**

```
1. User klik input field
2. Ketik: 5000000
3. Expected: Display "5.000.000" dengan prefix "Rp"
4. Expected: Konfirmasi "Rp 5.000.000" muncul di bawah
```

### **Test Case 2: Edit Existing Value**

```
1. Input sudah ada: 5.000.000
2. User edit jadi: 3.500.000
3. Expected: Auto re-format
4. Expected: Konfirmasi update
```

### **Test Case 3: Paste dari Clipboard**

```
1. Copy: "Rp 4.500.000"
2. Paste ke input
3. Expected: Clean & format jadi "4.500.000"
4. Expected: Numeric value = 4500000
```

### **Test Case 4: Submit Form**

```
1. Input: 5.000.000
2. Submit form
3. Expected: Kirim numeric value 5000000 ke database
4. Expected: Type = number (bukan string)
```

### **Test Case 5: Reset Form**

```
1. Input ada value
2. Cancel/Reset
3. Expected: Display & numeric reset ke empty/0
```

---

## 🔄 Data Flow

```
User Input
    ↓
handleRupiahInput()
    ↓
┌─────────────────────────────────┐
│ formatted: "5.000.000"          │ → salaryDisplay → Display di Input
│ numeric: 5000000                │ → salaryNumeric → Simpan ke DB
└─────────────────────────────────┘
    ↓
toRupiah(salaryNumeric)
    ↓
"Rp 5.000.000" → Konfirmasi di bawah input
```

---

## 📦 File yang Dimodifikasi

- ✅ `components/employees/AddEmployeeDialog.tsx`
  - Import currency utilities
  - Add state: salaryDisplay, salaryNumeric
  - Update input field dengan auto-format
  - Update handleSubmit
  - Update resetForm

---

## 🚀 Next Steps (Optional)

### **1. Extend ke Field Lain**

Jika nanti ada field rupiah lainnya:

- Tunjangan transport
- Tunjangan makan
- Tunjangan kesehatan
- Bonus
- Potongan
- dll

Gunakan pattern yang sama:

```tsx
const [displayValue, setDisplayValue] = useState("");
const [numericValue, setNumericValue] = useState(0);

<div className="relative">
  <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
  <Input
    type="text"
    value={displayValue}
    onChange={(e) => {
      const { formatted, numeric } = handleRupiahInput(e.target.value);
      setDisplayValue(formatted);
      setNumericValue(numeric);
    }}
    className="pl-10"
  />
</div>;
```

### **2. Create Reusable Component**

Jika banyak input rupiah, buat reusable component:

```tsx
// components/ui/currency-input.tsx
interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  ...props
}: CurrencyInputProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value > 0) {
      setDisplay(toRupiah(value).replace("Rp ", ""));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formatted, numeric } = handleRupiahInput(e.target.value);
    setDisplay(formatted);
    onChange(numeric);
  };

  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-sm text-gray-500">
          Rp
        </span>
        <Input
          type="text"
          value={display}
          onChange={handleChange}
          className="pl-10"
          {...props}
        />
      </div>
      {value > 0 && (
        <p className="text-xs text-gray-500 mt-1">{toRupiah(value)}</p>
      )}
    </div>
  );
}
```

**Usage:**

```tsx
<CurrencyInput
  label="Gaji Pokok"
  value={salaryBase}
  onChange={setSalaryBase}
  required
/>
```

---

## ✨ Summary

✅ **Implemented auto-format Rupiah pada input Gaji Pokok**

- Real-time formatting saat user mengetik
- Prefix "Rp" fixed position
- Konfirmasi full format di bawah input
- Clean data flow: display ↔ numeric
- Type-safe untuk database submission

**Files Modified:** 1

- `components/employees/AddEmployeeDialog.tsx`

**Ready to use!** 🎉
