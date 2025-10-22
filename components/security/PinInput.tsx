"use client";

import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function PinInput({
  value,
  onChange,
  onComplete,
  maxLength = 6,
  disabled = false,
  error = false,
  autoFocus = true,
}: PinInputProps) {
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array for individual boxes
  const values = value
    .split("")
    .concat(Array(maxLength - value.length).fill(""));

  useEffect(() => {
    // Auto-focus first input on mount
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow digits
    const digitValue = digit.replace(/\D/g, "");

    if (digitValue.length > 1) {
      // Handle paste
      handlePaste(digitValue);
      return;
    }

    // Update value
    const newValues = [...values];
    newValues[index] = digitValue;
    const newValue = newValues.join("").slice(0, maxLength);
    onChange(newValue);

    // Call onComplete if PIN is complete
    if (newValue.length === maxLength && onComplete) {
      onComplete(newValue);
    }

    // Auto-focus next input
    if (digitValue && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (!values[index]) {
        // If current box is empty, focus previous
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current box
        const newValues = [...values];
        newValues[index] = "";
        onChange(newValues.join("").replace(/\s/g, ""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (pasteValue: string) => {
    const digits = pasteValue.replace(/\D/g, "").slice(0, maxLength);
    onChange(digits);

    // Focus last filled input or last input
    const focusIndex = Math.min(digits.length, maxLength - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    handlePaste(pasteData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: maxLength }).map((_, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={values[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePasteEvent}
            disabled={disabled}
            className={`
              w-12 h-14 text-center text-2xl font-bold
              ${error ? "border-red-500 focus-visible:ring-red-500" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            aria-label={`PIN digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Show/Hide Toggle */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPin(!showPin)}
          disabled={disabled}
          className="text-xs text-muted-foreground"
        >
          {showPin ? (
            <>
              <EyeOff className="w-4 h-4 mr-1" />
              Sembunyikan PIN
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-1" />
              Tampilkan PIN
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
