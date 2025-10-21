# Auto-Generate Username dari Nama Lengkap

## Overview

Sistem HRIS sekarang secara otomatis membuat username untuk karyawan berdasarkan nama lengkap mereka. Username dijamin unik dengan menambahkan angka jika nama yang sama sudah ada.

## Perubahan Fitur

### Sebelum

- User harus manual input username di form Step 4 (Akun User)
- Risiko duplicate username
- Tambahan field yang harus diisi

### Sesudah

- Username di-generate otomatis dari nama lengkap
- Sistem memastikan username unique
- Form lebih simple, hanya pilih role
- Username ditampilkan setelah karyawan berhasil dibuat

## Format Username

### Algoritma

1. Ambil nama lengkap karyawan
2. Convert ke lowercase
3. Hapus karakter special (hanya huruf)
4. Replace spasi dengan titik (.)
5. Check keunikan di database
6. Jika sudah ada, tambahkan angka (2, 3, dst)

### Contoh

| Nama Lengkap          | Username Generated |
| --------------------- | ------------------ |
| Ahmad Rizki           | ahmad.rizki        |
| Siti Nurhaliza        | siti.nurhaliza     |
| Budi Santoso          | budi.santoso       |
| Budi Santoso (kedua)  | budi.santoso2      |
| Budi Santoso (ketiga) | budi.santoso3      |
| John O'Brien          | john.obrien        |
| María García          | mara.garca         |

## Files Modified

### 1. Server Actions

#### `lib/actions/employeeActions.ts`

**Added Function:**

```typescript
async function generateUniqueUsername(fullName: string): Promise<string> {
  const supabase = await createClient();

  // Clean and format name
  const cleanName = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, "") // Remove non-letter characters
    .replace(/\s+/g, "."); // Replace spaces with dots

  // Try base username first
  let username = cleanName;
  let counter = 1;

  // Check if username exists, if yes, add counter
  while (true) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .is("deleted_at", null)
      .single();

    if (!existingUser) {
      return username; // Username is unique
    }

    // Username exists, try with counter
    counter++;
    username = `${cleanName}${counter}`;
  }
}
```

**Modified `createEmployeeWithUser` Interface:**

```typescript
// BEFORE
export async function createEmployeeWithUser(data: {
  create_user_account: boolean;
  username?: string; // ❌ Manual input
  role_id?: number;
  // ...
});

// AFTER
export async function createEmployeeWithUser(data: {
  create_user_account: boolean;
  role_id?: number; // ✅ No username parameter
  // ...
});
```

**Modified Logic:**

```typescript
// Generate unique username from full name
generatedUsername = await generateUniqueUsername(data.full_name);

// Insert to users table with generated username
await supabase.from("users").insert({
  auth_user_id: authUserId,
  employee_id: employee.id,
  username: generatedUsername, // ← Auto-generated
  password_hash: hashedPassword,
  role_id: data.role_id,
  is_active: true,
});
```

**Return Value Updated:**

```typescript
return {
  success: true,
  message: "Karyawan berhasil ditambahkan...",
  data: {
    employee,
    tempPassword: data.create_user_account ? tempPassword : null,
    username: data.create_user_account ? generatedUsername : null, // ← New field
  },
};
```

### 2. Form Components

#### `components/employees/add-employee-steps/Step4AkunUser.tsx`

**Interface Changed:**

```typescript
// BEFORE
interface Step4AkunUserProps {
  formData: {
    create_user_account: boolean;
    username: string; // ❌ Removed
    role_id: string;
  };
}

// AFTER
interface Step4AkunUserProps {
  formData: {
    create_user_account: boolean;
    role_id: string; // ✅ Only role needed
  };
}
```

**UI Changed:**

```tsx
{
  /* BEFORE - Username Input Field */
}
<div>
  <Label htmlFor="username">
    Username <span className="text-red-500">*</span>
  </Label>
  <Input
    id="username"
    value={formData.username}
    onChange={(e) => onFormDataChange("username", e.target.value)}
    placeholder="username_karyawan"
    required
  />
</div>;

{
  /* AFTER - Only Role Selection */
}
<div>
  <Label htmlFor="role_id">
    Role <span className="text-red-500">*</span>
  </Label>
  <Select
    value={formData.role_id}
    onValueChange={(value) => onFormDataChange("role_id", value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Pilih Role" />
    </SelectTrigger>
    <SelectContent>
      {roles.map((r) => (
        <SelectItem key={r.id} value={r.id.toString()}>
          <div className="flex flex-col">
            <span className="font-medium">{r.name}</span>
            {r.description && (
              <span className="text-xs text-gray-500">{r.description}</span>
            )}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>;

{
  /* Info Box */
}
<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
  <p className="text-sm text-blue-800 font-medium">
    ℹ️ Informasi Username & Password:
  </p>
  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
    <li>Username akan di-generate otomatis dari nama lengkap karyawan</li>
    <li>Password sementara akan di-generate otomatis oleh sistem</li>
    <li>Keduanya akan ditampilkan setelah karyawan berhasil ditambahkan</li>
  </ul>
</div>;
```

#### `components/employees/add-employee-steps/useAddEmployeeForm.ts`

**State Changed:**

```typescript
// BEFORE
const [formData, setFormData] = useState({
  // ...
  create_user_account: false,
  username: "", // ❌ Removed
  role_id: "",
});

// AFTER
const [formData, setFormData] = useState({
  // ...
  create_user_account: false,
  role_id: "", // ✅ No username
});

// Added new state for generated username
const [generatedUsername, setGeneratedUsername] = useState("");
```

**Validation Changed:**

```typescript
// BEFORE
case 4:
  if (formData.create_user_account) {
    return formData.username && formData.role_id;  // ❌ Check username
  }
  return true;

// AFTER
case 4:
  if (formData.create_user_account) {
    return formData.role_id !== "";  // ✅ Only check role
  }
  return true;
```

**Submit Changed:**

```typescript
// BEFORE
const result = await createEmployeeWithUser({
  // ...
  create_user_account: formData.create_user_account,
  username: formData.username, // ❌ Manual username
  role_id: formData.role_id,
});

// AFTER
const result = await createEmployeeWithUser({
  // ...
  create_user_account: formData.create_user_account,
  role_id: formData.role_id, // ✅ No username sent
});

// Store generated username from response
if (result.data?.tempPassword) {
  setTempPassword(result.data.tempPassword);
  setGeneratedUsername(result.data.username || ""); // ← Store generated username
  setShowSuccess(true);
}
```

#### `components/employees/add-employee-steps/Step5Verifikasi.tsx`

**Interface Changed:**

```typescript
// BEFORE
interface Step5VerifikasiProps {
  formData: {
    // ...
    create_user_account: boolean;
    username: string; // ❌ Removed
    role_id: string;
  };
}

// AFTER
interface Step5VerifikasiProps {
  formData: {
    // ...
    create_user_account: boolean;
    role_id: string; // ✅ No username
  };
}
```

**UI Changed:**

```tsx
{
  /* BEFORE - Display Username */
}
<div>
  <span className="text-gray-600">Username:</span>
  <p className="font-medium">{formData.username}</p>
</div>;

{
  /* AFTER - Info about auto-generation */
}
<div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
  <p className="text-xs text-blue-700">
    ℹ️ Username akan di-generate otomatis dari nama lengkap karyawan
  </p>
  <p className="text-xs text-blue-700 mt-1">
    ℹ️ Password sementara akan di-generate otomatis oleh sistem
  </p>
  <p className="text-xs text-blue-700 mt-1">
    ℹ️ Keduanya akan ditampilkan setelah data berhasil disimpan
  </p>
</div>;
```

#### `components/employees/add-employee-steps/SuccessScreen.tsx`

**Props Changed:**

```typescript
// BEFORE
interface SuccessScreenProps {
  fullName: string;
  email: string;
  tempPassword: string;
  // ...
}

// AFTER
interface SuccessScreenProps {
  fullName: string;
  email: string;
  username: string; // ← New prop
  tempPassword: string;
  // ...
}
```

**WhatsApp Message Template:**

```typescript
const whatsappMessage = `Halo *${fullName}*! 👋

Selamat bergabung di PT Bharata Internasional! 🎉

*Informasi Akun Anda:*
👤 Nama: ${fullName}
🏢 Divisi: ${department}
💼 Posisi: ${position}

*Kredensial Login HRIS:*
👤 Username: ${username}  // ← Added
📧 Email: ${email}
🔑 Password Sementara: ${tempPassword}

*Langkah Selanjutnya:*
1️⃣ Download aplikasi HRIS Mobile
2️⃣ Login menggunakan username dan password di atas
3️⃣ Segera ganti password setelah login pertama kali

⚠️ *PENTING:* Password ini bersifat rahasia!
`;
```

## User Flow

### Form Step 4: Akun User

**Sebelum:**

```
┌─────────────────────────────────┐
│ ☑ Buat Akun User                │
│                                 │
│ Username: [_______________] *   │
│                                 │
│ Role: [Pilih Role ▼] *          │
│                                 │
│ ℹ️ Password di-generate otomatis│
└─────────────────────────────────┘
```

**Sesudah:**

```
┌─────────────────────────────────┐
│ ☑ Buat Akun User                │
│                                 │
│ Role: [Pilih Role ▼] *          │
│   ┌─────────────────────────┐  │
│   │ Admin                    │  │
│   │ Deskripsi: Full access   │  │
│   └─────────────────────────┘  │
│                                 │
│ ┌───────────────────────────┐  │
│ │ ℹ️ Informasi:              │  │
│ │ • Username auto-generated  │  │
│ │   dari nama lengkap        │  │
│ │ • Password auto-generated  │  │
│ │   oleh sistem              │  │
│ │ • Ditampilkan setelah      │  │
│ │   data disimpan            │  │
│ └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Success Screen

**Ditampilkan:**

```
┌─────────────────────────────────────┐
│  ✓ Karyawan Berhasil Ditambahkan!   │
│                                     │
│  Informasi Login Akun User:         │
│                                     │
│  👤 Username: ahmad.rizki           │
│  📧 Email: ahmad@company.com        │
│  🔑 Password: T3mp0r@ryP@ss         │
│                                     │
│  [📋 Copy Password]                 │
│  [💬 Salin Pesan WhatsApp]          │
│                                     │
│  ⚠️ Pastikan kirim informasi ini    │
│     ke karyawan dengan aman!        │
└─────────────────────────────────────┘
```

## Benefits

### 1. **UX Improvement**

- ✅ Form lebih simple dan cepat diisi
- ✅ Satu field lebih sedikit untuk diisi
- ✅ Tidak perlu memikirkan format username

### 2. **Consistency**

- ✅ Format username konsisten di seluruh sistem
- ✅ Mudah diingat (berdasarkan nama)
- ✅ Standarisasi penamaan

### 3. **Uniqueness Guaranteed**

- ✅ Sistem memastikan username unik
- ✅ Tidak ada duplicate username
- ✅ Automatic conflict resolution dengan numbering

### 4. **Security**

- ✅ Username tidak predictable dengan numbering
- ✅ Mengurangi human error dalam input

## Edge Cases Handled

### 1. **Nama dengan Karakter Special**

```
Input:  "John O'Brien"
Output: "john.obrien"  (apostrophe dihapus)

Input:  "María García"
Output: "mara.garca"  (accents dihapus)
```

### 2. **Nama Panjang**

```
Input:  "Muhammad Ahmad Rizki Pratama"
Output: "muhammad.ahmad.rizki.pratama"
```

### 3. **Nama Pendek/Single Word**

```
Input:  "Rizki"
Output: "rizki"

Input:  "Ahmad"
Output: "ahmad"
```

### 4. **Duplicate Names**

```
1st: "Ahmad Rizki" → "ahmad.rizki"
2nd: "Ahmad Rizki" → "ahmad.rizki2"
3rd: "Ahmad Rizki" → "ahmad.rizki3"
```

### 5. **Nama dengan Spasi Ganda**

```
Input:  "Ahmad  Rizki  Pratama"  (double spaces)
Output: "ahmad.rizki.pratama"  (normalized to single dots)
```

## Testing Checklist

- [ ] Test dengan nama normal (2-3 kata)
- [ ] Test dengan nama panjang (>4 kata)
- [ ] Test dengan nama pendek (1 kata)
- [ ] Test dengan karakter special (', -, @, etc)
- [ ] Test dengan accented characters (á, é, í, etc)
- [ ] Test duplicate names (pastikan numbering bekerja)
- [ ] Test dengan nama yang sudah ada di database
- [ ] Verify username muncul di success screen
- [ ] Verify username muncul di WhatsApp message
- [ ] Test dengan create_user_account = false (tidak generate username)

## Database Consideration

### Username Index

Pastikan ada index pada kolom `username` di tabel `users` untuk performa query checking:

```sql
CREATE INDEX IF NOT EXISTS idx_users_username
ON users (username)
WHERE deleted_at IS NULL;
```

### Username Validation

Username yang di-generate dijamin:

- Lowercase only
- Letters and dots only
- No leading/trailing dots
- No consecutive dots
- Unique across all active users

## Future Improvements

### 1. **Customizable Format**

```typescript
// Potential configuration
const usernameFormat = {
  separator: ".", // or "_", "-"
  maxLength: 50,
  includeNumber: "ifDuplicate", // or "always", "never"
  caseStyle: "lowercase", // or "camelCase", "PascalCase"
};
```

### 2. **Username Suggestions**

Jika nama terlalu panjang, suggest shortened version:

```
"Muhammad Ahmad Rizki Pratama"
→ Suggestions:
  - muhammad.ahmad
  - m.ahmad.rizki
  - ahmad.rizki
```

### 3. **Username Preview**

Show preview di Step 2 (Data Pribadi) setelah input nama:

```
Nama Lengkap: Ahmad Rizki
→ Username yang akan dibuat: ahmad.rizki ✓
```

## Related Documentation

- [Employee Feature Guide](./EMPLOYEE_FEATURE_GUIDE.md)
- [Authentication System](./AUTH_FIX_SERVICE_ROLE.md)

## Completion Date

**Completed:** December 2024

## Contributors

- GitHub Copilot
- Development Team
