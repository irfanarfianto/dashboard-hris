"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 18;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={"sm"}
          className="h-9 w-9 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
        >
          {theme === "light" ? (
            <Sun
              key="light"
              size={ICON_SIZE}
              className="text-amber-500 dark:text-amber-400"
            />
          ) : theme === "dark" ? (
            <Moon
              key="dark"
              size={ICON_SIZE}
              className="text-indigo-500 dark:text-indigo-400"
            />
          ) : (
            <Laptop
              key="system"
              size={ICON_SIZE}
              className="text-teal-600 dark:text-teal-400"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem
            className="flex gap-2 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20"
            value="light"
          >
            <Sun size={ICON_SIZE} className="text-amber-500" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="flex gap-2 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20"
            value="dark"
          >
            <Moon size={ICON_SIZE} className="text-indigo-500" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            className="flex gap-2 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20"
            value="system"
          >
            <Laptop size={ICON_SIZE} className="text-teal-600" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
