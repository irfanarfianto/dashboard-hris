"use client";

import { ChangePasswordDialog } from "@/components/security/ChangePasswordDialog";

/**
 * Component to check if user needs to change password after login
 * ChangePasswordDialog will fetch data itself and auto-show if needed
 */
export function DashboardPasswordCheck() {
  return <ChangePasswordDialog />;
}
