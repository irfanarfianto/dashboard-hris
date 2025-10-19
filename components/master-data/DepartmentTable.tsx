"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteDepartment } from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import DepartmentDialog from "./DepartmentDialog";

interface Department {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  companies: {
    name: string;
  } | null;
}

interface DepartmentTableProps {
  data: Department[];
}

export default function DepartmentTable({ data }: DepartmentTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const router = useRouter();

  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;

    setDeletingId(selectedDepartment.id);
    const result = await deleteDepartment(selectedDepartment.id);

    if (result.success) {
      setDeleteDialogOpen(false);
      setSelectedDepartment(null);
      router.refresh();
    } else {
      alert(result.error || "Gagal menghapus departemen");
    }
    setDeletingId(null);
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Nama Departemen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Perusahaan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data departemen
                </td>
              </tr>
            ) : (
              data.map((department, index) => (
                <tr
                  key={department.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {department.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400">
                    {department.companies?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {department.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <DepartmentDialog mode="edit" data={department}>
                        <Button size="sm" variant="outline" className="h-8">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </DepartmentDialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => openDeleteDialog(department)}
                        disabled={deletingId === department.id}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Tidak ada data departemen
          </div>
        ) : (
          data.map((department) => (
            <div
              key={department.id}
              className="rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {department.name}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {department.companies?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Deskripsi:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {department.description || "-"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <DepartmentDialog mode="edit" data={department}>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                </DepartmentDialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => openDeleteDialog(department)}
                  disabled={deletingId === department.id}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedDepartment(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedDepartment?.name}
        isDeleting={deletingId === selectedDepartment?.id}
      />
    </>
  );
}
