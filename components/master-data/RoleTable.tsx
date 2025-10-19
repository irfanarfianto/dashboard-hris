"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Shield } from "lucide-react";
import { deleteRole } from "@/lib/actions/masterDataActions";
import RoleDialog from "./RoleDialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface RoleTableProps {
  data: Role[];
}

export default function RoleTable({ data }: RoleTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRole) return;

    setIsDeleting(true);
    try {
      const result = await deleteRole(selectedRole.id);
      if (result.error) {
        alert(`Gagal menghapus: ${result.error}`);
      } else {
        setDeleteDialogOpen(false);
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("admin") || nameLower.includes("super"))
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (nameLower.includes("manager") || nameLower.includes("head"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (nameLower.includes("hr"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gradient-to-r from-teal-100 to-lime-100 dark:from-teal-900/20 dark:to-lime-900/20 p-4 mb-4">
          <Shield className="h-8 w-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Belum ada data role
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Mulai dengan menambahkan role pertama untuk sistem
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-teal-50 to-lime-50 dark:from-teal-900/20 dark:to-lime-900/20 text-gray-700 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Deskripsi</th>
              <th className="px-6 py-3">Dibuat</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((role) => (
              <tr
                key={role.id}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {role.name}
                      </div>
                      <Badge className={`${getRoleBadgeColor(role.name)} mt-1`}>
                        {role.name}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-md">
                  {role.description || (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      Tidak ada deskripsi
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {new Date(role.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RoleDialog mode="edit" initialData={role}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </RoleDialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(role)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-teal-500 to-lime-500 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {role.name}
                </h3>
                <Badge className={`${getRoleBadgeColor(role.name)} mt-1`}>
                  {role.name}
                </Badge>
              </div>
            </div>

            {role.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {role.description}
              </p>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Dibuat:{" "}
              {new Date(role.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>

            <div className="flex gap-2">
              <RoleDialog mode="edit" initialData={role}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </RoleDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDeleteDialog(role)}
                disabled={isDeleting}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedRole?.name || ""}
        title="Hapus Role"
        description="Apakah Anda yakin ingin menghapus role ini? Role yang masih digunakan oleh user tidak dapat dihapus."
        isDeleting={isDeleting}
      />
    </>
  );
}
