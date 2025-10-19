import {
  CheckCircle2,
  Briefcase,
  User,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils/currency";

interface Step5VerifikasiProps {
  formData: {
    company_id: string;
    department_id: string;
    position_id: string;
    shift_id: string;
    full_name: string;
    phone_number: string;
    email: string;
    gender: "L" | "P";
    birth_date: string;
    hire_date: string;
    contract_type: "Probation" | "Contract" | "Permanent";
    salary_base: string;
    contract_end_date: string;
    create_user_account: boolean;
    username: string;
    role_id: string;
  };
  personnelDetails: {
    religion: string;
    marital_status: string;
    ptkp_status: string;
    ktp_address: string;
    domicile_address: string;
    npwp_number: string;
  };
  salaryNumeric: number;
  educationList: Array<{
    degree: string;
    institution: string;
    major: string;
    graduation_year: string;
  }>;
  companies: Array<{ id: number; name: string }>;
  departments: Array<{ id: number; name: string }>;
  positions: Array<{ id: number; name: string }>;
  workShifts: Array<{
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  }>;
  roles: Array<{ id: number; name: string; description?: string }>;
}

export default function Step5Verifikasi({
  formData,
  personnelDetails,
  salaryNumeric,
  educationList,
  companies,
  departments,
  positions,
  workShifts,
  roles,
}: Step5VerifikasiProps) {
  // Helper functions to get names from IDs
  const getCompanyName = () =>
    companies.find((c) => c.id === parseInt(formData.company_id))?.name || "-";
  const getDepartmentName = () =>
    departments.find((d) => d.id === parseInt(formData.department_id))?.name ||
    "-";
  const getPositionName = () =>
    positions.find((p) => p.id === parseInt(formData.position_id))?.name || "-";
  const getShiftName = () => {
    const shift = workShifts.find((s) => s.id === parseInt(formData.shift_id));
    return shift
      ? `${shift.name} (${shift.start_time} - ${shift.end_time})`
      : "-";
  };
  const getRoleName = () =>
    roles.find((r) => r.id === parseInt(formData.role_id))?.name || "-";

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getContractTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Probation: "Masa Percobaan",
      Contract: "Kontrak",
      Permanent: "Tetap",
    };
    return labels[type] || type;
  };

  const getMaritalStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "TK/0": "Tidak Kawin / Tanpa Tanggungan",
      "K/0": "Kawin / Tanpa Tanggungan",
      "K/1": "Kawin / 1 Tanggungan",
      "K/2": "Kawin / 2 Tanggungan",
      "K/3": "Kawin / 3 Tanggungan",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
          Verifikasi Data Karyawan
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Pastikan semua data yang diinput sudah benar sebelum menyimpan.
        </p>

        {/* Data Pekerjaan */}
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-lime-50 dark:from-teal-900/10 dark:to-lime-900/10 rounded-lg border border-teal-200 dark:border-teal-800">
          <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Data Pekerjaan
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Perusahaan:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {getCompanyName()}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Departemen:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {getDepartmentName()}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Jabatan:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {getPositionName()}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Shift Kerja:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {getShiftName()}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Tipe Kontrak:
              </span>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                <Badge variant="outline">
                  {getContractTypeLabel(formData.contract_type)}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Gaji Pokok:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatRupiah(salaryNumeric)}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Tanggal Bergabung:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(formData.hire_date)}
              </p>
            </div>
            {formData.contract_end_date && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Akhir Kontrak:
                </span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(formData.contract_end_date)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Data Pribadi */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Data Pribadi
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Nama Lengkap:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formData.full_name}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Jenis Kelamin:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formData.gender === "L" ? "Laki-laki" : "Perempuan"}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Tanggal Lahir:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(formData.birth_date)}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                No. Telepon:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formData.phone_number}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formData.email}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Agama:</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {personnelDetails.religion}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Status Pernikahan:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {getMaritalStatusLabel(personnelDetails.marital_status)}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Status PTKP:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {personnelDetails.ptkp_status}
              </p>
            </div>
            {personnelDetails.npwp_number && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">NPWP:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {personnelDetails.npwp_number}
                </p>
              </div>
            )}
            <div className="md:col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                Alamat KTP:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {personnelDetails.ktp_address}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600 dark:text-gray-400">
                Alamat Domisili:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {personnelDetails.domicile_address}
              </p>
            </div>
          </div>
        </div>

        {/* Data Pendidikan */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Data Pendidikan
          </h4>
          {educationList.length > 0 ? (
            <div className="space-y-3">
              {educationList.map((edu, index) => (
                <div
                  key={index}
                  className="p-3 bg-white dark:bg-gray-800 rounded border border-purple-100 dark:border-purple-900"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Jenjang:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {edu.degree}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Institusi:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {edu.institution}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Jurusan:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {edu.major}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Tahun Lulus:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {edu.graduation_year}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Tidak ada data pendidikan
            </p>
          )}
        </div>

        {/* Akun User */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Akun User Aplikasi
          </h4>
          {formData.create_user_account ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Username:
                </span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formData.username}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  <Badge variant="outline">{getRoleName()}</Badge>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  ℹ️ Password sementara akan di-generate otomatis setelah data
                  berhasil disimpan
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Tidak membuat akun user untuk karyawan ini
            </p>
          )}
        </div>

        {/* Warning Box */}
        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>
              Pastikan semua data yang diinput sudah benar. Jika ada yang salah,
              klik tombol <strong>&ldquo;Sebelumnya&rdquo;</strong> untuk
              kembali ke step yang ingin diperbaiki.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
