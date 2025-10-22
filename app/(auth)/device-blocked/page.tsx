"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { getDeviceInfo } from "@/lib/utils/deviceFingerprint";
import { ShieldAlert, LogOut, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function DeviceBlockedPage() {
  const router = useRouter();
  const [deviceInfo, setDeviceInfo] = useState<{
    deviceId: string;
    browser: string;
    os: string;
    type: string;
  } | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "");
      }

      const info = getDeviceInfo();
      setDeviceInfo(info);
    };

    init();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Berhasil logout");
      router.push("/sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Gagal logout");
    }
  };

  const handleContactAdmin = () => {
    toast("Silakan hubungi administrator melalui email atau telepon", {
      icon: "ℹ️",
    });
    // You can add actual contact logic here
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-red-200 dark:border-red-900">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Perangkat Diblokir
          </CardTitle>
          <CardDescription>
            Akses dari perangkat ini telah ditangguhkan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              Perangkat ini telah diblokir karena terlalu banyak percobaan login
              yang gagal atau aktivitas mencurigakan.
            </AlertDescription>
          </Alert>

          {deviceInfo && (
            <div className="space-y-3 rounded-lg border border-red-200 dark:border-red-900 p-4 bg-red-50/50 dark:bg-red-950/10">
              <h4 className="font-medium text-sm mb-3">Informasi Perangkat:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipe:</span>
                  <span className="font-medium">{deviceInfo.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Browser:</span>
                  <span className="font-medium">{deviceInfo.browser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sistem:</span>
                  <span className="font-medium">{deviceInfo.os}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device ID:</span>
                  <span className="font-mono text-xs">
                    {deviceInfo.deviceId.substring(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
            <p className="font-medium mb-2 text-amber-900 dark:text-amber-100">
              ⚠️ Alasan Pemblokiran:
            </p>
            <ul className="list-inside list-disc space-y-1 text-amber-800 dark:text-amber-300">
              <li>3 kali percobaan PIN yang salah</li>
              <li>Aktivitas mencurigakan terdeteksi</li>
              <li>Perangkat diblokir oleh administrator</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleContactAdmin}
              variant="outline"
              className="w-full border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Mail className="mr-2 h-4 w-4" />
              Hubungi Administrator
            </Button>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {userEmail && (
            <p className="text-center text-xs text-muted-foreground">
              Akun: {userEmail}
            </p>
          )}

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">💡 Cara Membuka Blokir:</p>
            <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-300">
              <li>Hubungi administrator sistem</li>
              <li>Verifikasi identitas Anda</li>
              <li>Administrator akan membuka blokir perangkat</li>
              <li>Gunakan perangkat lain yang terdaftar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
