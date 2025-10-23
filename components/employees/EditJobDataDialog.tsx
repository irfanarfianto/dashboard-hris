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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { updateEmployee } from "@/lib/actions/employeeActions";
import {
  getCompanies,
  getDepartments,
  getPositions,
} from "@/lib/actions/masterDataActions";
import { toRupiah } from "@/lib/utils/currency";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface EditJobDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: number;
    company_id: number;
    department_id: number;
    position_id: number;
    contract_type: string;
    salary_base?: number;
    hire_date: string;
    contract_end_date?: string;
  };
}

export default function EditJobDataDialog({
  isOpen,
  onClose,
  employee,
}: EditJobDataDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [departments, setDepartments] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [positions, setPositions] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // Salary display states
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const [salaryNumeric, setSalaryNumeric] = useState(0);

  // Date states
  const [hireDate, setHireDate] = useState<Date | undefined>(undefined);
  const [contractEndDate, setContractEndDate] = useState<Date | undefined>(
    undefined
  );

  const [formData, setFormData] = useState({
    company_id: employee.company_id.toString(),
    department_id: employee.department_id.toString(),
    position_id: employee.position_id.toString(),
    contract_type: employee.contract_type as
      | "Probation"
      | "Contract"
      | "Permanent",
  });

  // Initialize data from employee
  useEffect(() => {
    if (employee.salary_base) {
      setSalaryNumeric(employee.salary_base);
      setSalaryDisplay(toRupiah(employee.salary_base));
    }

    if (employee.hire_date) {
      setHireDate(new Date(employee.hire_date));
    }

    if (employee.contract_end_date) {
      setContractEndDate(new Date(employee.contract_end_date));
    }
  }, [employee]);

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      const [companiesData, departmentsData, positionsData] = await Promise.all(
        [getCompanies(), getDepartments(), getPositions()]
      );

      if (companiesData.success) setCompanies(companiesData.data || []);
      if (departmentsData.success) setDepartments(departmentsData.data || []);
      if (positionsData.success) setPositions(positionsData.data || []);
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = parseInt(value) || 0;
    setSalaryNumeric(numericValue);
    setSalaryDisplay(toRupiah(numericValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateEmployee(employee.id, {
        company_id: parseInt(formData.company_id),
        department_id: parseInt(formData.department_id),
        position_id: parseInt(formData.position_id),
        contract_type: formData.contract_type,
        salary_base: salaryNumeric,
        hire_date: hireDate ? hireDate.toISOString().split("T")[0] : "",
        contract_end_date: contractEndDate
          ? contractEndDate.toISOString().split("T")[0]
          : "",
      });

      if (result.success) {
        toast.success("Data pekerjaan berhasil diperbarui");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Gagal memperbarui data pekerjaan");
      }
    } catch (error) {
      console.error("Error updating job data:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Pekerjaan</DialogTitle>
          <DialogDescription>
            Perbarui informasi pekerjaan karyawan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company_id">
              Perusahaan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.company_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, company_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih perusahaan" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department_id">
              Departemen <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, department_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih departemen" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position_id">
              Jabatan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.position_id.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, position_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jabatan" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.id.toString()}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contract Type */}
          <div className="space-y-2">
            <Label htmlFor="contract_type">
              Status Kontrak <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.contract_type}
              onValueChange={(value: "Probation" | "Contract" | "Permanent") =>
                setFormData({ ...formData, contract_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Probation">Masa Percobaan</SelectItem>
                <SelectItem value="Contract">Kontrak</SelectItem>
                <SelectItem value="Permanent">Tetap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Salary Base */}
          <div className="space-y-2">
            <Label htmlFor="salary_base">Gaji Pokok</Label>
            <Input
              id="salary_base"
              type="text"
              value={salaryDisplay}
              onChange={handleSalaryChange}
              placeholder="Rp 0"
            />
          </div>

          {/* Hire Date */}
          <div className="space-y-2">
            <Label htmlFor="hire_date">
              Tanggal Bergabung <span className="text-red-500">*</span>
            </Label>
            <DatePicker date={hireDate} onDateChange={setHireDate} />
          </div>

          {/* Contract End Date */}
          {formData.contract_type === "Contract" && (
            <div className="space-y-2">
              <Label htmlFor="contract_end_date">Akhir Kontrak</Label>
              <DatePicker
                date={contractEndDate}
                onDateChange={setContractEndDate}
              />
            </div>
          )}

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
