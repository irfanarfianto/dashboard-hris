import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import toast from "react-hot-toast";

interface SuccessScreenProps {
  fullName: string;
  department: string;
  position: string;
  email: string;
  username: string;
  tempPassword: string;
  copiedPassword: boolean;
  onCopyPassword: () => void;
  onClose: () => void;
}

export default function SuccessScreen({
  fullName,
  department,
  position,
  email,
  username,
  tempPassword,
  copiedPassword,
  onCopyPassword,
  onClose,
}: SuccessScreenProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Template message untuk WhatsApp
  const whatsappMessage = `Halo *${fullName}*! 👋

Selamat bergabung di PT Bharata Internasional! 🎉

*Informasi Akun Anda:*
👤 Nama: ${fullName}
🏢 Divisi: ${department}
💼 Posisi: ${position}

*Kredensial Login HRIS:*
👤 Username: ${username}
📧 Email: ${email}
🔑 Password Sementara: ${tempPassword}

*Langkah Selanjutnya:*
1️⃣ Download aplikasi HRIS Mobile di Play Store/App Store
2️⃣ Login menggunakan email dan password di atas
3️⃣ Segera ganti password Anda setelah login pertama kali

⚠️ *PENTING:* Password ini bersifat rahasia, jangan bagikan ke siapapun!

Jika ada kendala, silakan hubungi HR.

Terima kasih! 🙏`;

  const copyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMessage(true);
    toast.success("Pesan berhasil disalin! Siap dikirim ke WhatsApp");
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="p-8 overflow-y-auto max-h-[80vh]">
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Karyawan Berhasil Ditambahkan! 🎉
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        Akun user telah dibuat. Salin pesan untuk dikirim ke WhatsApp karyawan:
      </p>

      {/* WhatsApp Message Copy Button */}
      <div className="flex justify-center mb-6">
        <Button
          type="button"
          size="lg"
          onClick={copyWhatsAppMessage}
          className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold px-8 py-6 text-base"
        >
          {copiedMessage ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Pesan Tersalin! Kirim via WhatsApp
            </>
          ) : (
            <>
              <MessageCircle className="h-5 w-5 mr-2" />
              Salin Pesan WhatsApp
            </>
          )}
        </Button>
      </div>

      {/* Credential Details */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Detail Kredensial
        </h3>
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Nama Lengkap
            </Label>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {fullName}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Divisi
            </Label>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {department}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Posisi
            </Label>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {position}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Email
            </Label>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {email}
            </p>
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              Password Sementara
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded font-mono text-sm text-gray-900 dark:text-gray-100">
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
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
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
