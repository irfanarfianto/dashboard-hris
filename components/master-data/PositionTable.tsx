"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deletePosition } from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import PositionDialog from "./PositionDialog";

interface Position {
  id: number;
  department_id: number;
  level_id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  departments: {
    name: string;
    companies: {
      name: string;
    } | null;
  } | null;
  position_levels: {
    name: string;
    rank_order: number;
  } | null;
}

interface PositionTableProps {
  data: Position[];
  startIndex?: number;
  onRefresh?: () => void;
}

export default function PositionTable({
  data,
  startIndex = 0,
  onRefresh,
}: PositionTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const router = useRouter();

  const openDeleteDialog = (position: Position) => {
    setSelectedPosition(position);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPosition) return;

    setDeletingId(selectedPosition.id);
    const result = await deletePosition(selectedPosition.id);

    if (result.success) {
      setDeleteDialogOpen(false);
      setSelectedPosition(null);
      if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } else {
      alert(result.error || "Gagal menghapus posisi");
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
                Nama Posisi
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Departemen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Perusahaan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Level
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
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data posisi
                </td>
              </tr>
            ) : (
              data.map((position, index) => (
                <tr
                  key={position.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {position.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {position.departments?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400">
                    {position.departments?.companies?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {position.position_levels?.name || "-"}
                      {position.position_levels?.rank_order &&
                        ` (${position.position_levels.rank_order})`}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {position.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <PositionDialog
                        mode="edit"
                        data={position}
                        onSuccess={onRefresh}
                      >
                        <Button size="sm" variant="outline" className="h-8">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </PositionDialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => openDeleteDialog(position)}
                        disabled={deletingId === position.id}
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
            Tidak ada data posisi
          </div>
        ) : (
          data.map((position) => (
            <div
              key={position.id}
              className="rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {position.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {position.departments?.name || "-"}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {position.departments?.companies?.name || "-"}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {position.position_levels?.name || "-"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Deskripsi:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {position.description || "-"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <PositionDialog
                  mode="edit"
                  data={position}
                  onSuccess={onRefresh}
                >
                  <Button size="sm" variant="outline" className="flex-1">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                </PositionDialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => openDeleteDialog(position)}
                  disabled={deletingId === position.id}
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
          setSelectedPosition(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedPosition?.name}
        isDeleting={deletingId === selectedPosition?.id}
      />
    </>
  );
}
