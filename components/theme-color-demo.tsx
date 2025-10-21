"use client";

import { useThemeColor } from "@/components/providers/theme-color-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ThemeColorDemo() {
  const { themeColor } = useThemeColor();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Theme Color Demo</CardTitle>
        <CardDescription>
          Current theme: <strong className="text-primary">{themeColor}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Primary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="p-4 rounded-md bg-primary text-primary-foreground">
          <p className="font-medium">Primary Background</p>
          <p className="text-sm opacity-90">
            This section uses primary color as background
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-primary rounded-full" />
          </div>
          <span className="text-sm text-muted-foreground">Progress Bar</span>
        </div>
      </CardContent>
    </Card>
  );
}
