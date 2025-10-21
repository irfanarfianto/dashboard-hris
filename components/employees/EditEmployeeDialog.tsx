"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  Briefcase,
  User,
  GraduationCap,
  Shield,
  ChevronRight,
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StepperIndicator from "./add-employee-steps/StepperIndicator";
import Step1DataPekerjaan from "./add-employee-steps/Step1DataPekerjaan";
import Step2DataPribadi from "./add-employee-steps/Step2DataPribadi";
import Step3DataPendidikan from "./add-employee-steps/Step3DataPendidikan";
import Step5Verifikasi from "./add-employee-steps/Step5Verifikasi";
import { updateEmployee } from "@/lib/actions/employeeActions";
import { handleRupiahInput, formatRupiah } from "@/lib/utils/currency";
import { useRouter } from "next/navigation";

interface EducationData {
  id?: number;
  degree: string;
  institution: string;
  major: string;
  graduation_year: string;
}

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    gender: "L" | "P";
    birth_date: string;
    hire_date: string;
    company_id: number;
    department_id: number;
    position_id: number;
    contract_type: "Probation" | "Contract" | "Permanent";
    salary_base?: number;
    contract_end_date?: string;
    employee_personnel_details?: Array<{
      religion: string;
      marital_status: string;
      ptkp_status: string;
      ktp_address: string;
      domicile_address: string;
      npwp_number?: string;
    }>;
    employee_educations?: EducationData[];
    users?: Array<{
      username: string;
      role_id: number;
      is_active?: boolean;
      roles?: { name: string };
    }>;
  };
}

export default function EditEmployeeDialog({
  isOpen,
  onClose,
  employee,
}: EditEmployeeDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Salary state
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const [salaryNumeric, setSalaryNumeric] = useState(0);

  // Date states
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [hireDate, setHireDate] = useState<Date | undefined>(undefined);
  const [contractEndDate, setContractEndDate] = useState<Date | undefined>(
    undefined
  );

  // Education states
  const [educationList, setEducationList] = useState<EducationData[]>([]);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<EducationData>({
    degree: "",
    institution: "",
    major: "",
    graduation_year: "",
  });

  // Dropdown data - will be loaded from form components
  const [companies] = useState<Array<{ id: number; name: string }>>([]);
  const [departments] = useState<Array<{ id: number; name: string }>>([]);
  const [positions] = useState<Array<{ id: number; name: string }>>([]);
  const [roles] = useState<Array<{ id: number; name: string }>>([]);

  // Form data
  const [formData, setFormData] = useState({
    company_id: "",
    department_id: "",
    position_id: "",
    full_name: "",
    phone_number: "",
    email: "",
    gender: "L" as "L" | "P",
    birth_date: "",
    hire_date: "",
    contract_type: "Probation" as "Probation" | "Contract" | "Permanent",
    salary_base: "",
    contract_end_date: "",
    create_user_account: false,
    username: "",
    role_id: "",
  });

  // Personnel details
  const [personnelDetails, setPersonnelDetails] = useState({
    religion: "",
    marital_status: "TK/0" as "TK/0" | "K/0" | "K/1" | "K/2" | "K/3",
    ptkp_status: "TK/0",
    ktp_address: "",
    domicile_address: "",
    npwp_number: "",
  });

  // Initialize form with employee data
  useEffect(() => {
    if (employee && isOpen) {
      const personnelData = employee.employee_personnel_details?.[0];
      const userData = employee.users?.[0];

      setFormData({
        company_id: employee.company_id?.toString() || "",
        department_id: employee.department_id?.toString() || "",
        position_id: employee.position_id?.toString() || "",
        full_name: employee.full_name || "",
        phone_number: employee.phone_number || "",
        email: employee.email || "",
        gender: employee.gender || "L",
        birth_date: employee.birth_date || "",
        hire_date: employee.hire_date || "",
        contract_type: employee.contract_type || "Probation",
        salary_base: employee.salary_base?.toString() || "",
        contract_end_date: employee.contract_end_date || "",
        create_user_account: !!userData,
        username: userData?.username || "",
        role_id: userData?.role_id?.toString() || "",
      });

      if (personnelData) {
        setPersonnelDetails({
          religion: personnelData.religion || "",
          marital_status: (personnelData.marital_status || "TK/0") as
            | "TK/0"
            | "K/0"
            | "K/1"
            | "K/2"
            | "K/3",
          ptkp_status: personnelData.ptkp_status || "TK/0",
          ktp_address: personnelData.ktp_address || "",
          domicile_address: personnelData.domicile_address || "",
          npwp_number: personnelData.npwp_number || "",
        });
      }

      // Set dates
      if (employee.birth_date) {
        setBirthDate(new Date(employee.birth_date));
      }
      if (employee.hire_date) {
        setHireDate(new Date(employee.hire_date));
      }
      if (employee.contract_end_date) {
        setContractEndDate(new Date(employee.contract_end_date));
      }

      // Set salary
      if (employee.salary_base) {
        setSalaryNumeric(employee.salary_base);
        setSalaryDisplay(formatRupiah(employee.salary_base));
      }

      // Set education
      if (employee.employee_educations) {
        setEducationList(employee.employee_educations);
      }
    }
  }, [employee, isOpen]);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = handleRupiahInput(e.target.value);
    setSalaryDisplay(result.formatted);
    setSalaryNumeric(result.numeric);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loadingToast = toast.loading("Memperbarui data karyawan...");

    try {
      const result = await updateEmployee(employee.id, {
        company_id: parseInt(formData.company_id),
        department_id: parseInt(formData.department_id),
        position_id: parseInt(formData.position_id),
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email,
        gender: formData.gender,
        birth_date: formData.birth_date,
        hire_date: formData.hire_date,
        contract_type: formData.contract_type,
        salary_base: salaryNumeric > 0 ? salaryNumeric : undefined,
        contract_end_date: formData.contract_end_date || undefined,
        personnel_details: {
          religion: personnelDetails.religion,
          marital_status: personnelDetails.marital_status,
          ptkp_status: personnelDetails.ptkp_status,
          ktp_address: personnelDetails.ktp_address,
          domicile_address: personnelDetails.domicile_address,
          npwp_number: personnelDetails.npwp_number || undefined,
        },
      });

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Data karyawan berhasil diperbarui!");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Gagal memperbarui data karyawan");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error updating employee:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.company_id &&
          formData.department_id &&
          formData.position_id &&
          formData.contract_type &&
          salaryNumeric > 0
        );
      case 2:
        return (
          formData.full_name &&
          formData.phone_number &&
          formData.email &&
          formData.birth_date &&
          formData.hire_date &&
          personnelDetails.religion &&
          personnelDetails.ktp_address &&
          personnelDetails.domicile_address
        );
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: "Data Pekerjaan", icon: Briefcase },
    { number: 2, title: "Data Pribadi", icon: User },
    { number: 3, title: "Data Pendidikan", icon: GraduationCap },
    { number: 4, title: "Akun User", icon: Shield },
    { number: 5, title: "Verifikasi Data", icon: CheckCircle2 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 bg-gradient-to-r from-teal-50 to-lime-50 dark:from-teal-900/20 dark:to-lime-900/20 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
              Edit Data Karyawan
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Step {currentStep} dari 5 - {steps[currentStep - 1].title}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stepper Indicator */}
        <StepperIndicator steps={steps} currentStep={currentStep} />

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && currentStep < 5) {
              e.preventDefault();
            }
          }}
          className="flex-1 overflow-y-auto"
        >
          <div className="p-6">
            {/* Step 1: Data Pekerjaan */}
            {currentStep === 1 && (
              <Step1DataPekerjaan
                formData={formData}
                salaryDisplay={salaryDisplay}
                salaryNumeric={salaryNumeric}
                contractEndDate={contractEndDate}
                hireDate={hireDate}
                companies={companies}
                departments={departments}
                positions={positions}
                onFormDataChange={(data) =>
                  setFormData({ ...formData, ...data })
                }
                onSalaryChange={handleSalaryChange}
                onContractEndDateChange={setContractEndDate}
                onHireDateChange={setHireDate}
              />
            )}

            {/* Step 2: Data Pribadi */}
            {currentStep === 2 && (
              <Step2DataPribadi
                formData={formData}
                personnelDetails={personnelDetails}
                birthDate={birthDate}
                onFormDataChange={(field, value) =>
                  setFormData({ ...formData, [field]: value })
                }
                onPersonnelDetailsChange={(field, value) =>
                  setPersonnelDetails({
                    ...personnelDetails,
                    [field]: value,
                  })
                }
                onBirthDateChange={setBirthDate}
              />
            )}

            {/* Step 3: Data Pendidikan */}
            {currentStep === 3 && (
              <Step3DataPendidikan
                educationList={educationList}
                showEducationForm={showEducationForm}
                currentEducation={currentEducation}
                onEducationListChange={setEducationList}
                onShowEducationFormChange={setShowEducationForm}
                onCurrentEducationChange={setCurrentEducation}
              />
            )}

            {/* Step 4: Akun User - Read Only for Edit */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    ℹ️ Data akun user tidak dapat diubah melalui form edit.
                    Gunakan menu manajemen user untuk mengubah akun.
                  </p>
                </div>
                {formData.create_user_account ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Username: <strong>{formData.username}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Karyawan ini tidak memiliki akun user
                  </p>
                )}
              </div>
            )}

            {/* Step 5: Verifikasi Data */}
            {currentStep === 5 && (
              <Step5Verifikasi
                formData={formData}
                personnelDetails={personnelDetails}
                salaryNumeric={salaryNumeric}
                educationList={educationList}
                companies={companies}
                departments={departments}
                positions={positions}
                roles={roles}
              />
            )}
          </div>

          {/* Footer Navigation */}
          <div className="sticky bottom-0 border-t px-6 py-4 bg-white dark:bg-gray-900 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <div className="flex-1 text-center text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} dari 5
            </div>

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext();
                }}
                disabled={!canGoNext()}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !canGoNext()}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
