"use client";

import { useState } from "react";
import { Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteWorkShift } from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import WorkShiftDialog from "./WorkShiftDialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface WorkShift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_regular: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WorkShiftTableProps {
  data: WorkShift[];
}

export default function WorkShiftTable({ data }: WorkShiftTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);
  const router = useRouter();

  const openDeleteDialog = (shift: WorkShift) => {
    setSelectedShift(shift);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedShift) return;

    setIsDeleting(true);
    const result = await deleteWorkShift(selectedShift.id);

    if (result.success) {
      router.refresh();
      setDeleteDialogOpen(false);
    } else {
      alert(result.error || "Gagal menghapus shift");
    }
    setIsDeleting(false);
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
                Nama Shift
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Jam Mulai
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Jam Selesai
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Jenis
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data shift
                </td>
              </tr>
            ) : (
              data.map((shift, index) => (
                <tr
                  key={shift.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {shift.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {shift.start_time}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {shift.end_time}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={shift.is_regular ? "default" : "secondary"}
                      className={
                        shift.is_regular
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : ""
                      }
                    >
                      {shift.is_regular ? "Regular" : "Non-Regular"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <WorkShiftDialog mode="edit" data={shift}>
                        <Button size="sm" variant="outline" className="h-8">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </WorkShiftDialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteDialog(shift)}
                        disabled={isDeleting}
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
            Tidak ada data shift
          </div>
        ) : (
          data.map((shift) => (
            <div
              key={shift.id}
              className="rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {shift.name}
                  </h3>
                </div>
                <Badge
                  variant={shift.is_regular ? "default" : "secondary"}
                  className={
                    shift.is_regular ? "bg-green-100 text-green-800" : ""
                  }
                >
                  {shift.is_regular ? "Regular" : "Non-Regular"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Jam:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {shift.start_time} - {shift.end_time}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <WorkShiftDialog mode="edit" data={shift}>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                </WorkShiftDialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => openDeleteDialog(shift)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedShift?.name || ""}
        title="Hapus Shift Kerja"
        description="Apakah Anda yakin ingin menghapus shift kerja ini? Tindakan ini tidak dapat dibatalkan."
        isDeleting={isDeleting}
      />
    </>
  );
}
