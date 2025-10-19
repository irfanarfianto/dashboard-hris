"use client";

import {
  Briefcase,
  User,
  GraduationCap,
  Shield,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StepperIndicator from "./add-employee-steps/StepperIndicator";
import Step1DataPekerjaan from "./add-employee-steps/Step1DataPekerjaan";
import Step2DataPribadi from "./add-employee-steps/Step2DataPribadi";
import Step3DataPendidikan from "./add-employee-steps/Step3DataPendidikan";
import Step4AkunUser from "./add-employee-steps/Step4AkunUser";
import Step5Verifikasi from "./add-employee-steps/Step5Verifikasi";
import SuccessScreen from "./add-employee-steps/SuccessScreen";
import { useAddEmployeeForm } from "./add-employee-steps/useAddEmployeeForm";

interface AddEmployeeDialogProps {
  children: React.ReactNode;
}

export default function AddEmployeeDialog({
  children,
}: AddEmployeeDialogProps) {
  const {
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
  } = useAddEmployeeForm();

  const steps = [
    { number: 1, title: "Data Pekerjaan", icon: Briefcase },
    { number: 2, title: "Data Pribadi", icon: User },
    { number: 3, title: "Data Pendidikan", icon: GraduationCap },
    { number: 4, title: "Akun User", icon: Shield },
    { number: 5, title: "Verifikasi Data", icon: CheckCircle2 },
  ];

  const totalSteps = 5;

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden z-10 flex flex-col">
            {showSuccess ? (
              <SuccessScreen
                email={formData.email}
                username={formData.username}
                tempPassword={tempPassword}
                copiedPassword={copiedPassword}
                onCopyPassword={copyPassword}
                onClose={handleClose}
              />
            ) : (
              <>
                {/* Header */}
                <div className="border-b px-6 py-4 bg-gradient-to-r from-teal-50 to-lime-50 dark:from-teal-900/20 dark:to-lime-900/20">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
                    Tambah Karyawan Baru
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Step {currentStep} dari {totalSteps} -{" "}
                    {steps[currentStep - 1].title}
                  </p>
                </div>

                {/* Stepper Indicator */}
                <StepperIndicator steps={steps} currentStep={currentStep} />

                {/* Form Content */}
                <form
                  onSubmit={(e) => {
                    console.log(
                      "Form submit triggered. Current step:",
                      currentStep,
                      "Total steps:",
                      totalSteps
                    );
                    // Extra protection: only allow submit when on last step
                    if (currentStep < totalSteps) {
                      console.log("Preventing submit - not on last step");
                      e.preventDefault();
                      return;
                    }
                    console.log("Allowing submit - on last step");
                    handleSubmit(e);
                  }}
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting form when not on last step
                    if (e.key === "Enter" && currentStep < totalSteps) {
                      console.log(
                        "Preventing Enter key submit at step",
                        currentStep
                      );
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
                        workShifts={workShifts}
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

                    {/* Step 4: Akun User */}
                    {currentStep === 4 && (
                      <Step4AkunUser
                        formData={formData}
                        roles={roles}
                        onFormDataChange={(field, value) =>
                          setFormData({ ...formData, [field]: value })
                        }
                      />
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
                        workShifts={workShifts}
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
                      Step {currentStep} dari {totalSteps}
                    </div>

                    {currentStep < totalSteps ? (
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
                            <UserPlus className="h-4 w-4" />
                            Simpan Karyawan
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
