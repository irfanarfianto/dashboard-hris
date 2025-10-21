"use client";

import { useEffect, useState } from "react";
import { getPositions } from "@/lib/actions/masterDataActions";
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
  Briefcase,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PositionDialog from "@/components/master-data/PositionDialog";
import PositionTable from "@/components/master-data/PositionTable";

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

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      const { data } = await getPositions();
      setPositions(data || []);
      setLoading(false);
    };
    fetchPositions();
  }, []);

  // Filter positions based on search query
  const filteredPositions = positions.filter((position) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const positionName = position.name.toLowerCase();
    const deptName = position.departments?.name?.toLowerCase() || "";
    const companyName =
      position.departments?.companies?.name?.toLowerCase() || "";
    const levelName = position.position_levels?.name?.toLowerCase() || "";
    const description = position.description?.toLowerCase() || "";

    return (
      positionName.includes(query) ||
      deptName.includes(query) ||
      companyName.includes(query) ||
      levelName.includes(query) ||
      description.includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPositions = filteredPositions.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setLoading(true);
    const { data } = await getPositions();
    setPositions(data || []);
    setLoading(false);
  };

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
        <PositionDialog mode="create" onSuccess={handleRefresh}>
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
            <div className="text-2xl font-bold">
              {searchQuery ? filteredPositions.length : positions.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {searchQuery
                ? `dari ${positions.length} total`
                : "Posisi terdaftar"}
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
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama posisi, departemen, perusahaan, level, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Ditemukan {filteredPositions.length} dari {positions.length}{" "}
                posisi
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <>
              <PositionTable
                data={currentPositions}
                startIndex={startIndex}
                onRefresh={handleRefresh}
              />

              {/* Pagination */}
              {filteredPositions.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan {startIndex + 1} -{" "}
                    {Math.min(endIndex, filteredPositions.length)} dari{" "}
                    {filteredPositions.length} posisi
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? "bg-teal-600 hover:bg-teal-700"
                                : ""
                            }
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {filteredPositions.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery
                    ? "Tidak ada posisi yang sesuai dengan pencarian"
                    : "Tidak ada data posisi"}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
