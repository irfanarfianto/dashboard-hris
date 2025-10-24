"use client";

import { createContext, useContext, ReactNode } from "react";

/**
 * Permission Context
 * Provides permission checking capabilities to client components
 */

type PermissionContextType = {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
};

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

/**
 * Permission Provider
 * Wrap your app/page with this to provide permission context to children
 *
 * @example
 * <PermissionProvider permissions={userPermissions}>
 *   <YourComponents />
 * </PermissionProvider>
 */
export function PermissionProvider({
  children,
  permissions,
}: {
  children: ReactNode;
  permissions: string[];
}) {
  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]) => {
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]) => {
    return perms.every((p) => permissions.includes(p));
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to access permission context
 *
 * @example
 * const { hasPermission } = usePermissions();
 * if (hasPermission('employees.edit')) {
 *   return <EditButton />;
 * }
 */
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }
  return context;
}

/**
 * Component to conditionally render based on permission
 *
 * @example
 * <Can permission="employees.edit">
 *   <EditButton />
 * </Can>
 *
 * @example with fallback
 * <Can permission="employees.edit" fallback={<ViewOnlyMessage />}>
 *   <EditButton />
 * </Can>
 */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to conditionally render if user has ANY of the permissions
 *
 * @example
 * <CanAny permissions={['employees.view-all', 'employees.view-team']}>
 *   <EmployeeList />
 * </CanAny>
 */
export function CanAny({
  permissions,
  children,
  fallback = null,
}: {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to conditionally render if user has ALL of the permissions
 *
 * @example
 * <CanAll permissions={['employees.view-all', 'employees.edit']}>
 *   <FullAccessPanel />
 * </CanAll>
 */
export function CanAll({
  permissions,
  children,
  fallback = null,
}: {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to show content only if user does NOT have permission
 *
 * @example
 * <Cannot permission="employees.delete">
 *   <WarningMessage>You cannot delete employees</WarningMessage>
 * </Cannot>
 */
export function Cannot({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  return !hasPermission(permission) ? <>{children}</> : null;
}
