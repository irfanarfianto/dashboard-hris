// Example: Implementing permission system in employees page
// This is a reference implementation showing how to use permissions

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  hasPermission,
  requireAnyPermission,
  PERMISSIONS,
} from "@/lib/permissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function EmployeesPageExample() {
  const supabase = await createClient();

  // 1. Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // 2. Require at least ONE of these permissions to access page
  await requireAnyPermission(
    [
      PERMISSIONS.EMPLOYEES_VIEW_ALL,
      PERMISSIONS.EMPLOYEES_VIEW_TEAM,
      PERMISSIONS.EMPLOYEES_VIEW_OWN,
    ],
    {
      redirectTo: "/dashboard",
      errorMessage: "You don't have permission to view employees",
    }
  );

  // 3. Check specific permissions for features
  const canViewAll = await hasPermission(PERMISSIONS.EMPLOYEES_VIEW_ALL);
  const canViewTeam = await hasPermission(PERMISSIONS.EMPLOYEES_VIEW_TEAM);
  const canCreate = await hasPermission(PERMISSIONS.EMPLOYEES_CREATE);
  const canEdit = await hasPermission(PERMISSIONS.EMPLOYEES_EDIT);
  const canDelete = await hasPermission(PERMISSIONS.EMPLOYEES_DELETE);
  const canExport = await hasPermission(PERMISSIONS.EMPLOYEES_EXPORT);

  // 4. Load data based on permission level
  let employees;
  let pageTitle;

  if (canViewAll) {
    // HR Admin / Super Admin: View all employees
    const { data } = await supabase
      .from("employees")
      .select("*")
      .is("deleted_at", null)
      .order("full_name");
    employees = data || [];
    pageTitle = "All Employees";
  } else if (canViewTeam) {
    // Manager: View team employees only
    // TODO: Add department/team filter
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("department_id", 1) // Replace with actual user department
      .is("deleted_at", null)
      .order("full_name");
    employees = data || [];
    pageTitle = "Team Employees";
  } else {
    // Employee: View own data only
    const { data: userRecord } = await supabase
      .from("users")
      .select("employee_id")
      .eq("auth_user_id", user.id)
      .single();

    if (userRecord?.employee_id) {
      const { data } = await supabase
        .from("employees")
        .select("*")
        .eq("id", userRecord.employee_id)
        .single();
      employees = data ? [data] : [];
      pageTitle = "My Profile";
    } else {
      employees = [];
      pageTitle = "Employees";
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-gray-500 mt-1">
            {canViewAll && "Manage all employees"}
            {canViewTeam && !canViewAll && "View and manage your team"}
            {!canViewAll && !canViewTeam && "View your employee information"}
          </p>
        </div>

        {/* Create button - only show if has permission */}
        {canCreate && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Add Employee
          </button>
        )}
      </div>

      {/* Permission badges (for demo) */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Your Permissions:</h3>
        <div className="flex flex-wrap gap-2">
          {canViewAll && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              View All
            </span>
          )}
          {canViewTeam && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              View Team
            </span>
          )}
          {canCreate && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              Create
            </span>
          )}
          {canEdit && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
              Edit
            </span>
          )}
          {canDelete && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
              Delete
            </span>
          )}
          {canExport && (
            <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
              Export
            </span>
          )}
        </div>
      </div>

      {/* Employee list */}
      {employees.length > 0 ? (
        <div className="space-y-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{emp.full_name}</h3>
                <p className="text-sm text-gray-500">{emp.email}</p>
              </div>

              <div className="flex gap-2">
                {/* Edit button - only show if has permission */}
                {canEdit && (
                  <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                    Edit
                  </button>
                )}

                {/* Delete button - only show if has permission */}
                {canDelete && (
                  <button className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Employees Found</AlertTitle>
          <AlertDescription>
            No employee data available for your permission level.
          </AlertDescription>
        </Alert>
      )}

      {/* Export button - only show if has permission */}
      {canExport && employees.length > 0 && (
        <div className="mt-6">
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Export to Excel
          </button>
        </div>
      )}
    </div>
  );
}
