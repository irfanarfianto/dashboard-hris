"use client";

import { useState } from "react";
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
import { updateEmployeeEducations } from "@/lib/actions/employeeActions";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface EducationData {
  id?: number;
  degree: string;
  institution: string;
  major: string;
  graduation_year: string;
}

interface EditEducationDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: number;
    employee_educations?: EducationData[];
  };
}

export default function EditEducationDataDialog({
  isOpen,
  onClose,
  employee,
}: EditEducationDataDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with existing educations or one empty entry
  const [educations, setEducations] = useState<EducationData[]>(
    employee.employee_educations && employee.employee_educations.length > 0
      ? employee.employee_educations
      : [
          {
            degree: "",
            institution: "",
            major: "",
            graduation_year: "",
          },
        ]
  );

  const handleAddEducation = () => {
    setEducations([
      ...educations,
      {
        degree: "",
        institution: "",
        major: "",
        graduation_year: "",
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  const handleEducationChange = (
    index: number,
    field: keyof EducationData,
    value: string
  ) => {
    const updated = educations.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    setEducations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all educations have required fields
    const isValid = educations.every(
      (edu) => edu.degree && edu.institution && edu.major && edu.graduation_year
    );

    if (!isValid) {
      toast.error("Mohon lengkapi semua data pendidikan");
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateEmployeeEducations(employee.id, educations);

      if (result.success) {
        toast.success("Data pendidikan berhasil diperbarui");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Gagal memperbarui data pendidikan");
      }
    } catch (error) {
      console.error("Error updating education data:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Pendidikan</DialogTitle>
          <DialogDescription>
            Perbarui informasi pendidikan karyawan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {educations.map((education, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 relative"
            >
              {/* Remove button */}
              {educations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEducation(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Pendidikan {index + 1}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Degree */}
                <div className="space-y-2">
                  <Label>
                    Jenjang Pendidikan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={education.degree}
                    onValueChange={(value) =>
                      handleEducationChange(index, "degree", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="SMP">SMP</SelectItem>
                      <SelectItem value="SMA">SMA</SelectItem>
                      <SelectItem value="SMK">SMK</SelectItem>
                      <SelectItem value="D3">D3 (Diploma)</SelectItem>
                      <SelectItem value="D4">D4 (Diploma)</SelectItem>
                      <SelectItem value="S1">S1 (Sarjana)</SelectItem>
                      <SelectItem value="S2">S2 (Magister)</SelectItem>
                      <SelectItem value="S3">S3 (Doktor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Institution */}
                <div className="space-y-2">
                  <Label>
                    Nama Institusi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={education.institution}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Universitas Indonesia"
                    required
                  />
                </div>

                {/* Major */}
                <div className="space-y-2">
                  <Label>
                    Jurusan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={education.major}
                    onChange={(e) =>
                      handleEducationChange(index, "major", e.target.value)
                    }
                    placeholder="Contoh: Teknik Informatika"
                    required
                  />
                </div>

                {/* Graduation Year */}
                <div className="space-y-2">
                  <Label>
                    Tahun Lulus <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={education.graduation_year}
                    onValueChange={(value) =>
                      handleEducationChange(index, "graduation_year", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {/* Add Education Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddEducation}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pendidikan
          </Button>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
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
