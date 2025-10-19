"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { softDeleteEmployee } from "@/lib/actions/employeeActions";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  employeeId: number;
  employeeName: string;
}

export default function DeleteButton({
  employeeId,
  employeeName,
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    const loadingToast = toast.loading("Mengarsipkan karyawan...");

    try {
      const result = await softDeleteEmployee(employeeId);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || "Karyawan berhasil diarsipkan");
        setShowDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal mengarsipkan karyawan");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error deleting employee:", error);
      toast.error("Terjadi kesalahan saat mengarsipkan karyawan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowDialog(true)}
        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        title={`Arsipkan ${employeeName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteConfirmDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleDelete}
        title="Arsipkan Karyawan?"
        description={`Apakah Anda yakin ingin mengarsipkan karyawan "${employeeName}"? Data karyawan akan dipindahkan ke arsip dan tidak akan muncul di daftar aktif. Anda dapat memulihkan data ini kapan saja dari menu arsip.`}
        itemName={employeeName}
        isDeleting={isDeleting}
      />
    </>
  );
}
