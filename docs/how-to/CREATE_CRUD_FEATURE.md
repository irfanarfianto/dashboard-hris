# 🛠️ Cara Membuat Fitur CRUD Baru

Panduan langkah demi langkah untuk membuat fitur CRUD (Create, Read, Update, Delete) baru di HRIS Bharata.

## Daftar Isi

- [Overview](#overview)
- [Step 1: Database Schema](#step-1-database-schema)
- [Step 2: Server Actions](#step-2-server-actions)
- [Step 3: Page Component](#step-3-page-component)
- [Step 4: Table Component](#step-4-table-component)
- [Step 5: Form Dialog](#step-5-form-dialog)
- [Step 6: Delete Component](#step-6-delete-component)
- [Checklist](#checklist)

---

## Overview

Untuk membuat fitur CRUD baru, kita perlu membuat:

1. ✅ Database table & migration
2. ✅ Server actions untuk operasi database
3. ✅ Page component untuk menampilkan data
4. ✅ Table component untuk list view
5. ✅ Form dialog untuk Create/Update
6. ✅ Delete button/dialog untuk Delete

**Contoh**: Kita akan membuat fitur untuk mengelola "Departments" (Departemen)

---

## Step 1: Database Schema

### 1.1 Buat Migration File

**File**: `migrations/create_departments_table.sql`

```sql
-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  company_id BIGINT REFERENCES companies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create index for better query performance
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_departments_deleted_at ON departments(deleted_at);
CREATE INDEX idx_departments_code ON departments(code);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create policy (authenticated users can read)
CREATE POLICY "Allow authenticated users to read departments"
  ON departments FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Create policy (authenticated users can insert)
CREATE POLICY "Allow authenticated users to insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy (authenticated users can update)
CREATE POLICY "Allow authenticated users to update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE departments IS 'Master data for company departments';
COMMENT ON COLUMN departments.code IS 'Unique department code';
COMMENT ON COLUMN departments.company_id IS 'Reference to company';
```

### 1.2 Jalankan Migration

```bash
# Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Paste SQL above
# 3. Run query

# Or via CLI
supabase db push
```

---

## Step 2: Server Actions

### 2.1 Buat File Actions

**File**: `lib/actions/departmentActions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

// Type Definitions
export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  company_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  companies?: {
    name: string;
  };
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
  company_id: number;
  is_active?: boolean;
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {
  id: number;
}

// ============================================================================
// READ Operations
// ============================================================================

/**
 * Get all departments (not deleted)
 */
export async function getDepartments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select(
      `
      id,
      name,
      code,
      description,
      company_id,
      is_active,
      created_at,
      updated_at,
      companies:company_id (
        name
      )
    `
    )
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching departments:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data as Department[] };
}

/**
 * Get single department by ID
 */
export async function getDepartmentById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select(
      `
      id,
      name,
      code,
      description,
      company_id,
      is_active,
      created_at,
      updated_at,
      companies:company_id (
        name
      )
    `
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching department:", error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: data as Department };
}

// ============================================================================
// CREATE Operation
// ============================================================================

/**
 * Create new department
 */
export async function createDepartment(input: CreateDepartmentInput) {
  const supabase = await createClient();

  // Validation
  if (!input.name || !input.code || !input.company_id) {
    return {
      success: false,
      error: "Nama, kode, dan perusahaan wajib diisi",
    };
  }

  // Check if code already exists
  const { data: existing } = await supabase
    .from("departments")
    .select("id")
    .eq("code", input.code)
    .is("deleted_at", null)
    .single();

  if (existing) {
    return {
      success: false,
      error: "Kode departemen sudah digunakan",
    };
  }

  // Insert data
  const { data, error } = await supabase
    .from("departments")
    .insert({
      name: input.name,
      code: input.code,
      description: input.description || null,
      company_id: input.company_id,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating department:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Departemen berhasil ditambahkan",
    data,
  };
}

// ============================================================================
// UPDATE Operation
// ============================================================================

/**
 * Update existing department
 */
export async function updateDepartment(input: UpdateDepartmentInput) {
  const supabase = await createClient();

  // Validation
  if (!input.id) {
    return { success: false, error: "ID departemen diperlukan" };
  }

  // Check if code is being changed and already exists
  if (input.code) {
    const { data: existing } = await supabase
      .from("departments")
      .select("id")
      .eq("code", input.code)
      .neq("id", input.id)
      .is("deleted_at", null)
      .single();

    if (existing) {
      return {
        success: false,
        error: "Kode departemen sudah digunakan",
      };
    }
  }

  // Update data
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.code !== undefined) updateData.code = input.code;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.company_id !== undefined) updateData.company_id = input.company_id;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;

  const { data, error } = await supabase
    .from("departments")
    .update(updateData)
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating department:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Departemen berhasil diperbarui",
    data,
  };
}

// ============================================================================
// DELETE Operation (Soft Delete)
// ============================================================================

/**
 * Soft delete department
 */
export async function softDeleteDepartment(id: number) {
  const supabase = await createClient();

  if (!id) {
    return { success: false, error: "ID departemen diperlukan" };
  }

  const { error } = await supabase
    .from("departments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting department:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Departemen berhasil dihapus",
  };
}

/**
 * Restore soft-deleted department
 */
export async function restoreDepartment(id: number) {
  const supabase = await createClient();

  if (!id) {
    return { success: false, error: "ID departemen diperlukan" };
  }

  const { error } = await supabase
    .from("departments")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) {
    console.error("Error restoring department:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Departemen berhasil dipulihkan",
  };
}

// ============================================================================
// HELPER Functions
// ============================================================================

/**
 * Get companies for dropdown (reference data)
 */
export async function getCompaniesForDepartment() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data };
}
```

---

## Step 3: Page Component

### 3.1 Buat Page dengan Search & Pagination

**File**: `app/dashboard/departments/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Plus,
} from "lucide-react";
import { getDepartments, Department } from "@/lib/actions/departmentActions";
import DepartmentTable from "@/components/master-data/DepartmentTable";
import DepartmentDialog from "@/components/master-data/DepartmentDialog";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  const fetchDepartments = async () => {
    setLoading(true);
    const result = await getDepartments();
    if (result.success) {
      setDepartments(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const name = dept.name.toLowerCase();
    const code = dept.code.toLowerCase();
    const companyName = dept.companies?.name?.toLowerCase() || "";
    const description = dept.description?.toLowerCase() || "";

    return (
      name.includes(query) ||
      code.includes(query) ||
      companyName.includes(query) ||
      description.includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = filteredDepartments.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRefresh = () => {
    fetchDepartments();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departemen</h1>
          <p className="text-muted-foreground">
            Kelola data departemen perusahaan
          </p>
        </div>
        <DepartmentDialog onSuccess={handleRefresh}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Departemen
          </Button>
        </DepartmentDialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departemen
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDepartments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "Hasil pencarian" : "Total departemen"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari departemen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredDepartments.length} hasil
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Departemen</CardTitle>
          <CardDescription>
            Daftar semua departemen yang terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentTable
            departments={currentDepartments}
            startIndex={startIndex}
            onRefresh={handleRefresh}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Step 4: Table Component

**File**: `components/master-data/DepartmentTable.tsx`

```typescript
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Department } from "@/lib/actions/departmentActions";
import DepartmentDialog from "./DepartmentDialog";
import DepartmentDeleteDialog from "./DepartmentDeleteDialog";

interface DepartmentTableProps {
  departments: Department[];
  startIndex?: number;
  onRefresh?: () => void;
}

export default function DepartmentTable({
  departments,
  startIndex = 0,
  onRefresh,
}: DepartmentTableProps) {
  if (departments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Tidak ada data departemen
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium">No</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Kode</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Nama</th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Perusahaan
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">
              Deskripsi
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium">
              Status
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {departments.map((department, index) => (
            <tr key={department.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 text-sm">{startIndex + index + 1}</td>
              <td className="px-4 py-3 text-sm font-mono">{department.code}</td>
              <td className="px-4 py-3 text-sm font-medium">
                {department.name}
              </td>
              <td className="px-4 py-3 text-sm">
                {department.companies?.name || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {department.description || "-"}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    department.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {department.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <DepartmentDialog
                    department={department}
                    onSuccess={onRefresh}
                  >
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DepartmentDialog>
                  <DepartmentDeleteDialog
                    departmentId={department.id}
                    departmentName={department.name}
                    onSuccess={onRefresh}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Step 5: Form Dialog

**File**: `components/master-data/DepartmentDialog.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import {
  createDepartment,
  updateDepartment,
  getCompaniesForDepartment,
  Department,
} from "@/lib/actions/departmentActions";

interface DepartmentDialogProps {
  children: React.ReactNode;
  department?: Department; // If provided, it's edit mode
  onSuccess?: () => void;
}

export default function DepartmentDialog({
  children,
  department,
  onSuccess,
}: DepartmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    company_id: "",
    is_active: true,
  });

  // Load companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      const result = await getCompaniesForDepartment();
      if (result.success) {
        setCompanies(result.data);
      }
    };
    loadCompanies();
  }, []);

  // If edit mode, populate form
  useEffect(() => {
    if (department && isOpen) {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || "",
        company_id: department.company_id.toString(),
        is_active: department.is_active,
      });
    } else if (!isOpen) {
      // Reset form when dialog closes
      setFormData({
        name: "",
        code: "",
        description: "",
        company_id: "",
        is_active: true,
      });
    }
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;

      if (department) {
        // Update mode
        result = await updateDepartment({
          id: department.id,
          ...formData,
          company_id: parseInt(formData.company_id),
        });
      } else {
        // Create mode
        result = await createDepartment({
          ...formData,
          company_id: parseInt(formData.company_id),
        });
      }

      if (result.success) {
        toast.success(result.message || "Berhasil menyimpan departemen");
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Gagal menyimpan departemen");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Departemen" : "Tambah Departemen"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company_id">Perusahaan *</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) =>
                setFormData({ ...formData, company_id: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih perusahaan" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Kode Departemen *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="Contoh: IT, HR, FIN"
              required
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Departemen *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Information Technology"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Deskripsi departemen (opsional)"
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status Aktif</Label>
              <div className="text-sm text-muted-foreground">
                Departemen aktif akan muncul di sistem
              </div>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Step 6: Delete Component

**File**: `components/master-data/DepartmentDeleteDialog.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import toast from "react-hot-toast";
import { softDeleteDepartment } from "@/lib/actions/departmentActions";

interface DepartmentDeleteDialogProps {
  departmentId: number;
  departmentName: string;
  onSuccess?: () => void;
}

export default function DepartmentDeleteDialog({
  departmentId,
  departmentName,
  onSuccess,
}: DepartmentDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await softDeleteDepartment(departmentId);

      if (result.success) {
        toast.success(result.message || "Departemen berhasil dihapus");
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Gagal menghapus departemen");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={handleDelete}
      title="Hapus Departemen"
      description={`Apakah Anda yakin ingin menghapus departemen "${departmentName}"? Data ini akan diarsipkan dan dapat dipulihkan kembali.`}
      isDeleting={isDeleting}
      trigger={
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      }
    />
  );
}
```

---

## Checklist

Sebelum menganggap fitur selesai, pastikan semua ini sudah dilakukan:

### Database

- [ ] Table dibuat dengan struktur yang benar
- [ ] Index ditambahkan untuk performa
- [ ] RLS (Row Level Security) diaktifkan
- [ ] Policies dibuat dengan benar
- [ ] Foreign keys di-setup
- [ ] Trigger updated_at dibuat

### Server Actions

- [ ] Type definitions lengkap
- [ ] CRUD operations (Create, Read, Update, Delete)
- [ ] Validation di setiap function
- [ ] Error handling yang baik
- [ ] Return type consistent { success, data/error, message }
- [ ] Helper functions untuk dropdown data

### Page Component

- [ ] Client component dengan "use client"
- [ ] State management (data, loading, search, pagination)
- [ ] useEffect untuk fetch data
- [ ] Search functionality
- [ ] Pagination logic
- [ ] Stats cards
- [ ] Responsive design

### Table Component

- [ ] Menerima props: data, startIndex, onRefresh
- [ ] Sequential numbering menggunakan startIndex
- [ ] Empty state handling
- [ ] Actions column (Edit, Delete)
- [ ] Responsive table

### Form Dialog

- [ ] Create & Edit mode dalam satu component
- [ ] Form validation
- [ ] Loading state
- [ ] Success/error handling
- [ ] Toast notifications
- [ ] Reset form on close

### Delete Component

- [ ] Confirmation dialog
- [ ] Loading state
- [ ] Success callback (onSuccess)
- [ ] Toast notifications
- [ ] Soft delete (bukan hard delete)

### Testing

- [ ] Test create operation
- [ ] Test read/list
- [ ] Test update operation
- [ ] Test delete operation
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test validation errors
- [ ] Test with empty data
- [ ] Test mobile responsive

---

## Tips & Best Practices

### 1. **Consistent Naming**

```typescript
// Table: departments (plural, lowercase)
// Interface: Department (singular, PascalCase)
// File: departmentActions.ts (camelCase)
// Component: DepartmentDialog.tsx (PascalCase)
```

### 2. **Error Handling**

```typescript
// Always return consistent structure
return {
  success: boolean,
  data: any,
  error: string,
  message: string,
};
```

### 3. **Type Safety**

```typescript
// Define interfaces for everything
interface Department { ... }
interface CreateDepartmentInput { ... }
interface UpdateDepartmentInput { ... }
```

### 4. **Reusability**

```typescript
// Make components reusable
<DepartmentDialog department={dept} />  // Edit mode
<DepartmentDialog />  // Create mode
```

### 5. **Performance**

```typescript
// Use indexes in database
// Implement pagination
// Use client-side filtering for small datasets
// Use server-side filtering for large datasets
```

---

## Contoh Lengkap Fitur Lain

Lihat implementasi lengkap pada:

- Employee Management: `app/dashboard/employees/`
- Position Management: `app/dashboard/positions/`
- Shift Management: `app/dashboard/shifts/`

---

**Last Updated**: 2025-01-21
