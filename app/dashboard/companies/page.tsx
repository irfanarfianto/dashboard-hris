import { getCompanies } from "@/lib/actions/masterDataActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import CompanyTable from "@/components/master-data/CompanyTable";
import CompanyDialog from "@/components/master-data/CompanyDialog";

export default async function CompaniesPage() {
  const { data: companies } = await getCompanies();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Data Perusahaan
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola data master perusahaan
          </p>
        </div>
        <CompanyDialog mode="create">
          <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-white hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30">
            <Plus className="h-4 w-4" />
            Tambah Perusahaan
          </button>
        </CompanyDialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Perusahaan
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Perusahaan terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Perusahaan</CardTitle>
          <CardDescription>
            Daftar seluruh perusahaan yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyTable data={companies} />
        </CardContent>
      </Card>
    </div>
  );
}
