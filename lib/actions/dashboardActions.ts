"use server";

import { createClient } from "@/lib/supabase/server";

// Get total employees count
export async function getTotalEmployees() {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (error) {
      console.error("Error fetching total employees:", error);
      return { data: 0, previousMonth: 0 };
    }

    // Get previous month count
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const { count: previousCount } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .lte("created_at", lastMonth.toISOString());

    const currentCount = count || 0;
    const prevCount = previousCount || 0;
    const difference = currentCount - prevCount;

    return {
      data: currentCount,
      previousMonth: difference,
    };
  } catch (error) {
    console.error("Unexpected error in getTotalEmployees:", error);
    return { data: 0, previousMonth: 0 };
  }
}

// Get today's attendance statistics
export async function getTodayAttendance() {
  const supabase = await createClient();

  try {
    // Get total active employees
    const { count: totalEmployees } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    // Get today's attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const { count: attendedCount } = await supabase
      .from("attendances")
      .select("*", { count: "exact", head: true })
      .gte("check_in", todayStr)
      .lt("check_in", `${todayStr}T23:59:59`);

    const total = totalEmployees || 0;
    const attended = attendedCount || 0;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      data: attended,
      total: total,
      percentage: percentage,
    };
  } catch (error) {
    console.error("Unexpected error in getTodayAttendance:", error);
    return { data: 0, total: 0, percentage: 0 };
  }
}

// Get pending leave requests
export async function getPendingLeaveRequests() {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("leave_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching pending leave requests:", error);
      return { data: 0 };
    }

    return { data: count || 0 };
  } catch (error) {
    console.error("Unexpected error in getPendingLeaveRequests:", error);
    return { data: 0 };
  }
}

// Get total payroll for current month
export async function getCurrentMonthPayroll() {
  const supabase = await createClient();

  try {
    // Get all active employees with their salary
    const { data: employees, error } = await supabase
      .from("employees")
      .select("salary_base")
      .is("deleted_at", null)
      .not("salary_base", "is", null);

    if (error) {
      console.error("Error fetching payroll data:", error);
      return { data: 0 };
    }

    // Calculate total payroll
    const totalPayroll =
      employees?.reduce((sum, emp) => sum + (emp.salary_base || 0), 0) || 0;

    return { data: totalPayroll };
  } catch (error) {
    console.error("Unexpected error in getCurrentMonthPayroll:", error);
    return { data: 0 };
  }
}

// Get recent activities (simplified - you can expand this based on your needs)
export async function getRecentActivities(limit: number = 5) {
  const supabase = await createClient();

  try {
    // Get recent employee additions
    const { data: recentEmployees } = await supabase
      .from("employees")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    const activities =
      recentEmployees?.map((emp) => ({
        id: emp.id,
        user: emp.full_name,
        action: "bergabung sebagai karyawan baru",
        time: getRelativeTime(new Date(emp.created_at)),
        timestamp: emp.created_at,
      })) || [];

    return { data: activities };
  } catch (error) {
    console.error("Unexpected error in getRecentActivities:", error);
    return { data: [] };
  }
}

// Get dashboard statistics by department
export async function getDepartmentStats() {
  const supabase = await createClient();

  try {
    const { data: employees } = await supabase
      .from("employees")
      .select("id, department_id, departments:department_id (id, name)")
      .is("deleted_at", null);

    // Count employees by department
    const departmentCounts: Record<string, number> = {};
    employees?.forEach((emp) => {
      const departments = emp.departments as
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null;

      // Handle both single object and array responses
      const deptName = Array.isArray(departments)
        ? departments[0]?.name || "Tidak ada departemen"
        : departments?.name || "Tidak ada departemen";

      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
    });

    const stats = Object.entries(departmentCounts).map(([name, count]) => ({
      name,
      count,
    }));

    return { data: stats };
  } catch (error) {
    console.error("Unexpected error in getDepartmentStats:", error);
    return { data: [] };
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
}
