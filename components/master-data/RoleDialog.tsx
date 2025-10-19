"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCog } from "lucide-react";
import { createRole, updateRole } from "@/lib/actions/masterDataActions";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface RoleDialogProps {
  mode: "create" | "edit";
  initialData?: Role;
  children: React.ReactNode;
}

export default function RoleDialog({
  mode,
  initialData,
  children,
}: RoleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result =
        mode === "create"
          ? await createRole(formData)
          : await updateRole(initialData!.id, formData);

      if (result.success) {
        setIsOpen(false);
        setFormData({ name: "", description: "" });
      } else {
        alert(result.error);
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      name: initialData?.name || "",
      description: initialData?.description || "",
    });
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md z-10">
            {/* Header */}
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-teal-500 to-lime-500 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-white" />
                </div>
                {mode === "create" ? "Tambah Role Baru" : "Edit Role"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Role menentukan hak akses user dalam sistem
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="name">
                  Nama Role <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Employee, Manager, HR Admin"
                  required
                  className="mt-1"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Nama role harus unik. Contoh: Employee, Manager, HR Admin,
                  Super Admin
                </p>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Jelaskan fungsi dan hak akses role ini..."
                  rows={4}
                  className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Opsional. Contoh: &ldquo;Dapat melihat dan mengelola data
                  karyawan&rdquo;
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  💡 <strong>Tips:</strong> Gunakan nama yang deskriptif seperti
                  &ldquo;Employee&rdquo;, &ldquo;Manager&rdquo;, &ldquo;HR
                  Admin&rdquo;, atau &ldquo;Super Admin&rdquo; untuk memudahkan
                  identifikasi role.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      {mode === "create" ? "Tambah Role" : "Simpan Perubahan"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
