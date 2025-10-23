"use server";

import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// ============================================================================
// USER PASSWORD ACTIONS
// ============================================================================

/**
 * Check if user needs to change password (by auth_user_id)
 * Uses auth_user_id from Supabase Auth to query users table directly
 */
export async function checkPasswordChanged(authUserId: string) {
  const supabase = await createClient();

  try {
    // Query users table by auth_user_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_password_changed, id")
      .eq("auth_user_id", authUserId)
      .is("deleted_at", null)
      .maybeSingle();

    if (userError) {
      console.error("Error finding user:", userError);
      return {
        needsChange: false,
        error: "Error finding user",
      };
    }

    if (!user) {
      console.log("User not found for auth_user_id:", authUserId);
      // No user record = likely not set up yet, skip password change dialog
      return {
        needsChange: false,
        error: "User not found",
      };
    }

    return {
      needsChange: user.is_password_changed === false,
      is_password_changed: user.is_password_changed,
      userId: user.id, // Return user id for later use
    };
  } catch (error) {
    console.error("Unexpected error in checkPasswordChanged:", error);
    return {
      needsChange: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

// ============================================================================
// USER DEVICE ACTIONS
// ============================================================================
// USER DEVICE ACTIONS
// ============================================================================

/**
 * Register a new device for user
 */
export async function registerUserDevice(
  userId: string,
  deviceId: string,
  deviceName: string
) {
  const supabase = await createClient();

  try {
    // Check if device already exists
    const { data: existing } = await supabase
      .from("user_devices")
      .select("id")
      .eq("device_id", deviceId)
      .is("deleted_at", null)
      .single();

    if (existing) {
      return {
        success: false,
        error: "Device sudah terdaftar",
      };
    }

    // Insert new device
    const { error } = await supabase.from("user_devices").insert({
      user_id: userId,
      device_id: deviceId,
      device_name: deviceName,
      last_login: new Date().toISOString(),
      is_active: true,
    });

    if (error) {
      console.error("Error registering device:", error);
      return {
        success: false,
        error: "Gagal mendaftarkan device",
      };
    }

    revalidatePath("/dashboard/security");

    return {
      success: true,
      message: "Device berhasil didaftarkan",
    };
  } catch (error) {
    console.error("Unexpected error in registerUserDevice:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Check if device is registered and active
 */
export async function checkDeviceStatus(userId: string, deviceId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_devices")
      .select("id, is_active, device_name, last_login")
      .eq("user_id", userId)
      .eq("device_id", deviceId)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return {
        registered: false,
        active: false,
      };
    }

    return {
      registered: true,
      active: data.is_active,
      deviceName: data.device_name,
      lastLogin: data.last_login,
      deviceDbId: data.id,
    };
  } catch (error) {
    console.error("Unexpected error in checkDeviceStatus:", error);
    return {
      registered: false,
      active: false,
    };
  }
}

/**
 * Update device last login timestamp
 */
export async function updateDeviceLastLogin(deviceId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("user_devices")
      .update({ last_login: new Date().toISOString() })
      .eq("device_id", deviceId);

    if (error) {
      console.error("Error updating device last login:", error);
    }
  } catch (error) {
    console.error("Unexpected error in updateDeviceLastLogin:", error);
  }
}

/**
 * Get all devices for a user
 */
export async function getUserDevices(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_devices")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("last_login", { ascending: false });

    if (error) {
      console.error("Error getting user devices:", error);
      return { data: [] };
    }

    return { data: data || [] };
  } catch (error) {
    console.error("Unexpected error in getUserDevices:", error);
    return { data: [] };
  }
}

/**
 * Remove/deactivate a device
 */
export async function removeUserDevice(deviceDbId: number, userId: string) {
  const supabase = await createClient();

  try {
    // Soft delete the device
    const { error } = await supabase
      .from("user_devices")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", deviceDbId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing device:", error);
      return {
        success: false,
        error: "Gagal menghapus device",
      };
    }

    revalidatePath("/dashboard/security");

    return {
      success: true,
      message: "Device berhasil dihapus",
    };
  } catch (error) {
    console.error("Unexpected error in removeUserDevice:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Block a device by database ID (Admin only)
 */
export async function blockDevice(deviceDbId: number) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("user_devices")
      .update({ is_active: false })
      .eq("id", deviceDbId);

    if (error) {
      console.error("Error blocking device:", error);
      return {
        success: false,
        error: "Gagal memblokir device",
      };
    }

    revalidatePath("/dashboard/security");

    return {
      success: true,
      message: "Device berhasil diblokir",
    };
  } catch (error) {
    console.error("Unexpected error in blockDevice:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Block a device by device_id (fingerprint)
 */
export async function blockDeviceByDeviceId(deviceId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("user_devices")
      .update({ is_active: false })
      .eq("device_id", deviceId)
      .is("deleted_at", null);

    if (error) {
      console.error("Error blocking device:", error);
      return {
        success: false,
        error: "Gagal memblokir device",
      };
    }

    return {
      success: true,
      message: "Device berhasil diblokir",
    };
  } catch (error) {
    console.error("Unexpected error in blockDeviceByDeviceId:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

// ============================================================================
// USER PIN ACTIONS
// ============================================================================

/**
 * Check if user has an active PIN
 */
export async function checkUserHasPin(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_pins")
      .select("id, pin_code, expired_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        hasPin: false,
        isExpired: false,
      };
    }

    // Check if PIN is expired
    const isExpired = data.expired_at
      ? new Date(data.expired_at) < new Date()
      : false;

    return {
      hasPin: true,
      isExpired,
      pinId: data.id,
    };
  } catch (error) {
    console.error("Unexpected error in checkUserHasPin:", error);
    return {
      hasPin: false,
      isExpired: false,
    };
  }
}

/**
 * Create a new PIN for user
 */
export async function createUserPin(userId: string, pinCode: string) {
  const supabase = await createClient();

  try {
    // Validate PIN format (6 digits)
    if (!/^\d{6}$/.test(pinCode)) {
      return {
        success: false,
        error: "PIN harus 6 digit angka",
      };
    }

    // Check for weak PINs
    if (
      pinCode === "123456" ||
      pinCode === "000000" ||
      pinCode === "111111" ||
      /^(\d)\1{5}$/.test(pinCode)
    ) {
      return {
        success: false,
        error: "PIN terlalu lemah. Gunakan kombinasi yang lebih aman",
      };
    }

    // Hash the PIN
    const pinHash = await bcrypt.hash(pinCode, 10);

    // Set expiry date (90 days from now)
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 90);

    // Insert new PIN
    const { error } = await supabase.from("user_pins").insert({
      user_id: userId,
      pin_code: pinHash,
      expired_at: expiredAt.toISOString(),
    });

    if (error) {
      console.error("Error creating PIN:", error);
      return {
        success: false,
        error: "Gagal membuat PIN",
      };
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "PIN berhasil dibuat",
    };
  } catch (error) {
    console.error("Unexpected error in createUserPin:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Verify user's PIN
 */
export async function verifyUserPin(userId: string, pinCode: string) {
  const supabase = await createClient();

  try {
    // Validate PIN format
    if (!/^\d{6}$/.test(pinCode)) {
      return {
        success: false,
        error: "PIN harus 6 digit angka",
      };
    }

    // Get user's active PIN
    const { data, error } = await supabase
      .from("user_pins")
      .select("pin_code, expired_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("Error fetching PIN:", error);
      return {
        success: false,
        error: "PIN tidak ditemukan",
      };
    }

    // Check if PIN is expired
    if (data.expired_at && new Date(data.expired_at) < new Date()) {
      return {
        success: false,
        error: "PIN sudah expired. Silakan buat PIN baru",
        expired: true,
      };
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pinCode, data.pin_code);

    if (!isValid) {
      return {
        success: false,
        error: "PIN salah",
      };
    }

    return {
      success: true,
      message: "PIN benar",
    };
  } catch (error) {
    console.error("Unexpected error in verifyUserPin:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Change user's PIN
 */
export async function changeUserPin(
  userId: string,
  oldPin: string,
  newPin: string
) {
  const supabase = await createClient();

  try {
    // Validate new PIN format
    if (!/^\d{6}$/.test(newPin)) {
      return {
        success: false,
        error: "PIN baru harus 6 digit angka",
      };
    }

    // Check for weak PINs
    if (
      newPin === "123456" ||
      newPin === "000000" ||
      newPin === "111111" ||
      /^(\d)\1{5}$/.test(newPin)
    ) {
      return {
        success: false,
        error: "PIN terlalu lemah. Gunakan kombinasi yang lebih aman",
      };
    }

    // Verify old PIN first
    const verifyResult = await verifyUserPin(userId, oldPin);
    if (!verifyResult.success) {
      return {
        success: false,
        error: "PIN lama salah",
      };
    }

    // Soft delete old PIN(s)
    await supabase
      .from("user_pins")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("deleted_at", null);

    // Create new PIN
    const result = await createUserPin(userId, newPin);

    if (result.success) {
      return {
        success: true,
        message: "PIN berhasil diubah",
      };
    }

    return result;
  } catch (error) {
    console.error("Unexpected error in changeUserPin:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Reset user's PIN (force create new - for expired PIN)
 */
export async function resetUserPin(userId: string, newPin: string) {
  const supabase = await createClient();

  try {
    // Soft delete all old PINs
    await supabase
      .from("user_pins")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("deleted_at", null);

    // Create new PIN
    return await createUserPin(userId, newPin);
  } catch (error) {
    console.error("Unexpected error in resetUserPin:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server",
    };
  }
}

/**
 * Get user ID from Supabase auth user
 */
export async function getUserIdFromAuth() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { userId: null };
    }

    // Get user ID from users table based on employee
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", user.email)
      .single();

    if (error || !data) {
      return { userId: null };
    }

    return { userId: data.id };
  } catch (error) {
    console.error("Unexpected error in getUserIdFromAuth:", error);
    return { userId: null };
  }
}
