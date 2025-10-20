import { Clock, MapPin, Users, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Presensi</h1>
        <p className="text-muted-foreground">
          Manajemen presensi dan absensi karyawan
        </p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fitur Dalam Pengembangan</CardTitle>
          <CardDescription className="text-base">
            Modul presensi sedang dikembangkan dan akan segera hadir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-4">
              <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Geofencing</h4>
                <p className="text-xs text-muted-foreground">
                  Absensi berdasarkan lokasi GPS & WiFi
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Users className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Real-time Tracking
                </h4>
                <p className="text-xs text-muted-foreground">
                  Monitor kehadiran karyawan secara real-time
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Calendar className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Laporan Absensi</h4>
                <p className="text-xs text-muted-foreground">
                  Rekap harian, mingguan, dan bulanan
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Overtime Tracking
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pencatatan lembur otomatis
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
