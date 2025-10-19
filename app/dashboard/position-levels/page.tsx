import { getPositionLevels } from "@/lib/actions/masterDataActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Plus } from "lucide-react";
import PositionLevelDialog from "@/components/master-data/PositionLevelDialog";
import PositionLevelTable from "@/components/master-data/PositionLevelTable";

export default async function PositionLevelsPage() {
  const { data: positionLevels } = await getPositionLevels();

  // Sort by rank_order
  const sortedLevels = positionLevels.sort(
    (a, b) => a.rank_order - b.rank_order
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Data Level Jabatan
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola data master level dan hierarki jabatan
          </p>
        </div>
        <PositionLevelDialog mode="create">
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30">
            <Plus className="h-4 w-4" />
            Tambah Level
          </button>
        </PositionLevelDialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positionLevels.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Level jabatan terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Level Tertinggi
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedLevels[0]?.name || "-"}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Rank {sortedLevels[0]?.rank_order || "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Level Terendah
            </CardTitle>
            <div className="h-2 w-2 rounded-full bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedLevels[sortedLevels.length - 1]?.name || "-"}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Rank {sortedLevels[sortedLevels.length - 1]?.rank_order || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Level Jabatan</CardTitle>
          <CardDescription>
            Hierarki level jabatan dalam organisasi (terurut berdasarkan rank)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PositionLevelTable data={sortedLevels} />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                💡 Tentang Rank Order
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Rank order menentukan hierarki jabatan. Semakin{" "}
                <strong>kecil</strong> angkanya, semakin <strong>tinggi</strong>{" "}
                posisinya dalam organisasi.
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Rank 1 = Level tertinggi (Direktur, C-Level)</li>
                <li>• Rank 2 = Manager</li>
                <li>• Rank 3 = Supervisor</li>
                <li>• Rank 4-5 = Staff</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
