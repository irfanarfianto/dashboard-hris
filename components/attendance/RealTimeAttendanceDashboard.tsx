"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Wifi,
  TrendingUp,
} from "lucide-react";
import { getTodayAttendance } from "@/lib/actions/attendanceActions";

interface RealTimeAttendanceDashboardProps {
  companyId: number;
}

export default function RealTimeAttendanceDashboard({
  companyId,
}: RealTimeAttendanceDashboardProps) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadAttendances();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAttendances();
    }, 30000);

    return () => clearInterval(interval);
  }, [companyId]);

  useEffect(() => {
    filterAttendances();
  }, [searchQuery, attendances]);

  const loadAttendances = async () => {
    setIsLoading(true);
    const result = await getTodayAttendance(companyId);
    if (result.success) {
      setAttendances(result.data || []);
      setLastUpdate(new Date());
    }
    setIsLoading(false);
  };

  const filterAttendances = () => {
    if (!searchQuery.trim()) {
      setFilteredAttendances(attendances);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = attendances.filter(
      (att) =>
        att.employees?.full_name?.toLowerCase().includes(query) ||
        att.employees?.department?.name?.toLowerCase().includes(query) ||
        att.employees?.position?.name?.toLowerCase().includes(query)
    );
    setFilteredAttendances(filtered);
  };

  const getStatusBadge = (attendance: any) => {
    if (attendance.check_out) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Selesai
        </Badge>
      );
    } else if (attendance.is_late) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Terlambat
        </Badge>
      );
    } else if (attendance.status === "Hadir") {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-3 w-3 mr-1" />
          Sedang Bekerja
        </Badge>
      );
    } else {
      return <Badge variant="outline">{attendance.status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate statistics
  const stats = {
    total: attendances.length,
    present: attendances.filter((a) => !a.check_out).length,
    completed: attendances.filter((a) => a.check_out).length,
    late: attendances.filter((a) => a.is_late).length,
    totalOvertimeHours: attendances.reduce(
      (sum, a) => sum + (a.overtime_hours || 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Presensi
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sedang Bekerja
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.present}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Selesai
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Terlambat
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.late}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Lembur
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalOvertimeHours.toFixed(1)}h
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monitor Kehadiran Real-time</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live</span>
              </div>
              <span>•</span>
              <span>Update: {formatTime(lastUpdate.toISOString())}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari karyawan, departemen, atau jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {isLoading && attendances.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredAttendances.length === 0 && (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery
                  ? "Tidak ada hasil"
                  : "Belum ada presensi hari ini"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Coba gunakan kata kunci lain"
                  : "Presensi karyawan akan muncul di sini"}
              </p>
            </div>
          )}

          {/* Attendance List */}
          <div className="space-y-3">
            {filteredAttendances.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-lime-500 flex items-center justify-center text-white font-semibold text-lg">
                    {attendance.employees?.full_name?.charAt(0) || "?"}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold truncate">
                        {attendance.employees?.full_name || "Unknown"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {attendance.employees?.position?.name || "-"} •{" "}
                        {attendance.employees?.department?.name || "-"}
                      </p>
                    </div>
                    {getStatusBadge(attendance)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Check-in */}
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Check-in</span>
                      </div>
                      <p className="font-semibold">
                        {formatTime(attendance.check_in)}
                      </p>
                      {attendance.is_late && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          +{attendance.late_minutes} menit
                        </p>
                      )}
                    </div>

                    {/* Check-out */}
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Check-out</span>
                      </div>
                      <p className="font-semibold">
                        {attendance.check_out
                          ? formatTime(attendance.check_out)
                          : "-"}
                      </p>
                      {attendance.working_hours > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {attendance.working_hours.toFixed(1)} jam
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location & WiFi */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{attendance.location?.name || "Unknown"}</span>
                    </div>
                    {attendance.wifi && (
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        <span>{attendance.wifi.ssid_name}</span>
                      </div>
                    )}
                    {attendance.overtime_hours > 0 && (
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          Lembur {attendance.overtime_hours.toFixed(1)}h
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
