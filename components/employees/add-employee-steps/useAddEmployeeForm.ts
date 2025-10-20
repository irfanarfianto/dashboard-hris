import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getCompanies,
  getDepartmentsByCompany,
  getPositionsByDepartment,
  getWorkShifts,
  getRoles,
  createEmployeeWithUser,
} from "@/lib/actions/employeeActions";
import { handleRupiahInput } from "@/lib/utils/currency";

interface EducationData {
  degree: string;
  institution: string;
  major: string;
  graduation_year: string;
}

export function useAddEmployeeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Salary state
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const [salaryNumeric, setSalaryNumeric] = useState(0);

  // Date states
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [hireDate, setHireDate] = useState<Date | undefined>(new Date());
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

  // Dropdown data
  const [companies, setCompanies] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [departments, setDepartments] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [positions, setPositions] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [workShifts, setWorkShifts] = useState<
    Array<{ id: number; name: string; start_time: string; end_time: string }>
  >([]);
  const [roles, setRoles] = useState<
    Array<{ id: number; name: string; description?: string }>
  >([]);

  // Form data
  const [formData, setFormData] = useState({
    company_id: "",
    department_id: "",
    position_id: "",
    shift_id: "",
    full_name: "",
    phone_number: "",
    email: "",
    gender: "L" as "L" | "P",
    birth_date: "",
    hire_date: new Date().toISOString().split("T")[0],
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

  // Load master data
  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  // Load departments when company changes
  useEffect(() => {
    if (formData.company_id) {
      loadDepartments(parseInt(formData.company_id));
    } else {
      setDepartments([]);
      setPositions([]);
    }
  }, [formData.company_id]);

  // Load positions when department changes
  useEffect(() => {
    if (formData.department_id) {
      loadPositions(parseInt(formData.department_id));
    } else {
      setPositions([]);
    }
  }, [formData.department_id]);

  // Sync dates with form data
  useEffect(() => {
    if (birthDate) {
      setFormData((prev) => ({
        ...prev,
        birth_date: birthDate.toISOString().split("T")[0],
      }));
    }
  }, [birthDate]);

  useEffect(() => {
    if (hireDate) {
      setFormData((prev) => ({
        ...prev,
        hire_date: hireDate.toISOString().split("T")[0],
      }));
    }
  }, [hireDate]);

  useEffect(() => {
    if (contractEndDate) {
      setFormData((prev) => ({
        ...prev,
        contract_end_date: contractEndDate.toISOString().split("T")[0],
      }));
    }
  }, [contractEndDate]);

  const loadMasterData = async () => {
    const [companiesData, shiftsData, rolesData] = await Promise.all([
      getCompanies(),
      getWorkShifts(),
      getRoles(),
    ]);
    setCompanies(companiesData.data);
    setWorkShifts(shiftsData.data);
    setRoles(rolesData.data);
  };

  const loadDepartments = async (companyId: number) => {
    const data = await getDepartmentsByCompany(companyId);
    setDepartments(data.data);
  };

  const loadPositions = async (departmentId: number) => {
    const data = await getPositionsByDepartment(departmentId);
    setPositions(data.data);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = handleRupiahInput(e.target.value);
    setSalaryDisplay(result.formatted);
    setSalaryNumeric(result.numeric);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Show loading toast
    const loadingToast = toast.loading("Menyimpan data karyawan...");

    try {
      const result = await createEmployeeWithUser({
        company_id: parseInt(formData.company_id),
        department_id: parseInt(formData.department_id),
        position_id: parseInt(formData.position_id),
        shift_id: parseInt(formData.shift_id),
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email,
        gender: formData.gender,
        birth_date: formData.birth_date,
        hire_date: formData.hire_date,
        create_user_account: formData.create_user_account,
        username: formData.create_user_account ? formData.username : undefined,
        role_id: formData.create_user_account
          ? parseInt(formData.role_id)
          : undefined,
        contract_type: formData.contract_type,
        salary_base: salaryNumeric > 0 ? salaryNumeric : undefined,
        contract_end_date: formData.contract_end_date || undefined,
        education_data: educationList.length > 0 ? educationList : undefined,
        personnel_details: {
          religion: personnelDetails.religion,
          marital_status: personnelDetails.marital_status,
          ptkp_status: personnelDetails.ptkp_status,
          ktp_address: personnelDetails.ktp_address,
          domicile_address: personnelDetails.domicile_address,
          npwp_number: personnelDetails.npwp_number || undefined,
        },
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (result.success) {
        if (result.data?.tempPassword) {
          // Debug: Log password yang diterima dari server
          console.log("🔐 Received tempPassword:", result.data.tempPassword);
          console.log(
            "🔐 Is hashed?",
            result.data.tempPassword.startsWith("$2")
          );

          toast.success("Karyawan berhasil ditambahkan!");
          setTempPassword(result.data.tempPassword);
          setShowSuccess(true);
        } else {
          toast.success("Karyawan berhasil ditambahkan!");
          setIsOpen(false);
          resetForm();
        }
      } else {
        toast.error(result.error || "Gagal menyimpan data karyawan");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan saat menyimpan data");
      console.error("Error submitting employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopiedPassword(true);
    toast.success("Password berhasil disalin!");
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      company_id: "",
      department_id: "",
      position_id: "",
      shift_id: "",
      full_name: "",
      phone_number: "",
      email: "",
      gender: "L",
      birth_date: "",
      hire_date: new Date().toISOString().split("T")[0],
      contract_type: "Probation",
      salary_base: "",
      contract_end_date: "",
      create_user_account: false,
      username: "",
      role_id: "",
    });
    setPersonnelDetails({
      religion: "",
      marital_status: "TK/0",
      ptkp_status: "TK/0",
      ktp_address: "",
      domicile_address: "",
      npwp_number: "",
    });
    setSalaryDisplay("");
    setSalaryNumeric(0);
    setBirthDate(undefined);
    setHireDate(new Date());
    setContractEndDate(undefined);
    setShowSuccess(false);
    setTempPassword("");
    setCopiedPassword(false);
    setEducationList([]);
    setShowEducationForm(false);
    setCurrentEducation({
      degree: "",
      institution: "",
      major: "",
      graduation_year: "",
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
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
          formData.shift_id &&
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
        if (formData.create_user_account) {
          return formData.username && formData.role_id;
        }
        return true;
      case 5:
        // Step 5 is verification, always allow to proceed to submit
        return true;
      default:
        return false;
    }
  };

  return {
    // State
    isOpen,
    isSubmitting,
    showSuccess,
    tempPassword,
    copiedPassword,
    currentStep,
    salaryDisplay,
    salaryNumeric,
    birthDate,
    hireDate,
    contractEndDate,
    educationList,
    showEducationForm,
    currentEducation,
    companies,
    departments,
    positions,
    workShifts,
    roles,
    formData,
    personnelDetails,
    // Setters
    setIsOpen,
    setBirthDate,
    setHireDate,
    setContractEndDate,
    setEducationList,
    setShowEducationForm,
    setCurrentEducation,
    setFormData,
    setPersonnelDetails,
    // Functions
    handleSalaryChange,
    handleSubmit,
    copyPassword,
    handleClose,
    handleNext,
    handlePrevious,
    canGoNext,
  };
}
