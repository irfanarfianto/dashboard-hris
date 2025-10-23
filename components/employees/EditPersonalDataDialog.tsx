"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  updateEmployee,
  updateEmployeePersonnelDetails,
} from "@/lib/actions/employeeActions";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface EditPersonalDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: number;
    email: string;
    phone_number: string;
    gender: string;
    birth_date: string;
    employee_personnel_details?: Array<{
      religion: string;
      marital_status: string;
      ptkp_status: string;
      ktp_address: string;
      domicile_address: string;
      npwp_number?: string;
    }>;
  };
}

export default function EditPersonalDataDialog({
  isOpen,
  onClose,
  employee,
}: EditPersonalDataDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const personnelDetails = employee.employee_personnel_details?.[0];

  // Date state
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState({
    email: employee.email,
    phone_number: employee.phone_number,
    gender: employee.gender as "L" | "P",
    religion: personnelDetails?.religion || "",
    marital_status: personnelDetails?.marital_status || "",
    ptkp_status: personnelDetails?.ptkp_status || "",
    ktp_address: personnelDetails?.ktp_address || "",
    domicile_address: personnelDetails?.domicile_address || "",
    npwp_number: personnelDetails?.npwp_number || "",
  });

  // Initialize birth date
  useEffect(() => {
    if (employee.birth_date) {
      setBirthDate(new Date(employee.birth_date));
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update basic employee data
      const basicData = {
        email: formData.email,
        phone_number: formData.phone_number,
        gender: formData.gender,
        birth_date: birthDate ? birthDate.toISOString().split("T")[0] : "",
      };

      const result = await updateEmployee(employee.id, basicData);

      if (!result.success) {
        throw new Error(result.error || "Gagal memperbarui data dasar");
      }

      // Update personnel details
      const personnelData = {
        religion: formData.religion,
        marital_status: formData.marital_status,
        ptkp_status: formData.ptkp_status,
        ktp_address: formData.ktp_address,
        domicile_address: formData.domicile_address,
        npwp_number: formData.npwp_number || undefined,
      };

      const personnelResult = await updateEmployeePersonnelDetails(
        employee.id,
        personnelData
      );

      if (personnelResult.success) {
        toast.success("Data pribadi berhasil diperbarui");
        router.refresh();
        onClose();
      } else {
        toast.error(personnelResult.error || "Gagal memperbarui data pribadi");
      }
    } catch (error) {
      console.error("Error updating personal data:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Pribadi</DialogTitle>
          <DialogDescription>
            Perbarui informasi pribadi karyawan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone_number">
                No. Telepon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                required
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">
                Jenis Kelamin <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "L" | "P") =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birth_date">
                Tanggal Lahir <span className="text-red-500">*</span>
              </Label>
              <DatePicker date={birthDate} onDateChange={setBirthDate} />
            </div>

            {/* Religion */}
            <div className="space-y-2">
              <Label htmlFor="religion">
                Agama <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.religion}
                onValueChange={(value) =>
                  setFormData({ ...formData, religion: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih agama" />
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

            {/* Marital Status */}
            <div className="space-y-2">
              <Label htmlFor="marital_status">
                Status Pernikahan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.marital_status}
                onValueChange={(value) =>
                  setFormData({ ...formData, marital_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                  <SelectItem value="Menikah">Menikah</SelectItem>
                  <SelectItem value="Cerai">Cerai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PTKP Status */}
            <div className="space-y-2">
              <Label htmlFor="ptkp_status">
                Status PTKP <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.ptkp_status}
                onValueChange={(value) =>
                  setFormData({ ...formData, ptkp_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status PTKP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TK/0">TK/0 - Tidak Kawin</SelectItem>
                  <SelectItem value="TK/1">
                    TK/1 - Tidak Kawin 1 Tanggungan
                  </SelectItem>
                  <SelectItem value="K/0">K/0 - Kawin</SelectItem>
                  <SelectItem value="K/1">K/1 - Kawin 1 Tanggungan</SelectItem>
                  <SelectItem value="K/2">K/2 - Kawin 2 Tanggungan</SelectItem>
                  <SelectItem value="K/3">K/3 - Kawin 3 Tanggungan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NPWP */}
            <div className="space-y-2">
              <Label htmlFor="npwp_number">NPWP</Label>
              <Input
                id="npwp_number"
                type="text"
                value={formData.npwp_number}
                onChange={(e) =>
                  setFormData({ ...formData, npwp_number: e.target.value })
                }
                placeholder="Nomor NPWP (opsional)"
              />
            </div>
          </div>

          {/* KTP Address */}
          <div className="space-y-2">
            <Label htmlFor="ktp_address">
              Alamat KTP <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="ktp_address"
              value={formData.ktp_address}
              onChange={(e) =>
                setFormData({ ...formData, ktp_address: e.target.value })
              }
              placeholder="Alamat sesuai KTP"
              rows={3}
              required
            />
          </div>

          {/* Domicile Address */}
          <div className="space-y-2">
            <Label htmlFor="domicile_address">
              Alamat Domisili <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="domicile_address"
              value={formData.domicile_address}
              onChange={(e) =>
                setFormData({ ...formData, domicile_address: e.target.value })
              }
              placeholder="Alamat tempat tinggal saat ini"
              rows={3}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
