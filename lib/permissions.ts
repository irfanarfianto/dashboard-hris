/**
 * Permission Helper Functions
 *
 * Provides utilities to check user permissions in the application
 */

import { createClient } from "@/lib/supabase/server";

// Permission type definition
export type Permission = {
  name: string;
  module: string;
  action: string;
  description: string;
};

// Common permission names (for type safety)
export const PERMISSIONS = {
  // Profile
  PROFILE_VIEW: "profile.view",
  PROFILE_EDIT: "profile.edit",

  // Dashboard
  DASHBOARD_VIEW: "dashboard.view",

  // Employees
  EMPLOYEES_VIEW_ALL: "employees.view-all",
  EMPLOYEES_VIEW_OWN: "employees.view-own",
  EMPLOYEES_VIEW_TEAM: "employees.view-team",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_EDIT: "employees.edit",
  EMPLOYEES_DELETE: "employees.delete",
  EMPLOYEES_EXPORT: "employees.export",

  // Attendance
  ATTENDANCE_CHECK_IN: "attendance.check-in",
  ATTENDANCE_VIEW_OWN: "attendance.view-own",
  ATTENDANCE_VIEW_TEAM: "attendance.view-team",
  ATTENDANCE_VIEW_ALL: "attendance.view-all",
  ATTENDANCE_EDIT: "attendance.edit",
  ATTENDANCE_APPROVE: "attendance.approve",
  ATTENDANCE_EXPORT: "attendance.export",

  // Leave
  LEAVE_REQUEST: "leave.request",
  LEAVE_VIEW_OWN: "leave.view-own",
  LEAVE_VIEW_TEAM: "leave.view-team",
  LEAVE_VIEW_ALL: "leave.view-all",
  LEAVE_APPROVE: "leave.approve",
  LEAVE_CANCEL: "leave.cancel",

  // Payroll
  PAYROLL_VIEW_OWN: "payroll.view-own",
  PAYROLL_VIEW_ALL: "payroll.view-all",
  PAYROLL_CREATE: "payroll.create",
  PAYROLL_EDIT: "payroll.edit",
  PAYROLL_PROCESS: "payroll.process",
  PAYROLL_EXPORT: "payroll.export",

  // Shifts
  SHIFTS_VIEW: "shifts.view",
  SHIFTS_CREATE: "shifts.create",
  SHIFTS_EDIT: "shifts.edit",
  SHIFTS_DELETE: "shifts.delete",
  SHIFTS_ASSIGN: "shifts.assign",

  // Master Data
  MASTER_DATA_VIEW: "master-data.view",
  MASTER_DATA_CREATE: "master-data.create",
  MASTER_DATA_EDIT: "master-data.edit",
  MASTER_DATA_DELETE: "master-data.delete",

  // Roles
  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_EDIT: "roles.edit",
  ROLES_DELETE: "roles.delete",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",

  // Audit
  AUDIT_VIEW: "audit.view",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
} as const;

/**
 * Check if current user has a specific permission
 *
 * @param permissionName - The permission to check (e.g., 'employees.view-all')
 * @returns boolean - true if user has permission, false otherwise
 *
 * @example
 * const canViewAll = await hasPermission(PERMISSIONS.EMPLOYEES_VIEW_ALL);
 * if (!canViewAll) {
 *   return <AccessDenied />;
 * }
 */
export async function hasPermission(permissionName: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return false;

    // Call database function to check permission
    const { data, error } = await supabase.rpc("user_has_permission", {
      p_user_id: user.id,
      p_permission_name: permissionName,
    });

    if (error) {
      console.error("Error checking permission:", error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error("Unexpected error in hasPermission:", error);
    return false;
  }
}

/**
 * Check if current user has ANY of the specified permissions
 *
 * @param permissionNames - Array of permissions to check
 * @returns boolean - true if user has at least one permission
 *
 * @example
 * const canViewEmployees = await hasAnyPermission([
 *   PERMISSIONS.EMPLOYEES_VIEW_ALL,
 *   PERMISSIONS.EMPLOYEES_VIEW_TEAM
 * ]);
 */
export async function hasAnyPermission(
  permissionNames: string[]
): Promise<boolean> {
  for (const permission of permissionNames) {
    if (await hasPermission(permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if current user has ALL of the specified permissions
 *
 * @param permissionNames - Array of permissions to check
 * @returns boolean - true if user has all permissions
 *
 * @example
 * const canManageEmployees = await hasAllPermissions([
 *   PERMISSIONS.EMPLOYEES_VIEW_ALL,
 *   PERMISSIONS.EMPLOYEES_EDIT,
 *   PERMISSIONS.EMPLOYEES_DELETE
 * ]);
 */
export async function hasAllPermissions(
  permissionNames: string[]
): Promise<boolean> {
  for (const permission of permissionNames) {
    if (!(await hasPermission(permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for current user
 *
 * @returns Array of Permission objects
 *
 * @example
 * const userPermissions = await getUserPermissions();
 * console.log('User can:', userPermissions.map(p => p.name));
 */
export async function getUserPermissions(): Promise<Permission[]> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return [];

    // Call database function to get all permissions
    const { data, error } = await supabase.rpc("get_user_permissions", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error getting user permissions:", error);
      return [];
    }

    return (data || []).map(
      (p: {
        permission_name: string;
        module: string;
        action: string;
        description: string;
      }) => ({
        name: p.permission_name,
        module: p.module,
        action: p.action,
        description: p.description,
      })
    );
  } catch (error) {
    console.error("Unexpected error in getUserPermissions:", error);
    return [];
  }
}

/**
 * Check if user can perform an action on a module
 *
 * @param module - Module name (e.g., 'employees', 'attendance')
 * @param action - Action name (e.g., 'view', 'create', 'edit', 'delete')
 * @returns boolean
 *
 * @example
 * const canEditEmployees = await canPerformAction('employees', 'edit');
 */
export async function canPerformAction(
  module: string,
  action: string
): Promise<boolean> {
  const permissionName = `${module}.${action}`;
  return await hasPermission(permissionName);
}

/**
 * Require permission middleware for server components
 * Redirects or shows error if user doesn't have permission
 *
 * @param permissionName - Required permission
 * @param redirectTo - Where to redirect if no permission (optional)
 * @throws Error if no permission and no redirect specified
 *
 * @example
 * export default async function EmployeesPage() {
 *   await requirePermission(PERMISSIONS.EMPLOYEES_VIEW_ALL);
 *   // ... rest of page
 * }
 */
export async function requirePermission(
  permissionName: string,
  options?: {
    redirectTo?: string;
    errorMessage?: string;
  }
): Promise<void> {
  const hasPerm = await hasPermission(permissionName);

  if (!hasPerm) {
    if (options?.redirectTo) {
      const { redirect } = await import("next/navigation");
      redirect(options.redirectTo);
    } else {
      throw new Error(
        options?.errorMessage || `Permission denied: ${permissionName}`
      );
    }
  }
}

/**
 * Require any of the specified permissions
 *
 * @example
 * await requireAnyPermission([
 *   PERMISSIONS.EMPLOYEES_VIEW_ALL,
 *   PERMISSIONS.EMPLOYEES_VIEW_TEAM
 * ]);
 */
export async function requireAnyPermission(
  permissionNames: string[],
  options?: {
    redirectTo?: string;
    errorMessage?: string;
  }
): Promise<void> {
  const hasAny = await hasAnyPermission(permissionNames);

  if (!hasAny) {
    if (options?.redirectTo) {
      const { redirect } = await import("next/navigation");
      redirect(options.redirectTo);
    } else {
      throw new Error(
        options?.errorMessage ||
          `Permission denied: Requires one of [${permissionNames.join(", ")}]`
      );
    }
  }
}

/**
 * Get permission check result with user info
 * Useful for conditional rendering
 *
 * @returns Object with hasPermission flag and user info
 *
 * @example
 * const { hasPermission: canEdit, userId } = await checkPermission(PERMISSIONS.EMPLOYEES_EDIT);
 * if (canEdit) {
 *   return <EditButton />;
 * }
 */
export async function checkPermission(permissionName: string): Promise<{
  hasPermission: boolean;
  userId: string | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        hasPermission: false,
        userId: null,
        error: "User not authenticated",
      };
    }

    const hasPerm = await hasPermission(permissionName);

    return {
      hasPermission: hasPerm,
      userId: user.id,
    };
  } catch (error) {
    return {
      hasPermission: false,
      userId: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
