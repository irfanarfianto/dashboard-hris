"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  MapPin,
  Wifi,
  LogIn,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  checkIn,
  checkOut,
  getMyAttendanceToday,
} from "@/lib/actions/attendanceActions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CheckInOutCardProps {
  employeeId: number;
  employeeName: string;
}

export default function CheckInOutCard({ employeeId }: CheckInOutCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Load today's attendance
  useEffect(() => {
    loadTodayAttendance();
  }, [employeeId]);

  const loadTodayAttendance = async () => {
    const result = await getMyAttendanceToday(employeeId);
    if (result.success) {
      setAttendance(result.data);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    setIsGettingLocation(true);

    try {
      // Get current location
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      setCurrentLocation({ latitude, longitude });
      setIsGettingLocation(false);

      // Try to get WiFi info (if available)
      // Note: WiFi info is limited in browsers for security reasons
      const wifiSSID = undefined; // Would need native app for this
      const wifiMAC = undefined;

      // Call check-in API
      const result = await checkIn(
        employeeId,
        latitude,
        longitude,
        wifiSSID,
        wifiMAC,
        notes
      );

      if (result.success) {
        toast.success("Check-in berhasil! Selamat bekerja.");
        setAttendance(result.data);
        setNotes("");
        router.refresh();
      } else {
        toast.error(result.error || "Check-in gagal");
      }
    } catch (error) {
      const err = error as any;
      if (err.code === 1) {
        toast.error("Izin lokasi ditolak. Mohon aktifkan izin lokasi.");
      } else if (err.code === 2) {
        toast.error("Lokasi tidak tersedia. Pastikan GPS aktif.");
      } else if (err.code === 3) {
        toast.error("Timeout mendapatkan lokasi. Coba lagi.");
      } else {
        toast.error(
          "Gagal mendapatkan lokasi: " + (err.message || "Unknown error")
        );
      }
    } finally {
      setIsLoading(false);
      setIsGettingLocation(false);
    }
  };

  const handleCheckOut = async () => {
    if (!attendance?.id) {
      toast.error("Anda belum check-in hari ini");
      return;
    }

    setIsLoading(true);
    setIsGettingLocation(true);

    try {
      // Get current location
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      setCurrentLocation({ latitude, longitude });
      setIsGettingLocation(false);

      // Call check-out API
      const result = await checkOut(attendance.id, latitude, longitude, notes);

      if (result.success) {
        toast.success("Check-out berhasil! Hati-hati di jalan.");
        setAttendance(result.data);
        setNotes("");
        router.refresh();
      } else {
        toast.error(result.error || "Check-out gagal");
      }
    } catch (error) {
      const err = error as any;
      if (err.code === 1) {
        toast.error("Izin lokasi ditolak. Mohon aktifkan izin lokasi.");
      } else {
        toast.error(
          "Gagal mendapatkan lokasi: " + (err.message || "Unknown error")
        );
      }
    } finally {
      setIsLoading(false);
      setIsGettingLocation(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasCheckedIn = attendance && !attendance.check_out;
  const hasCheckedOut = attendance && attendance.check_out;

  return (
    <Card className="border-2 border-teal-200 dark:border-teal-800">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-lime-50 dark:from-teal-950/20 dark:to-lime-950/20">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Presensi Hari Ini
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatDate(new Date().toISOString())}
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Status Display */}
        {attendance ? (
          <div className="space-y-4">
            {/* Check-in Info */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
              <div className="mt-1">
                <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">Check-in</h4>
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                    {formatTime(attendance.check_in)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{attendance.location?.name || "Lokasi"}</span>
                </div>
                {attendance.wifi && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wifi className="h-3 w-3" />
                    <span>{attendance.wifi.ssid_name}</span>
                  </div>
                )}
                {attendance.is_late && (
                  <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Terlambat {attendance.late_minutes} menit
                  </div>
                )}
              </div>
            </div>

            {/* Check-out Info */}
            {attendance.check_out && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-lime-50 dark:bg-lime-950/20 border border-lime-200 dark:border-lime-800">
                <div className="mt-1">
                  <CheckCircle2 className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">Check-out</h4>
                    <span className="text-lg font-bold text-lime-600 dark:text-lime-400">
                      {formatTime(attendance.check_out)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total kerja: {attendance.working_hours?.toFixed(1) || 0} jam
                  </div>
                  {attendance.overtime_hours > 0 && (
                    <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Lembur: {attendance.overtime_hours.toFixed(1)} jam
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
            <AlertCircle className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h4 className="font-semibold text-sm mb-1">
                Belum melakukan presensi
              </h4>
              <p className="text-xs text-muted-foreground">
                Silakan check-in untuk memulai hari kerja Anda
              </p>
            </div>
          </div>
        )}

        {/* Notes Input */}
        {!hasCheckedOut && (
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan untuk presensi ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Location Status */}
        {isGettingLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Mendapatkan lokasi Anda...</span>
          </div>
        )}

        {currentLocation && !isGettingLocation && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Lokasi ditemukan: {currentLocation.latitude.toFixed(6)},{" "}
              {currentLocation.longitude.toFixed(6)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!hasCheckedIn && (
            <Button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="flex-1 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Check-in
                </>
              )}
            </Button>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <Button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="flex-1 flex items-center gap-2 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  Check-out
                </>
              )}
            </Button>
          )}

          {hasCheckedOut && (
            <div className="flex-1 p-4 rounded-lg bg-gradient-to-r from-green-50 to-lime-50 dark:from-green-950/20 dark:to-lime-950/20 border border-green-200 dark:border-green-800 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-green-700 dark:text-green-300">
                Presensi Hari Ini Selesai
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Terima kasih atas kerja keras Anda!
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
          <p className="flex items-start gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              ℹ️
            </span>
            <span>
              Pastikan GPS dan lokasi Anda aktif. Anda harus berada di area
              kantor yang ditentukan untuk dapat melakukan presensi.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
