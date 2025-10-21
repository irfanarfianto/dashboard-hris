# Shift Search Feature - Documentation

## 📋 Overview

Fitur pencarian (search) pada halaman Daftar Shift memungkinkan user untuk dengan cepat menemukan shift berdasarkan:

- **Nama Shift** (contoh: "Shift Pagi", "Shift Malam")
- **Nama Posisi** (contoh: "Sales Manager", "IT Staff")
- **Nama Departemen** (contoh: "Sales", "IT", "HR")

## ✨ Features

### 1. Real-time Search

- **Instant filtering**: Hasil muncul langsung saat mengetik
- **Case-insensitive**: Tidak peduli huruf besar/kecil
- **Partial match**: Cocok dengan sebagian kata

### 2. Visual Feedback

- **Search counter**: "Ditemukan X dari Y shift"
- **Empty state**: Pesan jelas jika tidak ada hasil
- **Stats update**: Card stats update sesuai filter

### 3. Multi-field Search

Search bekerja di 3 field sekaligus:

- Nama shift
- Nama posisi
- Nama departemen

## 🎯 Use Cases

### Scenario 1: Cari Shift untuk Departemen Tertentu

**Problem**: HR ingin melihat semua shift untuk departemen "Sales"

**Solution**:

1. Ketik "sales" di search bar
2. Sistem filter dan tampilkan hanya shift untuk posisi di departemen Sales
3. Stats card update untuk menunjukkan jumlah shift Sales

**Result**: Tampil hanya shift dari "Sales Department - Sales Manager", "Sales Department - Sales Staff", dll.

### Scenario 2: Cari Shift Berdasarkan Nama

**Problem**: HR ingin lihat semua "Shift Pagi" di berbagai posisi

**Solution**:

1. Ketik "pagi" di search bar
2. Sistem tampilkan semua shift dengan nama mengandung "pagi"
3. Group tetap berdasarkan posisi

**Result**: Tampil "Shift Pagi" dari berbagai posisi/departemen

### Scenario 3: Cari Shift untuk Posisi Spesifik

**Problem**: HR ingin edit shift untuk "IT Staff"

**Solution**:

1. Ketik "IT Staff" di search bar
2. Sistem filter hanya shift untuk posisi IT Staff
3. Langsung bisa klik edit

**Result**: Tampil hanya shift untuk posisi IT Staff

## 🛠️ Technical Implementation

### 1. State Management

**File**: `app/dashboard/shifts/page.tsx`

```typescript
const [searchQuery, setSearchQuery] = useState("");
```

### 2. Filter Logic

```typescript
const filteredShifts = shifts.filter((shift) => {
  if (!searchQuery.trim()) return true; // Show all if empty

  const query = searchQuery.toLowerCase();
  const positionName = shift.positions?.name?.toLowerCase() || "";
  const deptName = shift.positions?.departments?.name?.toLowerCase() || "";
  const shiftName = shift.name.toLowerCase();

  return (
    positionName.includes(query) ||
    deptName.includes(query) ||
    shiftName.includes(query)
  );
});
```

**Features**:

- Trim whitespace untuk menghindari pencarian kosong
- Case-insensitive dengan `.toLowerCase()`
- Null-safe dengan optional chaining `?.`
- Default empty string `|| ""`
- Multi-field OR condition

### 3. Grouping Logic

```typescript
const shiftsByPosition = filteredShifts.reduce((acc, shift) => {
  const positionName = shift.positions?.name || "Tanpa Posisi";
  const deptName = shift.positions?.departments?.name || "-";
  const groupKey = `${deptName} - ${positionName}`;

  if (!acc[groupKey]) {
    acc[groupKey] = [];
  }
  acc[groupKey].push(shift);
  return acc;
}, {} as Record<string, WorkShift[]>);
```

**Note**: Grouping tetap berdasarkan posisi, hanya data yang di-filter saja

### 4. UI Components

#### Search Bar

```tsx
<Card>
  <CardContent className="pt-6">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Cari berdasarkan nama shift, posisi, atau departemen..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
    {searchQuery && (
      <p className="text-sm text-muted-foreground mt-2">
        Ditemukan {filteredShifts.length} dari {shifts.length} shift
      </p>
    )}
  </CardContent>
</Card>
```

#### Stats Update

```tsx
<div className="text-2xl font-bold">
  {searchQuery ? filteredShifts.length : shifts.length}
</div>;
{
  searchQuery && (
    <p className="text-xs text-muted-foreground mt-1">
      dari {shifts.length} total
    </p>
  );
}
```

#### Empty State

```tsx
{filteredShifts.length === 0 ? (
  <div className="text-center py-8 text-muted-foreground">
    <p>Tidak ada shift yang sesuai dengan pencarian</p>
    <p className="text-sm mt-2">
      Coba gunakan kata kunci yang berbeda
    </p>
  </div>
) : (
  // Render shift list
)}
```

## 🎨 UI/UX Design

### Search Bar (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Cari berdasarkan nama shift, posisi, atau departemen...  │
│                                                              │
│ Ditemukan 5 dari 24 shift                                   │
└─────────────────────────────────────────────────────────────┘
```

### Stats Cards (Filtered)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Total Shift     │  │ Shift Regular   │  │ Shift Non-Reg   │
│                 │  │                 │  │                 │
│       5         │  │       3         │  │       2         │
│ dari 24 total   │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Empty State

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│            Tidak ada shift yang sesuai dengan pencarian     │
│            Coba gunakan kata kunci yang berbeda             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Filtered Results

```
Sales Department - Sales Manager
┌────────────────────────────────────────────────────────────┐
│ Shift Pagi    │ 08:00-17:00  │ 9 jam  │ 5 min │ Regular  │
│ Shift Malam   │ 20:00-05:00  │ 9 jam  │ 5 min │ Regular  │
└────────────────────────────────────────────────────────────┘

Sales Department - Sales Field Staff
┌────────────────────────────────────────────────────────────┐
│ Shift Pagi    │ 07:00-16:00  │ 9 jam  │ 10 min│ Regular  │
└────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

```
User Input → Search Query State
           ↓
Filter Logic → filteredShifts array
           ↓
       ┌───┴───┐
       ↓       ↓
   Stats    Grouping → shiftsByPosition
   Cards              ↓
                  Render Table
```

### Detailed Flow

1. **User types in search input**

   ```
   onChange={(e) => setSearchQuery(e.target.value)}
   ```

2. **searchQuery state updates**

   ```
   const [searchQuery, setSearchQuery] = useState("");
   ```

3. **Filter runs automatically** (useMemo could optimize this)

   ```
   const filteredShifts = shifts.filter(...)
   ```

4. **UI components re-render with filtered data**
   - Stats cards show filtered counts
   - Table shows filtered & grouped shifts
   - Search counter shows result count

## 🔍 Search Examples

### Example 1: Search by Department

**Input**: `"sales"`
**Match**:

- Department: "Sales Department" ✅
- Position: "Sales Manager" ✅
- Position: "Sales Staff" ✅
- Shift: "Pre-Sales Shift" ✅

### Example 2: Search by Position

**Input**: `"manager"`
**Match**:

- Position: "Sales Manager" ✅
- Position: "HR Manager" ✅
- Position: "IT Manager" ✅

### Example 3: Search by Shift Name

**Input**: `"pagi"`
**Match**:

- Shift: "Shift Pagi" ✅
- Shift: "Pagi Regular" ✅

### Example 4: Partial Match

**Input**: `"IT"`
**Match**:

- Department: "IT Department" ✅
- Position: "IT Staff" ✅
- Position: "IT Support" ✅

### Example 5: Case Insensitive

**Input**: `"SALES"` or `"sales"` or `"SaLeS"`
**Result**: All work the same ✅

## ✅ Validation & Edge Cases

### Edge Case 1: Empty Search

**Input**: `""` (empty string)
**Result**: Show all shifts ✅

### Edge Case 2: Only Spaces

**Input**: `"   "` (spaces only)
**Result**: Show all shifts (handled by `.trim()`) ✅

### Edge Case 3: No Match

**Input**: `"xyz123"`
**Result**: Show empty state message ✅

### Edge Case 4: Special Characters

**Input**: `"shift & manager"`
**Result**: Search still works (no special handling needed) ✅

### Edge Case 5: Null/Undefined Fields

**Input**: `"test"` when shift.positions is null
**Result**: No crash (handled by `?.` and `|| ""`) ✅

## 🧪 Testing Checklist

### Functional Testing

- [ ] Search by shift name returns correct results
- [ ] Search by position name returns correct results
- [ ] Search by department name returns correct results
- [ ] Partial match works (e.g., "sal" finds "sales")
- [ ] Case-insensitive search works
- [ ] Empty search shows all shifts
- [ ] Spaces-only search shows all shifts
- [ ] No match shows empty state

### UI Testing

- [ ] Search icon displays on the left
- [ ] Placeholder text is clear
- [ ] Counter appears when searching
- [ ] Counter shows correct numbers
- [ ] Stats cards update with filtered data
- [ ] "dari X total" text appears when filtering
- [ ] Empty state displays correctly
- [ ] Grouping maintains structure

### Performance Testing

- [ ] Search is instant (no lag)
- [ ] No unnecessary re-renders
- [ ] Works smoothly with 100+ shifts
- [ ] Debouncing not needed (React is fast enough)

### Edge Case Testing

- [ ] Search with null position name
- [ ] Search with null department name
- [ ] Search with special characters
- [ ] Search with numbers
- [ ] Search with emoji (should work!)
- [ ] Clear search returns to all data

## 📈 Performance Considerations

### Current Implementation

- **Filter runs on every render**: Acceptable for < 1000 shifts
- **No debouncing**: React re-render is fast enough
- **No memoization**: Simple filter logic

### Optimization (if needed for large datasets)

#### Option 1: useMemo

```typescript
const filteredShifts = useMemo(() => {
  return shifts.filter((shift) => {
    // ... filter logic
  });
}, [shifts, searchQuery]);
```

#### Option 2: Debouncing

```typescript
const [debouncedQuery, setDebouncedQuery] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 300);
  return () => clearTimeout(timer);
}, [searchQuery]);
```

#### Option 3: Backend Search

```typescript
// If > 10,000 shifts, move to backend
const result = await getWorkShifts({ search: searchQuery });
```

**Recommendation**: Current implementation sufficient until 1000+ shifts

## 🚀 Future Enhancements

### Phase 2: Advanced Filters

1. **Filter by Type**: Checkbox untuk Regular/Non-Regular
2. **Filter by Time Range**: Shift pagi (00:00-12:00), siang (12:00-18:00), malam (18:00-00:00)
3. **Filter by Duration**: Slider untuk durasi jam kerja
4. **Multi-select Department**: Checkbox multiple departments

### Phase 3: Search Improvements

1. **Search History**: Simpan 5 pencarian terakhir
2. **Search Suggestions**: Autocomplete dari data existing
3. **Fuzzy Search**: Toleransi typo ("salse" → "sales")
4. **Highlight Matches**: Highlight kata yang cocok di hasil

### Phase 4: Export & Bulk Actions

1. **Export Filtered Results**: Download filtered shifts ke Excel
2. **Bulk Edit**: Edit multiple filtered shifts sekaligus
3. **Bulk Delete**: Hapus filtered shifts dengan konfirmasi
4. **Print View**: Cetak daftar shift yang sudah difilter

## 🔧 Maintenance Notes

### Adding New Searchable Fields

To add more fields to search (e.g., shift description):

```typescript
const filteredShifts = shifts.filter((shift) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();
  const positionName = shift.positions?.name?.toLowerCase() || "";
  const deptName = shift.positions?.departments?.name?.toLowerCase() || "";
  const shiftName = shift.name.toLowerCase();
  const description = shift.description?.toLowerCase() || ""; // NEW

  return (
    positionName.includes(query) ||
    deptName.includes(query) ||
    shiftName.includes(query) ||
    description.includes(query) // NEW
  );
});
```

### Changing Search Behavior

To change from "OR" to "AND" logic:

```typescript
// Current: OR logic (any field matches)
return (
  positionName.includes(query) ||
  deptName.includes(query) ||
  shiftName.includes(query)
);

// Change to: AND logic (all words must match somewhere)
const words = query.split(" ");
return words.every(
  (word) =>
    positionName.includes(word) ||
    deptName.includes(word) ||
    shiftName.includes(word)
);
```

## 📝 Related Features

### Dependencies

- **Shift Management**: Core functionality
- **Position Management**: Provides position data
- **Department Management**: Provides department data

### Related Documentation

- [SHIFT_MANAGEMENT_GUIDE.md](./SHIFT_MANAGEMENT_GUIDE.md)
- [SHIFT_BULK_CREATE_FEATURE.md](./SHIFT_BULK_CREATE_FEATURE.md)
- [hris_schema_documentation.md](./hris_schema_documentation.md)

## 🐛 Known Issues

### Current Limitations

1. **No Search History**: User harus re-type setiap kali
2. **No Autocomplete**: Tidak ada suggestion saat mengetik
3. **No Advanced Filters**: Hanya text search, belum ada filter tambahan
4. **No Export Filtered**: Tidak bisa export hasil search

### Workarounds

1. **Search History**: Use browser autofill
2. **Autocomplete**: User familiar dengan data akan tahu apa yang dicari
3. **Advanced Filters**: Combine dengan manual scroll
4. **Export**: Copy-paste manual dari table

## 🎓 Code Structure

```
app/dashboard/shifts/page.tsx
│
├─ State Management
│  └─ const [searchQuery, setSearchQuery] = useState("")
│
├─ Data Fetching
│  └─ fetchShifts() → getWorkShifts()
│
├─ Filter Logic
│  └─ const filteredShifts = shifts.filter(...)
│
├─ Grouping Logic
│  └─ const shiftsByPosition = filteredShifts.reduce(...)
│
└─ UI Components
   ├─ Search Bar (Input with icon)
   ├─ Search Counter (conditional render)
   ├─ Stats Cards (filtered counts)
   └─ Shift Table (filtered & grouped)
```

## 🎉 Success Metrics

Track these metrics to measure feature usage:

1. **Usage Rate**: % of page visits that use search
2. **Search Patterns**: Most common search queries
3. **Time to Find**: Average time to find specific shift
4. **Empty Searches**: % of searches with no results

**Target**:

- 60% usage rate (most users search)
- < 5 seconds to find target shift
- < 10% empty search rate
- 4.5/5 user satisfaction

---

**Created**: October 21, 2025  
**Last Updated**: October 21, 2025  
**Author**: Development Team  
**Status**: ✅ Implemented & Ready for Use
