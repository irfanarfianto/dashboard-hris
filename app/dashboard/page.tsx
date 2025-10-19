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

export default async function DashboardPage() {
  // TODO: Fetch data from database
  // const supabase = await createClient();

  // Stats cards data (nanti bisa diambil dari database)
  const stats = [
    {
      title: "Total Karyawan",
      value: "156",
      description: "+12 dari bulan lalu",
      icon: Users,
      trend: "up",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Hadir Hari Ini",
      value: "142",
      description: "91% dari total",
      icon: Clock,
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pengajuan Cuti",
      value: "8",
      description: "Menunggu approval",
      icon: Calendar,
      trend: "neutral",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Payroll",
      value: "Rp 450M",
      description: "Bulan ini",
      icon: Wallet,
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  // Recent activities (placeholder)
  const recentActivities = [
    {
      id: 1,
      user: "Budi Santoso",
      action: "mengajukan cuti",
      time: "5 menit lalu",
    },
    {
      id: 2,
      user: "Siti Rahayu",
      action: "check-in presensi",
      time: "15 menit lalu",
    },
    { id: 3, user: "Ahmad Fauzi", action: "update profil", time: "1 jam lalu" },
    {
      id: 4,
      user: "Dewi Lestari",
      action: "mengajukan izin",
      time: "2 jam lalu",
    },
  ];

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
              {recentActivities.map((activity) => (
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
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
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
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      8 Pengajuan Cuti Menunggu
                    </h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Terdapat pengajuan cuti yang perlu direview
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Payroll Bulan Ini
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Deadline proses payroll: 25 Oktober 2025
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                      Presensi Normal
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      91% karyawan sudah presensi hari ini
                    </p>
                  </div>
                </div>
              </div>
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
            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Tambah Karyawan</span>
            </button>
            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Lihat Presensi</span>
            </button>
            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Kelola Cuti</span>
            </button>
            <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
              <Wallet className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Proses Payroll</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
