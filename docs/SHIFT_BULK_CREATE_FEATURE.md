# Bulk Create Shift untuk Multiple Posisi

## 📋 Overview

Fitur ini memungkinkan HR untuk membuat shift yang sama untuk beberapa posisi sekaligus, menghemat waktu saat membuat shift reguler yang berlaku untuk banyak posisi.

## ✨ Fitur Utama

### 1. Toggle Multi-Select Mode

- Tersedia hanya saat **Create New Shift** (tidak tersedia saat edit)
- Switch toggle yang jelas dengan deskripsi
- Visual feedback dengan background biru

### 2. Multi-Select Positions

- **Checkbox list** untuk memilih multiple posisi
- Menampilkan nama posisi dan departemen dalam kurung
- Counter menunjukkan berapa posisi yang dipilih
- Tombol "Pilih Semua" dan "Batal Pilih"
- Max height dengan scroll untuk banyak posisi

### 3. Bulk Creation

- Satu kali submit membuat shift untuk semua posisi terpilih
- Validasi duplicate per posisi (tidak create jika sudah ada shift dengan nama sama)
- Success message menunjukkan berapa posisi yang berhasil dibuat

## 🎯 Use Case

### Scenario 1: Shift Reguler untuk Office Staff

**Problem**: HR perlu create "Shift Regular (08:00-17:00)" untuk 15 posisi office staff

**Solution**:

1. Klik "Tambah Shift Baru"
2. Aktifkan toggle "Terapkan ke Multiple Posisi"
3. Centang 15 posisi (atau klik "Pilih Semua" lalu uncheck yang tidak perlu)
4. Isi detail shift (nama, waktu, durasi, dll)
5. Submit → 15 shift tercreate sekaligus

### Scenario 2: Shift Non-Regular untuk Field Staff

**Problem**: Create 3 rotating shifts (Pagi, Siang, Malam) untuk 8 posisi field staff

**Solution**:

1. Create "Shift Pagi" untuk 8 posisi → 1 kali submit
2. Create "Shift Siang" untuk 8 posisi → 1 kali submit
3. Create "Shift Malam" untuk 8 posisi → 1 kali submit

**Result**: 24 shift tercreate dengan 3 kali submit (vs 24 kali submit tanpa fitur ini)

## 🛠️ Implementasi Teknis

### 1. Database Function

**File**: `lib/actions/shiftActions.ts`

```typescript
export async function bulkCreateWorkShift(formData: FormData);
```

**Features**:

- Accept comma-separated position IDs
- Validate duplicate names per position
- Bulk insert dengan array mapping
- Revalidate path setelah berhasil

### 2. Frontend Component

**File**: `components/shifts/ShiftDialog.tsx`

**State Management**:

```typescript
const [isMultiSelect, setIsMultiSelect] = useState(false);
const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
```

**Conditional Rendering**:

- Toggle switch (only in create mode)
- Checkbox list vs Single dropdown
- Different validation logic
- Different submit action

### 3. UI Components Used

- `Switch` - Toggle multi-select mode
- `Checkbox` - Select positions
- `Button` - Select All / Deselect All
- Toast notification - Success/error feedback

## 📊 Data Flow

```
User Action → Toggle Multi-Select
            ↓
Select Multiple Positions (Checkbox)
            ↓
Fill Shift Details (Name, Time, Duration, etc)
            ↓
Submit Form
            ↓
bulkCreateWorkShift(formData)
            ↓
Validate: Position IDs, Name, Time, Duration
            ↓
Check Duplicates: Query existing shifts with same name
            ↓
Prepare Bulk Insert: Map position_ids to shift objects
            ↓
Insert All: Supabase bulk insert
            ↓
Revalidate Path: /dashboard/shifts
            ↓
Show Success Toast: "Shift berhasil dibuat untuk X posisi"
            ↓
Close Dialog & Refresh List
```

## 🎨 UI/UX Design

### Toggle Section (Create Mode Only)

```
┌─────────────────────────────────────────────────┐
│ 💡 Terapkan ke Multiple Posisi          [Switch]│
│ Aktifkan untuk membuat shift yang sama untuk    │
│ beberapa posisi sekaligus                       │
└─────────────────────────────────────────────────┘
```

### Multi-Select Mode

```
┌─────────────────────────────────────────────────┐
│ Pilih Posisi *                                   │
│ 5 posisi dipilih                                │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ ☑ Sales Manager (Sales Department)         │ │
│ │ ☑ Sales Staff (Sales Department)           │ │
│ │ ☐ Marketing Manager (Marketing Dept)       │ │
│ │ ☑ Customer Service (Operations)            │ │
│ │ ☑ Field Officer (Operations)               │ │
│ │ ... (scroll for more)                       │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ [Pilih Semua]                    [Batal Pilih]  │
└─────────────────────────────────────────────────┘
```

### Single Select Mode (Default & Edit Mode)

```
┌─────────────────────────────────────────────────┐
│ Posisi *                                         │
│ ┌─────────────────────────────────────────────┐ │
│ │ Sales Manager (Sales Department)       [▼] │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## ✅ Validation Rules

### Multi-Select Mode

1. ✅ Minimal 1 posisi harus dipilih
2. ✅ Nama shift wajib diisi
3. ✅ Start time & end time wajib diisi
4. ✅ Duration harus > 0 jam
5. ✅ Check duplicate: Nama shift tidak boleh sama dalam 1 posisi
6. ❌ **Error jika ada duplicate**: "Shift 'X' sudah ada di N posisi yang dipilih"

### Single Select Mode

1. ✅ Posisi wajib dipilih (1 saja)
2. ✅ Nama shift wajib diisi
3. ✅ Start time & end time wajib diisi
4. ✅ Duration harus > 0 jam
5. ✅ Check duplicate dalam 1 posisi
6. ❌ **Error jika duplicate**: "Shift 'X' sudah ada di posisi ini"

## 🧪 Testing Checklist

### Functional Testing

- [ ] Toggle switch berfungsi dengan benar
- [ ] Checkbox select/deselect individual position
- [ ] "Pilih Semua" button select semua posisi
- [ ] "Batal Pilih" button deselect semua posisi
- [ ] Counter "X posisi dipilih" update secara real-time
- [ ] Bulk create berhasil untuk multiple positions
- [ ] Validation error tampil jika tidak ada posisi dipilih
- [ ] Duplicate check mencegah create shift dengan nama sama

### Edge Cases

- [ ] Create shift untuk 1 posisi via multi-select (should work)
- [ ] Create shift untuk semua posisi sekaligus
- [ ] Toggle OFF setelah select positions (should clear selections)
- [ ] Close dialog setelah select positions (should reset on reopen)
- [ ] Submit dengan form kosong (should show validation errors)
- [ ] Duplicate shift name di beberapa posisi (should reject all)

### UI/UX Testing

- [ ] Toggle section hanya muncul saat create mode
- [ ] Toggle section TIDAK muncul saat edit mode
- [ ] Position dropdown disabled saat edit mode
- [ ] Scroll berfungsi jika positions > 10 items
- [ ] Visual feedback jelas antara multi vs single mode
- [ ] Success toast menunjukkan jumlah posisi yang dibuat
- [ ] Loading state saat submit

### Performance Testing

- [ ] Bulk create 10 positions → < 3 detik
- [ ] Bulk create 20 positions → < 5 detik
- [ ] Bulk create 50 positions → < 10 detik
- [ ] No lag saat checkbox interactions
- [ ] Smooth scroll di position list

## 📈 Benefits

### Before (Single Mode Only)

- Create 10 shifts untuk 10 posisi = **10 form submissions**
- Estimated time: **~15 menit** (90 detik per shift)
- Risk: Human error saat copy-paste data

### After (Multi-Select Mode)

- Create 10 shifts untuk 10 posisi = **1 form submission**
- Estimated time: **~2 menit** (pilih posisi + isi detail + submit)
- Risk: **Minimal** (isi sekali, apply ke semua)

**Time Saving**: ~87% faster ⚡

## 🔧 Future Enhancements

### Phase 2

1. **Bulk Edit**: Edit shift yang sama di multiple positions sekaligus
2. **Template System**: Save shift template untuk reuse
3. **Position Groups**: Group positions by department untuk faster selection
4. **Import from Excel**: Bulk import shifts via spreadsheet

### Phase 3

1. **Copy Existing Shift**: Duplicate shift ke posisi lain
2. **Shift Calendar View**: Visual calendar untuk manage shifts
3. **Conflict Detection**: Warning jika shift overlap
4. **Shift Rotation Builder**: UI untuk create rotating shift patterns

## 📝 Migration Notes

### Breaking Changes

**None** - Fitur ini backward compatible.

- Existing single create/edit tetap berfungsi normal
- Database schema tidak berubah
- API `upsertWorkShift()` tetap ada untuk single mode

### New Functions Added

- `bulkCreateWorkShift()` - New server action for bulk creation
- Export di `shiftActions.ts` updated dengan function baru

### Components Updated

- `ShiftDialog.tsx` - Added multi-select UI & logic
- Import `Checkbox` component dari UI library
- Import `bulkCreateWorkShift` action

## 🐛 Known Issues

### Current Limitations

1. **No Bulk Edit**: Edit mode masih single only
2. **No Undo**: Jika bulk create, tidak bisa undo (harus delete manual satu-satu)
3. **No Preview**: Tidak ada preview daftar shifts yang akan dibuat sebelum submit

### Workarounds

1. **Bulk Edit**: Create new shifts, delete old ones
2. **Undo**: Use soft delete, bisa restore jika perlu
3. **Preview**: Check counter "X posisi dipilih" sebagai confirmation

## 📚 Related Documentation

- [SHIFT_MANAGEMENT_GUIDE.md](./SHIFT_MANAGEMENT_GUIDE.md) - General shift management
- [hris_schema_documentation.md](./hris_schema_documentation.md) - Database schema
- [LOCATION_FEATURE_IMPLEMENTATION.md](./LOCATION_FEATURE_IMPLEMENTATION.md) - Similar bulk pattern

## 🎓 Code Examples

### Example 1: Basic Bulk Create

```typescript
// User selects 5 positions and fills form
const formData = new FormData();
formData.append("position_ids", "1,2,3,4,5");
formData.append("name", "Shift Regular");
formData.append("start_time", "08:00:00");
formData.append("end_time", "17:00:00");
formData.append("duration_hours", "9");
formData.append("is_regular", "true");
formData.append("tolerance_minutes", "5");

const result = await bulkCreateWorkShift(formData);
// Success: "Shift berhasil dibuat untuk 5 posisi"
```

### Example 2: Handle Duplicate Error

```typescript
// Position 1 already has "Shift Pagi"
// User tries to bulk create "Shift Pagi" for positions 1,2,3

const result = await bulkCreateWorkShift(formData);
// Error: "Shift 'Shift Pagi' sudah ada di 1 posisi yang dipilih"
// Solution: Uncheck position 1, submit again for positions 2,3
```

### Example 3: Toggle Between Modes

```tsx
<Switch
  checked={isMultiSelect}
  onCheckedChange={(checked) => {
    setIsMultiSelect(checked);
    if (checked) {
      // Clear single selection when switching to multi
      setFormData({ ...formData, position_id: "" });
      setSelectedPositions([]);
    }
  }}
/>
```

## 🎉 Success Metrics

Track these metrics to measure feature adoption:

1. **Adoption Rate**: % of shifts created via bulk vs single
2. **Time Savings**: Average time per shift creation (before vs after)
3. **Error Rate**: % of failed bulk creates vs single creates
4. **User Satisfaction**: Survey HR users about feature usefulness

**Target**:

- 40% adoption rate dalam 1 bulan
- 80% time savings untuk shift creation
- < 5% error rate
- 4.5/5 satisfaction score

---

**Created**: October 21, 2025  
**Last Updated**: October 21, 2025  
**Author**: Development Team  
**Status**: ✅ Implemented & Ready for Testing
