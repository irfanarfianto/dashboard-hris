import { Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
    username: string;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => onFormDataChange("username", e.target.value)}
                placeholder="username_karyawan"
                className="mt-1"
                required={formData.create_user_account}
              />
            </div>

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
                      {r.name}
                      {r.description && (
                        <span className="text-xs text-gray-500 ml-2">
                          - {r.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ℹ️ Password sementara akan di-generate otomatis oleh sistem dan
                ditampilkan setelah karyawan berhasil ditambahkan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
