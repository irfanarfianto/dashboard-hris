import { LoginForm } from "@/components/login-form";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 dark:from-gray-950 dark:via-teal-950/20 dark:to-lime-950/20">
      {/* Theme Switcher - Floating top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
