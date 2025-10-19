import { Briefcase } from "lucide-react";
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
import { toRupiah } from "@/lib/utils/currency";

interface FormDataStep1 {
  company_id: string;
  department_id: string;
  position_id: string;
  shift_id: string;
  contract_type: "Probation" | "Contract" | "Permanent";
  contract_end_date: string;
  [key: string]: string | boolean;
}

interface Step1DataPekerjaanProps {
  formData: FormDataStep1;
  salaryDisplay: string;
  salaryNumeric: number;
  contractEndDate: Date | undefined;
  hireDate: Date | undefined;
  companies: Array<{ id: number; name: string }>;
  departments: Array<{ id: number; name: string }>;
  positions: Array<{ id: number; name: string }>;
  workShifts: Array<{
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  }>;
  onFormDataChange: (data: Partial<FormDataStep1>) => void;
  onSalaryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContractEndDateChange: (date: Date | undefined) => void;
  onHireDateChange: (date: Date | undefined) => void;
}

export default function Step1DataPekerjaan({
  formData,
  salaryDisplay,
  salaryNumeric,
  contractEndDate,
  hireDate,
  companies,
  departments,
  positions,
  workShifts,
  onFormDataChange,
  onSalaryChange,
  onContractEndDateChange,
  onHireDateChange,
}: Step1DataPekerjaanProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-teal-600" />
          Data Pekerjaan & Kontrak
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Perusahaan */}
          <div>
            <Label htmlFor="company_id">
              Perusahaan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  company_id: value,
                  department_id: "",
                  position_id: "",
                })
              }
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Perusahaan" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Departemen */}
          <div>
            <Label htmlFor="department_id">
              Departemen <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department_id}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  department_id: value,
                  position_id: "",
                })
              }
              required
              disabled={!formData.company_id}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Departemen" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posisi */}
          <div>
            <Label htmlFor="position_id">
              Posisi <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.position_id}
              onValueChange={(value) =>
                onFormDataChange({ ...formData, position_id: value })
              }
              required
              disabled={!formData.department_id}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Posisi" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shift */}
          <div>
            <Label htmlFor="shift_id">
              Shift Kerja <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.shift_id}
              onValueChange={(value) =>
                onFormDataChange({ ...formData, shift_id: value })
              }
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Shift" />
              </SelectTrigger>
              <SelectContent>
                {workShifts.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name} ({s.start_time} - {s.end_time})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipe Kontrak */}
          <div>
            <Label htmlFor="contract_type">
              Tipe Kontrak <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.contract_type}
              onValueChange={(value: "Probation" | "Contract" | "Permanent") =>
                onFormDataChange({ ...formData, contract_type: value })
              }
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Pilih Tipe Kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Probation">Probation</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gaji Pokok */}
          <div>
            <Label htmlFor="salary_base">
              Gaji Pokok <span className="text-red-500">*</span>
            </Label>
            <Input
              id="salary_base"
              type="text"
              value={salaryDisplay}
              onChange={onSalaryChange}
              placeholder="Rp 0"
              className="mt-1"
              required
            />
            {salaryNumeric > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {toRupiah(salaryNumeric)}
              </p>
            )}
          </div>

          {/* Tanggal Bergabung */}
          <div>
            <Label htmlFor="hire_date">
              Tanggal Bergabung <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              date={hireDate}
              onDateChange={onHireDateChange}
              placeholder="Pilih tanggal bergabung"
              className="mt-1"
            />
          </div>

          {/* Tanggal Berakhir Kontrak */}
          {formData.contract_type !== "Permanent" && (
            <div className="md:col-span-2">
              <Label htmlFor="contract_end_date">
                Tanggal Berakhir Kontrak
              </Label>
              <DatePicker
                date={contractEndDate}
                onDateChange={onContractEndDateChange}
                placeholder="Pilih tanggal"
                minDate={hireDate}
                className="mt-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
