"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, GraduationCap } from "lucide-react";
import {
  createEmployeeEducation,
  updateEmployeeEducation,
} from "@/lib/actions/employeeActions";

interface EmployeeEducation {
  id?: number;
  employee_id?: number;
  degree: string;
  institution: string;
  major: string;
  graduation_year: number;
}

interface EmployeeEducationDialogProps {
  mode: "create" | "edit";
  employeeId: number;
  initialData?: EmployeeEducation;
  children: React.ReactNode;
}

export default function EmployeeEducationDialog({
  mode,
  employeeId,
  initialData,
  children,
}: EmployeeEducationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    degree: initialData?.degree || "",
    institution: initialData?.institution || "",
    major: initialData?.major || "",
    graduation_year: initialData?.graduation_year || currentYear,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToast = toast.loading(
      mode === "create"
        ? "Menambahkan data pendidikan..."
        : "Memperbarui data pendidikan..."
    );

    try {
      const result =
        mode === "create"
          ? await createEmployeeEducation({
              employee_id: employeeId,
              ...formData,
            })
          : await updateEmployeeEducation(initialData!.id!, formData);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Data pendidikan berhasil ditambahkan!"
            : "Data pendidikan berhasil diperbarui!"
        );
        setIsOpen(false);
        setFormData({
          degree: "",
          institution: "",
          major: "",
          graduation_year: currentYear,
        });
      } else {
        toast.error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error saving education:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      degree: initialData?.degree || "",
      institution: initialData?.institution || "",
      major: initialData?.major || "",
      graduation_year: initialData?.graduation_year || currentYear,
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
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                {mode === "create"
                  ? "Tambah Riwayat Pendidikan"
                  : "Edit Riwayat Pendidikan"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Input data pendidikan formal karyawan
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="degree">
                  Jenjang Pendidikan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="degree"
                  type="text"
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData({ ...formData, degree: e.target.value })
                  }
                  placeholder="SD, SMP, SMA, D3, S1, S2, S3"
                  required
                  className="mt-1"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Contoh: SD, SMP, SMA, D3, S1, S2, S3
                </p>
              </div>

              <div>
                <Label htmlFor="institution">
                  Nama Institusi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="institution"
                  type="text"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  placeholder="Universitas Indonesia"
                  required
                  className="mt-1"
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Nama sekolah/universitas
                </p>
              </div>

              <div>
                <Label htmlFor="major">
                  Jurusan/Program Studi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="major"
                  type="text"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  placeholder="Teknik Informatika"
                  required
                  className="mt-1"
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Untuk SD/SMP bisa tulis &ldquo;Umum&rdquo;
                </p>
              </div>

              <div>
                <Label htmlFor="graduation_year">
                  Tahun Lulus <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="graduation_year"
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graduation_year: parseInt(e.target.value),
                    })
                  }
                  min={1950}
                  max={currentYear + 10}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tahun kelulusan/ijazah
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
                      {mode === "create" ? "Tambah Data" : "Simpan Perubahan"}
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
