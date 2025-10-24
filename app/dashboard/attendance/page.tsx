import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CheckInOutCard from "@/components/attendance/CheckInOutCard";
import RealTimeAttendanceDashboard from "@/components/attendance/RealTimeAttendanceDashboard";
import AttendanceReportGenerator from "@/components/attendance/AttendanceReportGenerator";
import OvertimeManagement from "@/components/attendance/OvertimeManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  hasPermission,
  requireAnyPermission,
  PERMISSIONS,
} from "@/lib/permissions";

export default async function AttendancePage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Require at least one attendance permission
  await requireAnyPermission(
    [
      PERMISSIONS.ATTENDANCE_CHECK_IN,
      PERMISSIONS.ATTENDANCE_VIEW_OWN,
      PERMISSIONS.ATTENDANCE_VIEW_TEAM,
      PERMISSIONS.ATTENDANCE_VIEW_ALL,
    ],
    {
      redirectTo: "/dashboard",
      errorMessage: "You don't have access to attendance module",
    }
  );

  // Get user to find employee_id
  const { data: userRecord } = await supabase
    .from("users")
    .select("employee_id")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!userRecord?.employee_id) {
    redirect("/dashboard");
  }

  // Get employee info with company and role
  const { data: employee, error } = await supabase
    .from("employees")
    .select(
      `
      id,
      full_name,
      company_id,
      position:positions(name),
      department:departments(name)
    `
    )
    .eq("id", userRecord.employee_id)
    .is("deleted_at", null)
    .single();

  if (error || !employee) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Data karyawan tidak ditemukan. Silakan hubungi administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check user permissions (granular permission-based access)
  const canCheckIn = await hasPermission(PERMISSIONS.ATTENDANCE_CHECK_IN);
  const canViewTeam = await hasPermission(PERMISSIONS.ATTENDANCE_VIEW_TEAM);
  const canViewAll = await hasPermission(PERMISSIONS.ATTENDANCE_VIEW_ALL);
  const canApprove = await hasPermission(PERMISSIONS.ATTENDANCE_APPROVE);
  const canExport = await hasPermission(PERMISSIONS.ATTENDANCE_EXPORT);

  // Combined permissions for tabs
  const canViewMonitoring = canViewTeam || canViewAll; // Manager, HR Admin, Super Admin
  const canGenerateReports = canViewTeam || canViewAll || canExport; // Manager+
  const canManageOvertime = canApprove || canViewAll; // Manager+ (approve overtime)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Modul Presensi</h1>
        <p className="text-muted-foreground">
          Kelola presensi, lembur, dan laporan karyawan
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Check In/Out</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Laporan</span>
          </TabsTrigger>
          <TabsTrigger value="overtime" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Lembur</span>
          </TabsTrigger>
        </TabsList>

        {/* Check In/Out Tab */}
        <TabsContent value="checkin" className="space-y-4">
          <CheckInOutCard
            employeeId={employee.id}
            employeeName={employee.full_name}
          />
        </TabsContent>

        {/* Monitoring Tab - Manager, HR Admin, Super Admin */}
        <TabsContent value="monitoring" className="space-y-4">
          {canViewMonitoring ? (
            <RealTimeAttendanceDashboard companyId={employee.company_id} />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Akses Terbatas</AlertTitle>
              <AlertDescription>
                Fitur monitoring real-time hanya tersedia untuk Manager, HR
                Admin, dan Super Admin. Anda dapat melihat presensi pribadi Anda
                di tab &quot;Check In/Out&quot;.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Reports Tab - Manager, HR Admin, Super Admin */}
        <TabsContent value="reports" className="space-y-4">
          {canGenerateReports ? (
            <AttendanceReportGenerator companyId={employee.company_id} />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Akses Terbatas</AlertTitle>
              <AlertDescription>
                Fitur generate laporan hanya tersedia untuk Manager, HR Admin,
                dan Super Admin. Untuk melihat riwayat presensi Anda, silakan
                hubungi administrator.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Overtime Tab - All Users, but different views */}
        <TabsContent value="overtime" className="space-y-4">
          <OvertimeManagement
            isAdmin={canManageOvertime}
            currentUserId={employee.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
