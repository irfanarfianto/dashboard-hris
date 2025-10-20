import { Bell, Mail, MessageSquare, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifikasi</h1>
        <p className="text-muted-foreground">
          Manajemen template dan log notifikasi sistem
        </p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500">
            <Bell className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fitur Dalam Pengembangan</CardTitle>
          <CardDescription className="text-base">
            Modul notifikasi sedang dikembangkan dan akan segera hadir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-4">
              <Mail className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Email Template</h4>
                <p className="text-xs text-muted-foreground">
                  Kelola template email notifikasi
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <MessageSquare className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  Push Notification
                </h4>
                <p className="text-xs text-muted-foreground">
                  Notifikasi real-time untuk pengguna
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Send className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Broadcast</h4>
                <p className="text-xs text-muted-foreground">
                  Kirim notifikasi massal ke karyawan
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Bell className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Log Notifikasi</h4>
                <p className="text-xs text-muted-foreground">
                  Riwayat pengiriman notifikasi
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
