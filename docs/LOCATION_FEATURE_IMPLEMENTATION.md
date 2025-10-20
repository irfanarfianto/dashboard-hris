# Location & WiFi Management Feature

## Overview

Fitur manajemen lokasi kantor dan jaringan WiFi untuk sistem geofencing attendance. Memungkinkan admin untuk mengelola lokasi kantor dengan koordinat GPS dan jaringan WiFi yang terdaftar untuk validasi presensi karyawan.

## Features Implemented

### ✅ 1. Location Management

- **CRUD Operations**: Create, Read, Update, Delete locations
- **GPS Coordinates**: Latitude and longitude input with validation
- **Radius Setting**: Define area radius in meters for attendance validation
- **Address Management**: Complete address for each location

### ✅ 2. WiFi Network Management

- **CRUD Operations**: Create, Read, Update, Delete WiFi networks
- **SSID Management**: WiFi network name
- **mac_address Validation**: MAC address format validation with auto-formatting
- **Per-Location WiFi**: Multiple WiFi networks per location

### ✅ 3. User Interface

- **Responsive Table**: Location list with expandable rows
- **Statistics Cards**: Total locations and WiFi networks
- **Expandable WiFi List**: Show/hide WiFi networks per location
- **Action Buttons**: Add, Edit, Delete for both locations and WiFi

### ✅ 4. Validation & UX

- **Client-side Validation**: Form validation before submission
- **Server-side Validation**: Additional validation in server actions
- **Toast Notifications**: Success/error feedback using react-hot-toast
- **Delete Confirmation**: Confirm dialog before deletion
- **Loading States**: Loading indicators during API calls

## File Structure

```
app/dashboard/locations/
├── page.tsx                    # Main locations page (client component)
└── loading.tsx                 # Loading skeleton

components/locations/
├── LocationDialog.tsx          # Add/Edit location form
└── LocationWifiDialog.tsx      # Add/Edit WiFi network form

components/ui/
└── table.tsx                   # Table component (NEW)

lib/actions/
└── locationActions.ts          # Server actions (already exists)
```

## Components

### 1. LocationsPage (`app/dashboard/locations/page.tsx`)

**Type**: Client Component

**Features**:

- List all locations with WiFi count
- Expandable rows to show WiFi networks
- CRUD operations for locations and WiFi
- Statistics cards showing totals
- Delete confirmation dialogs

**State Management**:

```typescript
const [locations, setLocations] = useState<Location[]>([]);
const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
const [locationDialogOpen, setLocationDialogOpen] = useState(false);
const [wifiDialogOpen, setWifiDialogOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleteWifiDialogOpen, setDeleteWifiDialogOpen] = useState(false);
```

**Key Functions**:

- `fetchLocations()` - Fetch all locations with WiFi
- `toggleRow(locationId)` - Expand/collapse WiFi list
- `handleAddLocation()` - Open dialog to add location
- `handleEditLocation(location)` - Open dialog to edit location
- `handleDeleteLocation(location)` - Confirm and delete location
- `handleAddWifi(location)` - Open dialog to add WiFi
- `handleEditWifi(location, wifi)` - Open dialog to edit WiFi
- `handleDeleteWifi(location, wifi)` - Confirm and delete WiFi

### 2. LocationDialog (`components/locations/LocationDialog.tsx`)

**Type**: Client Component

**Props**:

```typescript
interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null; // If editing
  onSuccess: () => void;
}
```

**Form Fields**:

- **Name**: Location name (min 3 characters)
- **Address**: Full address (min 10 characters)
- **Latitude**: GPS coordinate (-90 to 90)
- **Longitude**: GPS coordinate (-180 to 180)
- **Radius**: Area radius in meters (> 0)

**Validation Rules**:

```typescript
- name: min 3 characters
- address: min 10 characters
- latitude: -90 <= value <= 90
- longitude: -180 <= value <= 180
- radius_meter: value > 0
```

**Tips Provided**:

- How to get GPS coordinates from Google Maps
- Step-by-step instructions

### 3. LocationWifiDialog (`components/locations/LocationWifiDialog.tsx`)

**Type**: Client Component

**Props**:

```typescript
interface LocationWifiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: number;
  locationName: string;
  wifi?: LocationWifi | null; // If editing
  onSuccess: () => void;
}
```

**Form Fields**:

- **SSID**: WiFi network name
- **mac_address**: MAC address in format AA:BB:CC:DD:EE:FF

**mac_address Auto-formatting**:

- Automatically adds colons every 2 characters
- Converts to uppercase
- Validates format with regex: `/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/`

**Tips Provided**:

- How to get mac_address on Android, iOS, Windows, and Mac
- Platform-specific instructions

## Server Actions Used

All server actions are from `lib/actions/locationActions.ts`:

### 1. getLocations()

```typescript
const result = await getLocations();
// Returns: { success: boolean, data?: Location[], error?: string }
```

### 2. upsertLocation(formData)

```typescript
const formData = new FormData();
formData.append("id", locationId); // Optional, for update
formData.append("name", "Kantor Pusat");
formData.append("address", "Jl. Sudirman No. 123");
formData.append("latitude", "-6.200000");
formData.append("longitude", "106.816666");
formData.append("radius_meter", "100");

const result = await upsertLocation(formData);
// Returns: { success: boolean, data?: Location, message?: string, error?: string }
```

### 3. deleteLocation(locationId)

```typescript
const result = await deleteLocation(locationId);
// Returns: { success: boolean, message?: string, error?: string }
// Note: Cannot delete if location has WiFi networks
```

### 4. upsertLocationWifi(locationId, formData)

```typescript
const formData = new FormData();
formData.append("id", wifiId); // Optional, for update
formData.append("ssid_name", "Office_WiFi_5G");
formData.append("mac_address", "AA:BB:CC:DD:EE:FF");

const result = await upsertLocationWifi(locationId, formData);
// Returns: { success: boolean, data?: LocationWifi, message?: string, error?: string }
```

### 5. deleteLocationWifi(wifiId)

```typescript
const result = await deleteLocationWifi(wifiId);
// Returns: { success: boolean, message?: string, error?: string }
```

## Database Schema

### locations table

```sql
id              SERIAL PRIMARY KEY
name            VARCHAR NOT NULL
address         TEXT NOT NULL
latitude        DECIMAL(10,8) NOT NULL
longitude       DECIMAL(11,8) NOT NULL
radius_meter    INTEGER NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### location_wifi table

```sql
id              SERIAL PRIMARY KEY
location_id     INTEGER REFERENCES locations(id)
ssid_name            VARCHAR NOT NULL
mac_address           VARCHAR(17) NOT NULL  -- Format: AA:BB:CC:DD:EE:FF
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()

UNIQUE(location_id, mac_address)  -- Prevent duplicate mac_address per location
```

## User Flow

### Adding a Location

1. Click "Tambah Lokasi" button
2. Fill in location details:
   - Name and address
   - GPS coordinates (can get from Google Maps)
   - Radius in meters
3. Click "Tambah Lokasi"
4. Success toast appears
5. Location appears in table

### Adding WiFi to Location

1. Click "+" button in WiFi column for a location
2. Enter SSID (WiFi name)
3. Enter mac_address (auto-formatted as you type)
4. Click "Tambah WiFi"
5. WiFi appears in expanded row

### Editing Location/WiFi

1. Click edit icon (pencil)
2. Form pre-filled with current data
3. Make changes
4. Click "Simpan Perubahan"
5. Success toast appears

### Deleting Location/WiFi

1. Click delete icon (trash)
2. Confirmation dialog appears
3. Confirm deletion
4. Success toast appears
5. Item removed from list

**Note**: Cannot delete location if it has WiFi networks. Delete WiFi networks first.

## Validation Rules

### Location Validation

| Field     | Rule                 | Error Message                         |
| --------- | -------------------- | ------------------------------------- |
| Name      | Min 3 characters     | "Nama lokasi minimal 3 karakter"      |
| Address   | Min 10 characters    | "Alamat minimal 10 karakter"          |
| Latitude  | -90 <= value <= 90   | "Latitude harus antara -90 dan 90"    |
| Longitude | -180 <= value <= 180 | "Longitude harus antara -180 dan 180" |
| Radius    | value > 0            | "Radius harus lebih dari 0"           |

### WiFi Validation

| Field       | Rule                           | Error Message                                               |
| ----------- | ------------------------------ | ----------------------------------------------------------- |
| SSID        | Required                       | "SSID wajib diisi"                                          |
| mac_address | MAC format (XX:XX:XX:XX:XX:XX) | "Format mac_address tidak valid. Contoh: AA:BB:CC:DD:EE:FF" |

## UI Components Used

- **Card**: Statistics and main container
- **Table**: Location list
- **Dialog**: Add/Edit forms
- **Button**: Actions
- **Input**: Form fields
- **Label**: Form labels
- **Badge**: WiFi count and radius display
- **DeleteConfirmDialog**: Deletion confirmation
- **Icons**: MapPin, Wifi, Plus, Edit, Trash2, ChevronDown, ChevronUp

## Toast Notifications

Using `react-hot-toast`:

**Success Messages**:

- "Lokasi berhasil ditambahkan"
- "Lokasi berhasil diperbarui"
- "Lokasi berhasil dihapus"
- "WiFi berhasil ditambahkan"
- "WiFi berhasil diperbarui"
- "WiFi berhasil dihapus"

**Error Messages**:

- "Gagal memuat data lokasi"
- "Gagal menghapus lokasi"
- "Tidak dapat menghapus lokasi yang masih memiliki jaringan WiFi"
- "Terjadi kesalahan saat menyimpan lokasi"
- Server error messages

## Integration with Attendance System

This location management system is designed to work with the attendance system for geofencing:

### Use Case: Attendance Check-in

1. Employee opens attendance app
2. App gets current GPS coordinates
3. App checks if GPS is within radius of any registered location
4. App scans connected WiFi mac_address
5. App verifies mac_address matches registered WiFi for that location
6. If both conditions met, allow check-in
7. Otherwise, show error message

### Validation Logic (Future Implementation)

```typescript
// Example pseudocode for attendance validation
async function validateAttendanceLocation(
  userLat: number,
  userLng: number,
  userBSSID: string
): Promise<{ valid: boolean; locationId?: number }> {
  const locations = await getLocations();

  for (const location of locations) {
    // Check GPS distance
    const distance = calculateDistance(
      userLat,
      userLng,
      location.latitude,
      location.longitude
    );

    if (distance <= location.radius_meter) {
      // Check WiFi mac_address
      const wifiMatch = location.location_wifis?.some(
        (wifi) => wifi.mac_address === userBSSID
      );

      if (wifiMatch) {
        return { valid: true, locationId: location.id };
      }
    }
  }

  return { valid: false };
}
```

## Testing Checklist

### Location CRUD

- [ ] ✅ Create new location
- [ ] ✅ View location list
- [ ] ✅ Edit existing location
- [ ] ✅ Delete location (without WiFi)
- [ ] ✅ Cannot delete location with WiFi
- [ ] ✅ Form validation works
- [ ] ✅ Toast notifications appear

### WiFi CRUD

- [ ] ✅ Add WiFi to location
- [ ] ✅ View WiFi list (expandable)
- [ ] ✅ Edit WiFi network
- [ ] ✅ Delete WiFi network
- [ ] ✅ mac_address auto-formatting works
- [ ] ✅ mac_address validation works
- [ ] ✅ Cannot add duplicate mac_address per location

### UI/UX

- [ ] ✅ Table responsive
- [ ] ✅ Expand/collapse WiFi list
- [ ] ✅ Statistics update correctly
- [ ] ✅ Loading states visible
- [ ] ✅ Delete confirmation works
- [ ] ✅ Forms reset on close
- [ ] ✅ Error messages clear

## Best Practices

### Security

- ✅ Server-side validation in actions
- ✅ Client-side validation for UX
- ✅ Cascade protection (location with WiFi)
- ✅ Unique mac_address per location

### Performance

- ✅ Client component for interactivity
- ✅ Efficient state management
- ✅ Debounced auto-formatting
- ✅ Cache revalidation after mutations

### User Experience

- ✅ Clear validation messages
- ✅ Helpful tips in dialogs
- ✅ Auto-formatting (mac_address)
- ✅ Confirmation for destructive actions
- ✅ Loading indicators
- ✅ Success/error feedback

## Future Enhancements

1. **Google Maps Integration**

   - Visual map picker for coordinates
   - Drag-and-drop location marker
   - Radius visualization on map

2. **Bulk Operations**

   - Import locations from CSV
   - Export locations to CSV
   - Bulk delete/update

3. **Advanced Filtering**

   - Search by location name/address
   - Filter by radius range
   - Filter by WiFi count

4. **Location History**

   - Track location changes
   - Audit log for modifications
   - Restore previous versions

5. **Mobile App Integration**

   - QR code for easy location registration
   - Auto-detect current location
   - WiFi scanner integration

6. **Analytics**
   - Most used locations
   - Attendance by location
   - Coverage heatmap

## Troubleshooting

### Common Issues

**Issue**: TypeScript error "Cannot find module '@/components/ui/table'"
**Solution**: Restart TypeScript server or reload VS Code window

**Issue**: mac_address not formatting
**Solution**: Make sure input uses `handleBssidChange` function

**Issue**: Cannot delete location
**Solution**: Check if location has WiFi networks. Delete WiFi first.

**Issue**: GPS coordinates invalid
**Solution**: Ensure latitude is between -90 and 90, longitude between -180 and 180

## Related Documentation

- [LOCATION_ACTIONS_GUIDE.md](./LOCATION_ACTIONS_GUIDE.md) - Server actions documentation
- [hris_schema_documentation.md](./hris_schema_documentation.md) - Database schema
- [SIDEBAR_RESTRUCTURE.md](./SIDEBAR_RESTRUCTURE.md) - Navigation changes

## Files Modified/Created

### Created:

- `app/dashboard/locations/page.tsx` - Main page (replaced placeholder)
- `components/locations/LocationDialog.tsx` - Location form dialog
- `components/locations/LocationWifiDialog.tsx` - WiFi form dialog
- `components/ui/table.tsx` - Table component
- `docs/LOCATION_FEATURE_IMPLEMENTATION.md` - This documentation

### Modified:

- None (server actions already existed)

## Conclusion

The Location & WiFi Management feature is now fully implemented and ready for use. It provides a complete solution for managing office locations and WiFi networks for the attendance geofencing system.

**Status**: ✅ Production Ready

**Last Updated**: October 20, 2025
