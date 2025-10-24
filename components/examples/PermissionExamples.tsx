// Example: Client component with permission checks
// Use this pattern for buttons, forms, and interactive elements

"use client";

import {
  Can,
  CanAny,
  usePermissions,
} from "@/components/providers/PermissionProvider";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  FileDown,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Example 1: Simple button with permission
export function EditEmployeeButton({ employeeId }: { employeeId: number }) {
  const handleEdit = () => {
    console.log("Edit employee:", employeeId);
    // Open edit dialog/form
  };

  return (
    <Can permission={PERMISSIONS.EMPLOYEES_EDIT}>
      <Button variant="outline" size="sm" onClick={handleEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    </Can>
  );
}

// Example 2: Button with fallback
export function DeleteEmployeeButton({ employeeId }: { employeeId: number }) {
  const handleDelete = () => {
    console.log("Delete employee:", employeeId);
    // Show confirmation dialog
  };

  return (
    <Can
      permission={PERMISSIONS.EMPLOYEES_DELETE}
      fallback={
        <Badge variant="secondary" className="text-xs">
          Delete not allowed
        </Badge>
      }
    >
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </Can>
  );
}

// Example 3: Action menu with multiple permissions
export function EmployeeActionMenu({ employeeId }: { employeeId: number }) {
  return (
    <div className="flex gap-2">
      <Can permission={PERMISSIONS.EMPLOYEES_VIEW_ALL}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </Can>

      <Can permission={PERMISSIONS.EMPLOYEES_EDIT}>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </Can>

      <Can permission={PERMISSIONS.EMPLOYEES_DELETE}>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </Can>

      <Can permission={PERMISSIONS.EMPLOYEES_EXPORT}>
        <Button variant="secondary" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </Can>
    </div>
  );
}

// Example 4: Using CanAny for multiple permission options
export function ViewEmployeesButton() {
  return (
    <CanAny
      permissions={[
        PERMISSIONS.EMPLOYEES_VIEW_ALL,
        PERMISSIONS.EMPLOYEES_VIEW_TEAM,
        PERMISSIONS.EMPLOYEES_VIEW_OWN,
      ]}
      fallback={
        <div className="text-sm text-gray-500">
          No permission to view employees
        </div>
      }
    >
      <Button>
        <Eye className="h-4 w-4 mr-2" />
        View Employees
      </Button>
    </CanAny>
  );
}

// Example 5: Using usePermissions hook for complex logic
export function EmployeeCard({
  employee,
}: {
  employee: { id: number; name: string; role: string };
}) {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const canEdit = hasPermission(PERMISSIONS.EMPLOYEES_EDIT);
  const canDelete = hasPermission(PERMISSIONS.EMPLOYEES_DELETE);
  const canViewDetails = hasAnyPermission([
    PERMISSIONS.EMPLOYEES_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_VIEW_TEAM,
  ]);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{employee.name}</h3>
          <p className="text-sm text-gray-500">{employee.role}</p>
        </div>

        {/* Show actions only if has permissions */}
        {(canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Show "View Details" only if has permission */}
      {canViewDetails && (
        <Button variant="link" size="sm" className="mt-2 p-0">
          View Full Details →
        </Button>
      )}

      {/* Show different badge based on permissions */}
      <div className="mt-2">
        {canEdit && (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Editable
          </Badge>
        )}
        {!canEdit && (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Read Only
          </Badge>
        )}
      </div>
    </div>
  );
}

// Example 6: Form with conditional fields
export function EmployeeForm({ mode }: { mode: "create" | "edit" }) {
  const { hasPermission } = usePermissions();

  const canEditSalary = hasPermission(PERMISSIONS.PAYROLL_EDIT);
  const canAssignRole = hasPermission(PERMISSIONS.ROLES_EDIT);

  return (
    <form className="space-y-4">
      {/* Basic fields - always visible */}
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Enter full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Enter email"
        />
      </div>

      {/* Salary field - only if has permission */}
      {canEditSalary && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Salary
            <Badge variant="secondary" className="ml-2 text-xs">
              HR Only
            </Badge>
          </label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter salary"
          />
        </div>
      )}

      {/* Role field - only if has permission */}
      {canAssignRole && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Role
            <Badge variant="secondary" className="ml-2 text-xs">
              Admin Only
            </Badge>
          </label>
          <select className="w-full border rounded px-3 py-2">
            <option>Select role</option>
            <option>Employee</option>
            <option>Manager</option>
            <option>HR Admin</option>
          </select>
        </div>
      )}

      {/* Submit button */}
      <div className="flex gap-2">
        <Button type="submit">
          {mode === "create" ? (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Employee
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Update Employee
            </>
          )}
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Example 7: Attendance approval button
export function ApproveAttendanceButton({
  attendanceId,
}: {
  attendanceId: number;
}) {
  const handleApprove = () => {
    console.log("Approve attendance:", attendanceId);
    // Call server action to approve
  };

  return (
    <Can
      permission={PERMISSIONS.ATTENDANCE_APPROVE}
      fallback={
        <Badge variant="outline" className="text-xs">
          Approval not allowed
        </Badge>
      }
    >
      <Button size="sm" onClick={handleApprove}>
        <CheckCircle className="h-4 w-4 mr-2" />
        Approve
      </Button>
    </Can>
  );
}

// Example 8: Leave approval actions
export function LeaveRequestActions({ requestId }: { requestId: number }) {
  const handleApprove = () => {
    console.log("Approve leave:", requestId);
  };

  const handleReject = () => {
    console.log("Reject leave:", requestId);
  };

  return (
    <Can
      permission={PERMISSIONS.LEAVE_APPROVE}
      fallback={<Badge variant="secondary">Pending Approval</Badge>}
    >
      <div className="flex gap-2">
        <Button size="sm" variant="default" onClick={handleApprove}>
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={handleReject}>
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>
    </Can>
  );
}

// Example 9: Export button with permission
export function ExportReportButton() {
  const handleExport = () => {
    console.log("Exporting report...");
    // Generate and download report
  };

  return (
    <CanAny
      permissions={[PERMISSIONS.ATTENDANCE_EXPORT, PERMISSIONS.REPORTS_EXPORT]}
    >
      <Button onClick={handleExport}>
        <FileDown className="h-4 w-4 mr-2" />
        Export Report
      </Button>
    </CanAny>
  );
}

// Example 10: Create employee button (toolbar)
export function CreateEmployeeToolbarButton() {
  return (
    <Can permission={PERMISSIONS.EMPLOYEES_CREATE}>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add New Employee
      </Button>
    </Can>
  );
}
