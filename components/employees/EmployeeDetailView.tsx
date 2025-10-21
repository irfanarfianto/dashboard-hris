"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  User,
  Briefcase,
  GraduationCap,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils/currency";
import EditEmployeeDialog from "./EditEmployeeDialog";

interface EducationData {
  id?: number;
  degree: string;
  institution: string;
  major: string;
  graduation_year: string;
}

interface EmployeeDetailViewProps {
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
    created_at?: string;
    updated_at?: string;
    companies: { name: string };
    departments: { name: string };
    positions: {
      name: string;
      position_levels?: { name: string };
    };
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
      is_active: boolean;
      role_id: number;
      roles: { name: string };
    }>;
  };
}

export default function EmployeeDetailView({
  employee,
}: EmployeeDetailViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  const getContractTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      Probation:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Contract: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Permanent:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
    return variants[type] || "";
  };

  const personnelDetails = employee.employee_personnel_details?.[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employees">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {employee.full_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {employee.positions?.name} - {employee.departments?.name}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsEditOpen(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Pekerjaan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Briefcase className="h-5 w-5 text-teal-600" />
              Data Pekerjaan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Perusahaan
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {employee.companies?.name}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Departemen
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {employee.departments?.name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Jabatan
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {employee.positions?.name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Level Jabatan
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {employee.positions?.position_levels?.name || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Status Kontrak
                </label>
                <div className="mt-1">
                  <Badge
                    className={getContractTypeBadge(employee.contract_type)}
                  >
                    {getContractTypeLabel(employee.contract_type)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Gaji Pokok
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {employee.salary_base
                    ? formatRupiah(employee.salary_base)
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Tanggal Bergabung
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(employee.hire_date)}
                  </p>
                </div>
              </div>
              {employee.contract_end_date && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Akhir Kontrak
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(employee.contract_end_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Pribadi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <User className="h-5 w-5 text-blue-600" />
              Data Pribadi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {employee.email}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  No. Telepon
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {employee.phone_number}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Jenis Kelamin
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {employee.gender === "L" ? "Laki-laki" : "Perempuan"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Tanggal Lahir
                </label>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {formatDate(employee.birth_date)}
                </p>
              </div>
              {personnelDetails && (
                <>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Agama
                    </label>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {personnelDetails.religion}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Status Pernikahan
                    </label>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {personnelDetails.marital_status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Status PTKP
                    </label>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {personnelDetails.ptkp_status}
                    </p>
                  </div>
                  {personnelDetails.npwp_number && (
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        NPWP
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {personnelDetails.npwp_number}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Alamat KTP
                    </label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {personnelDetails.ktp_address}
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Alamat Domisili
                    </label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {personnelDetails.domicile_address}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Data Pendidikan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Data Pendidikan
            </h2>
            {employee.employee_educations &&
            employee.employee_educations.length > 0 ? (
              <div className="space-y-3">
                {employee.employee_educations.map((edu, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          Jenjang
                        </label>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {edu.degree}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          Institusi
                        </label>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {edu.institution}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          Jurusan
                        </label>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {edu.major}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          Tahun Lulus
                        </label>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {edu.graduation_year}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Tidak ada data pendidikan
              </p>
            )}
          </div>
        </div>

        {/* Sidebar - User Account & Quick Info */}
        <div className="space-y-6">
          {/* User Account */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Shield className="h-5 w-5 text-amber-600" />
              Akun User
            </h2>
            {employee.users && employee.users.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Username
                  </label>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {employee.users[0].username}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Role
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {employee.users[0].roles?.name}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      className={
                        employee.users[0].is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }
                    >
                      {employee.users[0].is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Tidak memiliki akun user aplikasi
              </p>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-teal-50 to-lime-50 dark:from-teal-900/20 dark:to-lime-900/20 rounded-lg border border-teal-200 dark:border-teal-800 p-6">
            <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-3">
              Informasi Cepat
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  ID Karyawan:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  #{employee.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Dibuat:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(employee.created_at || "")}
                </span>
              </div>
              {employee.updated_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Diperbarui:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(employee.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditEmployeeDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        employee={employee}
      />
    </div>
  );
}
