# 🔍 Cara Menambahkan Search & Pagination

Panduan step-by-step untuk menambahkan fitur search dan pagination ke halaman list existing.

## Daftar Isi

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Convert to Client Component](#step-1-convert-to-client-component)
- [Step 2: Add State Management](#step-2-add-state-management)
- [Step 3: Implement Search Filter](#step-3-implement-search-filter)
- [Step 4: Implement Pagination](#step-4-implement-pagination)
- [Step 5: Add Search UI](#step-5-add-search-ui)
- [Step 6: Add Pagination UI](#step-6-add-pagination-ui)
- [Step 7: Update Stats](#step-7-update-stats)
- [Complete Example](#complete-example)

---

## Overview

Pattern yang digunakan untuk search & pagination:

1. ✅ Convert page ke client component
2. ✅ Move data fetching ke useEffect
3. ✅ Add search state & filter logic
4. ✅ Add pagination state & slice logic
5. ✅ Add search bar UI
6. ✅ Add pagination controls UI
7. ✅ Update stats untuk filtered data

**Target**: 10 items per page dengan multi-field search

---

## Prerequisites

**Before**: Server component dengan direct query

```typescript
// ❌ OLD WAY - Server Component
export default async function ItemsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("items").select();

  return <ItemTable items={data} />;
}
```

**After**: Client component dengan search & pagination

```typescript
// ✅ NEW WAY - Client Component
"use client";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // ... implementation
}
```

---

## Step 1: Convert to Client Component

### 1.1 Add "use client" Directive

**Before:**

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function ItemsPage() {
  // ...
}
```

**After:**

```typescript
"use client"; // ← Add this

import { useEffect, useState } from "react"; // ← Add React hooks
import { createClient } from "@/lib/supabase/client"; // ← Change to client

export default function ItemsPage() {
  // ← Remove async
  // ...
}
```

### 1.2 Update Imports

```typescript
// Remove server imports
- import { createClient } from "@/lib/supabase/server";

// Add client imports
+ "use client";
+ import { useEffect, useState } from "react";
+ import { createClient } from "@/lib/supabase/client";
+ import { Search, ChevronLeft, ChevronRight } from "lucide-react";
+ import { Input } from "@/components/ui/input";
```

---

## Step 2: Add State Management

### 2.1 Define States

```typescript
export default function ItemsPage() {
  // Data state
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Consistent across all pages

  // ... rest of implementation
}
```

### 2.2 Move Data Fetching to useEffect

```typescript
// Create fetch function
const fetchItems = async () => {
  setLoading(true);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("items")
    .select(
      `
      id,
      name,
      // ... other fields
      related_table:related_id (
        name
      )
    `
    )
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching items:", error);
  }

  setItems(data || []);
  setLoading(false);
};

// Call on mount
useEffect(() => {
  fetchItems();
}, []);

// Create refresh handler for CRUD operations
const handleRefresh = () => {
  fetchItems();
};
```

---

## Step 3: Implement Search Filter

### 3.1 Multi-Field Filter Logic

```typescript
// Filter items based on search query
const filteredItems = items.filter((item) => {
  // If no search, show all
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();

  // Search in multiple fields
  const name = item.name.toLowerCase();
  const code = item.code?.toLowerCase() || "";
  const description = item.description?.toLowerCase() || "";
  const relatedName = item.related_table?.name?.toLowerCase() || "";

  return (
    name.includes(query) ||
    code.includes(query) ||
    description.includes(query) ||
    relatedName.includes(query)
  );
});
```

### 3.2 Tips untuk Search Fields

```typescript
// ✅ GOOD - Null-safe searching
const email = item.email?.toLowerCase() || "";

// ❌ BAD - Will crash if null
const email = item.email.toLowerCase();

// ✅ GOOD - Trim whitespace
if (!searchQuery.trim()) return true;

// ❌ BAD - Empty space counts as search
if (!searchQuery) return true;
```

---

## Step 4: Implement Pagination

### 4.1 Calculate Pagination Values

```typescript
// Calculate total pages
const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

// Calculate current slice indexes
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

// Get current page items
const currentItems = filteredItems.slice(startIndex, endIndex);
```

### 4.2 Reset Page on Search Change

```typescript
// Reset to page 1 when search query changes
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);
```

### 4.3 Page Navigation Handlers

```typescript
// Previous page
const handlePrevious = () => {
  setCurrentPage((prev) => Math.max(1, prev - 1));
};

// Next page
const handleNext = () => {
  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
};

// Direct page
const handlePageClick = (page: number) => {
  setCurrentPage(page);
};
```

---

## Step 5: Add Search UI

### 5.1 Search Bar Component

```typescript
{
  /* Search Bar */
}
<div className="flex items-center gap-2">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Cari berdasarkan nama, kode, atau deskripsi..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-9"
    />
  </div>
  {searchQuery && (
    <span className="text-sm text-muted-foreground whitespace-nowrap">
      {filteredItems.length} hasil
    </span>
  )}
</div>;
```

### 5.2 Search Placeholder Tips

```typescript
// ✅ GOOD - Specific and informative
placeholder = "Cari berdasarkan nama, email, departemen, atau posisi...";

// ❌ BAD - Too generic
placeholder = "Cari...";
```

---

## Step 6: Add Pagination UI

### 6.1 Simple Pagination (Prev/Next Only)

```typescript
{
  /* Pagination Controls */
}
{
  totalPages > 1 && (
    <div className="mt-6 flex items-center justify-between border-t pt-4">
      <div className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages} ({filteredItems.length} total)
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
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

### 6.2 Advanced Pagination (With Page Numbers)

```typescript
{
  /* Pagination with page numbers */
}
{
  totalPages > 1 && (
    <div className="mt-6 flex items-center justify-between border-t pt-4">
      <div className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
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

        {/* Page numbers (hidden on mobile) */}
        <div className="hidden sm:flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first, last, current, and adjacent pages
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
                  className="w-10"
                >
                  {page}
                </Button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="px-2 py-1">
                  ...
                </span>
              );
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

---

## Step 7: Update Stats

### 7.1 Update Stats to Show Filtered Count

**Before:**

```typescript
<CardContent>
  <div className="text-2xl font-bold">{items.length}</div>
  <p className="text-xs text-muted-foreground">Total items</p>
</CardContent>
```

**After:**

```typescript
<CardContent>
  <div className="text-2xl font-bold">{filteredItems.length}</div>
  <p className="text-xs text-muted-foreground">
    {searchQuery ? "Hasil pencarian" : "Total items"}
  </p>
</CardContent>
```

### 7.2 Gender-Based Stats (For Employees)

```typescript
// Calculate from filtered data
const maleCount = filteredItems.filter((e) => e.gender === "L").length;
const femaleCount = filteredItems.filter((e) => e.gender === "P").length;

// Use in stats cards
<div className="text-2xl font-bold">{maleCount}</div>
<div className="text-2xl font-bold">{femaleCount}</div>
```

---

## Step 8: Update Table Component

### 8.1 Pass Correct Data

**Before:**

```typescript
<ItemTable items={items} />
```

**After:**

```typescript
<ItemTable
  items={currentItems} // ← Use paginated data
  startIndex={startIndex} // ← For sequential numbering
  onRefresh={handleRefresh} // ← For CRUD refresh
/>
```

### 8.2 Update Table Component Props

```typescript
interface ItemTableProps {
  items: Item[];
  startIndex?: number;  // ← Add this
  onRefresh?: () => void;  // ← Add this
}

export default function ItemTable({
  items,
  startIndex = 0,  // ← Default to 0
  onRefresh
}: ItemTableProps) {
  // Use startIndex for numbering
  <td>{startIndex + index + 1}</td>

  // Pass onRefresh to dialogs
  <ItemDialog item={item} onSuccess={onRefresh} />
  <DeleteButton itemId={item.id} onSuccess={onRefresh} />
}
```

---

## Step 9: Update CRUD Components

### 9.1 Add onSuccess Callback to Dialog

```typescript
interface ItemDialogProps {
  children: React.ReactNode;
  item?: Item;
  onSuccess?: () => void; // ← Add this
}

export default function ItemDialog({
  children,
  item,
  onSuccess,
}: ItemDialogProps) {
  const handleSubmit = async () => {
    // ... save logic

    if (result.success) {
      toast.success("Berhasil");
      setIsOpen(false);
      if (onSuccess) onSuccess(); // ← Call callback
    }
  };
}
```

### 9.2 Add onSuccess to Delete Button

```typescript
interface DeleteButtonProps {
  itemId: number;
  itemName: string;
  onSuccess?: () => void; // ← Add this
}

export default function DeleteButton({
  itemId,
  itemName,
  onSuccess,
}: DeleteButtonProps) {
  const handleDelete = async () => {
    // ... delete logic

    if (result.success) {
      toast.success("Berhasil dihapus");
      if (onSuccess) onSuccess(); // ← Call callback
    }
  };
}
```

---

## Complete Example

### Full Page Implementation

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ItemTable from "@/components/ItemTable";
import ItemDialog from "@/components/ItemDialog";

interface Item {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export default function ItemsPage() {
  // States
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  const fetchItems = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .is("deleted_at", null)
      .order("name");

    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      (item.description?.toLowerCase() || "").includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRefresh = () => {
    fetchItems();
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Items</h1>
          <p className="text-muted-foreground">Manage your items</p>
        </div>
        <ItemDialog onSuccess={handleRefresh}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </ItemDialog>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Total Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredItems.length}</div>
          <p className="text-xs text-muted-foreground">
            {searchQuery ? "Search results" : "Total items"}
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery && (
          <span className="text-sm text-muted-foreground">
            {filteredItems.length} results
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          <ItemTable
            items={currentItems}
            startIndex={startIndex}
            onRefresh={handleRefresh}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Checklist

- [ ] Convert to client component with "use client"
- [ ] Add useState for data, loading, search, pagination
- [ ] Move data fetching to useEffect
- [ ] Implement multi-field search filter
- [ ] Implement pagination logic (10 items/page)
- [ ] Add search bar UI with icon
- [ ] Add pagination controls (prev/next)
- [ ] Update stats to show filtered counts
- [ ] Pass startIndex to table component
- [ ] Pass onRefresh to CRUD components
- [ ] Test: search updates stats correctly
- [ ] Test: pagination resets on search
- [ ] Test: sequential numbering across pages
- [ ] Test: CRUD operations refresh data

---

## Common Mistakes

### ❌ Mistake 1: Using Original Data in Table

```typescript
// Wrong - Uses all data
<ItemTable items={items} />

// Correct - Uses paginated data
<ItemTable items={currentItems} startIndex={startIndex} />
```

### ❌ Mistake 2: Not Resetting Page on Search

```typescript
// Wrong - Page might be out of bounds after search
// (no useEffect)

// Correct - Reset to page 1
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);
```

### ❌ Mistake 3: Stats Not Updated

```typescript
// Wrong - Shows total, not filtered
<div>{items.length}</div>

// Correct - Shows filtered count
<div>{filteredItems.length}</div>
```

### ❌ Mistake 4: Null-Unsafe Search

```typescript
// Wrong - Crashes if null
item.email
  .toLowerCase()
  .includes(query)
  (
    // Correct - Null-safe
    item.email?.toLowerCase() || ""
  )
  .includes(query);
```

---

## Performance Tips

1. **Client-side filtering** for < 1000 records
2. **Server-side filtering** for > 1000 records
3. **Debounce search** for expensive operations
4. **Memoize filtered data** with useMemo if needed
5. **Lazy load** images in tables

---

## Related Documentation

- [CREATE_CRUD_FEATURE.md](./CREATE_CRUD_FEATURE.md) - Full CRUD implementation
- [EMPLOYEE_SEARCH_PAGINATION.md](../EMPLOYEE_SEARCH_PAGINATION.md) - Real example
- [POSITION_SEARCH_PAGINATION.md](../POSITION_SEARCH_PAGINATION.md) - Real example

---

**Last Updated**: 2025-01-21
