/**
 * Shift Schedule Utilities
 *
 * Helper functions untuk mengelola jadwal shift karyawan.
 * Mendukung hybrid system: shift tetap (office) dan shift rolling (pabrik/security).
 *
 * Priority Logic:
 * 1. Cek employee_shift_schedules untuk tanggal tertentu (scheduled shift)
 * 2. Jika tidak ada, pakai employees.shift_id (default shift)
 */

import { createClient } from "@/lib/supabase/server";

export interface WorkShift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface EmployeeShift {
  shift_id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  is_scheduled: boolean; // true = dari schedule table, false = default shift
}

export interface ShiftSchedule {
  id: number;
  employee_id: number;
  shift_id: number;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  work_shifts?: WorkShift;
}

export interface DailyShift {
  date: string;
  shift_id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  is_scheduled: boolean;
  notes: string | null;
}

/**
 * Get shift karyawan untuk tanggal tertentu
 * Priority: scheduled shift > default shift
 *
 * @param employeeId - ID karyawan
 * @param date - Tanggal format 'YYYY-MM-DD'
 * @returns EmployeeShift atau null jika tidak ada shift
 */
export async function getEmployeeShiftOnDate(
  employeeId: number,
  date: string
): Promise<EmployeeShift | null> {
  const supabase = await createClient();

  // 1. Try to get scheduled shift first (PRIORITY 1)
  const { data: schedule } = await supabase
    .from("employee_shift_schedules")
    .select(
      `
      shift_id,
      work_shifts!inner (
        name,
        start_time,
        end_time
      )
    `
    )
    .eq("employee_id", employeeId)
    .eq("date", date)
    .is("deleted_at", null)
    .single();

  if (
    schedule &&
    schedule.work_shifts &&
    !Array.isArray(schedule.work_shifts)
  ) {
    const shift = schedule.work_shifts as unknown as WorkShift;
    return {
      shift_id: schedule.shift_id,
      shift_name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      is_scheduled: true, // ✅ Dari schedule table
    };
  }

  // 2. Fallback to default shift from employees table (PRIORITY 2)
  const { data: employee } = await supabase
    .from("employees")
    .select(
      `
      shift_id,
      work_shifts!inner (
        name,
        start_time,
        end_time
      )
    `
    )
    .eq("id", employeeId)
    .is("deleted_at", null)
    .single();

  if (
    employee &&
    employee.work_shifts &&
    !Array.isArray(employee.work_shifts)
  ) {
    const shift = employee.work_shifts as unknown as WorkShift;
    return {
      shift_id: employee.shift_id,
      shift_name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      is_scheduled: false, // ❌ Default shift
    };
  }

  return null;
}

/**
 * Get jadwal shift karyawan untuk range tanggal
 * Menggabungkan scheduled shifts dan default shift
 *
 * @param employeeId - ID karyawan
 * @param startDate - Tanggal mulai 'YYYY-MM-DD'
 * @param endDate - Tanggal akhir 'YYYY-MM-DD'
 * @returns Array of DailyShift
 */
export async function getEmployeeShiftSchedule(
  employeeId: number,
  startDate: string,
  endDate: string
): Promise<DailyShift[]> {
  const supabase = await createClient();

  // 1. Get all scheduled shifts dalam range
  const { data: schedules } = await supabase
    .from("employee_shift_schedules")
    .select(
      `
      *,
      work_shifts:shift_id (
        name,
        start_time,
        end_time
      )
    `
    )
    .eq("employee_id", employeeId)
    .gte("date", startDate)
    .lte("date", endDate)
    .is("deleted_at", null)
    .order("date", { ascending: true });

  // 2. Get default shift dari employees
  const { data: employee } = await supabase
    .from("employees")
    .select(
      `
      shift_id,
      work_shifts:shift_id (
        name,
        start_time,
        end_time
      )
    `
    )
    .eq("id", employeeId)
    .is("deleted_at", null)
    .single();

  // 3. Generate all dates dalam range
  const dates = generateDateRange(startDate, endDate);

  // 4. Map setiap tanggal dengan shift-nya
  return dates.map((date) => {
    // Cek apakah ada scheduled shift untuk tanggal ini
    const scheduled = schedules?.find((s) => s.date === date);

    if (
      scheduled &&
      scheduled.work_shifts &&
      !Array.isArray(scheduled.work_shifts)
    ) {
      const shift = scheduled.work_shifts as unknown as WorkShift;
      return {
        date,
        shift_id: scheduled.shift_id,
        shift_name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        is_scheduled: true,
        notes: scheduled.notes,
      };
    }

    // Fallback to default shift
    if (
      employee &&
      employee.work_shifts &&
      !Array.isArray(employee.work_shifts)
    ) {
      const shift = employee.work_shifts as unknown as WorkShift;
      return {
        date,
        shift_id: employee.shift_id,
        shift_name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        is_scheduled: false,
        notes: null,
      };
    }

    // No shift found (shouldn't happen if employee exists)
    return {
      date,
      shift_id: 0,
      shift_name: "No Shift",
      start_time: "00:00",
      end_time: "00:00",
      is_scheduled: false,
      notes: null,
    };
  });
}

/**
 * Get semua scheduled shifts untuk employee
 * (tidak termasuk default shift)
 *
 * @param employeeId - ID karyawan
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Array of ShiftSchedule
 */
export async function getScheduledShifts(
  employeeId: number,
  startDate?: string,
  endDate?: string
): Promise<ShiftSchedule[]> {
  const supabase = await createClient();

  let query = supabase
    .from("employee_shift_schedules")
    .select(
      `
      *,
      work_shifts:shift_id (
        id,
        name,
        start_time,
        end_time
      )
    `
    )
    .eq("employee_id", employeeId)
    .is("deleted_at", null)
    .order("date", { ascending: true });

  if (startDate) {
    query = query.gte("date", startDate);
  }

  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching scheduled shifts:", error);
    return [];
  }

  return data || [];
}

/**
 * Check apakah karyawan punya scheduled shift untuk tanggal tertentu
 *
 * @param employeeId - ID karyawan
 * @param date - Tanggal 'YYYY-MM-DD'
 * @returns true jika ada scheduled shift
 */
export async function hasScheduledShift(
  employeeId: number,
  date: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employee_shift_schedules")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("date", date)
    .is("deleted_at", null)
    .single();

  return !!data && !error;
}

/**
 * Generate array of dates between start and end date
 *
 * @param start - Start date 'YYYY-MM-DD'
 * @param end - End date 'YYYY-MM-DD'
 * @returns Array of date strings
 */
export function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Get Monday of the week for a given date
 *
 * @param date - Date object or string
 * @returns Monday date string 'YYYY-MM-DD'
 */
export function getMonday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

/**
 * Get week range (Monday to Sunday) for a given date
 *
 * @param date - Date object or string
 * @returns Object with start (Monday) and end (Sunday) dates
 */
export function getWeekRange(date: Date | string): {
  start: string;
  end: string;
} {
  const monday = getMonday(date);
  const sundayDate = new Date(monday);
  sundayDate.setDate(sundayDate.getDate() + 6);
  const sunday = sundayDate.toISOString().split("T")[0];

  return { start: monday, end: sunday };
}

/**
 * Format time string (HH:MM:SS) to HH:MM
 *
 * @param time - Time string
 * @returns Formatted time
 */
export function formatTime(time: string): string {
  if (!time) return "";
  return time.substring(0, 5); // Take only HH:MM
}

/**
 * Get shift badge color classes based on shift name
 *
 * @param shiftName - Name of the shift
 * @returns Tailwind CSS classes
 */
export function getShiftBadgeColor(shiftName: string): string {
  const name = shiftName.toLowerCase();

  if (name.includes("pagi") || name.includes("morning")) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
  }

  if (name.includes("siang") || name.includes("afternoon")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
  }

  if (name.includes("malam") || name.includes("night")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
  }

  // Default/Regular
  return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
}

/**
 * Get day name in Indonesian
 *
 * @param date - Date string 'YYYY-MM-DD'
 * @returns Indonesian day name
 */
export function getDayName(date: string): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const d = new Date(date);
  return days[d.getDay()];
}

/**
 * Format date to Indonesian format
 *
 * @param date - Date string 'YYYY-MM-DD'
 * @returns Formatted date like "20 Oktober 2025"
 */
export function formatDateIndonesian(date: string): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const d = new Date(date);
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}
