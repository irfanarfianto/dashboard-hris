"use server";

/**
 * Server Actions for Shift Schedule Management
 *
 * CRUD operations untuk employee_shift_schedules table.
 * Mendukung single date, multiple dates, dan weekly schedule input.
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==============================================================================
// Types
// ==============================================================================

export interface ShiftScheduleInput {
  employee_id: number;
  shift_id: number;
  date: string;
  notes?: string;
}

export interface WeeklyScheduleInput {
  employee_id: number;
  week_start: string; // Monday YYYY-MM-DD
  shifts: {
    monday?: number;
    tuesday?: number;
    wednesday?: number;
    thursday?: number;
    friday?: number;
    saturday?: number;
    sunday?: number;
  };
  notes?: string;
}

// ==============================================================================
// Helper Functions
// ==============================================================================

/**
 * Get current user from session
 */
async function getCurrentUserId(): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  return userData?.id || null;
}

// ==============================================================================
// CREATE Operations
// ==============================================================================

/**
 * Create single shift schedule
 */
export async function createShiftSchedule(input: ShiftScheduleInput) {
  try {
    const supabase = await createClient();
    const currentUserId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("employee_shift_schedules")
      .insert({
        employee_id: input.employee_id,
        shift_id: input.shift_id,
        date: input.date,
        notes: input.notes || null,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating shift schedule:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/shift-schedules");
    revalidatePath("/dashboard/employees");
    return { success: true, data, message: "Jadwal shift berhasil dibuat" };
  } catch (error) {
    console.error("Error creating shift schedule:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

/**
 * Create multiple shift schedules (bulk insert)
 * Useful untuk input jadwal beberapa hari sekaligus
 */
export async function createBulkShiftSchedules(inputs: ShiftScheduleInput[]) {
  try {
    const supabase = await createClient();
    const currentUserId = await getCurrentUserId();

    const schedules = inputs.map((input) => ({
      employee_id: input.employee_id,
      shift_id: input.shift_id,
      date: input.date,
      notes: input.notes || null,
      created_by: currentUserId,
    }));

    // Use upsert untuk handle duplicate dates (update instead of insert)
    const { data, error } = await supabase
      .from("employee_shift_schedules")
      .upsert(schedules, {
        onConflict: "employee_id,date",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Error creating bulk shift schedules:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/shift-schedules");
    revalidatePath("/dashboard/employees");
    return {
      success: true,
      data,
      message: `${data.length} jadwal shift berhasil dibuat`,
    };
  } catch (error) {
    console.error("Error creating bulk shift schedules:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

/**
 * Create weekly schedule (Senin-Minggu)
 * Helper untuk input jadwal shift per minggu
 */
export async function createWeeklySchedule(input: WeeklyScheduleInput) {
  try {
    const schedules: ShiftScheduleInput[] = [];
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;

    // Generate schedules untuk setiap hari yang diisi
    days.forEach((day, index) => {
      const shiftId = input.shifts[day];
      if (shiftId) {
        const date = new Date(input.week_start);
        date.setDate(date.getDate() + index);

        schedules.push({
          employee_id: input.employee_id,
          shift_id: shiftId,
          date: date.toISOString().split("T")[0],
          notes: input.notes,
        });
      }
    });

    if (schedules.length === 0) {
      return {
        success: false,
        error: "Tidak ada jadwal shift yang diinput",
      };
    }

    // Use bulk create
    return await createBulkShiftSchedules(schedules);
  } catch (error) {
    console.error("Error creating weekly schedule:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ==============================================================================
// READ Operations
// ==============================================================================

/**
 * Get all shift schedules dengan filter
 */
export async function getShiftSchedules(params?: {
  employee_id?: number;
  shift_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("employee_shift_schedules")
      .select(
        `
        *,
        employees!inner (
          id,
          full_name,
          employee_number
        ),
        work_shifts!inner (
          id,
          name,
          start_time,
          end_time
        )
      `
      )
      .is("deleted_at", null)
      .order("date", { ascending: true });

    if (params?.employee_id) {
      query = query.eq("employee_id", params.employee_id);
    }

    if (params?.shift_id) {
      query = query.eq("shift_id", params.shift_id);
    }

    if (params?.start_date) {
      query = query.gte("date", params.start_date);
    }

    if (params?.end_date) {
      query = query.lte("date", params.end_date);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching shift schedules:", error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching shift schedules:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga",
      data: [],
    };
  }
}

/**
 * Get shift schedule by ID
 */
export async function getShiftScheduleById(id: number) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("employee_shift_schedules")
      .select(
        `
        *,
        employees!inner (
          id,
          full_name,
          employee_number
        ),
        work_shifts!inner (
          id,
          name,
          start_time,
          end_time
        )
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Error fetching shift schedule:", error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching shift schedule:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga",
      data: null,
    };
  }
}

// ==============================================================================
// UPDATE Operations
// ==============================================================================

/**
 * Update shift schedule
 */
export async function updateShiftSchedule(
  id: number,
  input: {
    shift_id?: number;
    date?: string;
    notes?: string;
  }
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("employee_shift_schedules")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      console.error("Error updating shift schedule:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/shift-schedules");
    revalidatePath("/dashboard/employees");
    return { success: true, data, message: "Jadwal shift berhasil diupdate" };
  } catch (error) {
    console.error("Error updating shift schedule:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ==============================================================================
// DELETE Operations
// ==============================================================================

/**
 * Delete shift schedule (soft delete)
 */
export async function deleteShiftSchedule(id: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("employee_shift_schedules")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error deleting shift schedule:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/shift-schedules");
    revalidatePath("/dashboard/employees");
    return { success: true, message: "Jadwal shift berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting shift schedule:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

/**
 * Delete multiple shift schedules
 * Useful untuk hapus jadwal seminggu sekaligus
 */
export async function deleteBulkShiftSchedules(ids: number[]) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("employee_shift_schedules")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      console.error("Error deleting bulk shift schedules:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/shift-schedules");
    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: `${ids.length} jadwal shift berhasil dihapus`,
    };
  } catch (error) {
    console.error("Error deleting bulk shift schedules:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

/**
 * Delete all schedules for employee in date range
 */
export async function deleteEmployeeSchedulesInRange(
  employeeId: number,
  startDate: string,
  endDate: string
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("employee_shift_schedules")
      .update({ deleted_at: new Date().toISOString() })
      .eq("employee_id", employeeId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      console.error("Error deleting employee schedules:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/shift-schedules");
    revalidatePath("/dashboard/employees");
    return {
      success: true,
      message: "Jadwal shift berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting employee schedules:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ==============================================================================
// Utility Functions
// ==============================================================================

/**
 * Copy schedule from one week to another
 */
export async function copyWeeklySchedule(
  employeeId: number,
  sourceWeekStart: string,
  targetWeekStart: string
) {
  try {
    const supabase = await createClient();

    // Get source week schedules (Senin-Minggu)
    const sourceWeekEnd = new Date(sourceWeekStart);
    sourceWeekEnd.setDate(sourceWeekEnd.getDate() + 6);

    const { data: sourceSchedules, error: fetchError } = await supabase
      .from("employee_shift_schedules")
      .select("*")
      .eq("employee_id", employeeId)
      .gte("date", sourceWeekStart)
      .lte("date", sourceWeekEnd.toISOString().split("T")[0])
      .is("deleted_at", null)
      .order("date", { ascending: true });

    if (fetchError) {
      console.error("Error fetching source schedules:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!sourceSchedules || sourceSchedules.length === 0) {
      return {
        success: false,
        error: "Tidak ada jadwal shift pada minggu sumber",
      };
    }

    // Create new schedules for target week
    const currentUserId = await getCurrentUserId();
    const newSchedules = sourceSchedules.map((schedule) => {
      const sourceDate = new Date(schedule.date);
      const dayOfWeek = sourceDate.getDay();
      const targetDate = new Date(targetWeekStart);
      targetDate.setDate(
        targetDate.getDate() + (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      );

      return {
        employee_id: employeeId,
        shift_id: schedule.shift_id,
        date: targetDate.toISOString().split("T")[0],
        notes: schedule.notes,
        created_by: currentUserId,
      };
    });

    // Upsert to target week
    const { data, error } = await supabase
      .from("employee_shift_schedules")
      .upsert(newSchedules, {
        onConflict: "employee_id,date",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error("Error copying schedules:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/shift-schedules");
    return {
      success: true,
      data,
      message: `${data.length} jadwal shift berhasil disalin`,
    };
  } catch (error) {
    console.error("Error copying weekly schedule:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}
