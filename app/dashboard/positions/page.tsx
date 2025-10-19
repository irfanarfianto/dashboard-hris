import { getPositions } from "@/lib/actions/masterDataActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Plus } from "lucide-react";
import PositionDialog from "@/components/master-data/PositionDialog";
import PositionTable from "@/components/master-data/PositionTable";

export default async function PositionsPage() {
  const { data: positions } = await getPositions();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Data Posisi/Jabatan
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola data master posisi dan jabatan karyawan
          </p>
        </div>
        <PositionDialog mode="create">
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30">
            <Plus className="h-4 w-4" />
            Tambah Posisi
          </button>
        </PositionDialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posisi</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Posisi terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Posisi/Jabatan</CardTitle>
          <CardDescription>
            Daftar seluruh posisi dan jabatan yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PositionTable data={positions} />
        </CardContent>
      </Card>
    </div>
  );
}
