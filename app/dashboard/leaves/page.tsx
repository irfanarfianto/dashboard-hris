import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LeavesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cuti & Dinas</h1>
        <p className="text-muted-foreground">
          Manajemen cuti, izin, dan perjalanan dinas karyawan
        </p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fitur Dalam Pengembangan</CardTitle>
          <CardDescription className="text-base">
            Modul cuti dan dinas sedang dikembangkan dan akan segera hadir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-4">
              <Calendar className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Pengajuan Cuti</h4>
                <p className="text-xs text-muted-foreground">
                  Sistem pengajuan cuti dengan approval workflow
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Approval Multi Level
                </h4>
                <p className="text-xs text-muted-foreground">
                  Persetujuan bertingkat sesuai hirarki
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Clock className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Sisa Cuti</h4>
                <p className="text-xs text-muted-foreground">
                  Tracking sisa jatah cuti karyawan
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <XCircle className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Riwayat Cuti</h4>
                <p className="text-xs text-muted-foreground">
                  Histori pengajuan dan status cuti
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
