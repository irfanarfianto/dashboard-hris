"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Clock,
  Calendar,
  Wallet,
  Settings,
  Shield,
  LayoutDashboard,
  MapPin,
  Building2,
  Bell,
  Briefcase,
  Timer,
  ChevronDown,
  X,
  BookOpen,
  Code,
  FileText,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Ringkasan & Statistik",
  },
  {
    title: "Manajemen SDM",
    icon: Users,
    description: "Data Karyawan & Struktur Organisasi",
    submenu: [
      {
        title: "Karyawan",
        href: "/dashboard/employees",
        icon: Users,
      },
      {
        title: "Perusahaan",
        href: "/dashboard/companies",
        icon: Building2,
      },
      {
        title: "Departemen",
        href: "/dashboard/departments",
        icon: Building2,
      },
      {
        title: "Level Jabatan",
        href: "/dashboard/position-levels",
        icon: Briefcase,
      },
      {
        title: "Posisi",
        href: "/dashboard/positions",
        icon: Briefcase,
      },
    ],
  },
  {
    title: "Presensi & Shift",
    icon: Clock,
    description: "Manajemen Presensi & Jadwal Kerja",
    submenu: [
      {
        title: "Presensi",
        href: "/dashboard/attendance",
        icon: Clock,
      },
      {
        title: "Shift Kerja",
        href: "/dashboard/shifts",
        icon: Timer,
      },
      {
        title: "Lokasi & WiFi",
        href: "/dashboard/locations",
        icon: MapPin,
      },
    ],
  },
  {
    title: "Cuti & Dinas",
    href: "/dashboard/leaves",
    icon: Calendar,
    description: "Manajemen Cuti & Persetujuan",
  },
  {
    title: "Penggajian",
    href: "/dashboard/payroll",
    icon: Wallet,
    description: "Payroll & Komponen Gaji",
  },
  {
    title: "Dokumentasi Dev",
    icon: BookOpen,
    description: "Panduan Developer & Dokumentasi",
    submenu: [
      {
        title: "Index Docs",
        href: "/dashboard/docs",
        icon: BookOpen,
      },
      {
        title: "Developer Guide",
        href: "/dashboard/docs/dev-guide",
        icon: Code,
      },
      {
        title: "Create CRUD",
        href: "/dashboard/docs/create-crud",
        icon: FileText,
      },
      {
        title: "Search & Pagination",
        href: "/dashboard/docs/search-pagination",
        icon: FileText,
      },
      {
        title: "Migration Guide",
        href: "/dashboard/docs/migration",
        icon: GitBranch,
      },
    ],
  },
  {
    title: "Sistem",
    icon: Settings,
    description: "Pengaturan & Keamanan Sistem",
    submenu: [
      {
        title: "Role & Akses",
        href: "/dashboard/roles",
        icon: Shield,
      },
      {
        title: "Notifikasi",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        title: "Audit Log",
        href: "/dashboard/audit",
        icon: Shield,
      },
      {
        title: "Pengaturan",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({
  className,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const handleLinkClick = () => {
    // Close mobile menu when clicking a link
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop untuk mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r bg-gradient-to-b from-teal-50 via-cyan-50 to-lime-50 dark:from-teal-950/30 dark:via-cyan-950/20 dark:to-lime-950/20 transition-transform duration-300 ease-in-out lg:translate-x-0",
          !isOpen && "-translate-x-full",
          className
        )}
      >
        {/* Logo/Brand */}
        <div className="flex h-16 items-center justify-between border-b px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-lime-500 text-white shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
                HRIS Bharata
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Close button untuk mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const hasSubmenu = "submenu" in item && item.submenu;
              const isSubmenuOpen = openSubmenu === item.title;

              // Untuk item dengan href
              if (item.href) {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <li key={item.href || index}>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "text-gray-700 hover:bg-teal-50 hover:text-teal-900 dark:text-gray-300 dark:hover:bg-teal-900/20 dark:hover:text-teal-100"
                      )}
                      title={item.description}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          isActive
                            ? "text-white"
                            : "text-gray-500 group-hover:text-teal-600 dark:text-gray-400 dark:group-hover:text-teal-400"
                        )}
                      />
                      <span className="flex-1">{item.title}</span>
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-lime-300 animate-pulse" />
                      )}
                    </Link>
                  </li>
                );
              }

              // Untuk item dengan submenu
              if (hasSubmenu) {
                const submenu = item.submenu as Array<{
                  title: string;
                  href: string;
                  icon: typeof Icon;
                }>;
                const isAnySubmenuActive = submenu.some((sub) =>
                  pathname.startsWith(sub.href)
                );

                return (
                  <li key={item.title}>
                    <button
                      onClick={() =>
                        setOpenSubmenu(isSubmenuOpen ? null : item.title)
                      }
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isAnySubmenuActive
                          ? "bg-gradient-to-r from-teal-100 to-lime-100 text-teal-900 dark:from-teal-900/30 dark:to-lime-900/30 dark:text-teal-100"
                          : "text-gray-700 hover:bg-teal-50 hover:text-teal-900 dark:text-gray-300 dark:hover:bg-teal-900/20 dark:hover:text-teal-100"
                      )}
                      title={item.description}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          isAnySubmenuActive
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-gray-500 group-hover:text-teal-600 dark:text-gray-400 dark:group-hover:text-teal-400"
                        )}
                      />
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isSubmenuOpen && "rotate-180",
                          isAnySubmenuActive &&
                            "text-teal-600 dark:text-teal-400"
                        )}
                      />
                    </button>

                    {/* Submenu */}
                    {isSubmenuOpen && (
                      <ul className="ml-4 mt-1 space-y-1 border-l-2 border-teal-200 dark:border-teal-800 pl-2">
                        {submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = pathname === subItem.href;

                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                onClick={handleLinkClick}
                                className={cn(
                                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                                  isSubActive
                                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-teal-50 hover:text-teal-900 dark:text-gray-400 dark:hover:bg-teal-900/10 dark:hover:text-teal-100"
                                )}
                              >
                                <SubIcon className="h-4 w-4" />
                                <span>{subItem.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </nav>

        {/* Footer Info */}
        <div className="border-t p-4 space-y-3">
          {/* Theme Switcher for Mobile */}
          <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-teal-50 to-lime-50 p-2 dark:from-teal-900/20 dark:to-lime-900/20 border border-teal-200 dark:border-teal-800">
            <span className="text-xs font-medium text-teal-900 dark:text-teal-100">
              🎨 Tema
            </span>
            <ThemeSwitcher />
          </div>

          {/* Tips Section */}
          <div className="rounded-lg bg-gradient-to-r from-teal-50 to-lime-50 p-3 dark:from-teal-900/20 dark:to-lime-900/20 border border-teal-200 dark:border-teal-800">
            <p className="text-xs font-medium text-teal-900 dark:text-teal-100">
              💡 Tips
            </p>
            <p className="mt-1 text-xs text-teal-700 dark:text-teal-300">
              Gunakan sidebar untuk navigasi cepat antar modul.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
