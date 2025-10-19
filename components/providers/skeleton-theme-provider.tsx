"use client";

import { SkeletonTheme } from "react-loading-skeleton";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function SkeletonThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of unstyled skeleton
  if (!mounted) {
    return <>{children}</>;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <SkeletonTheme
      baseColor={isDark ? "#1f2937" : "#e5e7eb"}
      highlightColor={isDark ? "#374151" : "#f3f4f6"}
      borderRadius="0.5rem"
      duration={1.5}
    >
      {children}
    </SkeletonTheme>
  );
}
