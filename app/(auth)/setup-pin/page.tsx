"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createUserPin } from "@/lib/actions/securityActions";
import { PinInput } from "@/components/security/PinInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SetupPinPage() {
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
    "123123",
    "112233",
  ];

  const isPinWeak = (pinValue: string): boolean => {
    return weakPins.includes(pinValue);
  };

  const handleContinue = () => {
    setError("");

    if (pin.length !== 6) {
      setError("PIN harus 6 digit");
      return;
    }

    if (isPinWeak(pin)) {
      setError(
        "PIN terlalu lemah. Hindari kombinasi yang mudah ditebak seperti 123456 atau 111111"
      );
      return;
    }

    setStep("confirm");
  };

  const handleCreatePin = async () => {
    setError("");

    if (confirmPin.length !== 6) {
      setError("PIN konfirmasi harus 6 digit");
      return;
    }

    if (pin !== confirmPin) {
      setError("PIN tidak cocok. Silakan coba lagi.");
      setConfirmPin("");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      const result = await createUserPin(user.id, pin);

      if (!result.success) {
        throw new Error(result.error || "Gagal membuat PIN");
      }

      // Set cookie to mark PIN as verified
      document.cookie = `pin_verified=true; path=/; max-age=${60 * 60 * 24}`; // 24 hours

      toast.success("PIN keamanan Anda telah berhasil dibuat!");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating PIN:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Buat PIN Keamanan</CardTitle>
            <CardDescription className="text-base">
              {step === "pin"
                ? "Buat PIN 6 digit untuk keamanan tambahan akun Anda"
                : "Konfirmasi PIN yang telah Anda buat"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "pin" ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-4 text-center">
                    Masukkan PIN 6 Digit
                  </label>
                  <PinInput
                    value={pin}
                    onChange={setPin}
                    error={!!error}
                    disabled={loading}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Tips Keamanan PIN:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>
                        Gunakan kombinasi angka yang unik dan tidak mudah
                        ditebak
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>
                        Hindari PIN yang mudah seperti 123456 atau 111111
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>
                        Jangan gunakan tanggal lahir atau nomor telepon
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>PIN ini akan diminta setiap kali Anda login</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={pin.length !== 6 || loading}
                  className="w-full"
                  size="lg"
                >
                  Lanjutkan
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-4 text-center">
                    Konfirmasi PIN Anda
                  </label>
                  <PinInput
                    value={confirmPin}
                    onChange={setConfirmPin}
                    error={!!error}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handleCreatePin}
                    disabled={confirmPin.length !== 6 || loading}
                    className="flex-1"
                  >
                    {loading ? "Membuat PIN..." : "Buat PIN"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
