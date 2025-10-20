# Location Schema Design - No Address Field

## Design Decision

Kolom `address` **tidak ditambahkan** ke tabel `locations` karena informasi alamat sudah tersedia di tabel `companies` yang terhubung melalui `company_id`.

## Rationale

### 1. **Data Normalization**

- Menghindari duplikasi data
- Satu perusahaan memiliki satu alamat resmi
- Lokasi hanya mendefinisikan titik geografis spesifik dalam area perusahaan

### 2. **Data Consistency**

- Perubahan alamat perusahaan otomatis berlaku untuk semua lokasi
- Tidak ada risiko data alamat yang berbeda-beda untuk satu perusahaan
- Single source of truth untuk informasi alamat

### 3. **Use Case Reality**

Lokasi kantor biasanya adalah:

- Gedung/lantai spesifik di alamat perusahaan
- Area dalam kompleks perusahaan
- Cabang dengan alamat berbeda (tetap masuk sebagai company berbeda)

## Database Schema

### Current Schema

```sql
-- Tabel companies (sudah ada address)
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  address TEXT,  -- ✅ Alamat ada di sini
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel locations (TIDAK ada address)
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id),
  name VARCHAR(100) NOT NULL,  -- Nama lokasi spesifik
  latitude DECIMAL(10,6) NOT NULL,
  longitude DECIMAL(10,6) NOT NULL,
  radius_meter INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Code Implementation

### TypeScript Interface

```typescript
// ✅ Tidak ada field address
interface Location {
  id: number;
  company_id: number;
  name: string; // e.g., "Lantai 5 - Engineering", "Warehouse A"
  latitude: number;
  longitude: number;
  radius_meter: number;
}

interface Company {
  id: number;
  name: string;
  code: string;
  address: string; // ✅ Address ada di sini
}
```

### Server Action

```typescript
interface LocationFormData {
  id?: number;
  company_id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  // ❌ NO address field
}

export async function upsertLocation(formData: FormData) {
  const name = formData.get("name")?.toString();
  // ❌ NO address extraction

  const locationData: Partial<LocationFormData> = {
    name: name.trim(),
    latitude,
    longitude,
    radius_meter: radiusMeter,
    // ❌ NO address field
  };
}
```

### Form Dialog

```typescript
const [formData, setFormData] = useState({
  company_id: "",
  name: "",
  latitude: "",
  longitude: "",
  radius_meter: "100",
  // ❌ NO address field
});
```

**Form Fields:**

- ✅ Company selector (required for new locations)
- ✅ Location name (e.g., "Main Building", "Parking Lot B")
- ✅ GPS coordinates (latitude, longitude)
- ✅ Radius in meters
- ❌ No address input field

## Data Display

### Getting Location with Company Info

```typescript
const { data, error } = await supabase
  .from("locations")
  .select(
    `
    *,
    companies (
      id,
      name,
      code,
      address  -- ✅ Address dari join
    ),
    location_wifi (*)
  `
  )
  .order("name", { ascending: true });
```

### Table Display

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nama Lokasi</TableHead>
      <TableHead>Perusahaan</TableHead>
      <TableHead>Koordinat</TableHead>
      {/* ❌ NO Alamat column */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {locations.map((location) => (
      <TableRow key={location.id}>
        <TableCell>{location.name}</TableCell>
        <TableCell>
          {location.companies?.name} ({location.companies?.code})
          {/* Address accessible via location.companies?.address if needed */}
        </TableCell>
        <TableCell>
          {location.latitude}, {location.longitude}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Use Cases

### Example 1: Single Office Building

**Company:**

- Name: "PT Bharata Tech"
- Address: "Jl. Sudirman No. 123, Jakarta"

**Locations:**

1. "Lantai 3 - IT Department" → Lat/Long untuk lantai 3
2. "Lantai 5 - HR Department" → Lat/Long untuk lantai 5
3. "Parkir Basement" → Lat/Long area parkir

Semua lokasi menggunakan alamat perusahaan yang sama.

### Example 2: Company with Multiple Buildings

**Company:**

- Name: "PT Bharata Manufacturing"
- Address: "Kawasan Industri Cikarang"

**Locations:**

1. "Factory Building A" → Lat/Long gedung A
2. "Factory Building B" → Lat/Long gedung B
3. "Warehouse" → Lat/Long gudang
4. "Office Tower" → Lat/Long kantor

Semua di kawasan yang sama, alamat perusahaan mencakup semua area.

### Example 3: Multiple Branches (Different Address)

Untuk cabang dengan alamat berbeda, buat **company** terpisah:

**Company 1:**

- Name: "PT Bharata - Jakarta"
- Address: "Jl. Sudirman, Jakarta"
- Locations: Office A, Office B

**Company 2:**

- Name: "PT Bharata - Bandung"
- Address: "Jl. Asia Afrika, Bandung"
- Locations: Office Bandung, Warehouse Bandung

## Benefits

### 1. **Simplified Data Entry**

- User hanya input nama lokasi dan GPS
- Tidak perlu input alamat berulang-ulang
- Fokus pada positioning, bukan alamat

### 2. **Cleaner Database**

- No data duplication
- Smaller table size
- Better data integrity

### 3. **Easier Updates**

- Update alamat perusahaan → semua lokasi otomatis update
- No need to sync address across multiple locations
- Consistent company information

### 4. **Better UX**

- Form lebih simpel
- Lebih cepat untuk tambah lokasi baru
- User tidak bingung antara alamat perusahaan vs alamat lokasi

## Migration Impact

### What Changed

❌ **Removed:**

- `address` column dari migration script
- `address` field dari LocationFormData interface
- `address` validation di server action
- `address` input field dari form dialog
- `address` column dari table display

✅ **Kept:**

- `company_id` relationship (PENTING!)
- Join dengan `companies` table untuk akses alamat
- Semua data perusahaan termasuk address tetap accessible

### Migration Script

```sql
-- ❌ TIDAK menambahkan address ke locations
-- ✅ Hanya rename location_wifi columns

ALTER TABLE location_wifi
RENAME COLUMN ssid_name TO ssid_name;

ALTER TABLE location_wifi
RENAME COLUMN mac_address TO mac_address;

-- Add timestamps
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE location_wifi
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_locations_company_id ON locations(company_id);
CREATE INDEX IF NOT EXISTS idx_location_wifi_location_id ON location_wifi(location_id);

-- Add unique constraint
ALTER TABLE location_wifi
ADD CONSTRAINT IF NOT EXISTS unique_location_bssid UNIQUE(location_id, mac_address);
```

## How to Access Address

### Option 1: Through Join (Recommended)

```typescript
const locations = await supabase.from("locations").select(`
    *,
    companies (
      name,
      code,
      address  -- ✅ Get address here
    )
  `);

// Usage
locations.forEach((location) => {
  console.log(`Location: ${location.name}`);
  console.log(`Company: ${location.companies.name}`);
  console.log(`Address: ${location.companies.address}`); // ✅
});
```

### Option 2: Separate Query (If Needed)

```typescript
// Get location first
const location = await getLocationById(locationId);

// Get company with address
const company = await supabase
  .from("companies")
  .select("*")
  .eq("id", location.company_id)
  .single();

console.log(`Address: ${company.address}`);
```

## UI Display Suggestions

### Detail View (If Needed)

```tsx
<Card>
  <CardHeader>
    <CardTitle>{location.name}</CardTitle>
    <CardDescription>
      {location.companies?.name} ({location.companies?.code})
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div>
        <span className="font-semibold">Alamat Perusahaan:</span>
        <p>{location.companies?.address}</p>
      </div>
      <div>
        <span className="font-semibold">Koordinat GPS:</span>
        <p>
          {location.latitude}, {location.longitude}
        </p>
      </div>
      <div>
        <span className="font-semibold">Radius:</span>
        <p>{location.radius_meter} meter</p>
      </div>
    </div>
  </CardContent>
</Card>
```

## FAQ

### Q: Bagaimana jika lokasi memiliki alamat berbeda dari perusahaan?

**A:** Buat company baru untuk lokasi tersebut. Ini masuk akal karena:

- Cabang dengan alamat berbeda = entity bisnis terpisah
- Memerlukan data payroll, tax, dll berbeda
- Better untuk compliance dan reporting

### Q: Bagaimana jika butuh detail alamat spesifik untuk lokasi?

**A:** Gunakan field `name` untuk detail spesifik:

- ✅ "Gedung A - Lantai 5"
- ✅ "Parking Lot B - Gate 2"
- ✅ "Warehouse 3 - Receiving Area"

### Q: Apakah bisa menambahkan field address nanti?

**A:** Bisa, tapi TIDAK DISARANKAN karena:

- ❌ Data duplication
- ❌ Consistency issues
- ❌ Maintenance burden

Lebih baik tetap gunakan alamat dari `companies`.

### Q: Bagaimana untuk geofencing?

**A:** GPS coordinates sudah cukup:

- ✅ Latitude/Longitude untuk titik center
- ✅ Radius_meter untuk area coverage
- ✅ WiFi mac_address untuk indoor location
- ❌ Address TIDAK diperlukan untuk geofencing

## Summary

| Aspect        | Decision                   | Reason                       |
| ------------- | -------------------------- | ---------------------------- |
| Address Field | ❌ NOT in locations table  | Available in companies table |
| Data Location | ✅ companies.address       | Single source of truth       |
| Access Method | ✅ Via JOIN                | Efficient and normalized     |
| Form Input    | ❌ No address field        | Simpler UX                   |
| Display       | ✅ Optional via join       | Available when needed        |
| Migration     | ❌ No address column added | Keep it clean                |

## Related Files

- **Migration:** `migrations/update_locations_schema.sql`
- **Server Actions:** `lib/actions/locationActions.ts`
- **Form Dialog:** `components/locations/LocationDialog.tsx`
- **Page:** `app/dashboard/locations/page.tsx`
- **Documentation:** `docs/LOCATION_COMPANY_INTEGRATION.md`

## Conclusion

Desain tanpa field `address` di tabel `locations` adalah keputusan yang tepat karena:

1. ✅ **Normalized** - No data duplication
2. ✅ **Consistent** - Single source of truth
3. ✅ **Simple** - Easier to maintain
4. ✅ **Efficient** - Smaller database
5. ✅ **Flexible** - Easy to access via JOIN when needed

Field `name` di `locations` sudah cukup untuk identifikasi lokasi spesifik, sementara alamat lengkap tetap tersedia melalui relasi dengan `companies`.
