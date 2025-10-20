import { Settings, Sliders, Globe, Key } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Konfigurasi dan pengaturan sistem
        </p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500">
            <Settings className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fitur Dalam Pengembangan</CardTitle>
          <CardDescription className="text-base">
            Modul pengaturan sedang dikembangkan dan akan segera hadir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-4">
              <Sliders className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Konfigurasi Umum</h4>
                <p className="text-xs text-muted-foreground">
                  Pengaturan dasar aplikasi
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Globe className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Lokalisasi</h4>
                <p className="text-xs text-muted-foreground">
                  Bahasa, timezone, dan format tanggal
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Key className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">API Keys</h4>
                <p className="text-xs text-muted-foreground">
                  Kelola kunci API untuk integrasi
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Settings className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Backup & Restore</h4>
                <p className="text-xs text-muted-foreground">
                  Backup dan restore data sistem
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
