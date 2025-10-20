# 🚀 Run Database Migration

## Error Yang Terjadi

```
Error creating WiFi: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'mac_address' column of 'location_wifi' in the schema cache"
}
```

**Root Cause**: Database belum di-migrate. Kolom masih bernama `mac_address`, tapi aplikasi mencari kolom `mac_address`.

---

## ✅ Solusi: Jalankan Migration

### Step 1: Buka Supabase Dashboard

1. Pergi ke [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Login dengan akun Anda
3. Pilih project HRIS Anda

### Step 2: Buka SQL Editor

1. Di sidebar kiri, klik **SQL Editor**
2. Atau langsung ke: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql`

### Step 3: Jalankan Migration Script

1. Klik tombol **New Query** (atau tekan Ctrl+Enter)
2. Copy-paste script berikut:

```sql
-- Update location_wifi column names to match the application
-- Change ssid_name to ssid_name and mac_address to mac_address for consistency

ALTER TABLE location_wifi
RENAME COLUMN ssid_name TO ssid_name;

ALTER TABLE location_wifi
RENAME COLUMN mac_address TO mac_address;

-- Add updated_at column to locations table (if not exists)
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at column to location_wifi table (if not exists)
ALTER TABLE location_wifi
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on company_id for better query performance
CREATE INDEX IF NOT EXISTS idx_locations_company_id ON locations(company_id);

-- Create index on location_id for better query performance
CREATE INDEX IF NOT EXISTS idx_location_wifi_location_id ON location_wifi(location_id);

-- Add unique constraint to prevent duplicate mac_address per location
ALTER TABLE location_wifi
ADD CONSTRAINT IF NOT EXISTS unique_location_bssid UNIQUE(location_id, mac_address);
```

3. Klik tombol **Run** (atau tekan Ctrl+Enter)
4. Tunggu sampai muncul "Success. No rows returned"

### Step 4: Verify Migration

Jalankan query berikut untuk memastikan kolom sudah ter-rename:

```sql
-- Check location_wifi columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'location_wifi'
ORDER BY ordinal_position;
```

**Expected Output:**

| column_name | data_type                |
| ----------- | ------------------------ |
| id          | uuid                     |
| location_id | uuid                     |
| ssid_name   | text                     |
| mac_address | text                     |
| created_at  | timestamp with time zone |
| updated_at  | timestamp with time zone |

✅ Jika Anda melihat kolom `ssid_name` dan `mac_address` (bukan `ssid_name` dan `mac_address`), migration berhasil!

### Step 5: Test di Aplikasi

1. Refresh aplikasi Anda (F5)
2. Pergi ke halaman **Locations**
3. Pilih/buat location
4. Coba tambah WiFi network
5. Seharusnya tidak ada error lagi! ✅

---

## 🔍 Troubleshooting

### Error: "column ssid_name does not exist"

**Artinya**: Kolom sudah pernah di-rename sebelumnya.

**Solusi**: Skip migration, kolom sudah benar. Cek dengan query verify di atas.

### Error: "constraint unique_location_bssid already exists"

**Artinya**: Constraint sudah pernah dibuat.

**Solusi**: Normal, skip error ini. Query menggunakan `IF NOT EXISTS` jadi aman.

### Error: "permission denied for table location_wifi"

**Artinya**: User Supabase tidak punya permission.

**Solusi**:

1. Pastikan Anda login sebagai **admin/owner** project
2. Atau jalankan migration dari **service_role** key

### WiFi Masih Error Setelah Migration

**Solusi**:

1. **Clear Cache**: Tutup semua tab aplikasi, buka lagi
2. **Restart Dev Server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Check RLS Policy**: Pastikan policy `location_wifi` allow insert/update/delete

---

## 📝 What This Migration Does

### 1. **Column Rename**

```sql
ssid_name → ssid_name
mac_address → mac_address
```

**Kenapa?** Aplikasi menggunakan nama kolom `ssid_name` dan `mac_address` (standar WiFi terminology).

### 2. **Add Timestamps**

```sql
updated_at TIMESTAMPTZ
```

**Kenapa?** Track kapan data terakhir diubah, penting untuk audit.

### 3. **Add Indexes**

```sql
idx_locations_company_id
idx_location_wifi_location_id
```

**Kenapa?** Performance optimization untuk JOIN queries.

### 4. **Add Unique Constraint**

```sql
UNIQUE(location_id, mac_address)
```

**Kenapa?** Prevent duplicate WiFi mac_address di location yang sama.

---

## 🎯 Post-Migration Checklist

- [ ] Migration script berhasil dijalankan tanpa error
- [ ] Verify query menunjukkan kolom `ssid_name` dan `mac_address` exist
- [ ] Aplikasi bisa tambah WiFi network tanpa error
- [ ] Aplikasi bisa edit WiFi network
- [ ] Aplikasi bisa delete WiFi network
- [ ] WiFi list tampil dengan benar di table

---

## 📚 Related Documentation

- [Location Actions Guide](./LOCATION_ACTIONS_GUIDE.md) - Server actions yang menggunakan `mac_address`
- [Location Feature Implementation](./LOCATION_FEATURE_IMPLEMENTATION.md) - UI implementation
- [Location Schema Design](./LOCATION_NO_ADDRESS_FIELD.md) - Schema design decisions

---

## 🆘 Need Help?

Jika masih ada masalah setelah migration:

1. **Check Error**: Baca error message di console (F12)
2. **Check Network**: Tab Network → Filter XHR → Lihat response error
3. **Check Database**: Query langsung `SELECT * FROM location_wifi LIMIT 5`
4. **Check RLS**: Pastikan Row Level Security policies benar

Setelah migration selesai, aplikasi akan berfungsi normal! 🎉
