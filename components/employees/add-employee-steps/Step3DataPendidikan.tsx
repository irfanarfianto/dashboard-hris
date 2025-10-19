import { GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EducationData {
  degree: string;
  institution: string;
  major: string;
  graduation_year: string;
}

interface Step3DataPendidikanProps {
  educationList: EducationData[];
  showEducationForm: boolean;
  currentEducation: EducationData;
  onEducationListChange: (list: EducationData[]) => void;
  onShowEducationFormChange: (show: boolean) => void;
  onCurrentEducationChange: (education: EducationData) => void;
}

export default function Step3DataPendidikan({
  educationList,
  showEducationForm,
  currentEducation,
  onEducationListChange,
  onShowEducationFormChange,
  onCurrentEducationChange,
}: Step3DataPendidikanProps) {
  const handleSaveEducation = () => {
    if (
      currentEducation.degree &&
      currentEducation.institution &&
      currentEducation.major &&
      currentEducation.graduation_year
    ) {
      onEducationListChange([...educationList, currentEducation]);
      onCurrentEducationChange({
        degree: "",
        institution: "",
        major: "",
        graduation_year: "",
      });
      onShowEducationFormChange(false);
      toast.success("Data pendidikan berhasil ditambahkan!");
    } else {
      toast.error("Mohon lengkapi semua field pendidikan");
    }
  };

  const handleCancelEducation = () => {
    onShowEducationFormChange(false);
    onCurrentEducationChange({
      degree: "",
      institution: "",
      major: "",
      graduation_year: "",
    });
  };

  const handleRemoveEducation = (index: number) => {
    const newList = educationList.filter((_, i) => i !== index);
    onEducationListChange(newList);
    toast.success("Data pendidikan berhasil dihapus");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-teal-600" />
          Data Pendidikan
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Data pendidikan bersifat opsional. Anda bisa melewati langkah ini.
        </p>

        {/* Education List */}
        {educationList.length > 0 && (
          <div className="mb-4 space-y-2">
            {educationList.map((edu, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {edu.degree} - {edu.major}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {edu.institution} ({edu.graduation_year})
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEducation(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Education Form */}
        {showEducationForm ? (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border-2 border-blue-200 dark:border-blue-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education_degree">Jenjang Pendidikan</Label>
                <Input
                  id="education_degree"
                  value={currentEducation.degree}
                  onChange={(e) =>
                    onCurrentEducationChange({
                      ...currentEducation,
                      degree: e.target.value,
                    })
                  }
                  placeholder="SD / SMP / SMA / D3 / S1 / S2"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="education_institution">Nama Institusi</Label>
                <Input
                  id="education_institution"
                  value={currentEducation.institution}
                  onChange={(e) =>
                    onCurrentEducationChange({
                      ...currentEducation,
                      institution: e.target.value,
                    })
                  }
                  placeholder="Nama sekolah/universitas"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="education_major">Jurusan/Program Studi</Label>
                <Input
                  id="education_major"
                  value={currentEducation.major}
                  onChange={(e) =>
                    onCurrentEducationChange({
                      ...currentEducation,
                      major: e.target.value,
                    })
                  }
                  placeholder="IPA / Teknik Informatika / dll"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="education_graduation_year">Tahun Lulus</Label>
                <Input
                  id="education_graduation_year"
                  type="number"
                  value={currentEducation.graduation_year}
                  onChange={(e) =>
                    onCurrentEducationChange({
                      ...currentEducation,
                      graduation_year: e.target.value,
                    })
                  }
                  placeholder="2020"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSaveEducation}
                className="bg-green-600 hover:bg-green-700"
              >
                Simpan Pendidikan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEducation}
              >
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => onShowEducationFormChange(true)}
            className="w-full border-dashed border-2"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Tambah Data Pendidikan
          </Button>
        )}
      </div>
    </div>
  );
}
