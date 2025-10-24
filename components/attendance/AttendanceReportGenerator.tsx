"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  generateAttendanceReport,
  getAttendanceReports,
} from "@/lib/actions/attendanceActions";
import toast from "react-hot-toast";
import { Loader2, FileText, Download, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AttendanceReportGeneratorProps {
  companyId: number;
}

export default function AttendanceReportGenerator({
  companyId,
}: AttendanceReportGeneratorProps) {
  const router = useRouter();
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Pilih tanggal mulai dan akhir");
      return;
    }

    if (startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateAttendanceReport(
        companyId,
        reportType,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      if (result.success) {
        toast.success("Laporan berhasil dibuat!");
        loadRecentReports();
        router.refresh();
      } else {
        toast.error(result.error || "Gagal membuat laporan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat laporan");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadRecentReports = async () => {
    setIsLoadingReports(true);
    const result = await getAttendanceReports(companyId, undefined, 5);
    if (result.success) {
      setRecentReports(result.data || []);
    }
    setIsLoadingReports(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
    };
    return labels[type] || type;
  };

  const handleExport = (report: any, format: "excel" | "pdf") => {
    // TODO: Implement export functionality
    toast.success(`Export ${format.toUpperCase()} akan segera tersedia`);
  };

  return (
    <div className="space-y-6">
      {/* Generator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" />
            Generate Laporan Presensi
          </CardTitle>
          <CardDescription>
            Buat laporan presensi harian, mingguan, atau bulanan dengan
            statistik lengkap
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label>Tipe Laporan</Label>
            <Select
              value={reportType}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setReportType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <DatePicker date={startDate} onDateChange={setStartDate} />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <DatePicker date={endDate} onDateChange={setEndDate} />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || !startDate || !endDate}
            className="w-full flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Membuat Laporan...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Generate Laporan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Laporan Terbaru</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRecentReports}
              disabled={isLoadingReports}
            >
              {isLoadingReports ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoadingReports && recentReports.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada laporan</h3>
              <p className="text-sm text-muted-foreground">
                Buat laporan pertama Anda untuk melihat riwayat di sini
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-lime-500 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold">
                          Laporan {getReportTypeLabel(report.report_type)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(report.start_date)} -{" "}
                          {formatDate(report.end_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(report.generated_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Karyawan
                        </p>
                        <p className="font-semibold">
                          {report.total_employees}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hadir</p>
                        <p className="font-semibold text-green-600">
                          {report.total_present}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Terlambat
                        </p>
                        <p className="font-semibold text-orange-600">
                          {report.total_late}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(report, "excel")}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Excel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(report, "pdf")}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
