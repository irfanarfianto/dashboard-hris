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

  return (
    <DashboardLayoutClient userEmail={user.email} userName={userName}>
      {children}
    </DashboardLayoutClient>
  );
}
