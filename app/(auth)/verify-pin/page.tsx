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
import { PinInput } from "@/components/security/PinInput";
import { verifyUserPin } from "@/lib/actions/securityActions";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Lock, AlertCircle, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { ChangePasswordDialog } from "@/components/security/ChangePasswordDialog";

const MAX_ATTEMPTS = 3;

export default function VerifyPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  // Debug logging for dialog state changes
  useEffect(() => {
    console.log("🔍 Dialog State Changed:");
    console.log("  - showPasswordDialog:", showPasswordDialog);
    console.log("  - needsPasswordChange:", needsPasswordChange);
    console.log(
      "  - Should Render Dialog:",
      showPasswordDialog && needsPasswordChange
    );
  }, [showPasswordDialog, needsPasswordChange]);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUserId(user.id);
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordDialog(false);
    toast.success("Password berhasil diubah! Mengalihkan ke dashboard...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const handlePasswordChangeSkip = () => {
    setShowPasswordDialog(false);
    toast.success("Mengalihkan ke dashboard...");
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  const handleVerify = async () => {
    if (!userId) {
      toast.error("User tidak ditemukan");
      return;
    }

    if (pin.length !== 6) {
      toast.error("PIN harus 6 digit");
      return;
    }

    setIsLoading(true);

    try {
      console.log("=".repeat(60));
      console.log("🔐 VERIFY PIN - DEBUGGING START");
      console.log("=".repeat(60));

      const result = await verifyUserPin(userId, pin);
      console.log("1️⃣ PIN Verification Result:", result);

      if (result.success) {
        toast.success("PIN benar!");
        console.log("✅ PIN Verified Successfully!");

        // Set cookie to mark PIN as verified
        document.cookie = `pin_verified=true; path=/; max-age=${60 * 60 * 24}`; // 24 hours
        console.log("🍪 Cookie 'pin_verified' set for 24 hours");

        // Check if password needs to be changed
        console.log("\n2️⃣ Checking Password Change Status...");
        console.log("Auth User ID:", userId);

        const supabase = createClient();
        const { data: userData, error: queryError } = await supabase
          .from("users")
          .select(
            "id, is_password_changed, auth_user_id, username, employee_id"
          )
          .eq("auth_user_id", userId)
          .is("deleted_at", null)
          .maybeSingle();

        console.log("\n3️⃣ Database Query Result:");
        console.log("Query Error:", queryError);
        console.log("User Data:", userData);

        if (queryError) {
          console.error("❌ Error querying users table:", queryError);
          toast.error("Error checking password status");
          // Still redirect to dashboard on error
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
          return;
        }

        if (!userData) {
          console.warn(
            "⚠️ No user data found in users table for auth_user_id:",
            userId
          );
          console.log("\n🔍 TROUBLESHOOTING:");
          console.log("1. Check if auth_user_id exists in users table:");
          console.log(
            `   SELECT * FROM users WHERE auth_user_id = '${userId}';`
          );
          console.log("2. Check if deleted_at is NULL");
          console.log("3. Run migration to populate auth_user_id if needed");

          // Redirect to dashboard anyway
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
          return;
        }

        console.log("\n4️⃣ User Data Details:");
        console.log("- User ID (internal):", userData.id);
        console.log("- Employee ID:", userData.employee_id);
        console.log("- Username:", userData.username);
        console.log("- Auth User ID:", userData.auth_user_id);
        console.log("- is_password_changed:", userData.is_password_changed);

        console.log("\n5️⃣ Password Change Decision:");
        if (userData.is_password_changed === false) {
          console.log(
            "🔑 Password NEEDS to be changed (is_password_changed = false)"
          );
          console.log("📋 Setting state to show password dialog...");

          // Show password change dialog
          setNeedsPasswordChange(true);
          setShowPasswordDialog(true);

          console.log("✅ State updated:");
          console.log("   - needsPasswordChange: true");
          console.log("   - showPasswordDialog: true");
          console.log("🎭 Password Change Dialog should now appear!");
        } else if (userData.is_password_changed === true) {
          console.log(
            "✅ Password already changed (is_password_changed = true)"
          );
          console.log("➡️ Redirecting to dashboard...");

          // Redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
        } else {
          console.warn(
            "⚠️ is_password_changed is neither true nor false:",
            userData.is_password_changed
          );
          console.log("➡️ Redirecting to dashboard as fallback...");

          setTimeout(() => {
            router.push("/dashboard");
          }, 500);
        }

        console.log("\n" + "=".repeat(60));
        console.log("🔐 VERIFY PIN - DEBUGGING END");
        console.log("=".repeat(60));
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          toast.error(
            "Terlalu banyak percobaan gagal. Akun Anda telah diblokir. Silakan hubungi admin."
          );

          // Block device or logout
          setTimeout(() => {
            handleLogout();
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
      toast.error("Terjadi kesalahan saat memverifikasi PIN");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-lime-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
            Verifikasi PIN
          </CardTitle>
          <CardDescription>
            Masukkan PIN 6 digit Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isBlocked && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Akun Anda telah diblokir karena terlalu banyak percobaan gagal.
                Silakan hubungi administrator.
              </AlertDescription>
            </Alert>
          )}

          {!isBlocked && attempts > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                PIN salah! Percobaan tersisa: {MAX_ATTEMPTS - attempts}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <PinInput
              value={pin}
              onChange={setPin}
              onComplete={handleVerify}
              disabled={isLoading || isBlocked}
              error={attempts > 0 && pin.length === 6}
            />

            <Button
              onClick={handleVerify}
              className="w-full bg-gradient-to-r from-teal-600 to-lime-600 hover:from-teal-700 hover:to-lime-700"
              disabled={isLoading || pin.length !== 6 || isBlocked}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Verifikasi PIN"
              )}
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">💡 Tips:</p>
            <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-300">
              <li>PIN adalah 6 digit angka yang Anda buat saat setup</li>
              <li>Jangan bagikan PIN kepada siapapun</li>
              <li>Hubungi admin jika lupa PIN</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog - shows after successful PIN verification if password needs to be changed */}
      {(() => {
        const shouldRender = showPasswordDialog && needsPasswordChange;
        console.log("\n🎭 RENDER CHECK:");
        console.log("  - showPasswordDialog:", showPasswordDialog);
        console.log("  - needsPasswordChange:", needsPasswordChange);
        console.log("  - Should Render:", shouldRender);

        if (shouldRender) {
          console.log("✅ Rendering ChangePasswordDialog with props:");
          console.log("  - autoCheck: false");
          console.log("  - forceOpen: true");
          console.log("  - onSuccess: defined");
          console.log("  - onSkip: defined");
        } else {
          console.log("❌ NOT Rendering ChangePasswordDialog");
        }

        return shouldRender ? (
          <ChangePasswordDialog
            autoCheck={false}
            forceOpen={true}
            onSuccess={handlePasswordChangeSuccess}
            onSkip={handlePasswordChangeSkip}
          />
        ) : null;
      })()}
    </div>
  );
}
