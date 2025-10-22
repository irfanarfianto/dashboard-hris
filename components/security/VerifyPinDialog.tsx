"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PinInput } from "@/components/security/PinInput";
import {
  verifyUserPin,
  blockDeviceByDeviceId,
} from "@/lib/actions/securityActions";
import { getDeviceInfo } from "@/lib/utils/deviceFingerprint";
import { createClient } from "@/lib/supabase/client";
import { Lock, AlertCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface VerifyPinDialogProps {
  open: boolean;
  userId: string;
  onSuccess?: () => void;
}

export function VerifyPinDialog({
  open,
  userId,
  onSuccess,
}: VerifyPinDialogProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const MAX_ATTEMPTS = 3;

  const handlePinComplete = async (value: string) => {
    setLoading(true);

    try {
      const result = await verifyUserPin(userId, value);

      if (result.success) {
        // Set cookie to mark PIN as verified
        document.cookie = `pin_verified=true; path=/; max-age=${60 * 60 * 24}`; // 24 hours

        toast.success("PIN benar! Mengalihkan ke dashboard...");

        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 500);
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          toast.error(
            "Terlalu banyak percobaan gagal. Device Anda telah diblokir."
          );

          // Block device
          const deviceInfo = getDeviceInfo();
          await blockDeviceByDeviceId(deviceInfo.deviceId);

          // Logout after 3 seconds
          setTimeout(async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/sign-in");
          }, 3000);
        } else {
          toast.error(
            `PIN salah! Percobaan tersisa: ${MAX_ATTEMPTS - newAttempts}`
          );
          setPin("");
        }
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      toast.error("Terjadi kesalahan");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Clear cookies
      document.cookie = "pin_verified=; path=/; max-age=0";
      document.cookie = "device_id=; path=/; max-age=0";

      // Sign out from Supabase
      await supabase.auth.signOut();

      toast.success("Berhasil logout");

      // Force redirect to login page
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Gagal logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md backdrop-blur-sm bg-background/95"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500 shadow-lg text-white">
            <Lock className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
            Verifikasi PIN
          </DialogTitle>
          <DialogDescription className="text-center">
            Masukkan PIN 6 digit untuk melanjutkan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isBlocked ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Device Anda telah diblokir karena terlalu banyak percobaan
                gagal. Silakan hubungi administrator.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {attempts > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    PIN salah! Percobaan tersisa: {MAX_ATTEMPTS - attempts}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Masukkan 6 digit PIN Anda
                  </p>
                  <PinInput
                    value={pin}
                    onChange={setPin}
                    onComplete={handlePinComplete}
                    disabled={loading || isBlocked}
                    autoFocus={true}
                    error={attempts > 0}
                  />
                </div>

                {loading && (
                  <div className="text-center text-sm text-muted-foreground">
                    Memverifikasi PIN...
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full text-muted-foreground hover:text-foreground"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
