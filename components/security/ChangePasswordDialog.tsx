"use client";

import { useState } from "react";
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
  open: boolean;
  userId: string;
  onSuccess?: () => void;
}

export function ChangePasswordDialog({
  open,
  userId,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

      // 2. Update flag di tabel users
      const { error: updateError } = await supabase
        .from("users")
        .update({ is_password_changed: true })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Password berhasil diubah!");

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

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md backdrop-blur-sm bg-background/95"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center">Ganti Password</DialogTitle>
          <DialogDescription className="text-center">
            Untuk keamanan akun, silakan ganti password default Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
              Ini adalah login pertama Anda. Harap ganti password sebelum
              melanjutkan.
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

          <Button
            onClick={handleChangePassword}
            disabled={
              isLoading ||
              !passwordStrength.isValid ||
              newPassword !== confirmPassword
            }
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Ubah Password"
            )}
          </Button>
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
