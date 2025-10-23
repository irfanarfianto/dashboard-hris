"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

interface ChangePasswordDialogProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  autoCheck?: boolean; // New prop: if true, auto-fetch data; if false, controlled by parent
  forceOpen?: boolean; // New prop: force dialog to open (controlled mode)
}

export function ChangePasswordDialog({
  onSuccess,
  onSkip,
  autoCheck = true, // Default to auto mode
  forceOpen = false,
}: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Log props on mount
  useEffect(() => {
    console.log("\n" + "=".repeat(60));
    console.log("🎨 ChangePasswordDialog MOUNTED");
    console.log("=".repeat(60));
    console.log("Props received:");
    console.log("  - autoCheck:", autoCheck);
    console.log("  - forceOpen:", forceOpen);
    console.log("  - onSuccess:", typeof onSuccess);
    console.log("  - onSkip:", typeof onSkip);
    console.log("=".repeat(60));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log("🔄 ChangePasswordDialog State:");
    console.log("  - open:", open);
    console.log("  - userId:", userId);
    console.log("  - isCheckingPassword:", isCheckingPassword);
  }, [open, userId, isCheckingPassword]);

  // Fetch data sendiri dan cek is_password_changed (only in auto mode)
  useEffect(() => {
    // If controlled mode, don't auto-fetch
    if (!autoCheck) {
      setIsCheckingPassword(false);
      return;
    }

    const checkPasswordStatus = async () => {
      try {
        const supabase = createClient();

        // 1. Get current authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("No authenticated user found");
          setIsCheckingPassword(false);
          return;
        }

        console.log("Auth user ID:", user.id);

        // 2. Query users table by auth_user_id
        const { data: userData, error } = await supabase
          .from("users")
          .select("id, is_password_changed, auth_user_id")
          .eq("auth_user_id", user.id)
          .is("deleted_at", null)
          .maybeSingle();

        if (error) {
          console.error("Error checking password status:", error);
          setIsCheckingPassword(false);
          return;
        }

        if (!userData) {
          console.log(
            "User data not found in users table for auth_user_id:",
            user.id
          );
          setIsCheckingPassword(false);
          return;
        }

        console.log("User data found:", {
          userId: userData.id,
          authUserId: userData.auth_user_id,
          isPasswordChanged: userData.is_password_changed,
        });

        // 3. Jika is_password_changed = false, tampilkan dialog
        if (userData.is_password_changed === false) {
          console.log("Password needs to be changed - showing dialog");
          setUserId(user.id); // Store auth user id
          setOpen(true); // Show dialog
        } else {
          console.log("Password already changed - no dialog needed");
        }
      } catch (error) {
        console.error("Error in checkPasswordStatus:", error);
      } finally {
        setIsCheckingPassword(false);
      }
    };

    checkPasswordStatus();
  }, [autoCheck]);

  // Handle controlled mode
  useEffect(() => {
    console.log("\n🎮 Controlled Mode Check:");
    console.log("  - autoCheck:", autoCheck);
    console.log("  - forceOpen:", forceOpen);
    console.log(
      "  - Should activate controlled mode:",
      !autoCheck && forceOpen
    );

    if (!autoCheck && forceOpen) {
      console.log("✅ Activating controlled mode...");

      // In controlled mode, get user ID and open dialog
      const getUserId = async () => {
        console.log("🔍 Fetching authenticated user...");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("User fetched:", user?.id);

        if (user) {
          console.log("✅ Setting userId and opening dialog...");
          setUserId(user.id);
          setOpen(true);
          console.log("✅ Dialog should now be open!");
        } else {
          console.error("❌ No authenticated user found!");
        }
      };
      getUserId();
    } else {
      console.log("⏭️ Skipping controlled mode");
    }
  }, [autoCheck, forceOpen]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid:
        minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar,
    };
  };

  const passwordStrength = validatePassword(newPassword);

  const handleChangePassword = async () => {
    if (!passwordStrength.isValid) {
      toast.error("Password tidak memenuhi kriteria keamanan");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // 1. Update password di Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) throw authError;

      // 2. Update flag di tabel users (by auth_user_id)
      if (userId) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ is_password_changed: true })
          .eq("auth_user_id", userId);

        if (updateError) {
          console.error("Error updating users table:", updateError);
          // Don't throw - password already changed in Auth
        }
      }

      toast.success("Password berhasil diubah!");
      setOpen(false);

      // 3. Call onSuccess callback
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengubah password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast("Anda dapat mengganti password kapan saja di menu Settings", {
      icon: "ℹ️",
      duration: 4000,
    });
    setOpen(false);
    if (onSkip) {
      onSkip();
    }
  };

  // Don't render anything while checking
  if (isCheckingPassword) {
    console.log(
      "⏳ ChangePasswordDialog: Still checking password status, not rendering..."
    );
    return null;
  }

  // Don't render if dialog shouldn't be shown
  if (!open) {
    console.log(
      "❌ ChangePasswordDialog: Dialog is closed (open = false), not rendering..."
    );
    return null;
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ ChangePasswordDialog: RENDERING DIALOG!");
  console.log("=".repeat(60));
  console.log("State:");
  console.log("  - open:", open);
  console.log("  - userId:", userId);
  console.log("  - isCheckingPassword:", isCheckingPassword);
  console.log("=".repeat(60));

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleSkip()}>
      <DialogContent
        className="sm:max-w-md backdrop-blur-sm bg-background/95"
        onInteractOutside={handleSkip}
        onEscapeKeyDown={handleSkip}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center">
            Rekomendasi Ganti Password
          </DialogTitle>
          <DialogDescription className="text-center">
            Untuk keamanan akun, kami merekomendasikan Anda mengganti password
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
              Untuk keamanan maksimal, kami sarankan Anda mengganti password
              secara berkala. Anda dapat melewati langkah ini.
            </AlertDescription>
          </Alert>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {newPassword && (
            <div className="space-y-2 rounded-lg border p-3 text-xs">
              <p className="font-medium">Kriteria Password:</p>
              <div className="space-y-1">
                <PasswordCriteria
                  met={passwordStrength.minLength}
                  text="Minimal 8 karakter"
                />
                <PasswordCriteria
                  met={passwordStrength.hasUpperCase}
                  text="Huruf besar (A-Z)"
                />
                <PasswordCriteria
                  met={passwordStrength.hasLowerCase}
                  text="Huruf kecil (a-z)"
                />
                <PasswordCriteria
                  met={passwordStrength.hasNumber}
                  text="Angka (0-9)"
                />
                <PasswordCriteria
                  met={passwordStrength.hasSpecialChar}
                  text="Karakter khusus (!@#$%)"
                />
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Password tidak cocok</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSkip}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Nanti Saja
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={
                isLoading ||
                !passwordStrength.isValid ||
                newPassword !== confirmPassword
              }
              className="flex-1 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ubah Password"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PasswordCriteria({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
      ) : (
        <AlertCircle className="h-3 w-3 text-muted-foreground" />
      )}
      <span
        className={
          met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
        }
      >
        {text}
      </span>
    </div>
  );
}
