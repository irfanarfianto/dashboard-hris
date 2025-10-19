"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/authActions";
import { LogOut } from "lucide-react";
import { useState } from "react";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  showIcon = true,
  className,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logoutAction();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      disabled={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
