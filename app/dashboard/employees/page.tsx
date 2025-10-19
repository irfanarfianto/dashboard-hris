import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DeleteButton from "@/components/employees/DeleteButton";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";

// Type definition untuk employee data dari Supabase
interface SupabaseEmployee {
  id: number;
  full_name: string;
  email: string | null;
  gender: string;
  departments: Array<{ name: string }>;
  positions: Array<{ name: string }>;
}

// Type definition untuk employee data yang sudah di-transform
interface Employee {
  id: number;
  full_name: string;
  email: string | null;
  gender: string;
  departments: {
    name: string;
  } | null;
  positions: {
    name: string;
  } | null;
}

// Helper function untuk transform data dari Supabase
function transformEmployeeData(data: SupabaseEmployee[]): Employee[] {
  return data.map((employee) => ({
    ...employee,
    departments: employee.departments?.[0] || null,
    positions: employee.positions?.[0] || null,
  }));
}

export default async function EmployeesPage() {
  const supabase = await createClient();

  // Fetch employees data dengan join ke departments dan positions
  const { data: employees, error } = await supabase
    .from("employees")
    .select(
      `
      id,
      full_name,
      email,
      gender,
      departments (
        name
      ),
      positions (
        name
      )
    `
    )
    .is("deleted_at", null) // Hanya ambil yang tidak diarsipkan
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
  }

  const employeeList = transformEmployeeData(employees || []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Daftar Karyawan
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kelola data master karyawan dan akun pengguna
          </p>
        </div>
        <AddEmployeeDialog>
          <Button className="gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg">
            <UserPlus className="h-4 w-4" />
            Tambah Karyawan
          </Button>
        </AddEmployeeDialog>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Karyawan
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeList.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Karyawan terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeList.filter((e) => e.gender === "L").length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Karyawan pria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perempuan</CardTitle>
            <div className="h-2 w-2 rounded-full bg-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeList.filter((e) => e.gender === "P").length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Karyawan wanita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Data Karyawan</CardTitle>
          <CardDescription>
            Daftar seluruh karyawan yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Nama Lengkap
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Departemen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Posisi
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employeeList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Tidak ada data karyawan
                    </td>
                  </tr>
                ) : (
                  employeeList.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                              {employee.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {employee.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.gender === "L"
                                ? "Laki-laki"
                                : "Perempuan"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {employee.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {employee.departments?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {employee.positions?.name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/employees/${employee.id}`}>
                            <Button size="sm" variant="outline" className="h-8">
                              Detail
                            </Button>
                          </Link>
                          <DeleteButton
                            employeeId={employee.id}
                            employeeName={employee.full_name}
                          />
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
            {employeeList.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Tidak ada data karyawan
              </div>
            ) : (
              employeeList.map((employee) => (
                <Card
                  key={employee.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                          <span className="text-lg font-medium text-purple-600 dark:text-purple-300">
                            {employee.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {employee.full_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {employee.gender === "L"
                              ? "Laki-laki"
                              : "Perempuan"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        <span className="text-gray-900 dark:text-gray-100">
                          {employee.email || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Departemen:</span>{" "}
                        <span className="text-gray-900 dark:text-gray-100">
                          {employee.departments?.name || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Posisi:</span>{" "}
                        <span className="text-gray-900 dark:text-gray-100">
                          {employee.positions?.name || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          Detail
                        </Button>
                      </Link>
                      <DeleteButton
                        employeeId={employee.id}
                        employeeName={employee.full_name}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
