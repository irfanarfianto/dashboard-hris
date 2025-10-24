"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  shift_id: number | null;
  check_in: string;
  check_out: string | null;
  status: "Hadir" | "Terlambat" | "Izin" | "Cuti" | "Dinas";
  location_id: number;
  wifi_id: number | null;
  notes: string | null;
  is_late: boolean;
  late_minutes: number;
  overtime_hours: number;
  working_hours: number;
}

export interface OvertimeRecord {
  id: number;
  employee_id: number;
  attendance_id: number | null;
  overtime_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  multiplier: number;
  total_compensation: number | null;
  reason: string | null;
  status: "Pending" | "Approved" | "Rejected";
  approver_id: number | null;
  approved_at: string | null;
}

export interface AttendanceReport {
  id: number;
  company_id: number;
  report_type: "daily" | "weekly" | "monthly";
  report_date: string;
  start_date: string;
  end_date: string;
  total_employees: number;
  total_present: number;
  total_late: number;
  total_absent: number;
  total_leave: number;
  total_overtime_hours: number;
  report_data: Record<string, unknown>;
}

interface LocationValidation {
  isValid: boolean;
  location?: Record<string, unknown>;
  wifi?: Record<string, unknown>;
  distance?: number;
  message?: string;
}

// ============================================================================
// 1. GEOFENCING - Check-in/Check-out dengan validasi GPS & WiFi
// ============================================================================

/**
 * Validate if user is within allowed location (GPS + WiFi)
 */
export async function validateLocation(
  latitude: number,
  longitude: number,
  wifiSSID?: string,
  wifiMAC?: string
): Promise<{ success: boolean; data?: LocationValidation; error?: string }> {
  try {
    const supabase = await createClient();

    // Get all active locations
    const { data: locations, error: locError } = await supabase
      .from("locations")
      .select("*, location_wifi(*)")
      .is("deleted_at", null)
      .eq("location_wifi.deleted_at", null);

    if (locError) throw locError;

    // Check GPS distance for each location
    for (const location of locations || []) {
      const distance = calculateDistance(
        latitude,
        longitude,
        parseFloat(location.latitude),
        parseFloat(location.longitude)
      );

      // If within radius
      if (distance <= location.radius_meter) {
        // If WiFi info provided, validate WiFi too
        if (wifiSSID && location.location_wifi?.length > 0) {
          const wifiMatch = location.location_wifi.find(
            (w: { ssid_name: string; mac_address: string }) =>
              w.ssid_name === wifiSSID || (wifiMAC && w.mac_address === wifiMAC)
          );
          if (wifiMatch) {
            return {
              success: true,
              data: {
                isValid: true,
                location,
                wifi: wifiMatch,
                distance,
                message: "Valid location with WiFi verification",
              },
            };
          }
        } else {
          // GPS only validation
          return {
            success: true,
            data: {
              isValid: true,
              location,
              distance,
              message: "Valid location based on GPS",
            },
          };
        }
      }
    }

    return {
      success: true,
      data: {
        isValid: false,
        message: "You are not within any allowed location",
      },
    };
  } catch (error: any) {
    console.error("Error validating location:", error);
    return {
      success: false,
      error: error.message || "Failed to validate location",
    };
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check-in attendance
 */
export async function checkIn(
  employeeId: number,
  latitude: number,
  longitude: number,
  wifiSSID?: string,
  wifiMAC?: string,
  notes?: string
): Promise<{ success: boolean; data?: AttendanceRecord; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate location first
    const validation = await validateLocation(
      latitude,
      longitude,
      wifiSSID,
      wifiMAC
    );

    if (!validation.success || !validation.data?.isValid) {
      return {
        success: false,
        error: validation.data?.message || "Invalid location",
      };
    }

    // Check if already checked in today
    const today = new Date().toISOString().split("T")[0];
    const { data: existingAttendance } = await supabase
      .from("attendances")
      .select("*")
      .eq("employee_id", employeeId)
      .gte("check_in", `${today}T00:00:00`)
      .lte("check_in", `${today}T23:59:59`)
      .is("deleted_at", null)
      .single();

    if (existingAttendance) {
      return {
        success: false,
        error: "You have already checked in today",
      };
    }

    // Get employee's position to determine shift
    const { data: employee } = await supabase
      .from("employees")
      .select("position_id")
      .eq("id", employeeId)
      .single();

    // Get applicable shift for this position
    const { data: shift } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("position_id", employee?.position_id)
      .is("deleted_at", null)
      .order("start_time")
      .limit(1)
      .single();

    // Create attendance record
    const locationId = (validation.data.location as { id: number })?.id;
    const wifiId = validation.data.wifi
      ? (validation.data.wifi as { id: number }).id
      : null;

    const { data: attendance, error: attError } = await supabase
      .from("attendances")
      .insert({
        employee_id: employeeId,
        shift_id: shift?.id || null,
        check_in: new Date().toISOString(),
        status: "Hadir", // Will be updated by trigger if late
        location_id: locationId,
        wifi_id: wifiId,
        notes: notes || null,
      })
      .select()
      .single();

    if (attError) throw attError;

    revalidatePath("/dashboard/attendance");

    return {
      success: true,
      data: attendance as AttendanceRecord,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to check in";
    console.error("Error checking in:", error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check-out attendance
 */
export async function checkOut(
  attendanceId: number,
  latitude: number,
  longitude: number,
  notes?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate location
    const validation = await validateLocation(latitude, longitude);

    if (!validation.success || !validation.data?.isValid) {
      return {
        success: false,
        error: validation.data?.message || "Invalid location",
      };
    }

    // Update attendance with check-out time
    const { data: attendance, error: attError } = await supabase
      .from("attendances")
      .update({
        check_out: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", attendanceId)
      .select()
      .single();

    if (attError) throw attError;

    // Calculate working hours
    if (attendance) {
      const checkIn = new Date(attendance.check_in);
      const checkOut = new Date(attendance.check_out);
      const workingHours =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      await supabase
        .from("attendances")
        .update({ working_hours: workingHours })
        .eq("id", attendanceId);
    }

    revalidatePath("/dashboard/attendance");

    return {
      success: true,
      data: attendance,
    };
  } catch (error: any) {
    console.error("Error checking out:", error);
    return {
      success: false,
      error: error.message || "Failed to check out",
    };
  }
}

// ============================================================================
// 2. REAL-TIME TRACKING - Get current attendance status
// ============================================================================

/**
 * Get today's attendance for all employees (real-time)
 */
export async function getTodayAttendance(companyId: number): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("attendances")
      .select(
        `
        *,
        employees!inner(
          id,
          full_name,
          email,
          phone_number,
          company_id,
          department:departments(id, name),
          position:positions(id, name)
        ),
        location:locations(id, name),
        wifi:location_wifi(id, ssid_name),
        shift:work_shifts(id, name, start_time, end_time)
      `
      )
      .eq("employees.company_id", companyId)
      .gte("check_in", `${today}T00:00:00`)
      .lte("check_in", `${today}T23:59:59`)
      .is("deleted_at", null)
      .order("check_in", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Error getting today attendance:", error);
    return {
      success: false,
      error: error.message || "Failed to get today's attendance",
    };
  }
}

/**
 * Get employee's attendance status today
 */
export async function getMyAttendanceToday(employeeId: number): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("attendances")
      .select(
        `
        *,
        location:locations(id, name, latitude, longitude),
        wifi:location_wifi(id, ssid_name),
        shift:work_shifts(id, name, start_time, end_time)
      `
      )
      .eq("employee_id", employeeId)
      .gte("check_in", `${today}T00:00:00`)
      .lte("check_in", `${today}T23:59:59`)
      .is("deleted_at", null)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return {
      success: true,
      data: data || null,
    };
  } catch (error: any) {
    console.error("Error getting my attendance:", error);
    return {
      success: false,
      error: error.message || "Failed to get attendance",
    };
  }
}

// ============================================================================
// 3. ATTENDANCE REPORTS - Generate and export reports
// ============================================================================

/**
 * Generate attendance report
 */
export async function generateAttendanceReport(
  companyId: number,
  reportType: "daily" | "weekly" | "monthly",
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: AttendanceReport; error?: string }> {
  try {
    const supabase = await createClient();

    // Get all attendances in date range
    const { data: attendances, error: attError } = await supabase
      .from("attendances")
      .select(
        `
        *,
        employee:employees!inner(
          id,
          full_name,
          company_id,
          department:departments(name),
          position:positions(name)
        )
      `
      )
      .eq("employee.company_id", companyId)
      .gte("check_in", `${startDate}T00:00:00`)
      .lte("check_in", `${endDate}T23:59:59`)
      .is("deleted_at", null);

    if (attError) throw attError;

    // Get total employees
    const { count: totalEmployees } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "Active")
      .is("deleted_at", null);

    // Calculate statistics
    const stats = {
      total_present:
        attendances?.filter((a) => a.status === "Hadir").length || 0,
      total_late:
        attendances?.filter((a) => a.status === "Terlambat").length || 0,
      total_leave: attendances?.filter((a) => a.status === "Cuti").length || 0,
      total_absent: (totalEmployees || 0) - (attendances?.length || 0),
      total_overtime_hours:
        attendances?.reduce((sum, a) => sum + (a.overtime_hours || 0), 0) || 0,
    };

    // Group by employee for detailed data
    const employeeData = attendances?.reduce((acc: any, att: any) => {
      const empId = att.employee_id;
      if (!acc[empId]) {
        acc[empId] = {
          employee_id: empId,
          full_name: att.employee?.full_name,
          department: att.employee?.department?.name,
          position: att.employee?.position?.name,
          attendances: [],
          total_days: 0,
          late_count: 0,
          total_overtime: 0,
        };
      }

      acc[empId].attendances.push({
        date: att.check_in,
        check_in: att.check_in,
        check_out: att.check_out,
        status: att.status,
        is_late: att.is_late,
        late_minutes: att.late_minutes,
        overtime_hours: att.overtime_hours,
        working_hours: att.working_hours,
      });

      acc[empId].total_days++;
      if (att.is_late) acc[empId].late_count++;
      acc[empId].total_overtime += att.overtime_hours || 0;

      return acc;
    }, {});

    const reportData = {
      summary: stats,
      employees: Object.values(employeeData || {}),
      period: { start_date: startDate, end_date: endDate },
      generated_at: new Date().toISOString(),
    };

    // Save report
    const { data: report, error: repError } = await supabase
      .from("attendance_reports")
      .insert({
        company_id: companyId,
        report_type: reportType,
        report_date: startDate,
        start_date: startDate,
        end_date: endDate,
        total_employees: totalEmployees || 0,
        total_present: stats.total_present,
        total_late: stats.total_late,
        total_absent: stats.total_absent,
        total_leave: stats.total_leave,
        total_overtime_hours: stats.total_overtime_hours,
        report_data: reportData,
      })
      .select()
      .single();

    if (repError) throw repError;

    return {
      success: true,
      data: report,
    };
  } catch (error: any) {
    console.error("Error generating report:", error);
    return {
      success: false,
      error: error.message || "Failed to generate report",
    };
  }
}

/**
 * Get attendance reports
 */
export async function getAttendanceReports(
  companyId: number,
  reportType?: "daily" | "weekly" | "monthly",
  limit: number = 10
): Promise<{ success: boolean; data?: AttendanceReport[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("attendance_reports")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("report_date", { ascending: false })
      .limit(limit);

    if (reportType) {
      query = query.eq("report_type", reportType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Error getting reports:", error);
    return {
      success: false,
      error: error.message || "Failed to get reports",
    };
  }
}

// ============================================================================
// 4. OVERTIME TRACKING - Manage overtime records
// ============================================================================

/**
 * Get overtime records
 */
export async function getOvertimeRecords(
  employeeId?: number,
  status?: "Pending" | "Approved" | "Rejected",
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data?: OvertimeRecord[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("overtime_records")
      .select(
        `
        *,
        employee:employees(id, full_name, email),
        approver:employees(id, full_name)
      `
      )
      .is("deleted_at", null)
      .order("overtime_date", { ascending: false });

    if (employeeId) {
      query = query.eq("employee_id", employeeId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("overtime_date", startDate);
    }

    if (endDate) {
      query = query.lte("overtime_date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Error getting overtime records:", error);
    return {
      success: false,
      error: error.message || "Failed to get overtime records",
    };
  }
}

/**
 * Approve/Reject overtime
 */
export async function approveOvertime(
  overtimeId: number,
  approverId: number,
  status: "Approved" | "Rejected",
  notes?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("overtime_records")
      .update({
        status,
        approver_id: approverId,
        approved_at: new Date().toISOString(),
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", overtimeId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/attendance");
    revalidatePath("/dashboard/overtime");

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error approving overtime:", error);
    return {
      success: false,
      error: error.message || "Failed to approve overtime",
    };
  }
}

/**
 * Get overtime summary for employee
 */
export async function getOvertimeSummary(
  employeeId: number,
  month: string // Format: YYYY-MM
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createClient();

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { data, error } = await supabase
      .from("overtime_records")
      .select("*")
      .eq("employee_id", employeeId)
      .gte("overtime_date", startDate)
      .lte("overtime_date", endDate)
      .is("deleted_at", null);

    if (error) throw error;

    const summary = {
      total_overtime_hours:
        data?.reduce((sum, r) => sum + r.duration_hours, 0) || 0,
      total_compensation:
        data?.reduce((sum, r) => sum + (r.total_compensation || 0), 0) || 0,
      pending_count: data?.filter((r) => r.status === "Pending").length || 0,
      approved_count: data?.filter((r) => r.status === "Approved").length || 0,
      rejected_count: data?.filter((r) => r.status === "Rejected").length || 0,
      records: data || [],
    };

    return {
      success: true,
      data: summary,
    };
  } catch (error: any) {
    console.error("Error getting overtime summary:", error);
    return {
      success: false,
      error: error.message || "Failed to get overtime summary",
    };
  }
}
