import { Shield, FileText, Search, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          Log aktivitas dan keamanan sistem
        </p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fitur Dalam Pengembangan</CardTitle>
          <CardDescription className="text-base">
            Modul audit log sedang dikembangkan dan akan segera hadir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-4">
              <FileText className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Activity Log</h4>
                <p className="text-xs text-muted-foreground">
                  Catat semua aktivitas pengguna
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Search className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Filter & Search</h4>
                <p className="text-xs text-muted-foreground">
                  Cari log berdasarkan kriteria tertentu
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Eye className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Real-time Monitor
                </h4>
                <p className="text-xs text-muted-foreground">
                  Monitor aktivitas secara real-time
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Shield className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Security Alert</h4>
                <p className="text-xs text-muted-foreground">
                  Deteksi aktivitas mencurigakan
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
