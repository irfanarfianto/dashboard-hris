# Geolocation Troubleshooting Guide

## Issue: "Gagal mendapatkan lokasi" meskipun sudah mengizinkan

### Kemungkinan Penyebab & Solusi

#### 1. **HTTPS Requirement** ⚠️

**Masalah:**
Browser modern (Chrome, Firefox, Safari) memerlukan HTTPS untuk Geolocation API.

**Gejala:**

- Error `PERMISSION_DENIED` meskipun sudah allow
- Location permission tidak muncul
- Console error: "Geolocation API can only be used in secure contexts"

**Solusi:**

```bash
# Development dengan HTTPS
# Next.js tidak support HTTPS by default, gunakan:

# Option 1: ngrok untuk tunnel HTTPS
npx ngrok http 3000

# Option 2: Local HTTPS dengan mkcert
npm install -g mkcert
mkcert -install
mkcert localhost
# Update package.json:
# "dev": "next dev --experimental-https"

# Option 3: Deploy ke Vercel/Netlify (production)
```

**Check:**

- ✅ URL harus `https://` bukan `http://`
- ✅ localhost exception hanya untuk beberapa browser

---

#### 2. **Browser Permission Settings** 🔒

**Masalah:**
Permission sudah di-allow tapi tidak berfungsi.

**Solusi Chrome:**

```
1. Klik ikon 🔒 (padlock) di address bar
2. Klik "Site settings"
3. Cari "Location"
4. Pastikan set ke "Allow"
5. Refresh halaman (F5)
6. Clear browser cache jika perlu
```

**Solusi Firefox:**

```
1. Klik ikon ⓘ (info) di address bar
2. Klik "Clear Permissions and Cookies"
3. Refresh halaman
4. Allow permission ketika popup muncul
```

**Solusi Safari:**

```
1. Safari > Preferences > Websites > Location Services
2. Pastikan site ada di list dan set "Allow"
3. Restart Safari jika perlu
```

---

#### 3. **System Location Services Disabled** 📍

**Masalah:**
Location services di OS level tidak aktif.

**Windows:**

```
1. Settings > Privacy > Location
2. Toggle "Location services" ON
3. Pastikan browser diizinkan akses location
```

**macOS:**

```
1. System Preferences > Security & Privacy > Privacy > Location Services
2. Check "Enable Location Services"
3. Centang browser Anda di list
```

**Linux:**

```
1. Settings > Privacy > Location Services
2. Enable Location Services
3. Grant permission ke browser
```

---

#### 4. **GPS/WiFi Not Available** 🛰️

**Masalah:**
Device tidak bisa mendeteksi lokasi karena GPS/WiFi off.

**Solusi:**

- ✅ Aktifkan WiFi (untuk location by IP/WiFi)
- ✅ Aktifkan GPS/Location di device
- ✅ Pastikan tidak dalam mode Airplane
- ✅ Connect ke WiFi network (bukan hanya scan)

---

#### 5. **Timeout Issues** ⏱️

**Masalah:**
Error `TIMEOUT` setelah 10 detik.

**Penyebab:**

- GPS satellite belum lock
- WiFi positioning tidak tersedia
- Slow network
- Indoor location sulit

**Solusi:**

```typescript
// Adjust timeout & accuracy di MapPicker.tsx
const options = {
  enableHighAccuracy: false, // Set false untuk faster result
  timeout: 30000, // Increase to 30 seconds
  maximumAge: 60000, // Cache location selama 1 menit
};
```

**Tips:**

- Coba di outdoor untuk GPS yang lebih baik
- Pastikan WiFi connected
- Tunggu beberapa detik sebelum retry
- Gunakan manual input sebagai fallback

---

#### 6. **VPN/Proxy Issues** 🌐

**Masalah:**
VPN bisa mengubah lokasi atau block geolocation.

**Solusi:**

- Disable VPN temporarily
- Use manual coordinate input
- Verify IP-based location

---

#### 7. **Browser Extensions Blocking** 🚫

**Masalah:**
Privacy extensions block geolocation.

**Ekstensi yang Mungkin Mengganggu:**

- uBlock Origin
- Privacy Badger
- Ghostery
- AdBlock Plus (dengan privacy settings)

**Solusi:**

```
1. Disable extensions temporarily
2. Add site ke whitelist
3. Test di incognito/private mode
```

---

## Error Code Reference

### PERMISSION_DENIED (Code 1)

**Arti:**
User explicitly deny permission atau browser block.

**Penyebab Umum:**

- User klik "Block" atau "Don't Allow"
- Non-HTTPS connection (except localhost)
- Browser setting block location
- System location services disabled

**Fix:**

1. Check HTTPS connection
2. Clear browser permissions
3. Enable system location services
4. Try different browser

---

### POSITION_UNAVAILABLE (Code 2)

**Arti:**
Device tidak bisa menentukan lokasi.

**Penyebab Umum:**

- GPS not available
- WiFi off atau tidak connected
- Indoor location sulit
- No network connection

**Fix:**

1. Enable WiFi
2. Move to outdoor
3. Connect to WiFi network
4. Check GPS settings

---

### TIMEOUT (Code 3)

**Arti:**
Request lokasi melebihi timeout (10 detik default).

**Penyebab Umum:**

- Slow GPS lock
- Poor network
- Heavy device load
- Indoor positioning delay

**Fix:**

1. Increase timeout duration
2. Set `enableHighAccuracy: false`
3. Try outdoor
4. Wait and retry

---

## Debugging Steps

### 1. Check Console Logs

Buka browser console (F12), cari:

```
Geolocation error details: {
  code: 1,  // Error code
  message: "User denied geolocation prompt",
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3
}
```

### 2. Test Geolocation API

Run di browser console:

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log("Success!", position.coords);
  },
  (error) => {
    console.error("Error:", error.code, error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  }
);
```

### 3. Check Browser Compatibility

```javascript
if (navigator.geolocation) {
  console.log("✅ Geolocation supported");
} else {
  console.log("❌ Geolocation NOT supported");
}
```

### 4. Verify HTTPS

```javascript
console.log("Protocol:", window.location.protocol);
// Should be "https:" in production
```

---

## Solutions Summary

| Issue               | Quick Fix                            |
| ------------------- | ------------------------------------ |
| Not HTTPS           | Use ngrok or deploy to production    |
| Permission Denied   | Clear site data & reload             |
| System Location Off | Enable in OS settings                |
| GPS/WiFi Off        | Turn on WiFi/GPS                     |
| Timeout             | Increase timeout or use manual input |
| VPN Issues          | Disable VPN temporarily              |
| Extensions Blocking | Test in incognito mode               |

---

## Alternative: Manual Input

Jika geolocation tetap tidak work, gunakan manual input:

### Cara Mendapatkan Koordinat dari Google Maps:

1. Buka https://www.google.com/maps
2. Cari lokasi yang diinginkan
3. Klik kanan pada lokasi
4. Koordinat muncul di top (contoh: `-6.200000, 106.816666`)
5. Klik koordinat untuk copy
6. Paste ke form manual input

### Format Koordinat:

```
Latitude:  -6.200000  (range: -90 to 90)
Longitude: 106.816666 (range: -180 to 180)
```

---

## Best Practices

### For Developers:

1. **Always provide manual input fallback**

   ```tsx
   <Tabs>
     <TabsTrigger value="map">Map</TabsTrigger>
     <TabsTrigger value="manual">Manual Input</TabsTrigger>
   </Tabs>
   ```

2. **Show helpful error messages**

   ```typescript
   switch (error.code) {
     case error.PERMISSION_DENIED:
       toast.error("Check HTTPS & browser permissions");
       break;
     case error.POSITION_UNAVAILABLE:
       toast.error("Enable WiFi/GPS and try again");
       break;
     case error.TIMEOUT:
       toast.error("Timeout. Try manual input");
       break;
   }
   ```

3. **Configure reasonable options**

   ```typescript
   const options = {
     enableHighAccuracy: true, // Accuracy vs speed
     timeout: 10000, // 10 seconds
     maximumAge: 0, // Don't use cache
   };
   ```

4. **Log errors for debugging**
   ```typescript
   console.error("Geolocation error:", {
     code: error.code,
     message: error.message,
   });
   ```

### For Users:

1. **Use HTTPS site** (production)
2. **Enable location in browser & OS**
3. **Turn on WiFi/GPS**
4. **Try outdoor if indoor fails**
5. **Use manual input as fallback**
6. **Clear browser cache if issues persist**

---

## Testing Checklist

- [ ] Test on HTTPS (production or ngrok)
- [ ] Test dengan permission allowed
- [ ] Test dengan permission denied
- [ ] Test dengan location services disabled
- [ ] Test dengan WiFi off
- [ ] Test timeout scenario
- [ ] Test manual input fallback
- [ ] Test error messages display correctly
- [ ] Test di berbagai browser (Chrome, Firefox, Safari)
- [ ] Test di mobile device

---

## Common Questions

### Q: Kenapa harus HTTPS?

**A:** Browser security policy. Geolocation API mengandung sensitive data (lokasi user) sehingga hanya boleh digunakan di secure context (HTTPS).

### Q: Localhost work tanpa HTTPS?

**A:** Yes, localhost dianggap secure context oleh browser modern. Tapi production harus HTTPS.

### Q: Accuracy berapa meter?

**A:**

- GPS: ±5-10 meters
- WiFi: ±20-50 meters
- IP: ±1000+ meters (city-level)

### Q: Bagaimana cara force HTTPS di development?

**A:** Gunakan ngrok tunnel atau mkcert untuk local HTTPS certificate.

---

## Related Documentation

- [Leaflet Map Integration](./LEAFLET_MAP_INTEGRATION.md)
- [Location Feature Implementation](./LOCATION_FEATURE_IMPLEMENTATION.md)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

---

**Last Updated:** October 20, 2025
