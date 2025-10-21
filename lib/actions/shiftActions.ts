"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get all work shifts with position info
 */
export async function getWorkShifts() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("work_shifts")
      .select(
        `
        *,
        positions:position_id (
          id,
          name,
          departments:department_id (
            id,
            name
          )
        )
      `
      )
      .is("deleted_at", null)
      .order("position_id", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching work shifts:", error);
      return {
        success: false,
        error: error.message || "Gagal mengambil data shift",
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in getWorkShifts:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Get shifts by position
 */
export async function getShiftsByPosition(positionId: number) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("work_shifts")
      .select("*")
      .eq("position_id", positionId)
      .is("deleted_at", null)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching shifts by position:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in getShiftsByPosition:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Upsert Work Shift (Insert/Update)
 */
export async function upsertWorkShift(formData: FormData) {
  const supabase = await createClient();

  try {
    const id = formData.get("id")?.toString();
    const position_id = parseInt(
      formData.get("position_id")?.toString() || "0"
    );
    const name = formData.get("name")?.toString()?.trim();
    const start_time = formData.get("start_time")?.toString();
    const end_time = formData.get("end_time")?.toString();
    const duration_hours = parseFloat(
      formData.get("duration_hours")?.toString() || "0"
    );
    const is_regular = formData.get("is_regular") === "true";
    const tolerance_minutes = parseInt(
      formData.get("tolerance_minutes")?.toString() || "5"
    );

    // Validation
    if (!position_id || position_id === 0) {
      return {
        success: false,
        error: "Posisi wajib dipilih",
      };
    }

    if (!name || name === "") {
      return {
        success: false,
        error: "Nama shift wajib diisi",
      };
    }

    if (!start_time) {
      return {
        success: false,
        error: "Waktu mulai wajib diisi",
      };
    }

    if (!end_time) {
      return {
        success: false,
        error: "Waktu selesai wajib diisi",
      };
    }

    if (duration_hours <= 0) {
      return {
        success: false,
        error: "Durasi kerja harus lebih dari 0 jam",
      };
    }

    if (tolerance_minutes < 0) {
      return {
        success: false,
        error: "Toleransi tidak boleh negatif",
      };
    }

    // Check for duplicate name in same position (only for insert or different id)
    const { data: existingShift } = await supabase
      .from("work_shifts")
      .select("id")
      .eq("position_id", position_id)
      .eq("name", name)
      .is("deleted_at", null)
      .single();

    if (existingShift && (!id || existingShift.id !== parseInt(id))) {
      return {
        success: false,
        error: `Shift dengan nama "${name}" sudah ada di posisi ini`,
      };
    }

    const shiftData = {
      position_id,
      name,
      start_time,
      end_time,
      duration_hours,
      is_regular,
      tolerance_minutes,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      // Update
      const { error } = await supabase
        .from("work_shifts")
        .update(shiftData)
        .eq("id", id);

      if (error) {
        console.error("Error updating shift:", error);
        return {
          success: false,
          error: error.message || "Gagal mengupdate shift",
        };
      }
    } else {
      // Insert
      const { error } = await supabase.from("work_shifts").insert({
        ...shiftData,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creating shift:", error);
        return {
          success: false,
          error: error.message || "Gagal membuat shift",
        };
      }
    }

    revalidatePath("/dashboard/shifts");

    return {
      success: true,
      message: id ? "Shift berhasil diupdate" : "Shift berhasil dibuat",
    };
  } catch (error) {
    console.error("Error in upsertWorkShift:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Soft delete work shift
 */
export async function deleteWorkShift(shiftId: number) {
  const supabase = await createClient();

  try {
    // Check if shift is being used by any employee schedules or attendance
    const { data: usageCheck } = await supabase
      .from("attendances")
      .select("id")
      .eq("shift_id", shiftId)
      .limit(1);

    if (usageCheck && usageCheck.length > 0) {
      return {
        success: false,
        error:
          "Shift ini sedang digunakan dalam data absensi dan tidak dapat dihapus",
      };
    }

    // Soft delete
    const { error } = await supabase
      .from("work_shifts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", shiftId);

    if (error) {
      console.error("Error deleting shift:", error);
      return {
        success: false,
        error: error.message || "Gagal menghapus shift",
      };
    }

    revalidatePath("/dashboard/shifts");

    return {
      success: true,
      message: "Shift berhasil dihapus",
    };
  } catch (error) {
    console.error("Error in deleteWorkShift:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Bulk create work shift for multiple positions
 */
export async function bulkCreateWorkShift(formData: FormData) {
  const supabase = await createClient();

  try {
    const position_ids =
      formData
        .get("position_ids")
        ?.toString()
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id)) || [];
    const name = formData.get("name")?.toString()?.trim();
    const start_time = formData.get("start_time")?.toString();
    const end_time = formData.get("end_time")?.toString();
    const duration_hours = parseFloat(
      formData.get("duration_hours")?.toString() || "0"
    );
    const is_regular = formData.get("is_regular") === "true";
    const tolerance_minutes = parseInt(
      formData.get("tolerance_minutes")?.toString() || "5"
    );

    // Validation
    if (!position_ids || position_ids.length === 0) {
      return {
        success: false,
        error: "Minimal pilih 1 posisi",
      };
    }

    if (!name || name === "") {
      return {
        success: false,
        error: "Nama shift wajib diisi",
      };
    }

    if (!start_time || !end_time) {
      return {
        success: false,
        error: "Waktu mulai dan selesai wajib diisi",
      };
    }

    if (duration_hours <= 0) {
      return {
        success: false,
        error: "Durasi kerja harus lebih dari 0 jam",
      };
    }

    // Check for duplicate names in selected positions
    const { data: existingShifts } = await supabase
      .from("work_shifts")
      .select("position_id, name")
      .in("position_id", position_ids)
      .eq("name", name)
      .is("deleted_at", null);

    if (existingShifts && existingShifts.length > 0) {
      const duplicateCount = existingShifts.length;
      return {
        success: false,
        error: `Shift "${name}" sudah ada di ${duplicateCount} posisi yang dipilih. Silakan hapus posisi tersebut atau gunakan nama shift yang berbeda.`,
      };
    }

    // Prepare bulk insert data
    const shiftsToInsert = position_ids.map((position_id) => ({
      position_id,
      name,
      start_time,
      end_time,
      duration_hours,
      is_regular,
      tolerance_minutes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Bulk insert
    const { error } = await supabase.from("work_shifts").insert(shiftsToInsert);

    if (error) {
      console.error("Error bulk creating shifts:", error);
      return {
        success: false,
        error: error.message || "Gagal membuat shift",
      };
    }

    revalidatePath("/dashboard/shifts");

    return {
      success: true,
      message: `Shift berhasil dibuat untuk ${position_ids.length} posisi`,
    };
  } catch (error) {
    console.error("Error in bulkCreateWorkShift:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Get all positions for dropdown
 */
export async function getPositions() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("positions")
      .select(
        `
        id, 
        name,
        departments:department_id (
          id,
          name
        )
      `
      )
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching positions:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in getPositions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}
