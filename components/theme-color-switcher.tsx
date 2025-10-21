"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeColor } from "@/components/providers/theme-color-provider";
import { themeColors } from "@/lib/theme-colors";
import { cn } from "@/lib/utils";

export function ThemeColorSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { themeColor, setThemeColor } = useThemeColor();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleColorChange = (color: typeof themeColor) => {
    console.log("Changing theme color to:", color);
    setThemeColor(color);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Pilih warna tema</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Pilih warna tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Warna Tema</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-1 p-2">
          {themeColors.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => handleColorChange(theme.value)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-2",
                themeColor === theme.value && "bg-accent"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="h-6 w-6 rounded-full border-2 border-border"
                  style={{
                    backgroundColor: `hsl(${theme.light.primary})`,
                  }}
                />
                <span className="flex-1">{theme.name}</span>
                {themeColor === theme.value && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
