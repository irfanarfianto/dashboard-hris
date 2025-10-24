import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mendapatkan user session dari Supabase
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Redirect ke login jika tidak ada user atau terjadi error
  if (error || !user) {
    redirect("/auth/login");
  }

  // Ambil user metadata jika ada
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0];

  // Get user role from database
  let userRole = "Employee"; // Default role
  let userPermissions: string[] = [];

  try {
    // Get user record to find employee_id
    const { data: userRecord } = await supabase
      .from("users")
      .select("employee_id, role_id")
      .eq("auth_user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (userRecord?.role_id) {
      // Get role name
      const { data: roleData } = await supabase
        .from("roles")
        .select("name")
        .eq("id", userRecord.role_id)
        .single();

      if (roleData?.name) {
        userRole = roleData.name;
      }

      // Get user permissions using database function
      const { data: permissionsData, error: permError } = await supabase.rpc(
        "get_user_permissions",
        {
          p_user_id: user.id,
        }
      );

      if (!permError && permissionsData) {
        // Extract permission names
        userPermissions = permissionsData.map(
          (p: { permission_name: string }) => p.permission_name
        );
      }
    }
  } catch (err) {
    console.error("Error fetching user role/permissions:", err);
    // Continue with default role and empty permissions
  }

  return (
    <DashboardLayoutClient
      userEmail={user.email}
      userName={userName}
      userRole={userRole}
      userPermissions={userPermissions}
    >
      {children}
    </DashboardLayoutClient>
  );
}
