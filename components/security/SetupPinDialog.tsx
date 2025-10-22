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
import { createUserPin } from "@/lib/actions/securityActions";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface SetupPinDialogProps {
  open: boolean;
  userId: string;
  onSuccess?: () => void;
}

export function SetupPinDialog({
  open,
  userId,
  onSuccess,
}: SetupPinDialogProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"pin" | "confirm">("pin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const weakPins = [
    "123456",
    "111111",
    "222222",
    "333333",
    "444444",
    "555555",
    "666666",
    "777777",
    "888888",
    "999999",
    "000000",
  ];

  const handlePinComplete = (value: string) => {
    if (step === "pin") {
      if (weakPins.includes(value)) {
        setError("PIN terlalu lemah. Gunakan kombinasi yang lebih aman.");
        setPin("");
        return;
      }
      setPin(value);
      setStep("confirm");
      setError("");
    } else {
      setConfirmPin(value);
    }
  };

  const handleConfirmComplete = async (value: string) => {
    if (value !== pin) {
      setError("PIN tidak cocok. Silakan coba lagi.");
      setConfirmPin("");
      return;
    }

    await handleSubmit(value);
  };

  const handleSubmit = async (finalPin: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await createUserPin(userId, finalPin);

      if (!result.success) {
        throw new Error(result.error || "Gagal membuat PIN");
      }

      // Set cookie to mark PIN as verified
      document.cookie = `pin_verified=true; path=/; max-age=${60 * 60 * 24}`; // 24 hours

      toast.success("PIN keamanan Anda telah berhasil dibuat!");

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating PIN:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setStep("pin");
      setPin("");
      setConfirmPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("pin");
    setConfirmPin("");
    setError("");
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
            {step === "pin" ? "Buat PIN Keamanan" : "Konfirmasi PIN"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "pin"
              ? "Buat PIN 6 digit untuk keamanan akun Anda"
              : "Masukkan ulang PIN untuk konfirmasi"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {step === "pin"
                  ? "Masukkan 6 digit PIN"
                  : "Konfirmasi PIN Anda"}
              </p>
              <PinInput
                value={step === "pin" ? pin : confirmPin}
                onChange={step === "pin" ? setPin : setConfirmPin}
                onComplete={
                  step === "pin" ? handlePinComplete : handleConfirmComplete
                }
                disabled={loading}
                autoFocus={true}
              />
            </div>

            {step === "confirm" && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="w-full"
              >
                Kembali
              </Button>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Tips Keamanan:
                </p>
                <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                  <li>Jangan gunakan PIN yang mudah ditebak</li>
                  <li>Hindari kombinasi berurutan (123456)</li>
                  <li>Jangan bagikan PIN kepada siapapun</li>
                  <li>PIN akan diminta setiap kali login</li>
                </ul>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              Menyimpan PIN...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
