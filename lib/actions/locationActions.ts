"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Types
interface LocationFormData {
  id?: number;
  company_id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
}

interface LocationWifiFormData {
  id?: number;
  location_id: number;
  ssid_name: string;
  mac_address: string;
}

// Validation helpers
function validateNumber(
  value: string | undefined,
  fieldName: string
): number | null {
  if (!value) {
    return null;
  }

  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`${fieldName} harus berupa angka`);
  }

  return parsed;
}

function validateLatitude(value: number): void {
  if (value < -90 || value > 90) {
    throw new Error("Latitude harus antara -90 dan 90");
  }
}

function validateLongitude(value: number): void {
  if (value < -180 || value > 180) {
    throw new Error("Longitude harus antara -180 dan 180");
  }
}

function validateRadius(value: number): void {
  if (value <= 0) {
    throw new Error("Radius harus lebih besar dari 0");
  }
}

/**
 * Upsert Location (Insert/Update)
 *
 * @param formData - Form data containing location information
 * @returns Success/error object
 */
export async function upsertLocation(formData: FormData) {
  const supabase = await createClient();

  try {
    // Extract and validate form data
    const id = formData.get("id")?.toString();
    const companyIdStr = formData.get("company_id")?.toString();
    const name = formData.get("name")?.toString();
    const latitudeStr = formData.get("latitude")?.toString();
    const longitudeStr = formData.get("longitude")?.toString();
    const radiusStr = formData.get("radius_meter")?.toString();

    // Basic validation
    if (!name || name.trim() === "") {
      return {
        success: false,
        error: "Nama lokasi wajib diisi",
      };
    }

    // Validate company_id (required for new locations)
    if (!id && (!companyIdStr || companyIdStr.trim() === "")) {
      return {
        success: false,
        error: "Perusahaan wajib dipilih",
      };
    }

    const companyId = companyIdStr
      ? validateNumber(companyIdStr, "Company ID")
      : null;
    if (!id && companyId === null) {
      return {
        success: false,
        error: "Perusahaan tidak valid",
      };
    }

    // Validate numeric fields
    const latitude = validateNumber(latitudeStr, "Latitude");
    const longitude = validateNumber(longitudeStr, "Longitude");
    const radiusMeter = validateNumber(radiusStr, "Radius");

    if (latitude === null || longitude === null || radiusMeter === null) {
      return {
        success: false,
        error: "Latitude, Longitude, dan Radius wajib diisi",
      };
    }

    // Validate ranges
    validateLatitude(latitude);
    validateLongitude(longitude);
    validateRadius(radiusMeter);

    // Prepare location data
    const locationData: Partial<LocationFormData> = {
      name: name.trim(),
      latitude,
      longitude,
      radius_meter: radiusMeter,
    };

    // Add company_id only for new locations (cannot change company_id on update)
    if (!id && companyId !== null) {
      locationData.company_id = companyId;
    }

    let result;

    if (id) {
      // Update existing location
      const { data, error } = await supabase
        .from("locations")
        .update(locationData)
        .eq("id", parseInt(id))
        .select()
        .single();

      if (error) {
        console.error("Error updating location:", error);
        return {
          success: false,
          error: error.message || "Gagal memperbarui lokasi",
        };
      }

      result = data;
    } else {
      // Insert new location
      const { data, error } = await supabase
        .from("locations")
        .insert(locationData)
        .select()
        .single();

      if (error) {
        console.error("Error creating location:", error);
        return {
          success: false,
          error: error.message || "Gagal membuat lokasi",
        };
      }

      result = data;
    }

    // Revalidate cache
    revalidatePath("/dashboard/locations");

    return {
      success: true,
      data: result,
      message: id
        ? "Lokasi berhasil diperbarui"
        : "Lokasi berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error in upsertLocation:", error);
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
 * Delete Location
 *
 * @param locationId - ID of location to delete
 * @returns Success/error object
 */
export async function deleteLocation(locationId: number) {
  const supabase = await createClient();

  try {
    // Check if location has WiFi networks
    const { data: wifiNetworks, error: wifiCheckError } = await supabase
      .from("location_wifi")
      .select("id")
      .eq("location_id", locationId);

    if (wifiCheckError) {
      console.error("Error checking WiFi networks:", wifiCheckError);
      return {
        success: false,
        error: "Gagal memeriksa jaringan WiFi",
      };
    }

    if (wifiNetworks && wifiNetworks.length > 0) {
      return {
        success: false,
        error:
          "Tidak dapat menghapus lokasi yang masih memiliki jaringan WiFi. Hapus WiFi terlebih dahulu.",
      };
    }

    // Delete location
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", locationId);

    if (error) {
      console.error("Error deleting location:", error);
      return {
        success: false,
        error: error.message || "Gagal menghapus lokasi",
      };
    }

    // Revalidate cache
    revalidatePath("/dashboard/settings/locations");

    return {
      success: true,
      message: "Lokasi berhasil dihapus",
    };
  } catch (error) {
    console.error("Error in deleteLocation:", error);
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
 * Upsert Location WiFi (Insert/Update)
 *
 * @param locationId - ID of the location
 * @param formData - Form data containing WiFi information
 * @returns Success/error object
 */
export async function upsertLocationWifi(
  locationId: number,
  formData: FormData
) {
  const supabase = await createClient();

  try {
    // Extract form data
    const id = formData.get("id")?.toString();
    const ssid_name = formData.get("ssid_name")?.toString();
    const mac_address = formData.get("mac_address")?.toString();

    // Basic validation
    if (!ssid_name || ssid_name.trim() === "") {
      return {
        success: false,
        error: "SSID wajib diisi",
      };
    }

    if (!mac_address || mac_address.trim() === "") {
      return {
        success: false,
        error: "mac_address wajib diisi",
      };
    }

    // Validate mac_address format (MAC address format: XX:XX:XX:XX:XX:XX)
    const bssidPattern = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (!bssidPattern.test(mac_address)) {
      return {
        success: false,
        error: "Format mac_address tidak valid (contoh: AA:BB:CC:DD:EE:FF)",
      };
    }

    // Verify location exists
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("id", locationId)
      .single();

    if (locationError || !location) {
      return {
        success: false,
        error: "Lokasi tidak ditemukan",
      };
    }

    // Prepare WiFi data
    const wifiData: Partial<LocationWifiFormData> = {
      location_id: locationId,
      ssid_name: ssid_name.trim(),
      mac_address: mac_address.trim().toUpperCase(),
    };

    let result;

    if (id) {
      // Update existing WiFi
      const { data, error } = await supabase
        .from("location_wifi")
        .update(wifiData)
        .eq("id", parseInt(id))
        .select()
        .single();

      if (error) {
        console.error("Error updating WiFi:", error);
        return {
          success: false,
          error: error.message || "Gagal memperbarui WiFi",
        };
      }

      result = data;
    } else {
      // Check if mac_address already exists for this location
      const { data: existingWifi } = await supabase
        .from("location_wifi")
        .select("id")
        .eq("location_id", locationId)
        .eq("mac_address", mac_address.trim().toUpperCase())
        .single();

      if (existingWifi) {
        return {
          success: false,
          error: "mac_address sudah terdaftar untuk lokasi ini",
        };
      }

      // Insert new WiFi
      const { data, error } = await supabase
        .from("location_wifi")
        .insert(wifiData)
        .select()
        .single();

      if (error) {
        console.error("Error creating WiFi:", error);
        return {
          success: false,
          error: error.message || "Gagal menambahkan WiFi",
        };
      }

      result = data;
    }

    // Revalidate cache
    revalidatePath("/dashboard/settings/locations");

    return {
      success: true,
      data: result,
      message: id ? "WiFi berhasil diperbarui" : "WiFi berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error in upsertLocationWifi:", error);
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
 * Delete Location WiFi
 *
 * @param wifiId - ID of WiFi to delete
 * @returns Success/error object
 */
export async function deleteLocationWifi(wifiId: number) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("location_wifi")
      .delete()
      .eq("id", wifiId);

    if (error) {
      console.error("Error deleting WiFi:", error);
      return {
        success: false,
        error: error.message || "Gagal menghapus WiFi",
      };
    }

    // Revalidate cache
    revalidatePath("/dashboard/settings/locations");

    return {
      success: true,
      message: "WiFi berhasil dihapus",
    };
  } catch (error) {
    console.error("Error in deleteLocationWifi:", error);
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
 * Get all locations with their WiFi networks
 *
 * @returns List of locations with WiFi data
 */
export async function getLocations() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("locations")
      .select(
        `
        *,
        companies (
          id,
          name,
          code
        ),
        location_wifis:location_wifi (*)
      `
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching locations:", error);
      return {
        success: false,
        error: error.message || "Gagal mengambil data lokasi",
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in getLocations:", error);
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
 * Get all companies for dropdown selection
 *
 * @returns List of companies
 */
export async function getCompanies() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, code")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching companies:", error);
      return {
        success: false,
        error: error.message || "Gagal mengambil data perusahaan",
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error in getCompanies:", error);
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
 * Get single location by ID
 *
 * @param locationId - ID of location
 * @returns Location data with WiFi networks
 */
export async function getLocationById(locationId: number) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("locations")
      .select(
        `
        *,
        location_wifi (*)
      `
      )
      .eq("id", locationId)
      .single();

    if (error) {
      console.error("Error fetching location:", error);
      return {
        success: false,
        error: error.message || "Gagal mengambil data lokasi",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error in getLocationById:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server",
    };
  }
}
