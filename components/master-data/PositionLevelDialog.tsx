"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPositionLevel,
  updatePositionLevel,
} from "@/lib/actions/masterDataActions";

interface PositionLevel {
  id: number;
  name: string;
  rank_order: number;
  created_at: string;
  updated_at: string;
}

interface PositionLevelDialogProps {
  mode: "create" | "edit";
  initialData?: PositionLevel;
  children: React.ReactNode;
}

export default function PositionLevelDialog({
  mode,
  initialData,
  children,
}: PositionLevelDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    rank_order: initialData?.rank_order || 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (mode === "edit" && initialData) {
        result = await updatePositionLevel(initialData.id, formData);
      } else {
        result = await createPositionLevel(formData);
      }

      if (result.error) {
        alert(`Gagal menyimpan: ${result.error}`);
      } else {
        setIsOpen(false);
        // Reset form jika mode create
        if (mode === "create") {
          setFormData({ name: "", rank_order: 1 });
        }
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset form ketika dialog ditutup
    if (!open && mode === "create") {
      setFormData({ name: "", rank_order: 1 });
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => handleOpenChange(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {mode === "create"
                ? "Tambah Level Jabatan"
                : "Edit Level Jabatan"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Level */}
              <div>
                <Label htmlFor="name">
                  Nama Level <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Manager, Supervisor, Staff"
                  required
                  maxLength={50}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maksimal 50 karakter
                </p>
              </div>

              {/* Rank Order */}
              <div>
                <Label htmlFor="rank_order">
                  Rank Order <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rank_order"
                  type="number"
                  value={formData.rank_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rank_order: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="Contoh: 1, 2, 3"
                  required
                  min={1}
                  max={100}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                  <p>💡 Semakin kecil angka, semakin tinggi posisinya</p>
                  <p className="ml-4">• Rank 1 = Level tertinggi (Direktur)</p>
                  <p className="ml-4">• Rank 2 = Manager</p>
                  <p className="ml-4">• Rank 3 = Supervisor</p>
                  <p className="ml-4">• Rank 4-5 = Staff</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : mode === "create"
                    ? "Tambah"
                    : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
