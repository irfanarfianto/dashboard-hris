"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { PermissionProvider } from "@/components/providers/PermissionProvider";

export default function DashboardLayoutClient({
  children,
  userEmail,
  userName,
  userRole,
  userPermissions = [],
}: {
  children: React.ReactNode;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  userPermissions?: string[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <PermissionProvider permissions={userPermissions}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Sidebar with role */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={userRole}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader
            userEmail={userEmail}
            userName={userName}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}
