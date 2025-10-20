# Location Actions - Server Actions Documentation

Server actions untuk mengelola Lokasi dan WiFi di HRIS Bharata Dashboard.

## 📁 File Location

```
lib/actions/locationActions.ts
```

## 🎯 Functions

### 1. **upsertLocation(formData: FormData)**

Insert atau update data lokasi.

#### Parameters:

- `formData` - FormData containing:
  - `id` (optional) - Location ID untuk update
  - `name` (required) - Nama lokasi
  - `address` (required) - Alamat lengkap
  - `latitude` (required) - Koordinat latitude (-90 to 90)
  - `longitude` (required) - Koordinat longitude (-180 to 180)
  - `radius_meter` (required) - Radius dalam meter (> 0)

#### Returns:

```typescript
{
  success: boolean;
  data?: Location;
  message?: string;
  error?: string;
}
```

#### Validations:

- ✅ Name & address tidak boleh kosong
- ✅ Latitude harus antara -90 dan 90
- ✅ Longitude harus antara -180 dan 180
- ✅ Radius harus lebih besar dari 0
- ✅ Semua numeric fields harus berupa angka

#### Usage Example:

```typescript
const formData = new FormData();
formData.append("name", "Kantor Pusat");
formData.append("address", "Jl. Sudirman No. 1");
formData.append("latitude", "-6.2088");
formData.append("longitude", "106.8456");
formData.append("radius_meter", "100");

const result = await upsertLocation(formData);
if (result.success) {
  toast.success(result.message);
} else {
  toast.error(result.error);
}
```

---

### 2. **deleteLocation(locationId: number)**

Hapus lokasi (dengan validasi WiFi).

#### Parameters:

- `locationId` - ID lokasi yang akan dihapus

#### Returns:

```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

#### Validations:

- ✅ Tidak bisa hapus lokasi yang masih punya WiFi networks
- ✅ User harus hapus semua WiFi terlebih dahulu

#### Usage Example:

```typescript
const result = await deleteLocation(1);
if (result.success) {
  toast.success(result.message);
} else {
  toast.error(result.error);
}
```

---

### 3. **upsertLocationWifi(locationId: number, formData: FormData)**

Insert atau update WiFi network untuk lokasi tertentu.

#### Parameters:

- `locationId` - ID lokasi yang akan ditambahkan WiFi
- `formData` - FormData containing:
  - `id` (optional) - WiFi ID untuk update
  - `ssid_name` (required) - Nama WiFi network
  - `mac_address` (required) - MAC address (format: XX:XX:XX:XX:XX:XX)

#### Returns:

```typescript
{
  success: boolean;
  data?: LocationWifi;
  message?: string;
  error?: string;
}
```

#### Validations:

- ✅ SSID tidak boleh kosong
- ✅ mac_address harus format MAC address (AA:BB:CC:DD:EE:FF)
- ✅ Location ID harus valid (location exists)
- ✅ mac_address tidak boleh duplikat per location
- ✅ mac_address di-convert ke uppercase

#### Usage Example:

```typescript
const formData = new FormData();
formData.append("ssid_name", "WiFi-Office");
formData.append("mac_address", "AA:BB:CC:DD:EE:FF");

const result = await upsertLocationWifi(1, formData);
if (result.success) {
  toast.success(result.message);
} else {
  toast.error(result.error);
}
```

---

### 4. **deleteLocationWifi(wifiId: number)**

Hapus WiFi network.

#### Parameters:

- `wifiId` - ID WiFi yang akan dihapus

#### Returns:

```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

#### Usage Example:

```typescript
const result = await deleteLocationWifi(1);
if (result.success) {
  toast.success(result.message);
} else {
  toast.error(result.error);
}
```

---

### 5. **getLocations()**

Ambil semua lokasi dengan WiFi networks.

#### Returns:

```typescript
{
  success: boolean;
  data?: Array<{
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_meter: number;
    created_at: string;
    updated_at: string;
    location_wifi: Array<{
      id: number;
      location_id: number;
      ssid_name: string;
      mac_address: string;
    }>;
  }>;
  error?: string;
}
```

#### Usage Example:

```typescript
const result = await getLocations();
if (result.success) {
  const locations = result.data;
  // Display locations
} else {
  toast.error(result.error);
}
```

---

### 6. **getLocationById(locationId: number)**

Ambil detail lokasi by ID dengan WiFi networks.

#### Parameters:

- `locationId` - ID lokasi

#### Returns:

```typescript
{
  success: boolean;
  data?: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_meter: number;
    created_at: string;
    updated_at: string;
    location_wifi: Array<{
      id: number;
      location_id: number;
      ssid_name: string;
      mac_address: string;
    }>;
  };
  error?: string;
}
```

#### Usage Example:

```typescript
const result = await getLocationById(1);
if (result.success) {
  const location = result.data;
  // Display location detail
} else {
  toast.error(result.error);
}
```

---

## 🔒 Security Features

1. ✅ **Input Validation** - All inputs validated before database operation
2. ✅ **Error Handling** - Try-catch blocks on all functions
3. ✅ **Type Safety** - TypeScript interfaces for all data structures
4. ✅ **SQL Injection Protection** - Using Supabase prepared statements
5. ✅ **Cascade Protection** - Cannot delete location with WiFi networks

---

## 🔄 Cache Revalidation

All mutation functions (upsert, delete) automatically revalidate:

```typescript
revalidatePath("/dashboard/settings/locations");
```

This ensures UI stays in sync after data changes.

---

## 📊 Database Schema

### Table: `locations`

```sql
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meter INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `location_wifi`

```sql
CREATE TABLE location_wifi (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(id),
  ssid_name VARCHAR(255) NOT NULL,
  mac_address VARCHAR(17) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(location_id, mac_address)
);
```

---

## 🧪 Testing

### Test Location Creation:

```typescript
// 1. Valid location
const result = await upsertLocation(validFormData);
expect(result.success).toBe(true);

// 2. Invalid latitude
formData.set("latitude", "100"); // > 90
const result = await upsertLocation(formData);
expect(result.success).toBe(false);
expect(result.error).toContain("Latitude");

// 3. Missing required field
formData.delete("name");
const result = await upsertLocation(formData);
expect(result.success).toBe(false);
```

### Test WiFi Creation:

```typescript
// 1. Valid WiFi
const result = await upsertLocationWifi(1, validFormData);
expect(result.success).toBe(true);

// 2. Invalid mac_address format
formData.set("mac_address", "invalid");
const result = await upsertLocationWifi(1, formData);
expect(result.success).toBe(false);

// 3. Duplicate mac_address
const result = await upsertLocationWifi(1, duplicateFormData);
expect(result.success).toBe(false);
expect(result.error).toContain("sudah terdaftar");
```

---

## 💡 Best Practices

1. **Always validate on client side first** - Reduce unnecessary server calls
2. **Use toast notifications** - Provide user feedback
3. **Handle loading states** - Show loading indicator during API calls
4. **Refresh data after mutations** - Call getLocations() after upsert/delete
5. **Confirm before delete** - Use DeleteConfirmDialog component

---

## 🚨 Error Handling

All functions return consistent error format:

```typescript
{
  success: false,
  error: "Error message in Indonesian"
}
```

Common error messages:

- "Nama lokasi wajib diisi"
- "Latitude harus antara -90 dan 90"
- "Longitude harus antara -180 dan 180"
- "Radius harus lebih besar dari 0"
- "Format mac_address tidak valid (contoh: AA:BB:CC:DD:EE:FF)"
- "mac_address sudah terdaftar untuk lokasi ini"
- "Tidak dapat menghapus lokasi yang masih memiliki jaringan WiFi"

---

## 📝 Usage in Components

### Location Form Component:

```tsx
"use client";

import { upsertLocation } from "@/lib/actions/locationActions";
import { useState } from "react";
import toast from "react-hot-toast";

export function LocationForm({ location }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    if (location?.id) {
      formData.append("id", location.id.toString());
    }

    const result = await upsertLocation(formData);

    if (result.success) {
      toast.success(result.message);
      // Close dialog or reset form
    } else {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="address" required />
      <input name="latitude" type="number" step="0.000001" required />
      <input name="longitude" type="number" step="0.000001" required />
      <input name="radius_meter" type="number" required />
      <button disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
```

---

## 🔗 Related Files

- `lib/actions/locationActions.ts` - Server actions (this file)
- `app/dashboard/settings/locations/page.tsx` - Locations list page
- `components/settings/LocationDialog.tsx` - Location form dialog
- `components/settings/LocationWifiDialog.tsx` - WiFi form dialog

---

**Created:** October 20, 2025  
**Author:** HRIS Development Team
