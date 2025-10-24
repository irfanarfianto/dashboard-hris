import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Shield,
  CreditCard,
  Home,
  Users,
  BookOpen,
  Heart,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }

    // Get user to find employee_id
    // First, check if user exists in users table
    const { data: allUsers, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", user.id);

    console.log("Auth User ID:", user.id);
    console.log("All matching users:", allUsers);
    console.log("Check error:", checkError);

    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("employee_id, username, role_id")
      .eq("auth_user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    console.log("User record:", userRecord, "Error:", userError);

    if (userError || !userRecord?.employee_id) {
      console.log(
        "No employee_id found for user:",
        user.id,
        "Error:",
        userError
      );
      return (
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Data karyawan tidak ditemukan. Silakan hubungi administrator.
              <div className="mt-2 text-xs">
                <div>Auth User ID: {user.id}</div>
                <div>Email: {user.email}</div>
                {userError && <div>Error: {userError.message}</div>}
                {allUsers && (
                  <div>
                    Found {allUsers.length} users with this auth_user_id
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Get employee data with all related information
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select(
        `
      *,
      company:companies(name, address, phone),
      position:positions(name),
      department:departments(name),
      personnel:employee_personnel_details(
        ktp_address,
        domicile_address,
        npwp_number,
        religion,
        marital_status
      )
    `
      )
      .eq("id", userRecord.employee_id)
      .is("deleted_at", null)
      .single();

    console.log("Employee data:", employee, "Error:", employeeError);

    if (!employee) {
      console.log("No employee found for employee_id:", userRecord.employee_id);
      redirect("/dashboard");
    }

    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select(
        `
      username,
      role:roles!inner(name, description)
    `
      )
      .eq("employee_id", employee.id)
      .is("deleted_at", null)
      .single();

    // Get employee education
    const { data: educations } = await supabase
      .from("employee_educations")
      .select("*")
      .eq("employee_id", employee.id)
      .is("deleted_at", null)
      .order("graduation_year", { ascending: false });

    // Get employee family
    const { data: families } = await supabase
      .from("employee_families")
      .select("*")
      .eq("employee_id", employee.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getGenderLabel = (gender: string) => {
      return gender === "L" ? "Laki-laki" : "Perempuan";
    };

    const getStatusLabel = (status: string) => {
      const labels: Record<string, string> = {
        Aktif: "Aktif",
        Cuti: "Cuti",
        "Tidak Aktif": "Tidak Aktif",
      };
      return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        Aktif: "bg-green-100 text-green-800 border-green-200",
        Cuti: "bg-orange-100 text-orange-800 border-orange-200",
        "Tidak Aktif": "bg-gray-100 text-gray-800 border-gray-200",
      };
      return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getRoleColor = (roleName: string) => {
      const colors: Record<string, string> = {
        Employee: "bg-blue-100 text-blue-800 border-blue-200",
        Manager: "bg-purple-100 text-purple-800 border-purple-200",
        "HR Admin": "bg-teal-100 text-teal-800 border-teal-200",
        "Super Admin": "bg-red-100 text-red-800 border-red-200",
      };
      return colors[roleName] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleName = (userData?.role as any)?.name || "Employee";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleDescription = (userData?.role as any)?.description || "";

    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
          <p className="text-muted-foreground">
            Informasi lengkap tentang data pribadi dan pekerjaan Anda
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-teal-500 to-lime-500 text-white">
                  {getInitials(employee.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Basic Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{employee.full_name}</h2>
                  <p className="text-muted-foreground">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(employee.position as any)?.name || "-"} •{" "}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(employee.department as any)?.name || "-"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={getStatusColor(employee.status)}
                  >
                    {getStatusLabel(employee.status)}
                  </Badge>
                  <Badge variant="outline" className={getRoleColor(roleName)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {roleName}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.phone_number}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                Informasi Pribadi
              </CardTitle>
              <CardDescription>Data pribadi dan identitas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tanggal Lahir</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(employee.birth_date)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Jenis Kelamin</p>
                    <p className="text-sm text-muted-foreground">
                      {getGenderLabel(employee.gender)}
                    </p>
                  </div>
                </div>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(employee.personnel as any)?.ktp_address && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Home className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alamat KTP</p>
                        <p className="text-sm text-muted-foreground">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(employee.personnel as any)?.ktp_address}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(employee.personnel as any)?.domicile_address && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alamat Domisili</p>
                        <p className="text-sm text-muted-foreground">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(employee.personnel as any)?.domicile_address}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(employee.personnel as any)?.npwp_number && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">NPWP</p>
                        <p className="text-sm text-muted-foreground">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(employee.personnel as any)?.npwp_number}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-lime-600" />
                Informasi Pekerjaan
              </CardTitle>
              <CardDescription>Data kepegawaian dan perusahaan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Perusahaan</p>
                    <p className="text-sm text-muted-foreground">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(employee.company as any)?.name || "-"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Jabatan</p>
                    <p className="text-sm text-muted-foreground">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(employee.position as any)?.name || "-"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Departemen</p>
                    <p className="text-sm text-muted-foreground">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(employee.department as any)?.name || "-"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tanggal Bergabung</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(employee.hire_date)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Informasi Akun
              </CardTitle>
              <CardDescription>Role dan hak akses sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-muted-foreground">
                      {userData?.username || "-"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Role</p>
                    <Badge variant="outline" className={getRoleColor(roleName)}>
                      {roleName}
                    </Badge>
                  </div>
                </div>

                {roleDescription && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Deskripsi Role</p>
                        <p className="text-sm text-muted-foreground">
                          {roleDescription}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email Akun</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          {employee.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  Informasi Perusahaan
                </CardTitle>
                <CardDescription>
                  Data perusahaan tempat bekerja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nama Perusahaan</p>
                      <p className="text-sm text-muted-foreground">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(employee.company as any)?.name}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Alamat</p>
                      <p className="text-sm text-muted-foreground">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(employee.company as any)?.address}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Telepon</p>
                      <p className="text-sm text-muted-foreground">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(employee.company as any)?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Education History */}
        {educations && educations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Riwayat Pendidikan
              </CardTitle>
              <CardDescription>
                Menampilkan {educations.length} riwayat pendidikan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {educations.map((edu, index) => (
                  <div key={edu.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{edu.institution}</h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.degree} - {edu.major}
                          </p>
                        </div>
                        <Badge variant="outline">{edu.graduation_year}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Information */}
        {families && families.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-600" />
                Informasi Keluarga
              </CardTitle>
              <CardDescription>
                Menampilkan {families.length} anggota keluarga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {families.map((family, index) => (
                  <div key={family.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium">Nama</p>
                        <p className="text-sm text-muted-foreground">
                          {family.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hubungan</p>
                        <Badge variant="outline">{family.relationship}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tanggal Lahir</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(family.birth_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Nomor Telepon</p>
                        <p className="text-sm text-muted-foreground">
                          {family.phone_number || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading profile:", error);
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Terjadi kesalahan saat memuat profil. Silakan coba lagi atau hubungi
            administrator.
            {error instanceof Error && (
              <div className="mt-2 text-xs">Error: {error.message}</div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
