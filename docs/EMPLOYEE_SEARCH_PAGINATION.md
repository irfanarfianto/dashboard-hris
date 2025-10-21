# Employee Search & Pagination Feature

## Overview

Implementasi fitur pencarian dan paginasi pada halaman Data Karyawan untuk memudahkan pencarian dan navigasi karyawan dalam jumlah besar.

## Fitur Utama

### 1. Multi-Field Search

Search bar yang dapat mencari karyawan berdasarkan:

- **Nama Lengkap** - Pencarian nama karyawan
- **Email** - Pencarian berdasarkan alamat email
- **Nama Departemen** - Filter berdasarkan departemen
- **Nama Posisi** - Filter berdasarkan posisi/jabatan

### 2. Pagination

- **Items per page**: 10 karyawan per halaman
- **Navigation controls**: Tombol Previous/Next dan direct page buttons
- **Sequential numbering**: Nomor urut tetap konsisten di setiap halaman
- **Smart page display**: Menampilkan halaman pertama, terakhir, dan halaman terdekat

### 3. Dynamic Stats

Stats cards yang update real-time berdasarkan filter:

- **Total Karyawan**: Jumlah total karyawan (filtered)
- **Laki-laki**: Jumlah karyawan pria dari hasil filter
- **Perempuan**: Jumlah karyawan wanita dari hasil filter

### 4. Auto-refresh

- Refresh otomatis setelah menambah karyawan baru
- Refresh otomatis setelah menghapus karyawan
- Tetap di halaman yang sama setelah CRUD operation

## Technical Implementation

### Component Conversion

```typescript
// Before: Server Component
export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase.from("employees").select(...)
}

// After: Client Component
"use client"
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchEmployees()
  }, [])
}
```

### Search Logic

```typescript
const filteredEmployees = employees.filter((employee) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();
  const fullName = employee.full_name.toLowerCase();
  const email = employee.email?.toLowerCase() || "";
  const deptName = employee.departments?.name?.toLowerCase() || "";
  const positionName = employee.positions?.name?.toLowerCase() || "";

  return (
    fullName.includes(query) ||
    email.includes(query) ||
    deptName.includes(query) ||
    positionName.includes(query)
  );
});
```

### Pagination Logic

```typescript
const itemsPerPage = 10;
const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

// Reset to page 1 when search changes
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);
```

### Stats Calculation

```typescript
// Calculate stats from filtered data (not all data)
const maleCount = filteredEmployees.filter((e) => e.gender === "L").length;
const femaleCount = filteredEmployees.filter((e) => e.gender === "P").length;

<div className="text-2xl font-bold">{filteredEmployees.length}</div>
<p className="text-xs text-muted-foreground">
  {searchQuery ? "Hasil pencarian" : "Karyawan terdaftar"}
</p>
```

### Sequential Numbering

```typescript
// Table rows use startIndex for consistent numbering across pages
<td className="px-4 py-3 text-sm">{startIndex + index + 1}</td>

// Example:
// Page 1: 1-10
// Page 2: 11-20
// Page 3: 21-30
```

## UI Components

### Search Bar

```typescript
<div className="flex items-center gap-2">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
    <Input
      type="text"
      placeholder="Cari berdasarkan nama, email, departemen, atau posisi..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-9"
    />
  </div>
  {searchQuery && (
    <span className="text-sm text-muted-foreground">
      {filteredEmployees.length} hasil
    </span>
  )}
</div>
```

### Pagination Controls

```typescript
{
  totalPages > 1 && (
    <div className="mt-6 flex items-center justify-between border-t pt-4">
      <div className="text-sm text-gray-500">
        Halaman {currentPage} dari {totalPages} ({filteredEmployees.length}{" "}
        total)
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        {/* Smart page number display */}
        <div className="hidden sm:flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page}>...</span>;
            }
            return null;
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

## Refresh Callbacks

### AddEmployeeDialog

```typescript
// Parent component
<AddEmployeeDialog onSuccess={handleRefresh}>
  <Button>Tambah Karyawan</Button>
</AddEmployeeDialog>;

// Hook accepts callback
export function useAddEmployeeForm(onSuccess?: () => void) {
  const handleClose = () => {
    setIsOpen(false);
    resetForm();
    if (showSuccess && onSuccess) {
      onSuccess();
    }
  };
}
```

### DeleteButton

```typescript
// Parent component
<DeleteButton
  employeeId={employee.id}
  employeeName={employee.full_name}
  onSuccess={handleRefresh}
/>;

// Component uses callback
if (result.success) {
  toast.success("Karyawan berhasil diarsipkan");
  setShowDialog(false);
  if (onSuccess) {
    onSuccess();
  } else {
    router.refresh();
  }
}
```

## Files Modified

1. **app/dashboard/employees/page.tsx**

   - Converted from server to client component
   - Added search and pagination state
   - Implemented filter logic
   - Added search bar UI
   - Added pagination controls
   - Added refresh callback

2. **components/employees/AddEmployeeDialog.tsx**

   - Added `onSuccess?: () => void` prop
   - Passed callback to useAddEmployeeForm hook

3. **components/employees/add-employee-steps/useAddEmployeeForm.ts**

   - Added `onSuccess?: () => void` parameter
   - Call onSuccess in handleClose when success

4. **components/employees/DeleteButton.tsx**
   - Added `onSuccess?: () => void` prop
   - Call onSuccess instead of router.refresh if provided

## Testing Checklist

### Search Functionality

- [ ] Search by full name (case-insensitive)
- [ ] Search by partial name
- [ ] Search by email address
- [ ] Search by department name
- [ ] Search by position name
- [ ] Empty search shows all employees
- [ ] Search counter shows correct count

### Pagination

- [ ] Shows 10 employees per page
- [ ] Previous button disabled on page 1
- [ ] Next button disabled on last page
- [ ] Direct page buttons work correctly
- [ ] Sequential numbering correct across pages (1-10, 11-20, etc.)
- [ ] Page info shows correct totals

### Stats Cards

- [ ] Total count matches filtered employees
- [ ] Male count correct from filtered data
- [ ] Female count correct from filtered data
- [ ] Stats update when search changes
- [ ] Description shows "Hasil pencarian" when searching

### Gender-Specific Filtering

- [ ] Male count: filters `gender === "L"` from filtered data
- [ ] Female count: filters `gender === "P"` from filtered data
- [ ] Counts update correctly with search

### CRUD Operations

- [ ] Add employee → dialog closes → list refreshes → shows new employee
- [ ] Delete employee → confirmation → list refreshes → employee removed
- [ ] Stay on same page after refresh (if page still valid)
- [ ] Return to page 1 if current page becomes empty

### Responsive Design

- [ ] Desktop: table view with all columns
- [ ] Mobile: card layout with essential info
- [ ] Search bar responsive on all sizes
- [ ] Pagination controls responsive
- [ ] Page numbers hidden on mobile, show on sm+

### Edge Cases

- [ ] Empty state when no employees
- [ ] Empty state when search has no results
- [ ] Single page (< 10 employees) hides pagination
- [ ] Large numbers of employees load correctly
- [ ] Special characters in search work properly
- [ ] Null/empty email fields don't break search

## Performance Considerations

### Client-Side Filtering

- Semua filtering dilakukan di client-side
- Data di-fetch sekali saat mount
- Performa baik untuk < 1000 karyawan
- Untuk dataset besar (> 1000), pertimbangkan server-side pagination

### Optimization Tips

```typescript
// Use React.memo for table rows if needed
const EmployeeRow = React.memo(({ employee, index }) => {
  // row component
});

// Debounce search for very large datasets
const debouncedSearch = useDebounce(searchQuery, 300);
```

## Differences from Positions Page

### Additional Search Field

- Positions: 5 fields (name, dept, company, level, description)
- Employees: 4 fields (name, email, dept, position)
- Email adalah field unik untuk employees

### Gender-Specific Stats

- Employees memiliki stats berbasis gender
- Stats harus filter berdasarkan gender DAN hasil pencarian

```typescript
const maleCount = filteredEmployees.filter((e) => e.gender === "L").length;
const femaleCount = filteredEmployees.filter((e) => e.gender === "P").length;
```

### Avatar Component

- Employees menampilkan avatar dengan initial huruf pertama nama
- Avatar tetap berfungsi dengan pagination

```typescript
<div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
  <span className="text-sm font-medium text-purple-600">
    {employee.full_name.charAt(0).toUpperCase()}
  </span>
</div>
```

### CRUD Complexity

- Employees memiliki multi-step dialog form (5 steps)
- Delete adalah soft delete (archived, bukan hard delete)
- Callback pattern sama dengan positions

## Future Enhancements

1. **Advanced Filters**

   - Filter by gender dropdown
   - Filter by department dropdown
   - Filter by employment type
   - Date range filter (hire date)

2. **Sorting**

   - Sort by name (A-Z, Z-A)
   - Sort by hire date
   - Sort by department

3. **Export**

   - Export filtered results to Excel
   - Export to PDF
   - Print view

4. **Bulk Actions**

   - Select multiple employees
   - Bulk delete (archive)
   - Bulk assign to department/shift

5. **Server-Side Pagination**
   - For very large datasets (> 1000 employees)
   - Reduce initial load time
   - API: `/api/employees?page=1&limit=10&search=query`

## Related Documentation

- [Position Search & Pagination](./POSITION_SEARCH_PAGINATION.md) - Reference implementation
- [Shift Search Feature](./SHIFT_SEARCH_FEATURE.md) - Basic search only
- [Employee Feature Guide](./EMPLOYEE_FEATURE_GUIDE.md) - Complete employee management
- [Loading Component Guide](./LOADING_COMPONENT_GUIDE.md) - Loading states

## Conclusion

Fitur search dan pagination pada Data Karyawan sekarang konsisten dengan Data Posisi, dengan tambahan:

- Stats berbasis gender yang update dengan filter
- Search field tambahan untuk email
- Avatar component yang terintegrasi
- Refresh callbacks untuk semua CRUD operations
