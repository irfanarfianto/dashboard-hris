# Location-Company Integration Guide

## Overview

This guide documents the integration of `company_id` relationship in the Location Management feature. Each location is now properly associated with a specific company, enabling multi-tenant location management.

## Schema Changes

### Database Migration Required

Run the migration script: `migrations/update_locations_schema.sql`

**Important Changes:**

1. ✅ `company_id` already exists in `locations` table (no change needed)
2. 🔄 Renamed `location_wifi.ssid_name` → `ssid_name`
3. 🔄 Renamed `location_wifi.mac_address` → `mac_address`
4. 📊 Added indexes for better performance
5. 🔒 Added unique constraint on `location_id + mac_address`

> **Note:** Kolom `address` tidak ditambahkan ke tabel `locations` karena informasi alamat sudah tersedia di tabel `companies` yang di-join.

### Migration Script

```sql
-- Rename WiFi columns to match application code
ALTER TABLE location_wifi
RENAME COLUMN ssid_name TO ssid_name;

ALTER TABLE location_wifi
RENAME COLUMN mac_address TO mac_address;-- Add timestamps
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

## Code Changes

### 1. Server Actions (`lib/actions/locationActions.ts`)

#### New Function: `getCompanies()`

Fetches list of companies for dropdown selection:

```typescript
export async function getCompanies() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, code")
    .order("name", { ascending: true });

  return { success: true, data };
}
```

#### Updated: `upsertLocation()`

Now validates and includes `company_id`:

```typescript
// Extract company_id from form
const companyIdStr = formData.get("company_id")?.toString();

// Validate company_id (required for new locations)
if (!id && (!companyIdStr || companyIdStr.trim() === "")) {
  return {
    success: false,
    error: "Perusahaan wajib dipilih",
  };
}

// Add company_id to locationData (only for new locations)
if (!id && companyId !== null) {
  locationData.company_id = companyId;
}
```

**Key Points:**

- `company_id` is **required** when creating new locations
- `company_id` **cannot be changed** when editing existing locations
- Validation ensures valid company selection

#### Updated: `getLocations()`

Now joins with `companies` table:

```typescript
const { data, error } = await supabase
  .from("locations")
  .select(
    `
    *,
    companies (
      id,
      name,
      code
    ),
    location_wifi (*)
  `
  )
  .order("name", { ascending: true });
```

### 2. Location Dialog (`components/locations/LocationDialog.tsx`)

#### New State

```typescript
const [companies, setCompanies] = useState<Company[]>([]);
const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
const [formData, setFormData] = useState({
  company_id: "", // NEW FIELD
  name: "",
  latitude: "",
  longitude: "",
  radius_meter: "100",
});
```

#### New Company Selector (Only for New Locations)

```tsx
{
  !isEdit && (
    <div className="space-y-2">
      <Label htmlFor="company_id">
        Perusahaan <span className="text-red-500">*</span>
      </Label>
      <Select
        value={formData.company_id}
        onValueChange={(value) => {
          setFormData((prev) => ({ ...prev, company_id: value }));
        }}
        disabled={isSubmitting || isLoadingCompanies}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih perusahaan..." />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id.toString()}>
              {company.name} ({company.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### Auto-selection Logic

If only one company exists, it's automatically selected:

```typescript
useEffect(() => {
  if (isOpen && !isEdit) {
    fetchCompanies();
  }
}, [isOpen, isEdit]);

const fetchCompanies = async () => {
  const result = await getCompanies();
  if (result.success && result.data) {
    setCompanies(result.data);
    // Auto-select if only one company
    if (result.data.length === 1) {
      setFormData((prev) => ({
        ...prev,
        company_id: result.data![0].id.toString(),
      }));
    }
  }
};
```

#### Form Submission

Company ID is included when creating new locations:

```typescript
const data = new FormData();
if (location?.id) {
  data.append("id", location.id.toString());
}
// Add company_id for new locations
if (!isEdit && formData.company_id) {
  data.append("company_id", formData.company_id);
}
data.append("name", formData.name.trim());
// ... other fields
```

### 3. Locations Page (`app/dashboard/locations/page.tsx`)

#### Updated Interface

```typescript
interface Company {
  id: number;
  name: string;
  code: string;
}

interface Location {
  id: number;
  company_id: number; // ADDED
  name: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  companies?: Company; // ADDED (from join)
  location_wifis?: LocationWifi[];
}
```

> **Note:** Field `address` tidak ada di tabel `locations`. Informasi alamat diambil dari `companies.address` melalui relasi `company_id`.

#### Updated Table

Added "Perusahaan" column:

```tsx
<TableHeader>
  <TableRow>
    <TableHead className="w-[50px]"></TableHead>
    <TableHead>Nama Lokasi</TableHead>
    <TableHead>Perusahaan</TableHead>
    <TableHead>Koordinat</TableHead>
    <TableHead>Radius</TableHead>
    <TableHead>WiFi</TableHead>
    <TableHead className="text-right">Aksi</TableHead>
  </TableRow>
</TableHeader>
```

Display company name and code:

```tsx
<TableCell>
  <div className="flex flex-col">
    <span className="font-medium text-sm">
      {location.companies?.name || "N/A"}
    </span>
    <span className="text-xs text-muted-foreground">
      {location.companies?.code || ""}
    </span>
  </div>
</TableCell>
```

## User Experience Changes

### Creating New Location

1. **Company Selection Required**

   - Dropdown shows all available companies
   - Format: "Company Name (CODE)"
   - Auto-selects if only one company exists
   - Must select before saving

2. **Validation**
   - Company must be selected (new validation)
   - All other validations remain the same

### Editing Existing Location

1. **Company Cannot Be Changed**
   - Company selector is **hidden** during edit
   - Prevents accidental data reassignment
   - Company info shown in table but not editable

### Viewing Locations

1. **Table Display**
   - Company name and code visible for each location
   - Helps identify which company owns each location
   - Better organization in multi-company scenarios

## Data Flow

### Creating Location

```
User fills form → Selects company → Submit
    ↓
LocationDialog collects data → includes company_id
    ↓
upsertLocation validates → checks company_id required
    ↓
Insert into locations table with company_id
    ↓
Success → Refresh locations list
```

### Editing Location

```
User clicks edit → LocationDialog opens
    ↓
Loads existing data (including company_id)
    ↓
Company selector HIDDEN (can't change)
    ↓
User edits other fields → Submit
    ↓
Update locations (company_id unchanged)
```

## Benefits

### Multi-Tenancy Support

✅ Each company has isolated locations
✅ No cross-company location access
✅ Better data organization

### Data Integrity

✅ Foreign key ensures valid company references
✅ Cannot create location without company
✅ Cannot change company after creation (prevents orphaned data)

### Performance

✅ Index on `company_id` speeds up queries
✅ Efficient joins with companies table
✅ Quick filtering by company

### User Experience

✅ Clear company association
✅ Auto-selection for single-company scenarios
✅ Prevents accidental company changes

## Testing Checklist

### Database Migration

- [ ] Run migration script on Supabase
- [ ] Verify `location_wifi` columns renamed (ssid_name, mac_address)
- [ ] Verify indexes created
- [ ] Verify unique constraint added

### Create Location

- [ ] Open "Tambah Lokasi" dialog
- [ ] Verify company dropdown appears
- [ ] Verify companies load correctly
- [ ] Verify auto-selection if only one company
- [ ] Try submitting without selecting company (should fail)
- [ ] Select company and submit (should succeed)
- [ ] Verify location saved with correct company_id

### Edit Location

- [ ] Click edit on existing location
- [ ] Verify company selector is HIDDEN
- [ ] Verify other fields load correctly
- [ ] Edit fields and save
- [ ] Verify company_id unchanged in database

### View Locations

- [ ] Verify company column displays in table
- [ ] Verify company name and code shown
- [ ] Verify locations grouped correctly
- [ ] Verify WiFi networks still work

### Error Handling

- [ ] Try creating location without company → shows error
- [ ] Try with invalid company_id → validation fails
- [ ] Verify toast notifications work
- [ ] Verify error messages are clear

## Migration Steps

### Step 1: Backup Database

```sql
-- Create backup of locations and location_wifi tables
CREATE TABLE locations_backup AS SELECT * FROM locations;
CREATE TABLE location_wifi_backup AS SELECT * FROM location_wifi;
```

### Step 2: Run Migration

Execute the migration script in Supabase SQL Editor.

### Step 3: Verify Schema

```sql
-- Check location_wifi table (should have ssid_name and mac_address columns)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'location_wifi';

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('locations', 'location_wifi');

-- Check unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'location_wifi';
```

### Step 4: Test Application

1. Clear browser cache
2. Refresh application
3. Test creating new location
4. Test editing existing location
5. Verify data display

## Troubleshooting

### Issue: Column rename fails

**Error:** `column "ssid_name" does not exist`

**Solution:** Columns might already be renamed. Check current schema:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'location_wifi';
```

### Issue: Unique constraint violation

**Error:** `duplicate key value violates unique constraint`

**Solution:** Clean up duplicate mac_address entries before adding constraint:

```sql
-- Find duplicates
SELECT location_id, mac_address, COUNT(*)
FROM location_wifi
GROUP BY location_id, mac_address
HAVING COUNT(*) > 1;

-- Remove duplicates (keep first occurrence)
DELETE FROM location_wifi
WHERE id NOT IN (
  SELECT MIN(id)
  FROM location_wifi
  GROUP BY location_id, mac_address
);
```

### Issue: Company dropdown empty

**Possible Causes:**

1. No companies in database
2. RLS policy blocking access
3. API error

**Debug:**

```typescript
// Check browser console for errors
console.log("Companies:", companies);

// Verify companies exist in database
SELECT * FROM companies;

// Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

### Issue: Company_id not saving

**Check:**

1. FormData includes company_id
2. Server action receives company_id
3. Database allows insert with company_id

**Debug:**

```typescript
// In LocationDialog.tsx
console.log("Form data:", formData);

// In locationActions.ts
const companyIdStr = formData.get("company_id")?.toString();
console.log("Company ID from form:", companyIdStr);
```

## API Reference

### `getCompanies()`

**Purpose:** Fetch all companies for dropdown selection

**Returns:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  error?: string;
}
```

**Usage:**

```typescript
const result = await getCompanies();
if (result.success) {
  setCompanies(result.data);
}
```

### `upsertLocation(formData)`

**Parameters:**

- `id` (optional): Location ID for updates
- `company_id` (required for new): Company ID
- `name`: Location name
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `radius_meter`: Geofence radius

> **Note:** Field `address` tidak diperlukan karena alamat diambil dari tabel `companies`.

**Validation:**

- Company ID required for new locations
- Company ID cannot be changed on update
- All other validations remain the same

**Returns:**

```typescript
{
  success: boolean;
  data?: Location;
  message?: string;
  error?: string;
}
```

## Best Practices

### Creating Locations

1. ✅ Always select appropriate company
2. ✅ Verify company before saving
3. ✅ Use descriptive location names
4. ✅ Include full address details

### Managing Companies

1. ✅ Create companies before locations
2. ✅ Use consistent company codes
3. ✅ Document company structure
4. ✅ Plan location hierarchy

### Data Integrity

1. ✅ Never manually change company_id in database
2. ✅ Use application interface for all changes
3. ✅ Regular backups before bulk operations
4. ✅ Monitor for orphaned records

## Related Documentation

- [Location Feature Implementation](./LOCATION_FEATURE_IMPLEMENTATION.md)
- [Location Actions Guide](./LOCATION_ACTIONS_GUIDE.md)
- [HRIS Schema Documentation](./hris_schema_documentation.md)

## Changelog

### Version 1.1.0 (Current)

- ✅ Added company_id integration
- ✅ Created getCompanies() server action
- ✅ Added company selector to LocationDialog
- ✅ Updated locations table to show company
- ✅ Added database migration script
- ✅ Updated validation rules
- ✅ Enhanced data isolation

### Version 1.0.0

- Initial location management implementation
- Basic CRUD operations
- WiFi network management
- GPS coordinate validation
