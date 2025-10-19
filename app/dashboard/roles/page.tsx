import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleTable from "@/components/master-data/RoleTable";
import RoleDialog from "@/components/master-data/RoleDialog";

export default async function RolesPage() {
  const supabase = await createClient();

  // Fetch roles data
  const { data: roles, error } = await supabase
    .from("roles")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
  }

  const roleList = roles || [];

  // Count users per role for statistics
  const { data: userCounts } = await supabase
    .from("users")
    .select("role_id")
    .is("deleted_at", null);

  const totalUsers = userCounts?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
            Role & Hak Akses
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola role pengguna dan atur hak akses sistem
          </p>
        </div>
        <RoleDialog mode="create">
          <Button className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg">
            <UserCog className="h-4 w-4" />
            Tambah Role
          </Button>
        </RoleDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-teal-200 dark:border-teal-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Role
            </CardTitle>
            <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {roleList.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Role terdaftar dalam sistem
            </p>
          </CardContent>
        </Card>

        <Card className="border-lime-200 dark:border-lime-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total User
            </CardTitle>
            <UserCog className="h-4 w-4 text-lime-600 dark:text-lime-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalUsers}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              User aktif dengan role
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg User/Role
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {roleList.length > 0
                ? Math.round(totalUsers / roleList.length)
                : 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rata-rata user per role
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <div className="bg-gradient-to-r from-teal-50 to-lime-50 dark:from-teal-900/10 dark:to-lime-900/10 border-l-4 border-teal-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Tentang Role & Hak Akses
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Role menentukan level akses dan permission user dalam sistem HRIS.
              Setiap user harus memiliki satu role. Role yang masih digunakan
              oleh user tidak dapat dihapus untuk menjaga integritas data.
            </p>
            <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                📌 <strong>Employee:</strong> Akses dasar untuk melihat data
                pribadi
              </p>
              <p>
                📌 <strong>Manager:</strong> Akses untuk melihat data tim
              </p>
              <p>
                📌 <strong>HR Admin:</strong> Akses penuh untuk mengelola data
                karyawan
              </p>
              <p>
                📌 <strong>Super Admin:</strong> Akses penuh ke seluruh sistem
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Role</CardTitle>
          <CardDescription>
            Kelola semua role yang tersedia dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleTable data={roleList} />
        </CardContent>
      </Card>
    </div>
  );
}
