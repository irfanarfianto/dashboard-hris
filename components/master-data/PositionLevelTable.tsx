"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { deletePositionLevel } from "@/lib/actions/masterDataActions";
import PositionLevelDialog from "./PositionLevelDialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface PositionLevel {
  id: number;
  name: string;
  rank_order: number;
  created_at: string;
  updated_at: string;
}

interface PositionLevelTableProps {
  data: PositionLevel[];
}

export default function PositionLevelTable({ data }: PositionLevelTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<PositionLevel | null>(
    null
  );

  const openDeleteDialog = (level: PositionLevel) => {
    setSelectedLevel(level);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLevel) return;

    setIsDeleting(true);
    try {
      const result = await deletePositionLevel(selectedLevel.id);
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

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1)
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (rank === 2)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (rank === 3)
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (rank === 4)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
          <TrendingUp className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Belum ada data level jabatan
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Mulai dengan menambahkan level jabatan pertama
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Nama Level</th>
              <th className="px-6 py-3">Dibuat</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((level) => (
              <tr
                key={level.id}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-6 py-4">
                  <Badge className={getRankBadgeColor(level.rank_order)}>
                    Rank {level.rank_order}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                  {level.name}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {new Date(level.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <PositionLevelDialog mode="edit" initialData={level}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </PositionLevelDialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(level)}
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
        {data.map((level) => (
          <div
            key={level.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {level.name}
                </h3>
                <Badge
                  className={`${getRankBadgeColor(level.rank_order)} mt-2`}
                >
                  Rank {level.rank_order}
                </Badge>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>
                Dibuat:{" "}
                {new Date(level.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <PositionLevelDialog mode="edit" initialData={level}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </PositionLevelDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDeleteDialog(level)}
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
        itemName={selectedLevel?.name || ""}
        title="Hapus Level Jabatan"
        description="Apakah Anda yakin ingin menghapus level jabatan ini? Tindakan ini tidak dapat dibatalkan."
        isDeleting={isDeleting}
      />
    </>
  );
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
