"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * Server Action untuk soft delete employee
 * Mengupdate deleted_at timestamp untuk menandai employee sebagai diarsipkan
 */
export async function softDeleteEmployee(employeeId: number) {
  try {
    const supabase = await createClient();

    // Update deleted_at dengan timestamp saat ini
    const { error } = await supabase
      .from("employees")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", employeeId);

    if (error) {
      console.error("Error soft deleting employee:", error);
      return {
        success: false,
        error: "Gagal mengarsipkan karyawan: " + error.message,
      };
    }

    // Revalidate halaman employees untuk refresh data
    revalidatePath("/dashboard/employees");

    return {
      success: true,
      message: "Karyawan berhasil diarsipkan",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga",
    };
  }
}

/**
 * Server Action untuk restore employee yang sudah diarsipkan
 * Menghapus deleted_at untuk mengembalikan employee ke status aktif
 */
export async function restoreEmployee(employeeId: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("employees")
      .update({ deleted_at: null })
      .eq("id", employeeId);

    if (error) {
      console.error("Error restoring employee:", error);
      return {
        success: false,
        error: "Gagal mengembalikan karyawan: " + error.message,
      };
    }

    revalidatePath("/dashboard/employees");

    return {
      success: true,
      message: "Karyawan berhasil dikembalikan",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga",
    };
  }
}

/**
 * Generate random temporary password
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Server Action untuk create employee dengan akun user
 */
export async function createEmployeeWithUser(data: {
  // Employee data
  company_id: number;
  department_id: number;
  position_id: number;
  shift_id: number;
  full_name: string;
  phone_number: string;
  email: string;
  gender: "L" | "P";
  birth_date: string;
  hire_date: string;
  // User account data
  create_user_account: boolean;
  username?: string;
  role_id?: number;
  // Contract data (status will be derived from contract_type)
  contract_type?: "Probation" | "Contract" | "Permanent";
  salary_base?: number;
  contract_end_date?: string;
  // Education data
  education_data?: Array<{
    degree: string;
    institution: string;
    major: string;
    graduation_year: string;
  }>;
  // Personnel details data
  personnel_details?: {
    religion: string;
    marital_status: "TK/0" | "K/0" | "K/1" | "K/2" | "K/3";
    ptkp_status: string;
    ktp_address: string;
    domicile_address: string;
    npwp_number?: string;
  };
}) {
  try {
    const supabase = await createClient();

    // 1. Validasi email unique
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("id")
      .eq("email", data.email)
      .is("deleted_at", null)
      .single();

    if (existingEmployee) {
      return {
        success: false,
        error: "Email sudah digunakan oleh karyawan lain",
      };
    }

    // 2. Insert employee data (without status - will be derived from contract)
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .insert({
        company_id: data.company_id,
        department_id: data.department_id,
        position_id: data.position_id,
        shift_id: data.shift_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
        gender: data.gender,
        birth_date: data.birth_date,
        hire_date: data.hire_date,
      })
      .select()
      .single();

    if (employeeError) {
      console.error("Error creating employee:", employeeError);
      return {
        success: false,
        error: "Gagal membuat data karyawan: " + employeeError.message,
      };
    }

    // 2.5. Create initial contract if contract data provided
    if (data.contract_type && data.salary_base) {
      const { error: contractError } = await supabase
        .from("employee_contracts")
        .insert({
          employee_id: employee.id,
          start_date: data.hire_date,
          end_date: data.contract_end_date || null,
          contract_type: data.contract_type,
          salary_base: data.salary_base,
        });

      if (contractError) {
        // Rollback: delete employee if contract creation fails
        await supabase.from("employees").delete().eq("id", employee.id);

        console.error("Error creating contract:", contractError);
        return {
          success: false,
          error: "Gagal membuat kontrak karyawan: " + contractError.message,
        };
      }
    }

    let tempPassword = "";
    let authUserId = "";

    // 3. Jika diminta create user account
    if (data.create_user_account && data.username && data.role_id) {
      // Generate temporary password
      tempPassword = generateTemporaryPassword();

      // Hash password untuk disimpan di database
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // A. Create user di Supabase Auth using ADMIN CLIENT
      const adminClient = createAdminClient();
      const { data: authUser, error: authError } =
        await adminClient.auth.admin.createUser({
          email: data.email,
          password: tempPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: data.full_name,
            employee_id: employee.id,
          },
        });

      if (authError) {
        // Rollback: delete employee jika gagal create auth user
        await supabase.from("employees").delete().eq("id", employee.id);

        console.error("Error creating auth user:", authError);
        return {
          success: false,
          error: "Gagal membuat akun autentikasi: " + authError.message,
        };
      }

      authUserId = authUser.user.id;

      // B. Validasi username unique
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", data.username)
        .is("deleted_at", null)
        .single();

      if (existingUser) {
        // Rollback: delete employee dan auth user
        await supabase.from("employees").delete().eq("id", employee.id);
        await adminClient.auth.admin.deleteUser(authUserId);

        return {
          success: false,
          error: "Username sudah digunakan",
        };
      }

      // C. Insert ke tabel users dengan hashed password
      const { error: userError } = await supabase.from("users").insert({
        auth_user_id: authUserId,
        employee_id: employee.id,
        username: data.username,
        password_hash: hashedPassword, // ← Hash password disimpan
        role_id: data.role_id,
        is_active: true,
      });

      if (userError) {
        // Rollback: delete employee dan auth user
        await supabase.from("employees").delete().eq("id", employee.id);
        await adminClient.auth.admin.deleteUser(authUserId);

        console.error("Error creating user:", userError);
        return {
          success: false,
          error: "Gagal membuat user: " + userError.message,
        };
      }
    }

    // 4. Create personnel details if provided
    if (data.personnel_details) {
      const { error: personnelError } = await supabase
        .from("employee_personnel_details")
        .insert({
          employee_id: employee.id,
          religion: data.personnel_details.religion,
          marital_status: data.personnel_details.marital_status,
          ptkp_status: data.personnel_details.ptkp_status,
          ktp_address: data.personnel_details.ktp_address,
          domicile_address: data.personnel_details.domicile_address,
          npwp_number: data.personnel_details.npwp_number || null,
        });

      if (personnelError) {
        console.error("Error creating personnel details:", personnelError);
        // Don't fail the whole operation, just log the error
      }
    }

    // 5. Create education records if provided
    if (data.education_data && data.education_data.length > 0) {
      for (const education of data.education_data) {
        const { error: educationError } = await supabase
          .from("employee_educations")
          .insert({
            employee_id: employee.id,
            degree: education.degree,
            institution: education.institution,
            major: education.major,
            graduation_year: parseInt(education.graduation_year),
          });

        if (educationError) {
          console.error("Error creating education record:", educationError);
          // Don't fail the whole operation, just log the error
          // Employee is already created successfully
        }
      }
    }

    revalidatePath("/dashboard/employees");

    return {
      success: true,
      message:
        "Karyawan berhasil ditambahkan" +
        (data.create_user_account ? " dan akun user telah dibuat" : ""),
      data: {
        employee,
        tempPassword: data.create_user_account ? tempPassword : null,
      },
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga",
    };
  }
}

/**
 * Server Action untuk update employee
 */
export async function updateEmployee(
  employeeId: number,
  data: {
    // Employee data
    company_id: number;
    department_id: number;
    position_id: number;
    shift_id: number;
    full_name: string;
    phone_number: string;
    email: string;
    gender: "L" | "P";
    birth_date: string;
    hire_date: string;
    // Contract data
    contract_type?: "Probation" | "Contract" | "Permanent";
    salary_base?: number;
    contract_end_date?: string;
    // Personnel details
    personnel_details?: {
      religion: string;
      marital_status: string;
      ptkp_status: string;
      ktp_address: string;
      domicile_address: string;
      npwp_number?: string;
    };
  }
) {
  try {
    const supabase = await createClient();

    // 1. Update employee data
    const { error: employeeError } = await supabase
      .from("employees")
      .update({
        company_id: data.company_id,
        department_id: data.department_id,
        position_id: data.position_id,
        shift_id: data.shift_id,
        full_name: data.full_name,
        phone_number: data.phone_number,
        email: data.email,
        gender: data.gender,
        birth_date: data.birth_date,
        hire_date: data.hire_date,
        contract_type: data.contract_type,
        salary_base: data.salary_base,
        contract_end_date: data.contract_end_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeId);

    if (employeeError) {
      console.error("Error updating employee:", employeeError);
      return {
        success: false,
        error: "Gagal memperbarui data karyawan: " + employeeError.message,
      };
    }

    // 2. Update personnel details if provided
    if (data.personnel_details) {
      // Check if personnel details exist
      const { data: existingDetails } = await supabase
        .from("employee_personnel_details")
        .select("id")
        .eq("employee_id", employeeId)
        .single();

      if (existingDetails) {
        // Update existing
        const { error: personnelError } = await supabase
          .from("employee_personnel_details")
          .update({
            religion: data.personnel_details.religion,
            marital_status: data.personnel_details.marital_status,
            ptkp_status: data.personnel_details.ptkp_status,
            ktp_address: data.personnel_details.ktp_address,
            domicile_address: data.personnel_details.domicile_address,
            npwp_number: data.personnel_details.npwp_number,
            updated_at: new Date().toISOString(),
          })
          .eq("employee_id", employeeId);

        if (personnelError) {
          console.error("Error updating personnel details:", personnelError);
          return {
            success: false,
            error:
              "Gagal memperbarui data personnel: " + personnelError.message,
          };
        }
      } else {
        // Insert new
        const { error: personnelError } = await supabase
          .from("employee_personnel_details")
          .insert({
            employee_id: employeeId,
            religion: data.personnel_details.religion,
            marital_status: data.personnel_details.marital_status,
            ptkp_status: data.personnel_details.ptkp_status,
            ktp_address: data.personnel_details.ktp_address,
            domicile_address: data.personnel_details.domicile_address,
            npwp_number: data.personnel_details.npwp_number,
          });

        if (personnelError) {
          console.error("Error creating personnel details:", personnelError);
          return {
            success: false,
            error: "Gagal membuat data personnel: " + personnelError.message,
          };
        }
      }
    }

    // Revalidate path
    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${employeeId}`);

    return {
      success: true,
      message: "Data karyawan berhasil diperbarui",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan yang tidak terduga",
    };
  }
}

/**
 * Get all companies for dropdown
 */
export async function getCompanies() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, code")
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return { data: data || [] };
  } catch (error) {
    console.error("Error fetching companies:", error);
    return { data: [] };
  }
}

/**
 * Get departments by company
 */
export async function getDepartmentsByCompany(companyId: number) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("departments")
      .select("id, name")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return { data: data || [] };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { data: [] };
  }
}

/**
 * Get positions by department
 */
export async function getPositionsByDepartment(departmentId: number) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("positions")
      .select("id, name, position_levels(name, rank_order)")
      .eq("department_id", departmentId)
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return { data: data || [] };
  } catch (error) {
    console.error("Error fetching positions:", error);
    return { data: [] };
  }
}

/**
 * Get work shifts
 */
export async function getWorkShifts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("work_shifts")
      .select("id, name, start_time, end_time")
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return { data: data || [] };
  } catch (error) {
    console.error("Error fetching work shifts:", error);
    return { data: [] };
  }
}

/**
 * Get roles for user account
 */
export async function getRoles() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("roles")
      .select("id, name, description")
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return { data: data || [] };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { data: [] };
  }
}

// ============================================================================
// EMPLOYEE EDUCATION ACTIONS
// ============================================================================

/**
 * Get employee educations
 */
export async function getEmployeeEducations(employeeId: number) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("employee_educations")
      .select("*")
      .eq("employee_id", employeeId)
      .is("deleted_at", null)
      .order("graduation_year", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching employee educations:", error);
    return { success: false, error: "Gagal memuat data pendidikan", data: [] };
  }
}

/**
 * Create employee education
 */
export async function createEmployeeEducation(formData: {
  employee_id: number;
  degree: string;
  institution: string;
  major: string;
  graduation_year: number;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("employee_educations")
      .insert([formData]);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/employees");
    return { success: true, message: "Data pendidikan berhasil ditambahkan" };
  } catch (error) {
    console.error("Error creating employee education:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

/**
 * Update employee education
 */
export async function updateEmployeeEducation(
  id: number,
  formData: {
    degree: string;
    institution: string;
    major: string;
    graduation_year: number;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("employee_educations")
      .update(formData)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/employees");
    return { success: true, message: "Data pendidikan berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating employee education:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

/**
 * Delete employee education
 */
export async function deleteEmployeeEducation(id: number) {
  try {
    const supabase = await createClient();

    // Soft delete
    const { error } = await supabase
      .from("employee_educations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/employees");
    return { success: true, message: "Data pendidikan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting employee education:", error);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}
