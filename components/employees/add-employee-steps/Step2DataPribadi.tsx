import { useState } from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface Step2DataPribadiProps {
  formData: {
    full_name: string;
    phone_number: string;
    email: string;
    gender: "L" | "P";
  };
  personnelDetails: {
    religion: string;
    marital_status: "TK/0" | "K/0" | "K/1" | "K/2" | "K/3";
    ktp_address: string;
    domicile_address: string;
    npwp_number: string;
  };
  birthDate: Date | undefined;
  onFormDataChange: (field: string, value: string) => void;
  onPersonnelDetailsChange: (field: string, value: string) => void;
  onBirthDateChange: (date: Date | undefined) => void;
}

export default function Step2DataPribadi({
  formData,
  personnelDetails,
  birthDate,
  onFormDataChange,
  onPersonnelDetailsChange,
  onBirthDateChange,
}: Step2DataPribadiProps) {
  const [sameAsKTP, setSameAsKTP] = useState(false);

  const handleSameAsKTPChange = (checked: boolean) => {
    setSameAsKTP(checked);
    if (checked) {
      onPersonnelDetailsChange(
        "domicile_address",
        personnelDetails.ktp_address
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-teal-600" />
          Data Pribadi Karyawan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div className="md:col-span-2">
            <Label htmlFor="full_name">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => onFormDataChange("full_name", e.target.value)}
              placeholder="Nama lengkap karyawan"
              className="mt-1"
              required
            />
          </div>

          {/* No. Telepon */}
          <div>
            <Label htmlFor="phone_number">
              No. Telepon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => onFormDataChange("phone_number", e.target.value)}
              placeholder="081234567890"
              className="mt-1"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange("email", e.target.value)}
              placeholder="nama@email.com"
              className="mt-1"
              required
            />
          </div>

          {/* Jenis Kelamin */}
          <div>
            <Label htmlFor="gender">
              Jenis Kelamin <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value: "L" | "P") =>
                onFormDataChange("gender", value)
              }
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tanggal Lahir */}
          <div>
            <Label htmlFor="birth_date">
              Tanggal Lahir <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              date={birthDate}
              onDateChange={onBirthDateChange}
              placeholder="Pilih tanggal lahir"
              maxDate={new Date()}
              className="mt-1"
            />
          </div>

          {/* Agama */}
          <div>
            <Label htmlFor="religion">
              Agama <span className="text-red-500">*</span>
            </Label>
            <Select
              value={personnelDetails.religion}
              onValueChange={(value) =>
                onPersonnelDetailsChange("religion", value)
              }
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Agama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Islam">Islam</SelectItem>
                <SelectItem value="Kristen">Kristen</SelectItem>
                <SelectItem value="Katolik">Katolik</SelectItem>
                <SelectItem value="Hindu">Hindu</SelectItem>
                <SelectItem value="Buddha">Buddha</SelectItem>
                <SelectItem value="Konghucu">Konghucu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Perkawinan */}
          <div>
            <Label htmlFor="marital_status">
              Status Perkawinan (PTKP) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={personnelDetails.marital_status}
              onValueChange={(
                value: "TK/0" | "K/0" | "K/1" | "K/2" | "K/3"
              ) => {
                onPersonnelDetailsChange("marital_status", value);
                onPersonnelDetailsChange("ptkp_status", value);
              }}
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Status PTKP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TK/0">
                  TK/0 - Tidak Kawin, Tanpa Tanggungan
                </SelectItem>
                <SelectItem value="K/0">
                  K/0 - Kawin, Tanpa Tanggungan
                </SelectItem>
                <SelectItem value="K/1">K/1 - Kawin, 1 Tanggungan</SelectItem>
                <SelectItem value="K/2">K/2 - Kawin, 2 Tanggungan</SelectItem>
                <SelectItem value="K/3">K/3 - Kawin, 3 Tanggungan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alamat KTP */}
          <div className="md:col-span-2">
            <Label htmlFor="ktp_address">
              Alamat KTP <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="ktp_address"
              value={personnelDetails.ktp_address}
              onChange={(e) => {
                const newValue = e.target.value;
                onPersonnelDetailsChange("ktp_address", newValue);
                // Jika checkbox aktif, sync ke domicile address
                if (sameAsKTP) {
                  onPersonnelDetailsChange("domicile_address", newValue);
                }
              }}
              placeholder="Alamat sesuai KTP"
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Checkbox: Sama dengan Alamat KTP */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="same_as_ktp"
                checked={sameAsKTP}
                onCheckedChange={handleSameAsKTPChange}
              />
              <Label
                htmlFor="same_as_ktp"
                className="text-sm font-normal cursor-pointer"
              >
                Alamat domisili sama dengan alamat KTP
              </Label>
            </div>
          </div>

          {/* Alamat Domisili */}
          <div className="md:col-span-2">
            <Label htmlFor="domicile_address">
              Alamat Domisili <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="domicile_address"
              value={personnelDetails.domicile_address}
              onChange={(e) => {
                onPersonnelDetailsChange("domicile_address", e.target.value);
                setSameAsKTP(false);
              }}
              placeholder="Alamat domisili saat ini"
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              required
              disabled={sameAsKTP}
            />
          </div>

          {/* NPWP */}
          <div className="md:col-span-2">
            <Label htmlFor="npwp_number">
              Nomor NPWP{" "}
              <span className="text-gray-500 text-sm">(Opsional)</span>
            </Label>
            <Input
              id="npwp_number"
              value={personnelDetails.npwp_number}
              onChange={(e) =>
                onPersonnelDetailsChange("npwp_number", e.target.value)
              }
              placeholder="00.000.000.0-000.000"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
