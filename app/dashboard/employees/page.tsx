"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import DeleteButton from "@/components/employees/DeleteButton";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";

// Type definition untuk employee data dari Supabase
interface Employee {
  id: number;
  full_name: string;
  email: string | null;
  gender: string;
  department_id: number;
  position_id: number;
  departments: {
    name: string;
  } | null;
  positions: {
    name: string;
  } | null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchEmployees = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("employees")
      .select(
        `
        id,
        full_name,
        email,
        gender,
        department_id,
        position_id,
        departments:department_id (
          name
        ),
        positions:position_id (
          name
        )
      `
      )
      .is("deleted_at", null)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
    }

    setEmployees((data || []) as unknown as Employee[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const fullName = employee.full_name.toLowerCase();
    const email = employee.email?.toLowerCase() || "";
    const deptName = employee.departments?.name?.toLowerCase() || "";
    const positionName = employee.positions?.name?.toLowerCase() || "";

    return (
      fullName.includes(query) ||
      email.includes(query) ||
      deptName.includes(query) ||
      positionName.includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRefresh = () => {
    fetchEmployees();
  };

  // Calculate stats from filtered data
  const maleCount = filteredEmployees.filter((e) => e.gender === "L").length;
  const femaleCount = filteredEmployees.filter((e) => e.gender === "P").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

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
        <AddEmployeeDialog onSuccess={handleRefresh}>
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
            <div className="text-2xl font-bold">{filteredEmployees.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {searchQuery ? "Hasil pencarian" : "Karyawan terdaftar"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maleCount}</div>
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
            <div className="text-2xl font-bold">{femaleCount}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Karyawan wanita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama, email, departemen, atau posisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredEmployees.length} hasil
          </span>
        )}
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
                {currentEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "Tidak ada karyawan yang cocok dengan pencarian"
                        : "Tidak ada data karyawan"}
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {startIndex + index + 1}
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
            {currentEmployees.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {searchQuery
                  ? "Tidak ada karyawan yang cocok dengan pencarian"
                  : "Tidak ada data karyawan"}
              </div>
            ) : (
              currentEmployees.map((employee) => (
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
                        onSuccess={handleRefresh}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages} (
                {filteredEmployees.length} total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>

                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and adjacent pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 py-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
