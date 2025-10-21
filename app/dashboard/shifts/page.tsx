"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { getWorkShifts, deleteWorkShift } from "@/lib/actions/shiftActions";
import ShiftDialog from "@/components/shifts/ShiftDialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface Position {
  id: number;
  name: string;
  departments?: {
    id: number;
    name: string;
  };
}

interface WorkShift {
  id: number;
  position_id: number;
  name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  is_regular: boolean;
  tolerance_minutes: number;
  positions?: Position;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchShifts = async () => {
    setLoading(true);
    const result = await getWorkShifts();
    if (result.success) {
      setShifts(result.data as WorkShift[]);
    } else {
      toast.error(result.error || "Gagal memuat data shift");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleAddShift = () => {
    setSelectedShift(null);
    setShiftDialogOpen(true);
  };

  const handleEditShift = (shift: WorkShift) => {
    setSelectedShift(shift);
    setShiftDialogOpen(true);
  };

  const handleDeleteShift = (shift: WorkShift) => {
    setSelectedShift(shift);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedShift) return;

    setIsDeleting(true);
    try {
      const result = await deleteWorkShift(selectedShift.id);
      if (result.success) {
        toast.success(result.message || "Shift berhasil dihapus");
        fetchShifts();
        setDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "Gagal menghapus shift");
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Terjadi kesalahan saat menghapus shift");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM from HH:MM:SS
  };

  // Filter shifts by search query
  const filteredShifts = shifts.filter((shift) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const positionName = shift.positions?.name?.toLowerCase() || "";
    const deptName = shift.positions?.departments?.name?.toLowerCase() || "";
    const shiftName = shift.name.toLowerCase();

    return (
      positionName.includes(query) ||
      deptName.includes(query) ||
      shiftName.includes(query)
    );
  });

  // Group shifts by position
  const shiftsByPosition = filteredShifts.reduce((acc, shift) => {
    const positionName = shift.positions?.name || "Tanpa Posisi";
    const deptName = shift.positions?.departments?.name || "-";
    const groupKey = `${deptName} - ${positionName}`;

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(shift);
    return acc;
  }, {} as Record<string, WorkShift[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Kerja</h1>
          <p className="text-muted-foreground">
            Kelola jadwal shift kerja per posisi
          </p>
        </div>
        <Button onClick={handleAddShift} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Shift
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama shift, posisi, atau departemen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Ditemukan {filteredShifts.length} dari {shifts.length} shift
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shift</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {searchQuery ? filteredShifts.length : shifts.length}
            </div>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-1">
                dari {shifts.length} total
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shift Regular</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                (searchQuery ? filteredShifts : shifts).filter(
                  (s) => s.is_regular
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Shift Non-Regular
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                (searchQuery ? filteredShifts : shifts).filter(
                  (s) => !s.is_regular
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shifts List by Position */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Shift</CardTitle>
          <CardDescription>
            Shift kerja dikelompokkan berdasarkan posisi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data shift
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Tidak ada shift yang sesuai dengan pencarian</p>
              <p className="text-sm mt-2">
                Coba gunakan kata kunci yang berbeda
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(shiftsByPosition).map(
                ([groupKey, positionShifts]) => (
                  <div key={groupKey} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {groupKey}
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Shift</TableHead>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Durasi</TableHead>
                          <TableHead>Toleransi</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positionShifts.map((shift) => (
                          <TableRow key={shift.id}>
                            <TableCell className="font-medium">
                              {shift.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatTime(shift.start_time)} -{" "}
                                {formatTime(shift.end_time)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {shift.duration_hours.toFixed(1)} jam
                            </TableCell>
                            <TableCell>
                              {shift.tolerance_minutes} menit
                            </TableCell>
                            <TableCell>
                              {shift.is_regular ? (
                                <Badge variant="default">Regular</Badge>
                              ) : (
                                <Badge variant="secondary">Non-Regular</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditShift(shift)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteShift(shift)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Dialog */}
      <ShiftDialog
        isOpen={shiftDialogOpen}
        onClose={() => {
          setShiftDialogOpen(false);
          setSelectedShift(null);
        }}
        shift={selectedShift}
        onSuccess={fetchShifts}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedShift?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
