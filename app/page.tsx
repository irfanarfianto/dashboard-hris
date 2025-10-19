import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check apakah user sudah login
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika sudah login, redirect ke dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Jika belum login, redirect ke halaman login
  redirect("/auth/login");
}
