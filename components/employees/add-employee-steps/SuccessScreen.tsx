import { CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SuccessScreenProps {
  email: string;
  username: string;
  tempPassword: string;
  copiedPassword: boolean;
  onCopyPassword: () => void;
  onClose: () => void;
}

export default function SuccessScreen({
  email,
  username,
  tempPassword,
  copiedPassword,
  onCopyPassword,
  onClose,
}: SuccessScreenProps) {
  return (
    <div className="p-8 text-center overflow-y-auto">
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Karyawan Berhasil Ditambahkan! 🎉
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Akun user telah dibuat. Berikan kredensial berikut kepada karyawan:
      </p>

      <div className="bg-gradient-to-r from-teal-50 to-lime-50 dark:from-teal-900/20 dark:to-lime-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Email
            </Label>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {email}
            </p>
          </div>
          <div>
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Username
            </Label>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {username}
            </p>
          </div>
          <div>
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Password Sementara
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded font-mono text-sm text-gray-900 dark:text-gray-100">
                {tempPassword}
              </code>
              <Button
                type="button"
                size="sm"
                onClick={onCopyPassword}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {copiedPassword ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Salin
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          ⚠️ <strong>Penting:</strong> Salin password ini dan kirimkan ke
          karyawan dengan aman. Password tidak akan ditampilkan lagi.
        </p>
      </div>

      <Button
        onClick={onClose}
        className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
      >
        Selesai
      </Button>
    </div>
  );
}
