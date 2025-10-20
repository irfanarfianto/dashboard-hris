# Leaflet Map Integration for Location Selection

## Overview

Integrasi Leaflet interactive map untuk memudahkan user memilih koordinat lokasi kantor dengan visual dan intuitif. User dapat memilih lokasi dengan klik pada peta atau drag marker, dan melihat area geofencing secara real-time.

## Features

### 1. **Interactive Map Selection**

- ✅ Klik pada peta untuk set marker
- ✅ Drag marker untuk adjust posisi
- ✅ Visual circle untuk geofencing radius
- ✅ OpenStreetMap tile layer
- ✅ Current location detection

### 2. **Two Input Methods**

- **📍 Pilih di Peta**: Interactive map dengan visual feedback
- **⌨️ Input Manual**: Traditional text input untuk latitude/longitude

### 3. **Real-time Feedback**

- Circle biru menunjukkan area geofencing
- Marker dapat di-drag untuk adjust
- Koordinat ter-update otomatis saat marker bergerak
- Radius circle menyesuaikan dengan input radius_meter

## Installation

### Dependencies

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
npm install @radix-ui/react-tabs
```

### Components Created

1. **`components/locations/MapPicker.tsx`** - Main map component
2. **`components/ui/tabs.tsx`** - Tabs untuk switch input method

## Components

### MapPicker Component

**Location:** `components/locations/MapPicker.tsx`

#### Props

```typescript
interface MapPickerProps {
  latitude?: number; // Initial latitude
  longitude?: number; // Initial longitude
  radius?: number; // Geofencing radius in meters
  onLocationSelect: (lat: number, lng: number) => void; // Callback when location changes
  height?: string; // Map height (default: "400px")
}
```

#### Features

1. **Map Initialization**

   - Default ke Jakarta (-6.2088, 106.8456) jika tidak ada koordinat
   - Zoom level 15 untuk detail yang baik
   - OpenStreetMap tiles dengan attribution

2. **Marker Management**

   - Draggable marker
   - Auto-create marker saat klik pertama
   - Move marker saat klik berikutnya
   - Red marker icon dari Leaflet CDN

3. **Circle Overlay**

   - Blue circle untuk visualisasi radius
   - Fill opacity 0.2 untuk tidak menghalangi peta
   - Auto-update saat radius berubah
   - Follow marker position

4. **Current Location**
   - Button "Gunakan Lokasi Saya"
   - HTML5 Geolocation API
   - Permission request handling
   - Error handling untuk denied/failed

#### Implementation

```tsx
<MapPicker
  latitude={formData.latitude ? parseFloat(formData.latitude) : undefined}
  longitude={formData.longitude ? parseFloat(formData.longitude) : undefined}
  radius={formData.radius_meter ? parseFloat(formData.radius_meter) : 100}
  onLocationSelect={(lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  }}
/>
```

### Tabs Component

**Location:** `components/ui/tabs.tsx`

Built dengan Radix UI primitives untuk accessibility.

#### Usage in LocationDialog

```tsx
<Tabs defaultValue="map">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="map">📍 Pilih di Peta</TabsTrigger>
    <TabsTrigger value="manual">⌨️ Input Manual</TabsTrigger>
  </TabsList>

  <TabsContent value="map">
    <MapPicker {...props} />
  </TabsContent>

  <TabsContent value="manual">{/* Traditional input fields */}</TabsContent>
</Tabs>
```

## Integration with LocationDialog

### Updated LocationDialog (`components/locations/LocationDialog.tsx`)

#### 1. Dynamic Import

Leaflet must be dynamically imported to avoid SSR issues:

```typescript
const MapPicker = dynamic(() => import("@/components/locations/MapPicker"), {
  ssr: false, // Important! Leaflet requires window object
  loading: () => (
    <div className="h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  ),
});
```

#### 2. Form Layout

```tsx
<form onSubmit={handleSubmit}>
  {/* Company Selector (untuk lokasi baru) */}
  {!isEdit && <CompanySelect />}

  {/* Nama Lokasi */}
  <Input name="name" />

  {/* Koordinat Lokasi dengan Tabs */}
  <Tabs defaultValue="map">
    <TabsList>
      <TabsTrigger value="map">📍 Pilih di Peta</TabsTrigger>
      <TabsTrigger value="manual">⌨️ Input Manual</TabsTrigger>
    </TabsList>

    <TabsContent value="map">
      <MapPicker onLocationSelect={handleLocationSelect} />
    </TabsContent>

    <TabsContent value="manual">
      <div className="grid grid-cols-2 gap-4">
        <Input name="latitude" />
        <Input name="longitude" />
      </div>
    </TabsContent>
  </Tabs>

  {/* Radius */}
  <Input name="radius_meter" />

  {/* Submit buttons */}
</form>
```

#### 3. State Management

Koordinat dari map langsung update form state:

```typescript
const handleLocationSelect = (lat: number, lng: number) => {
  setFormData((prev) => ({
    ...prev,
    latitude: lat.toFixed(6),
    longitude: lng.toFixed(6),
  }));

  // Clear errors
  if (errors.latitude) {
    setErrors((prev) => ({ ...prev, latitude: "" }));
  }
  if (errors.longitude) {
    setErrors((prev) => ({ ...prev, longitude: "" }));
  }
};
```

## User Experience Flow

### Flow 1: Tambah Lokasi dengan Map

```
User klik "Tambah Lokasi"
    ↓
Dialog terbuka → Tab "Pilih di Peta" active by default
    ↓
Map tampil dengan default view (Jakarta)
    ↓
User klik "Gunakan Lokasi Saya" (optional)
    ↓
Map zoom ke lokasi user, marker ter-create
    ↓
User adjust marker dengan drag (jika perlu)
    ↓
Circle biru menunjukkan area geofencing
    ↓
User input nama lokasi & radius
    ↓
Submit → Lokasi tersimpan dengan koordinat presisi
```

### Flow 2: Tambah Lokasi Manual

```
User klik "Tambah Lokasi"
    ↓
Dialog terbuka
    ↓
User switch ke tab "Input Manual"
    ↓
User ketik latitude & longitude dari Google Maps
    ↓
(Optional) Switch ke tab "Peta" untuk verifikasi
    ↓
Map menampilkan marker di koordinat yang diinput
    ↓
Submit
```

### Flow 3: Edit Lokasi

```
User klik edit pada lokasi existing
    ↓
Dialog terbuka dengan data ter-fill
    ↓
Map langsung tampil dengan marker di lokasi existing
    ↓
Circle menunjukkan radius existing
    ↓
User adjust posisi marker atau switch ke manual input
    ↓
Submit → Lokasi ter-update
```

## Technical Details

### Leaflet Configuration

#### Tile Layer

```typescript
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 19,
});
```

#### Marker

```typescript
const marker = L.marker([lat, lng], {
  draggable: true, // Allow drag
}).addTo(map);

marker.on("dragend", () => {
  const position = marker.getLatLng();
  onLocationSelect(position.lat, position.lng);
});
```

#### Circle

```typescript
const circle = L.circle([lat, lng], {
  color: "#0ea5e9", // Tailwind blue-500
  fillColor: "#0ea5e9",
  fillOpacity: 0.2,
  radius: radiusInMeters,
}).addTo(map);
```

### SSR Handling

Leaflet requires `window` object, sehingga harus di-import dynamic:

```typescript
const MapPicker = dynamic(() => import("@/components/locations/MapPicker"), {
  ssr: false,
});
```

### Icon Fix for Next.js

Leaflet default icons broken di Next.js, fixed dengan CDN:

```typescript
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/.../marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/.../marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/.../marker-shadow.png",
});
```

## Styling

### CSS Import

Leaflet CSS harus di-import:

```typescript
import "leaflet/dist/leaflet.css";
```

### Custom Styling

Map container:

```tsx
<div
  ref={mapContainerRef}
  style={{ height, width: "100%" }}
  className="z-0" // Ensure proper z-index
/>
```

Card wrapper:

```tsx
<Card className="overflow-hidden">
  <div ref={mapContainerRef} ... />
</Card>
```

## Features in Detail

### 1. Current Location Detection

```typescript
const getCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      // Set marker & zoom to current location
      map.setView([lat, lng], 16);
    },
    (error) => {
      alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.");
    }
  );
};
```

**User Benefits:**

- ✅ One-click location detection
- ✅ No need to manually find coordinates
- ✅ Accurate positioning

### 2. Drag & Drop Marker

```typescript
const marker = L.marker([lat, lng], {
  draggable: true,
});

marker.on("dragend", () => {
  const position = marker.getLatLng();
  onLocationSelect(position.lat, position.lng);
  updateCircle(position.lat, position.lng);
});
```

**User Benefits:**

- ✅ Fine-tune position with drag
- ✅ Visual feedback
- ✅ Precision adjustment

### 3. Click to Place

```typescript
map.on("click", (e: L.LeafletMouseEvent) => {
  const { lat, lng } = e.latlng;

  if (!markerRef.current) {
    // Create new marker
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;
  } else {
    // Move existing marker
    markerRef.current.setLatLng([lat, lng]);
  }

  onLocationSelect(lat, lng);
});
```

**User Benefits:**

- ✅ Quick placement
- ✅ Easy repositioning
- ✅ Intuitive UX

### 4. Geofencing Visualization

```typescript
const circle = L.circle([lat, lng], {
  color: "#0ea5e9",
  fillColor: "#0ea5e9",
  fillOpacity: 0.2,
  radius: radiusInMeters,
}).addTo(map);
```

**User Benefits:**

- ✅ See exact geofencing area
- ✅ Understand coverage
- ✅ Adjust radius accordingly

## Validation

Koordinat dari map sudah valid by default:

```typescript
onLocationSelect={(lat, lng) => {
  // lat: -90 to 90 (automatic from Leaflet)
  // lng: -180 to 180 (automatic from Leaflet)
  setFormData(prev => ({
    ...prev,
    latitude: lat.toFixed(6),   // 6 decimal precision
    longitude: lng.toFixed(6),
  }));
}}
```

Server-side validation tetap dilakukan di `locationActions.ts`.

## Error Handling

### 1. Geolocation Denied

```typescript
navigator.geolocation.getCurrentPosition(onSuccess, (error) => {
  if (error.code === error.PERMISSION_DENIED) {
    alert("Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.");
  }
});
```

### 2. Geolocation Not Supported

```typescript
if (!navigator.geolocation) {
  alert("Geolocation tidak didukung oleh browser Anda");
  return;
}
```

### 3. Map Load Error

Dynamic import provides fallback loading state:

```typescript
loading: () => (
  <div className="h-[400px] flex items-center justify-center">
    <Loader2 className="animate-spin" />
  </div>
);
```

## Benefits

### For Users

1. **Visual & Intuitive**

   - ✅ See location on real map
   - ✅ No need to find coordinates manually
   - ✅ Visual geofencing preview

2. **Flexible Input**

   - ✅ Choose map or manual input
   - ✅ Switch between methods anytime
   - ✅ Sync between both methods

3. **Accurate**

   - ✅ Precise marker placement
   - ✅ Fine-tune with drag
   - ✅ 6 decimal precision (±0.11m accuracy)

4. **Quick**
   - ✅ One-click current location
   - ✅ Click-to-place marker
   - ✅ Fast positioning

### For Developers

1. **Reusable Component**

   - ✅ MapPicker can be used anywhere
   - ✅ Props-based configuration
   - ✅ Clean API

2. **Well-Integrated**

   - ✅ Works with existing form state
   - ✅ Proper validation
   - ✅ Error handling

3. **Maintainable**
   - ✅ Clear separation of concerns
   - ✅ TypeScript types
   - ✅ Documented code

## Testing Checklist

### Map Functionality

- [ ] Map loads correctly
- [ ] Default view shows Jakarta
- [ ] Click on map creates marker
- [ ] Marker is draggable
- [ ] Drag updates coordinates
- [ ] Circle appears with correct radius
- [ ] Circle follows marker

### Current Location

- [ ] "Gunakan Lokasi Saya" button works
- [ ] Permission request appears
- [ ] Map zooms to current location
- [ ] Marker placed at current location
- [ ] Works on HTTPS only (browser requirement)

### Input Methods

- [ ] Can switch between Map and Manual tabs
- [ ] Manual input updates map marker
- [ ] Map selection updates manual fields
- [ ] Both methods stay synced

### Validation

- [ ] Invalid coordinates rejected
- [ ] Latitude range: -90 to 90
- [ ] Longitude range: -180 to 180
- [ ] Precision: 6 decimal places
- [ ] Toast shows on errors

### UX

- [ ] Loading indicator shows while map loads
- [ ] No errors in console
- [ ] Smooth marker drag
- [ ] Circle resize smooth
- [ ] Tips text helpful
- [ ] Mobile responsive

## Known Issues & Solutions

### Issue 1: Marker Icons Missing

**Symptom:** Red markers don't show, only shadows

**Solution:** Fixed dengan icon CDN setup:

```typescript
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "...",
  iconUrl: "...",
  shadowUrl: "...",
});
```

### Issue 2: SSR Error

**Symptom:** `window is not defined` during build

**Solution:** Dynamic import with `ssr: false`:

```typescript
const MapPicker = dynamic(() => import("@/components/locations/MapPicker"), {
  ssr: false,
});
```

### Issue 3: Map Not Rendering

**Symptom:** Empty gray box instead of map

**Solution:** Ensure Leaflet CSS is imported:

```typescript
import "leaflet/dist/leaflet.css";
```

### Issue 4: Circle Not Updating

**Symptom:** Circle doesn't follow radius changes

**Solution:** useEffect to update circle radius:

```typescript
useEffect(() => {
  if (circleRef.current) {
    circleRef.current.setRadius(radius);
  }
}, [radius]);
```

## Future Enhancements

### Potential Additions

1. **Search Location**

   - Geocoding API integration
   - Search box untuk nama tempat
   - Auto-complete suggestions

2. **Multiple Markers**

   - Support untuk multiple locations
   - Cluster markers for overview
   - Bulk location import

3. **Custom Map Styles**

   - Dark mode map tiles
   - Different map providers (Google, Mapbox)
   - Custom marker icons per company

4. **Distance Measurement**

   - Measure distance between locations
   - Show nearby locations
   - Overlap detection

5. **Offline Support**
   - Cache map tiles
   - Work without internet
   - Sync when online

## Related Files

- `components/locations/MapPicker.tsx` - Map component
- `components/locations/LocationDialog.tsx` - Dialog with map integration
- `components/ui/tabs.tsx` - Tabs component
- `lib/actions/locationActions.ts` - Server actions
- `app/dashboard/locations/page.tsx` - Locations page

## Related Documentation

- [Location Feature Implementation](./LOCATION_FEATURE_IMPLEMENTATION.md)
- [Location-Company Integration](./LOCATION_COMPANY_INTEGRATION.md)
- [Location Actions Guide](./LOCATION_ACTIONS_GUIDE.md)

## References

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [React Leaflet](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Radix UI Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)

## Changelog

### Version 1.2.0

- ✅ Added Leaflet map integration
- ✅ Interactive marker placement
- ✅ Geofencing circle visualization
- ✅ Current location detection
- ✅ Tabs for map/manual input
- ✅ Drag & drop marker support
- ✅ Real-time coordinate updates

---

**Leaflet Map Integration** membuat location selection lebih intuitif dan visual, mengurangi error input koordinat, dan memberikan feedback visual untuk area geofencing! 🗺️✨
