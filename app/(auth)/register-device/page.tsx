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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { registerUserDevice } from "@/lib/actions/securityActions";
import { getDeviceInfo } from "@/lib/utils/deviceFingerprint";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterDevicePage() {
  const router = useRouter();
  const [deviceName, setDeviceName] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<{
    deviceId: string;
    browser: string;
    os: string;
    type: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUserId(user.id);

      // Get device info
      const info = getDeviceInfo();
      setDeviceInfo(info);

      // Set default device name
      setDeviceName(`${info.browser} on ${info.os} (${info.type})`);
    };

    init();
  }, [router]);

  const getDeviceIcon = () => {
    if (!deviceInfo) return <Monitor className="h-6 w-6" />;

    switch (deviceInfo.type) {
      case "Mobile":
        return <Smartphone className="h-6 w-6" />;
      case "Tablet":
        return <Tablet className="h-6 w-6" />;
      default:
        return <Monitor className="h-6 w-6" />;
    }
  };

  const handleRegister = async () => {
    if (!userId || !deviceInfo) {
      toast.error("Data tidak lengkap");
      return;
    }

    if (!deviceName.trim()) {
      toast.error("Nama perangkat harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUserDevice(
        userId,
        deviceInfo.deviceId,
        deviceName
      );

      if (result.success) {
        // Set device_id cookie
        document.cookie = `device_id=${deviceInfo.deviceId}; path=/; max-age=${
          60 * 60 * 24 * 365
        }`; // 1 year

        setIsRegistered(true);
        toast.success("Perangkat berhasil didaftarkan!");

        setTimeout(() => {
          router.push("/setup-pin");
        }, 1500);
      } else {
        toast.error(result.error || "Gagal mendaftarkan perangkat");
      }
    } catch (error) {
      console.error("Error registering device:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId || !deviceInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-lime-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Perangkat Terdaftar!</h3>
            <p className="text-muted-foreground mb-4">
              Mengalihkan ke setup PIN...
            </p>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-lime-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500 shadow-lg text-white">
            {getDeviceIcon()}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
            Daftarkan Perangkat Baru
          </CardTitle>
          <CardDescription>
            Untuk keamanan akun Anda, perangkat baru perlu didaftarkan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Kami mendeteksi ini adalah perangkat baru yang belum terdaftar
              pada akun Anda.
            </AlertDescription>
          </Alert>

          {/* Device Information */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
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

          {/* Device Name Input */}
          <div className="space-y-2">
            <Label htmlFor="deviceName">
              Nama Perangkat <span className="text-red-500">*</span>
            </Label>
            <Input
              id="deviceName"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Contoh: Laptop Kantor"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Berikan nama yang mudah dikenali untuk perangkat ini
            </p>
          </div>

          <Button
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-teal-600 to-lime-600 hover:from-teal-700 hover:to-lime-700"
            disabled={isLoading || !deviceName.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              "Daftarkan Perangkat"
            )}
          </Button>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">🔒 Keamanan:</p>
            <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-300">
              <li>Setiap perangkat harus didaftarkan untuk akses</li>
              <li>Anda dapat mengelola perangkat di pengaturan</li>
              <li>Perangkat tidak dikenal akan diblokir</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
