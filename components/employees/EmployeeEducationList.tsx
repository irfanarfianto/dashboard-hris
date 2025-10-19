"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, GraduationCap } from "lucide-react";
import { deleteEmployeeEducation } from "@/lib/actions/employeeActions";
import EmployeeEducationDialog from "./EmployeeEducationDialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface EmployeeEducation {
  id: number;
  employee_id: number;
  degree: string;
  institution: string;
  major: string;
  graduation_year: number;
  created_at: string;
}

interface EmployeeEducationListProps {
  employeeId: number;
  data: EmployeeEducation[];
}

export default function EmployeeEducationList({
  employeeId,
  data,
}: EmployeeEducationListProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] =
    useState<EmployeeEducation | null>(null);

  const openDeleteDialog = (education: EmployeeEducation) => {
    setSelectedEducation(education);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEducation) return;

    setIsDeleting(true);
    try {
      const result = await deleteEmployeeEducation(selectedEducation.id);
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

  const getDegreeBadgeColor = (degree: string) => {
    const degreeLower = degree.toLowerCase();
    if (degreeLower.includes("s3") || degreeLower.includes("doktor"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (
      degreeLower.includes("s2") ||
      degreeLower.includes("master") ||
      degreeLower.includes("magister")
    )
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (degreeLower.includes("s1") || degreeLower.includes("sarjana"))
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (
      degreeLower.includes("d3") ||
      degreeLower.includes("d4") ||
      degreeLower.includes("diploma")
    )
      return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
    if (degreeLower.includes("sma") || degreeLower.includes("smk"))
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <div className="rounded-full bg-gradient-to-r from-teal-100 to-lime-100 dark:from-teal-900/20 dark:to-lime-900/20 p-3 mb-3">
          <GraduationCap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Belum ada data pendidikan
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-3">
          Klik tombol di bawah untuk menambahkan riwayat pendidikan
        </p>
        <EmployeeEducationDialog mode="create" employeeId={employeeId}>
          <Button
            size="sm"
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Tambah Pendidikan
          </Button>
        </EmployeeEducationDialog>
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
              <th className="px-4 py-3">Jenjang</th>
              <th className="px-4 py-3">Institusi</th>
              <th className="px-4 py-3">Jurusan</th>
              <th className="px-4 py-3">Tahun Lulus</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((education) => (
              <tr
                key={education.id}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3">
                  <Badge className={getDegreeBadgeColor(education.degree)}>
                    {education.degree}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {education.institution}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {education.major}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {education.graduation_year}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EmployeeEducationDialog
                      mode="edit"
                      employeeId={employeeId}
                      initialData={education}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </EmployeeEducationDialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(education)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
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
      <div className="md:hidden space-y-3">
        {data.map((education) => (
          <div
            key={education.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-teal-500 to-lime-500 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <Badge className={getDegreeBadgeColor(education.degree)}>
                  {education.degree}
                </Badge>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {education.institution}
                </h3>
              </div>
            </div>

            <div className="space-y-1 text-sm mb-3">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Jurusan:</strong> {education.major}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Tahun Lulus:</strong> {education.graduation_year}
              </p>
            </div>

            <div className="flex gap-2">
              <EmployeeEducationDialog
                mode="edit"
                employeeId={employeeId}
                initialData={education}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </EmployeeEducationDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDeleteDialog(education)}
                disabled={isDeleting}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-3 w-3 mr-1" />
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
        itemName={`${selectedEducation?.degree} - ${selectedEducation?.institution}`}
        title="Hapus Riwayat Pendidikan"
        description="Apakah Anda yakin ingin menghapus riwayat pendidikan ini?"
        isDeleting={isDeleting}
      />
    </>
  );
}
