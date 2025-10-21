"use client";

import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Bell, User, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  userEmail?: string;
  userName?: string;
  onMenuClick?: () => void;
}

export default function DashboardHeader({
  userEmail,
  userName,
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 md:px-6 dark:bg-gray-950/80 shadow-sm">
      {/* Left Section - Hamburger & Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger Button - Only visible on mobile */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 hover:bg-teal-50 dark:hover:bg-teal-900/20"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        )}

        <h1 className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-lime-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-lime-400">
          Dashboard
        </h1>
      </div>

      {/* Right Section - Theme Switcher, Notifications & User Menu */}
      <div className="flex items-center gap-2">
        {/* Theme Mode Switcher (Light/Dark) */}
        <ThemeSwitcher />

        {/* Notification Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 hover:bg-teal-50 dark:hover:bg-teal-900/20"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white dark:border-gray-950">
            3
          </Badge>
        </Button>

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 hover:bg-teal-50 dark:hover:bg-teal-900/20"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500 shadow-md">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userName || "Admin"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {userEmail || "admin@example.com"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{userName || "Admin"}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {userEmail}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Bell className="mr-2 h-4 w-4" />
              Notifikasi
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutButton variant="ghost" className="w-full justify-start" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
