"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteCompany } from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import CompanyDialog from "./CompanyDialog";

interface Company {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

interface CompanyTableProps {
  data: Company[];
}

export default function CompanyTable({ data }: CompanyTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const router = useRouter();

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;

    setDeletingId(selectedCompany.id);
    const result = await deleteCompany(selectedCompany.id);

    if (result.success) {
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
      router.refresh();
    } else {
      alert(result.error || "Gagal menghapus perusahaan");
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
                Kode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Nama Perusahaan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Alamat
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Telepon
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Email
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
                  Tidak ada data perusahaan
                </td>
              </tr>
            ) : (
              data.map((company, index) => (
                <tr
                  key={company.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400">
                    {company.code}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {company.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {company.address}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {company.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {company.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <CompanyDialog mode="edit" data={company}>
                        <Button size="sm" variant="outline" className="h-8">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </CompanyDialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => openDeleteDialog(company)}
                        disabled={deletingId === company.id}
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
            Tidak ada data perusahaan
          </div>
        ) : (
          data.map((company) => (
            <div
              key={company.id}
              className="rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {company.name}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {company.code}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Alamat:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {company.address}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Telepon:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {company.phone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {company.email}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <CompanyDialog mode="edit" data={company}>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                </CompanyDialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => openDeleteDialog(company)}
                  disabled={deletingId === company.id}
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
          setSelectedCompany(null);
        }}
        onConfirm={handleDelete}
        itemName={selectedCompany?.name}
        isDeleting={deletingId === selectedCompany?.id}
      />
    </>
  );
}
