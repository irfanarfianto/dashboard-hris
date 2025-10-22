"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDeviceInfo } from "@/lib/utils/deviceFingerprint";
import {
  registerUserDevice,
  checkUserHasPin,
} from "@/lib/actions/securityActions";
import { ChangePasswordDialog } from "@/components/security/ChangePasswordDialog";
import { SetupPinDialog } from "@/components/security/SetupPinDialog";
import { VerifyPinDialog } from "@/components/security/VerifyPinDialog";
import toast from "react-hot-toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Dialog states
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [showSetupPinDialog, setShowSetupPinDialog] = useState(false);
  const [showVerifyPinDialog, setShowVerifyPinDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Login with email & password
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User tidak ditemukan");

      const userId = authData.user.id;
      setCurrentUserId(userId);

      // Step 2: Check if user needs to change password (first time login)
      const { data: userData } = await supabase
        .from("users")
        .select("is_password_changed")
        .eq("id", userId)
        .single();

      if (userData && !userData.is_password_changed) {
        // Show Change Password Dialog untuk user baru
        setShowChangePasswordDialog(true);
        setIsLoading(false);
        return;
      }

      // Step 3: Auto-register device di background
      const deviceInfo = getDeviceInfo();
      const deviceName = `${deviceInfo.browser} on ${deviceInfo.os}`;

      // Check if device already registered
      const deviceCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("device_id="));

      if (!deviceCookie) {
        // Register device
        const registerResult = await registerUserDevice(
          userId,
          deviceInfo.deviceId,
          deviceName
        );

        if (registerResult.success) {
          // Set device cookie
          document.cookie = `device_id=${
            deviceInfo.deviceId
          }; path=/; max-age=${60 * 60 * 24 * 365}`;
          toast.success("Device berhasil terdaftar");
        }
      }

      // Step 4: Check if user has PIN
      const pinCheck = await checkUserHasPin(userId);

      if (!pinCheck.hasPin) {
        // Show Setup PIN Dialog
        setShowSetupPinDialog(true);
      } else {
        // Show Verify PIN Dialog
        setShowVerifyPinDialog(true);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handlePasswordChangeSuccess = async () => {
    // After password changed, close dialog and continue to device & PIN setup
    setShowChangePasswordDialog(false);

    try {
      // Auto-register device di background
      const deviceInfo = getDeviceInfo();
      const deviceName = `${deviceInfo.browser} on ${deviceInfo.os}`;

      const registerResult = await registerUserDevice(
        currentUserId,
        deviceInfo.deviceId,
        deviceName
      );

      if (registerResult.success) {
        document.cookie = `device_id=${deviceInfo.deviceId}; path=/; max-age=${
          60 * 60 * 24 * 365
        }`;
      }

      // Check if user has PIN
      const pinCheck = await checkUserHasPin(currentUserId);

      if (!pinCheck.hasPin) {
        // Show Setup PIN Dialog
        setTimeout(() => {
          setShowSetupPinDialog(true);
        }, 300);
      } else {
        // Show Verify PIN Dialog (unlikely for new user, but just in case)
        setTimeout(() => {
          setShowVerifyPinDialog(true);
        }, 300);
      }
    } catch (error) {
      console.error("Error after password change:", error);
      toast.error("Terjadi kesalahan");
    }
  };

  const handlePinSuccess = () => {
    // Redirect to dashboard after PIN is set/verified
    setShowSetupPinDialog(false);
    setShowVerifyPinDialog(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-2xl border-teal-100 dark:border-teal-900/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500 shadow-lg">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
            HRIS Bharata
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Masukkan email dan password untuk login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bharata.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm text-teal-600 dark:text-teal-400 underline-offset-4 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-300 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Belum punya akun?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-teal-600 dark:text-teal-400 underline underline-offset-4 hover:text-teal-700 dark:hover:text-teal-300"
              >
                Daftar sekarang
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© 2025 Bharata Group. All rights reserved.</p>
      </div>

      {/* Change Password Dialog (First Time Login) */}
      {showChangePasswordDialog && (
        <ChangePasswordDialog
          open={showChangePasswordDialog}
          userId={currentUserId}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}

      {/* Setup PIN Dialog */}
      {showSetupPinDialog && (
        <SetupPinDialog
          open={showSetupPinDialog}
          userId={currentUserId}
          onSuccess={handlePinSuccess}
        />
      )}

      {/* Verify PIN Dialog */}
      {showVerifyPinDialog && (
        <VerifyPinDialog
          open={showVerifyPinDialog}
          userId={currentUserId}
          onSuccess={handlePinSuccess}
        />
      )}
    </div>
  );
}
