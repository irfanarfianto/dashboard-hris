"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  getOvertimeRecords,
  approveOvertime,
  getOvertimeSummary,
} from "@/lib/actions/attendanceActions";
import toast from "react-hot-toast";
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface OvertimeManagementProps {
  isAdmin: boolean;
  currentUserId: number;
}

export default function OvertimeManagement({
  isAdmin,
  currentUserId,
}: OvertimeManagementProps) {
  const [overtimeRecords, setOvertimeRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  // Approval Dialog
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    overtimeId: number | null;
    action: "Approved" | "Rejected" | null;
    employeeName: string;
    overtimeHours: number;
  }>({
    open: false,
    overtimeId: null,
    action: null,
    employeeName: "",
    overtimeHours: 0,
  });
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Monthly Summary
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [summaryMonth] = useState<Date>(new Date()); // TODO: Add month selector

  useEffect(() => {
    loadOvertimeRecords();
  }, [statusFilter, startDate, endDate]);

  useEffect(() => {
    if (!isAdmin) {
      loadMonthlySummary();
    }
  }, [summaryMonth]);

  const loadOvertimeRecords = async () => {
    setIsLoading(true);
    const employeeId = isAdmin ? undefined : currentUserId;
    const status =
      statusFilter === "all"
        ? undefined
        : (statusFilter as "Pending" | "Approved" | "Rejected");

    const result = await getOvertimeRecords(
      employeeId,
      status,
      startDate?.toISOString().split("T")[0],
      endDate?.toISOString().split("T")[0]
    );

    if (result.success) {
      setOvertimeRecords(result.data || []);
    } else {
      toast.error("Gagal memuat data lembur");
    }
    setIsLoading(false);
  };

  const loadMonthlySummary = async () => {
    const monthStr = summaryMonth.toISOString().slice(0, 7);
    const result = await getOvertimeSummary(currentUserId, monthStr);

    if (result.success) {
      setMonthlySummary(result.data);
    }
  };

  const handleApproveClick = (
    overtimeId: number,
    action: "Approved" | "Rejected",
    employeeName: string,
    overtimeHours: number
  ) => {
    setApprovalDialog({
      open: true,
      overtimeId,
      action,
      employeeName,
      overtimeHours,
    });
    setApprovalNotes("");
  };

  const handleApprovalSubmit = async () => {
    if (!approvalDialog.overtimeId || !approvalDialog.action) return;

    setIsApproving(true);

    const result = await approveOvertime(
      approvalDialog.overtimeId,
      currentUserId,
      approvalDialog.action,
      approvalNotes
    );

    if (result.success) {
      toast.success(
        `Lembur berhasil ${
          approvalDialog.action === "Approved" ? "disetujui" : "ditolak"
        }`
      );
      setApprovalDialog({
        open: false,
        overtimeId: null,
        action: null,
        employeeName: "",
        overtimeHours: 0,
      });
      loadOvertimeRecords();
    } else {
      toast.error(result.error || "Gagal memproses persetujuan");
    }

    setIsApproving(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-600"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredRecords = overtimeRecords.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.employee_name?.toLowerCase().includes(searchLower) ||
      record.department?.toLowerCase().includes(searchLower) ||
      record.position?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Monthly Summary (for non-admin users) */}
      {!isAdmin && monthlySummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Ringkasan Lembur Bulanan
            </CardTitle>
            <CardDescription>
              Statistik lembur Anda untuk bulan{" "}
              {summaryMonth.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Lembur
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {monthlySummary.total_records}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-muted-foreground mb-1">Total Jam</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {monthlySummary.total_hours.toFixed(1)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
                <p className="text-sm text-muted-foreground mb-1">Disetujui</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {monthlySummary.approved_records}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border border-teal-200 dark:border-teal-800">
                <p className="text-sm text-muted-foreground mb-1">Kompensasi</p>
                <p className="text-lg font-bold text-teal-700 dark:text-teal-300">
                  {formatCurrency(monthlySummary.total_compensation)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Cari Karyawan</Label>
              <Input
                placeholder="Nama, jabatan, departemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Disetujui</SelectItem>
                  <SelectItem value="Rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <DatePicker date={startDate} onDateChange={setStartDate} />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <DatePicker date={endDate} onDateChange={setEndDate} />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("all");
              setStartDate(undefined);
              setEndDate(undefined);
              setSearchTerm("");
            }}
          >
            Reset Filter
          </Button>
        </CardContent>
      </Card>

      {/* Overtime Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Lembur</CardTitle>
              <CardDescription>
                Menampilkan {filteredRecords.length} dari{" "}
                {overtimeRecords.length} data lembur
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadOvertimeRecords} size="sm">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Tidak ada data lembur
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Coba ubah filter pencarian Anda"
                  : "Belum ada data lembur yang tercatat"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {record.employee_name?.charAt(0) || "U"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {record.employee_name}
                          {getStatusBadge(record.status)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {record.position} • {record.department}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Tanggal
                          </p>
                          <p className="font-medium">
                            {formatDate(record.overtime_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Durasi
                          </p>
                          <p className="font-medium">
                            {record.duration_hours.toFixed(1)} jam
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Multiplier
                          </p>
                          <p className="font-medium">{record.multiplier}x</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Kompensasi
                          </p>
                          <p className="font-medium">
                            {formatCurrency(record.total_compensation)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Time Range */}
                    <div className="text-sm mb-3">
                      <span className="text-muted-foreground">Waktu: </span>
                      <span className="font-medium">
                        {record.start_time} - {record.end_time}
                      </span>
                    </div>

                    {/* Approval Info */}
                    {record.status !== "Pending" && record.approver_name && (
                      <div className="text-sm text-muted-foreground mb-3">
                        <User className="h-3 w-3 inline mr-1" />
                        {record.status === "Approved"
                          ? "Disetujui"
                          : "Ditolak"}{" "}
                        oleh {record.approver_name} pada{" "}
                        {formatDate(record.approved_at)}
                        {record.approval_notes && (
                          <p className="mt-1 italic">
                            Catatan: {record.approval_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions for Admin */}
                    {isAdmin && record.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleApproveClick(
                              record.id,
                              "Approved",
                              record.employee_name,
                              record.duration_hours
                            )
                          }
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleApproveClick(
                              record.id,
                              "Rejected",
                              record.employee_name,
                              record.duration_hours
                            )
                          }
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog.open}
        onOpenChange={(open) =>
          setApprovalDialog({
            ...approvalDialog,
            open,
          })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.action === "Approved" ? "Setujui" : "Tolak"}{" "}
              Lembur
            </DialogTitle>
            <DialogDescription>
              Konfirmasi{" "}
              {approvalDialog.action === "Approved"
                ? "persetujuan"
                : "penolakan"}{" "}
              lembur untuk {approvalDialog.employeeName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Durasi Lembur</Label>
              <p className="text-2xl font-bold">
                {approvalDialog.overtimeHours.toFixed(1)} jam
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval-notes">
                Catatan{" "}
                {approvalDialog.action === "Approved" ? "" : "(Opsional)"}
              </Label>
              <Textarea
                id="approval-notes"
                placeholder="Tambahkan catatan atau alasan..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setApprovalDialog({
                  open: false,
                  overtimeId: null,
                  action: null,
                  employeeName: "",
                  overtimeHours: 0,
                })
              }
              disabled={isApproving}
            >
              Batal
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              disabled={isApproving}
              className={
                approvalDialog.action === "Approved"
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              }
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {approvalDialog.action === "Approved" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Setujui
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Tolak
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
