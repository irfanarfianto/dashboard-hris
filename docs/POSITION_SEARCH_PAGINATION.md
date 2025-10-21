# Position Search & Pagination Feature

## 📋 Overview

Fitur pencarian (search) dan pagination pada halaman Data Posisi/Jabatan memungkinkan user untuk:

- **Search**: Menemukan posisi berdasarkan nama, departemen, perusahaan, level, atau deskripsi
- **Pagination**: Menampilkan data dalam halaman-halaman (10 item per halaman)
- **Real-time filtering**: Hasil muncul langsung saat mengetik
- **Auto-reset pagination**: Pagination kembali ke halaman 1 saat search query berubah

## ✨ Features

### 1. Multi-Field Search

Search bekerja di 5 field sekaligus:

- **Nama Posisi** (contoh: "Sales Manager", "IT Staff")
- **Nama Departemen** (contoh: "Sales", "IT", "HR")
- **Nama Perusahaan** (contoh: "PT ABC", "PT XYZ")
- **Level Jabatan** (contoh: "Manager", "Staff", "Supervisor")
- **Deskripsi** (contoh: "Bertanggung jawab untuk...")

### 2. Pagination

- **10 items per page** (configurable)
- **Page navigation**: Previous, Next, dan direct page buttons
- **Page counter**: "Menampilkan X - Y dari Z posisi"
- **Smart buttons**: Disable prev/next saat di first/last page

### 3. Stats Integration

- **Total count**: Menampilkan jumlah posisi yang terfilter
- **Context info**: "dari X total" saat ada filter aktif

### 4. Responsive Design

- **Desktop**: Full table dengan pagination controls
- **Mobile**: Card layout dengan pagination

## 🎯 Use Cases

### Scenario 1: Cari Posisi Berdasarkan Nama

**Problem**: HR ingin menemukan posisi "Manager"

**Flow**:

1. Ketik "manager" di search bar
2. Sistem filter dan tampilkan semua posisi dengan nama mengandung "manager"
3. Stats card update: "5 dari 50 posisi"
4. Pagination reset ke halaman 1

**Result**: Tampil Sales Manager, HR Manager, IT Manager, dll.

### Scenario 2: Cari Posisi di Departemen Tertentu

**Problem**: HR ingin lihat semua posisi di departemen "IT"

**Flow**:

1. Ketik "IT" di search bar
2. Sistem tampilkan semua posisi di IT Department
3. Jika hasil > 10, pagination muncul

**Result**: IT Manager, IT Staff, IT Support, dll.

### Scenario 3: Navigate Pagination

**Problem**: Ada 50 posisi, ingin lihat halaman 3

**Flow**:

1. Clear search (atau tanpa search)
2. Klik button "3" di pagination
3. Tampil item 21-30

**Result**: Smooth navigation antar halaman

### Scenario 4: Search + Pagination

**Problem**: Search "staff" menghasilkan 25 hasil

**Flow**:

1. Ketik "staff" → Tampil 25 hasil
2. Pagination menampilkan 3 halaman (10, 10, 5)
3. Navigate antar halaman untuk lihat semua hasil

**Result**: Bisa browse semua 25 hasil staff dengan mudah

## 🛠️ Technical Implementation

### 1. Page Component (Client-Side)

**File**: `app/dashboard/positions/page.tsx`

**Converted to Client Component**:

```typescript
"use client";
```

**State Management**:

```typescript
const [positions, setPositions] = useState<Position[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
```

**Data Fetching**:

```typescript
useEffect(() => {
  const fetchPositions = async () => {
    setLoading(true);
    const { data } = await getPositions();
    setPositions(data || []);
    setLoading(false);
  };
  fetchPositions();
}, []);
```

### 2. Search Logic

```typescript
const filteredPositions = positions.filter((position) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();
  const positionName = position.name.toLowerCase();
  const deptName = position.departments?.name?.toLowerCase() || "";
  const companyName =
    position.departments?.companies?.name?.toLowerCase() || "";
  const levelName = position.position_levels?.name?.toLowerCase() || "";
  const description = position.description?.toLowerCase() || "";

  return (
    positionName.includes(query) ||
    deptName.includes(query) ||
    companyName.includes(query) ||
    levelName.includes(query) ||
    description.includes(query)
  );
});
```

**Features**:

- Case-insensitive dengan `.toLowerCase()`
- Null-safe dengan optional chaining `?.`
- Default empty string `|| ""`
- Multi-field OR condition
- Trim whitespace untuk avoid pencarian kosong

### 3. Pagination Logic

```typescript
// Calculate pagination
const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentPositions = filteredPositions.slice(startIndex, endIndex);

// Reset to page 1 when search changes
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);
```

**Key Points**:

- `totalPages`: Berapa halaman total yang dibutuhkan
- `startIndex`: Index awal untuk slice
- `endIndex`: Index akhir untuk slice
- `currentPositions`: Data yang ditampilkan di current page
- Auto-reset pagination saat search query berubah

### 4. UI Components

#### Search Bar

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
  <Input
    placeholder="Cari berdasarkan nama posisi, departemen, perusahaan, level, atau deskripsi..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-10"
  />
</div>;
{
  searchQuery && (
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
      Ditemukan {filteredPositions.length} dari {positions.length} posisi
    </p>
  );
}
```

#### Pagination Controls

```tsx
<div className="flex items-center justify-between mt-4 pt-4 border-t">
  {/* Counter */}
  <div className="text-sm text-gray-600">
    Menampilkan {startIndex + 1} -{" "}
    {Math.min(endIndex, filteredPositions.length)} dari{" "}
    {filteredPositions.length} posisi
  </div>

  {/* Navigation Buttons */}
  <div className="flex items-center gap-2">
    {/* Previous */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      <ChevronLeft className="h-4 w-4" />
      Sebelumnya
    </Button>

    {/* Page Numbers */}
    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(page)}
          className={
            currentPage === page ? "bg-teal-600 hover:bg-teal-700" : ""
          }
        >
          {page}
        </Button>
      ))}
    </div>

    {/* Next */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Selanjutnya
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

#### Stats Card Update

```tsx
<div className="text-2xl font-bold">
  {searchQuery ? filteredPositions.length : positions.length}
</div>
<p className="text-xs text-gray-600">
  {searchQuery ? `dari ${positions.length} total` : "Posisi terdaftar"}
</p>
```

### 5. Table Component Updates

**File**: `components/master-data/PositionTable.tsx`

**New Props**:

```typescript
interface PositionTableProps {
  data: Position[];
  startIndex?: number; // NEW: For sequential numbering
  onRefresh?: () => void; // NEW: Callback after CRUD
}
```

**Sequential Numbering**:

```tsx
<td className="px-4 py-3 text-sm">{startIndex + index + 1}</td>
```

**Refresh Integration**:

```tsx
// In handleDelete
if (onRefresh) {
  onRefresh();
} else {
  router.refresh();
}

// In PositionDialog
<PositionDialog mode="edit" data={position} onSuccess={onRefresh}>
```

### 6. Dialog Component Updates

**File**: `components/master-data/PositionDialog.tsx`

**New Prop**:

```typescript
interface PositionDialogProps {
  mode: "create" | "edit";
  data?: Position;
  children: React.ReactNode;
  onSuccess?: () => void; // NEW: Callback after save
}
```

**Usage**:

```tsx
if (result.success) {
  setIsOpen(false);

  if (onSuccess) {
    onSuccess(); // Call parent's refresh
  } else {
    router.refresh(); // Fallback to router refresh
  }

  // Reset form...
}
```

## 🎨 UI/UX Design

### Search Bar

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Cari berdasarkan nama posisi, departemen, perusahaan...   │
│                                                               │
│ Ditemukan 5 dari 50 posisi                                   │
└──────────────────────────────────────────────────────────────┘
```

### Pagination Controls

```
┌──────────────────────────────────────────────────────────────┐
│ Menampilkan 11 - 20 dari 50 posisi                           │
│                                                               │
│ [< Sebelumnya] [1] [2] [3] [4] [5] [Selanjutnya >]          │
│                     ^^^                                       │
│                  (active)                                     │
└──────────────────────────────────────────────────────────────┘
```

### Empty State (No Results)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│            Tidak ada posisi yang sesuai dengan pencarian     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Table with Pagination

```
┌──────────────────────────────────────────────────────────────┐
│ No │ Nama Posisi    │ Departemen │ Perusahaan │ Level │ Aksi│
├────┼────────────────┼────────────┼────────────┼───────┼─────┤
│ 11 │ Sales Manager  │ Sales      │ PT ABC     │ Mngr  │ ✏️🗑️│
│ 12 │ IT Staff       │ IT         │ PT ABC     │ Staff │ ✏️🗑️│
│ 13 │ HR Manager     │ HR         │ PT ABC     │ Mngr  │ ✏️🗑️│
│ ...│                                                          │
│ 20 │ Finance Staff  │ Finance    │ PT XYZ     │ Staff │ ✏️🗑️│
└──────────────────────────────────────────────────────────────┘

Menampilkan 11 - 20 dari 50 posisi
[< Sebelumnya] [1] [2] [3] [4] [5] [Selanjutnya >]
```

## 📊 Data Flow

```
User Input → searchQuery State
          ↓
    Filter Logic → filteredPositions
          ↓
    Pagination Logic → currentPositions (slice)
          ↓
    ┌─────┴─────┐
    ↓           ↓
  Stats      Table Render
  Card       (with page data)
```

### Detailed Flow

1. **User types in search**

   ```
   onChange={(e) => setSearchQuery(e.target.value)}
   ```

2. **Filter runs automatically**

   ```
   const filteredPositions = positions.filter(...)
   ```

3. **Pagination resets** (via useEffect)

   ```
   setCurrentPage(1)
   ```

4. **Calculate current page data**

   ```
   const currentPositions = filteredPositions.slice(startIndex, endIndex)
   ```

5. **Render table + pagination**
   ```
   <PositionTable data={currentPositions} startIndex={startIndex} />
   <PaginationControls ... />
   ```

## ✅ Validation & Edge Cases

### Edge Case 1: Empty Search

**Input**: `""` (empty string)
**Result**: Show all positions ✅

### Edge Case 2: No Results

**Input**: `"xyz123"` (tidak ada match)
**Result**: Show empty state message ✅

### Edge Case 3: Results Less Than Page Size

**Input**: Search returns 5 results (< 10)
**Result**: Show all in single page, hide pagination ✅

### Edge Case 4: Exactly Page Size

**Input**: 10 results exactly
**Result**: Show 1 page, hide pagination ✅

### Edge Case 5: Search While on Page 3

**Input**: On page 3, user searches
**Result**: Auto-reset to page 1 ✅

### Edge Case 6: Delete Last Item on Page

**Input**: Delete last item on page 2
**Behavior**: Stay on page 2 (or show empty if only item)
**Enhancement**: Could auto-go to previous page

## 🧪 Testing Checklist

### Search Functionality

- [ ] Search by position name works
- [ ] Search by department name works
- [ ] Search by company name works
- [ ] Search by level name works
- [ ] Search by description works
- [ ] Partial match works
- [ ] Case-insensitive search works
- [ ] Empty search shows all positions
- [ ] No match shows empty state
- [ ] Search counter displays correctly

### Pagination Functionality

- [ ] Page 1 shows items 1-10
- [ ] Page 2 shows items 11-20
- [ ] Last page shows remaining items
- [ ] Previous button disabled on page 1
- [ ] Next button disabled on last page
- [ ] Direct page click works
- [ ] Active page highlighted
- [ ] Counter shows correct range

### Integration

- [ ] Search + pagination works together
- [ ] Pagination resets to page 1 on search
- [ ] Stats card updates with filtered count
- [ ] Create position refreshes list
- [ ] Edit position refreshes list
- [ ] Delete position refreshes list
- [ ] Sequential numbering correct across pages

### UI/UX

- [ ] Search icon visible
- [ ] Placeholder text clear
- [ ] Search counter appears when searching
- [ ] Empty state displays when no results
- [ ] Pagination controls styled correctly
- [ ] Loading state shows when fetching
- [ ] Responsive on mobile

### Performance

- [ ] Search is instant (no lag)
- [ ] Pagination smooth
- [ ] No unnecessary re-renders
- [ ] Works with 100+ positions

## 📈 Performance Considerations

### Current Implementation

✅ **Good**:

- Client-side filtering (instant)
- Simple slice operation for pagination
- Minimal re-renders

⚠️ **Could be improved for large datasets (1000+ items)**:

- No virtualization
- Loads all data upfront
- No backend pagination

### Optimization (Future)

#### Option 1: useMemo for Filtered Data

```typescript
const filteredPositions = useMemo(() => {
  return positions.filter((position) => {
    // ... filter logic
  });
}, [positions, searchQuery]);
```

#### Option 2: Backend Pagination

```typescript
// When > 1000 positions, move to backend
const result = await getPositions({
  search: searchQuery,
  page: currentPage,
  limit: itemsPerPage,
});
```

#### Option 3: Virtual Scrolling

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";
// Render only visible items
```

**Recommendation**: Current implementation sufficient until 500+ positions

## 🚀 Future Enhancements

### Phase 2: Advanced Filters

1. **Filter by Department**: Dropdown multi-select departments
2. **Filter by Company**: Dropdown multi-select companies
3. **Filter by Level**: Dropdown select position level
4. **Filter by Date**: Created date range picker

### Phase 3: Sort Features

1. **Sort by Name**: A-Z, Z-A
2. **Sort by Department**: Group by department
3. **Sort by Level**: By rank order
4. **Custom Sort**: Drag & drop to reorder

### Phase 4: Export & Bulk Actions

1. **Export to Excel**: Download filtered positions
2. **Export to PDF**: Print-friendly format
3. **Bulk Delete**: Select multiple and delete
4. **Bulk Edit**: Edit multiple positions at once

### Phase 5: Advanced Pagination

1. **Page Size Selector**: Choose 10, 25, 50, 100 per page
2. **Jump to Page**: Input box to jump directly
3. **Infinite Scroll**: Alternative to pagination
4. **"Load More" Button**: Append instead of replace

## 🔧 Configuration

### Change Items Per Page

```typescript
const itemsPerPage = 20; // Change from 10 to 20
```

### Change Searchable Fields

```typescript
// Add new field (e.g., code)
const code = position.code?.toLowerCase() || "";

return (
  positionName.includes(query) ||
  deptName.includes(query) ||
  code.includes(query) // NEW
);
```

### Change Pagination Style

```typescript
// Option 1: Show only 5 page buttons
const visiblePages = 5;

// Option 2: Show ellipsis
// [1] [2] [3] ... [10]

// Option 3: Simple prev/next only
// Remove page number buttons
```

## 📝 Related Features

### Dependencies

- Position Management (core feature)
- Department Management (for filter data)
- Company Management (for filter data)
- Position Level Management (for filter data)

### Related Documentation

- [Position Management Guide](./POSITION_MANAGEMENT_GUIDE.md) (if exists)
- [Shift Search Feature](./SHIFT_SEARCH_FEATURE.md)
- [Master Data Guide](./MASTER_DATA_GUIDE.md) (if exists)

## 🐛 Known Issues

### Current Limitations

1. **No URL State**: Search & page not in URL (can't share/bookmark)
2. **No Search History**: No autocomplete or recent searches
3. **Fixed Page Size**: Can't change items per page
4. **All Page Buttons**: May be too many buttons if 100+ pages

### Workarounds

1. **URL State**: Use query params (next implementation)
2. **Search History**: Use localStorage
3. **Page Size**: Add dropdown selector
4. **Too Many Buttons**: Show ellipsis or limit visible pages

## 🎓 Code Examples

### Example 1: Change Page Programmatically

```typescript
// Go to specific page
setCurrentPage(3);

// Go to first page
setCurrentPage(1);

// Go to last page
setCurrentPage(totalPages);
```

### Example 2: Get Current Page Data

```typescript
const currentPageItems = currentPositions;
console.log(currentPageItems); // Array of 10 positions
```

### Example 3: Check Pagination State

```typescript
const isFirstPage = currentPage === 1;
const isLastPage = currentPage === totalPages;
const hasMultiplePages = totalPages > 1;
```

## 🎉 Success Metrics

Track these metrics:

1. **Search Usage Rate**: % of users who use search
2. **Average Search Query Length**: Characters typed
3. **Search Success Rate**: % searches with results
4. **Pagination Usage**: % users who navigate pages
5. **Page Views Distribution**: Which pages viewed most

**Target**:

- 70% search usage rate
- < 5% empty search rate
- Average 2 pages viewed per session
- 4.5/5 user satisfaction

---

**Created**: October 21, 2025  
**Last Updated**: October 21, 2025  
**Author**: Development Team  
**Status**: ✅ Implemented & Ready for Testing
