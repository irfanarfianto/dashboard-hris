import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmployeeDetailView from "@/components/employees/EmployeeDetailView";

interface EmployeeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getEmployeeDetail(id: number) {
  const supabase = await createClient();

  try {
    // First, get basic employee data with simple relations
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select(
        `
        *,
        companies:company_id (id, name),
        departments:department_id (id, name),
        positions:position_id (id, name, level_id),
        work_shifts:shift_id (id, name, start_time, end_time),
        employee_personnel_details (*),
        employee_educations (*)
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (employeeError) {
      console.error("Error fetching employee:", employeeError);
      return null;
    }

    if (!employee) {
      console.log("Employee not found with ID:", id);
      return null;
    }

    // Get position level if exists
    if (employee.positions && employee.positions.level_id) {
      const { data: positionLevel } = await supabase
        .from("position_levels")
        .select("id, name")
        .eq("id", employee.positions.level_id)
        .single();

      if (positionLevel) {
        employee.positions.position_levels = positionLevel;
      }
    }

    // Get user data with role separately
    const { data: userData } = await supabase
      .from("users")
      .select("id, username, is_active, role_id")
      .eq("employee_id", id)
      .single();

    if (userData) {
      // Get role name
      const { data: roleData } = await supabase
        .from("roles")
        .select("id, name")
        .eq("id", userData.role_id)
        .single();

      if (roleData) {
        employee.users = [
          {
            ...userData,
            roles: roleData,
          },
        ];
      } else {
        employee.users = [userData];
      }
    }

    return employee;
  } catch (error) {
    console.error("Unexpected error in getEmployeeDetail:", error);
    return null;
  }
}

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;
  const employeeId = parseInt(id);

  if (isNaN(employeeId)) {
    notFound();
  }

  const employee = await getEmployeeDetail(employeeId);

  if (!employee) {
    notFound();
  }

  return <EmployeeDetailView employee={employee} />;
}
