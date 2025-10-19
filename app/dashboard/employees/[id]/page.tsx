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

  const { data: employee, error } = await supabase
    .from("employees")
    .select(
      `
      *,
      companies:company_id (id, name),
      departments:department_id (id, name),
      positions:position_id (id, name, level_id, position_levels:level_id (id, name)),
      work_shifts:shift_id (id, name, start_time, end_time),
      employee_personnel_details (*),
      employee_education (*),
      users (id, username, is_active, roles:role_id (id, name))
    `
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !employee) {
    return null;
  }

  return employee;
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
