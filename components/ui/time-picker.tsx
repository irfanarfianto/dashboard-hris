"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  time?: string; // Format: "HH:mm"
  onTimeChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = "Pilih waktu",
  disabled = false,
  className,
}: TimePickerProps) {
  const [hours, setHours] = React.useState<string>(
    time ? time.split(":")[0] : "00"
  );
  const [minutes, setMinutes] = React.useState<string>(
    time ? time.split(":")[1] : "00"
  );

  const hoursList = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutesList = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const handleTimeSelect = (newHours: string, newMinutes: string) => {
    setHours(newHours);
    setMinutes(newMinutes);
    if (onTimeChange) {
      onTimeChange(`${newHours}:${newMinutes}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Hours */}
          <div className="flex flex-col border-r">
            <div className="px-4 py-2 text-center font-semibold text-sm border-b bg-muted">
              Jam
            </div>
            <div className="h-60 overflow-y-auto">
              {hoursList.map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleTimeSelect(hour, minutes)}
                  className={cn(
                    "w-full px-4 py-2 text-sm hover:bg-accent transition-colors",
                    hours === hour &&
                      "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="flex flex-col">
            <div className="px-4 py-2 text-center font-semibold text-sm border-b bg-muted">
              Menit
            </div>
            <div className="h-60 overflow-y-auto">
              {minutesList.map((minute) => (
                <button
                  key={minute}
                  onClick={() => handleTimeSelect(hours, minute)}
                  className={cn(
                    "w-full px-4 py-2 text-sm hover:bg-accent transition-colors",
                    minutes === minute &&
                      "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
