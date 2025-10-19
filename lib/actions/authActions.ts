"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Server Action untuk handle logout pengguna
 * Menghapus sesi Supabase dan redirect ke halaman login
 */
export async function logoutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error during logout:", error.message);
    throw new Error("Gagal melakukan logout");
  }

  // Revalidate semua path untuk clear cache
  revalidatePath("/", "layout");

  // Redirect ke halaman login
  redirect("/auth/login");
}

/**
 * Server Action untuk mendapatkan user session saat ini
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error.message);
    return null;
  }

  return user;
}
