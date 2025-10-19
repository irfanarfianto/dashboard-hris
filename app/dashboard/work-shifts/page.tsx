import { getWorkShifts } from "@/lib/actions/masterDataActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Timer, Plus } from "lucide-react";
import WorkShiftDialog from "@/components/master-data/WorkShiftDialog";
import WorkShiftTable from "@/components/master-data/WorkShiftTable";

export default async function WorkShiftsPage() {
  const { data: workShifts } = await getWorkShifts();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Data Shift Kerja
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola data master shift dan jam kerja karyawan
          </p>
        </div>
        <WorkShiftDialog mode="create">
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30">
            <Plus className="h-4 w-4" />
            Tambah Shift
          </button>
        </WorkShiftDialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shift</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workShifts.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Shift terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shift Regular</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workShifts.filter((s) => s.is_regular).length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Shift normal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Shift Non-Regular
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workShifts.filter((s) => !s.is_regular).length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Shift khusus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Shift Kerja</CardTitle>
          <CardDescription>
            Daftar seluruh shift dan jam kerja yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkShiftTable data={workShifts} />
        </CardContent>
      </Card>
    </div>
  );
}
