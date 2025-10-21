import { Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step4AkunUserProps {
  formData: {
    create_user_account: boolean;
    role_id: string;
  };
  roles: Array<{ id: number; name: string; description?: string }>;
  onFormDataChange: (field: string, value: string | boolean) => void;
}

export default function Step4AkunUser({
  formData,
  roles,
  onFormDataChange,
}: Step4AkunUserProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-600" />
          Akun User Aplikasi
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Buat akun user agar karyawan dapat mengakses aplikasi HRIS.
        </p>

        {/* Checkbox Create Account */}
        <div className="flex items-start gap-3 mb-4 p-4 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-200 dark:border-teal-800">
          <Checkbox
            id="create_user_account"
            checked={formData.create_user_account}
            onCheckedChange={(checked) =>
              onFormDataChange("create_user_account", checked as boolean)
            }
            className="mt-1"
          />
          <div className="flex-1">
            <Label
              htmlFor="create_user_account"
              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              Buat Akun User
            </Label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Karyawan akan dapat login menggunakan username dan password yang
              dibuat sistem
            </p>
          </div>
        </div>

        {/* User Account Fields */}
        {formData.create_user_account && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <Label htmlFor="role_id">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role_id}
                onValueChange={(value) => onFormDataChange("role_id", value)}
                required={formData.create_user_account}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        {r.description && (
                          <span className="text-xs text-gray-500">
                            {r.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                ℹ️ Informasi Username & Password:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>
                  Username akan di-generate otomatis dari nama lengkap karyawan
                </li>
                <li>
                  Password sementara akan di-generate otomatis oleh sistem
                </li>
                <li>
                  Keduanya akan ditampilkan setelah karyawan berhasil
                  ditambahkan
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
