"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// COMPANIES ACTIONS
// ============================================================================

export async function getCompanies() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching companies:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

export async function createCompany(formData: {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("companies").insert([formData]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/companies");
    return { success: true, message: "Perusahaan berhasil ditambahkan" };
  } catch (error) {
    console.error("Error creating company:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function updateCompany(
  id: number,
  formData: {
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("companies")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/companies");
    return { success: true, message: "Perusahaan berhasil diupdate" };
  } catch (error) {
    console.error("Error updating company:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function deleteCompany(id: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("companies")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/companies");
    return { success: true, message: "Perusahaan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting company:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ============================================================================
// DEPARTMENTS ACTIONS
// ============================================================================

export async function getDepartments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("*, companies(name)")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching departments:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

export async function createDepartment(formData: {
  company_id: number;
  name: string;
  description?: string;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("departments").insert([formData]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/departments");
    return { success: true, message: "Departemen berhasil ditambahkan" };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function updateDepartment(
  id: number,
  formData: {
    company_id: number;
    name: string;
    description?: string;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("departments")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/departments");
    return { success: true, message: "Departemen berhasil diupdate" };
  } catch (error) {
    console.error("Error updating department:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function deleteDepartment(id: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("departments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/departments");
    return { success: true, message: "Departemen berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ============================================================================
// POSITION LEVELS ACTIONS
// ============================================================================

export async function getPositionLevels() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("position_levels")
    .select("*")
    .is("deleted_at", null)
    .order("rank_order", { ascending: true });

  if (error) {
    console.error("Error fetching position levels:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

export async function createPositionLevel(formData: {
  name: string;
  rank_order: number;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("position_levels").insert([formData]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/position-levels");
    return { success: true, message: "Level jabatan berhasil ditambahkan" };
  } catch (error) {
    console.error("Error creating position level:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function updatePositionLevel(
  id: number,
  formData: {
    name: string;
    rank_order: number;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("position_levels")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/position-levels");
    return { success: true, message: "Level jabatan berhasil diupdate" };
  } catch (error) {
    console.error("Error updating position level:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function deletePositionLevel(id: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("position_levels")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/position-levels");
    return { success: true, message: "Level jabatan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting position level:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ============================================================================
// POSITIONS ACTIONS
// ============================================================================

export async function getPositions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("positions")
    .select(
      "*, departments(name, companies(name)), position_levels(name, rank_order)"
    )
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching positions:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

export async function createPosition(formData: {
  department_id: number;
  level_id: number;
  name: string;
  description?: string;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("positions").insert([formData]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/positions");
    return { success: true, message: "Posisi berhasil ditambahkan" };
  } catch (error) {
    console.error("Error creating position:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function updatePosition(
  id: number,
  formData: {
    department_id: number;
    level_id: number;
    name: string;
    description?: string;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("positions")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/positions");
    return { success: true, message: "Posisi berhasil diupdate" };
  } catch (error) {
    console.error("Error updating position:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function deletePosition(id: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("positions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/positions");
    return { success: true, message: "Posisi berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting position:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ============================================================================
// WORK SHIFTS ACTIONS
// ============================================================================

export async function getWorkShifts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("work_shifts")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching work shifts:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

export async function createWorkShift(formData: {
  name: string;
  start_time: string;
  end_time: string;
  is_regular: boolean;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("work_shifts").insert([formData]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/work-shifts");
    return { success: true, message: "Shift kerja berhasil ditambahkan" };
  } catch (error) {
    console.error("Error creating work shift:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function updateWorkShift(
  id: number,
  formData: {
    name: string;
    start_time: string;
    end_time: string;
    is_regular: boolean;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("work_shifts")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/work-shifts");
    return { success: true, message: "Shift kerja berhasil diupdate" };
  } catch (error) {
    console.error("Error updating work shift:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function deleteWorkShift(id: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("work_shifts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/work-shifts");
    return { success: true, message: "Shift kerja berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting work shift:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

// ============================================================================
// ROLES ACTIONS
// ============================================================================

export async function getRoles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

export async function createRole(formData: {
  name: string;
  description?: string;
}) {
  try {
    const supabase = await createClient();

    // Check if role name already exists
    const { data: existing } = await supabase
      .from("roles")
      .select("id")
      .eq("name", formData.name)
      .is("deleted_at", null)
      .single();

    if (existing) {
      return { success: false, error: "Nama role sudah digunakan" };
    }

    const { error } = await supabase.from("roles").insert([formData]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/roles");
    return { success: true, message: "Role berhasil ditambahkan" };
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function updateRole(
  id: number,
  formData: {
    name: string;
    description?: string;
  }
) {
  try {
    const supabase = await createClient();

    // Check if role name already exists (excluding current role)
    const { data: existing } = await supabase
      .from("roles")
      .select("id")
      .eq("name", formData.name)
      .neq("id", id)
      .is("deleted_at", null)
      .single();

    if (existing) {
      return { success: false, error: "Nama role sudah digunakan" };
    }

    const { error } = await supabase
      .from("roles")
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/roles");
    return { success: true, message: "Role berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

export async function deleteRole(id: number) {
  try {
    const supabase = await createClient();

    // Check if role is being used by any users
    const { data: usersWithRole, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("role_id", id)
      .is("deleted_at", null)
      .limit(1);

    if (checkError) {
      return { success: false, error: checkError.message };
    }

    if (usersWithRole && usersWithRole.length > 0) {
      return {
        success: false,
        error: "Role tidak dapat dihapus karena masih digunakan oleh user",
      };
    }

    // Soft delete
    const { error } = await supabase
      .from("roles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/roles");
    return { success: true, message: "Role berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}
