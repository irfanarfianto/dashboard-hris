import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Clock,
  Calendar,
  Wallet,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  getTotalEmployees,
  getTodayAttendance,
  getPendingLeaveRequests,
  getCurrentMonthPayroll,
  getRecentActivities,
} from "@/lib/actions/dashboardActions";
import { formatRupiah } from "@/lib/utils/currency";

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [
    totalEmployeesData,
    attendanceData,
    leaveRequestsData,
    payrollData,
    activitiesData,
  ] = await Promise.all([
    getTotalEmployees(),
    getTodayAttendance(),
    getPendingLeaveRequests(),
    getCurrentMonthPayroll(),
    getRecentActivities(4),
  ]);

  // Prepare stats cards with real data
  const stats = [
    {
      title: "Total Karyawan",
      value: totalEmployeesData.data.toString(),
      description:
        totalEmployeesData.previousMonth >= 0
          ? `+${totalEmployeesData.previousMonth} dari bulan lalu`
          : `${totalEmployeesData.previousMonth} dari bulan lalu`,
      icon: Users,
      trend: totalEmployeesData.previousMonth >= 0 ? "up" : "down",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Hadir Hari Ini",
      value: attendanceData.data.toString(),
      description: `${attendanceData.percentage}% dari total (${attendanceData.total} karyawan)`,
      icon: Clock,
      trend: attendanceData.percentage >= 90 ? "up" : "neutral",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pengajuan Cuti",
      value: leaveRequestsData.data.toString(),
      description: "Menunggu approval",
      icon: Calendar,
      trend: "neutral",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Payroll",
      value: formatRupiah(payrollData.data),
      description: "Bulan ini",
      icon: Wallet,
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // Recent activities from database
  const recentActivities = activitiesData.data;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Selamat Datang Kembali! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Ini adalah ringkasan aktivitas HRIS hari ini -{" "}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} rounded-lg p-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>
              Aktivitas karyawan dalam 24 jam terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Belum ada aktivitas terbaru</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts/Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Peringatan & Notifikasi
            </CardTitle>
            <CardDescription>
              Item yang memerlukan perhatian Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequestsData.data > 0 && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        {leaveRequestsData.data} Pengajuan Cuti Menunggu
                      </h4>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        Terdapat pengajuan cuti yang perlu direview
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Payroll Bulan Ini
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Total: {formatRupiah(payrollData.data)} untuk{" "}
                      {totalEmployeesData.data} karyawan
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-lg border p-4 ${
                  attendanceData.percentage >= 90
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                    : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Clock
                    className={`h-5 w-5 ${
                      attendanceData.percentage >= 90
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  />
                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        attendanceData.percentage >= 90
                          ? "text-green-900 dark:text-green-100"
                          : "text-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      Presensi{" "}
                      {attendanceData.percentage >= 90
                        ? "Normal"
                        : "Perlu Perhatian"}
                    </h4>
                    <p
                      className={`text-xs mt-1 ${
                        attendanceData.percentage >= 90
                          ? "text-green-700 dark:text-green-300"
                          : "text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      {attendanceData.percentage}% karyawan sudah presensi hari
                      ini ({attendanceData.data}/{attendanceData.total})
                    </p>
                  </div>
                </div>
              </div>

              {totalEmployeesData.data === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Belum Ada Data Karyawan
                      </h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        Tambahkan karyawan pertama Anda untuk memulai
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Shortcut untuk tugas yang sering dilakukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/employees"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Kelola Karyawan</span>
            </Link>
            <Link
              href="/dashboard/attendance"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Lihat Presensi</span>
            </Link>
            <Link
              href="/dashboard/leaves"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Kelola Cuti</span>
            </Link>
            <Link
              href="/dashboard/payroll"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Wallet className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Proses Payroll</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
