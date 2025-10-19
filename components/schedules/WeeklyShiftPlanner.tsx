"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2, Copy, Trash2 } from "lucide-react";
import {
  createWeeklySchedule,
  copyWeeklySchedule,
  deleteEmployeeSchedulesInRange,
} from "@/lib/actions/shiftScheduleActions";
import {
  getWeekRange,
  formatDateIndonesian,
  getShiftBadgeColor,
} from "@/lib/utils/shiftSchedule";

interface WeeklyShiftPlannerProps {
  employeeId: number;
  employeeName: string;
  workShifts: Array<{
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  }>;
  currentWeekStart?: string;
  onSuccess?: () => void;
}

export default function WeeklyShiftPlanner({
  employeeId,
  employeeName,
  workShifts,
  currentWeekStart,
  onSuccess,
}: WeeklyShiftPlannerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Week navigation
  const [weekStart, setWeekStart] = useState(
    currentWeekStart || getMonday(new Date())
  );
  const weekRange = getWeekRange(weekStart);

  // Selected shifts untuk setiap hari
  const [selectedShifts, setSelectedShifts] = useState<{
    monday: number | undefined;
    tuesday: number | undefined;
    wednesday: number | undefined;
    thursday: number | undefined;
    friday: number | undefined;
    saturday: number | undefined;
    sunday: number | undefined;
  }>({
    monday: undefined,
    tuesday: undefined,
    wednesday: undefined,
    thursday: undefined,
    friday: undefined,
    saturday: undefined,
    sunday: undefined,
  });

  const [notes, setNotes] = useState("");

  const days = [
    { key: "monday" as const, label: "Senin", date: weekRange.start },
    {
      key: "tuesday" as const,
      label: "Selasa",
      date: addDays(weekRange.start, 1),
    },
    {
      key: "wednesday" as const,
      label: "Rabu",
      date: addDays(weekRange.start, 2),
    },
    {
      key: "thursday" as const,
      label: "Kamis",
      date: addDays(weekRange.start, 3),
    },
    {
      key: "friday" as const,
      label: "Jumat",
      date: addDays(weekRange.start, 4),
    },
    {
      key: "saturday" as const,
      label: "Sabtu",
      date: addDays(weekRange.start, 5),
    },
    {
      key: "sunday" as const,
      label: "Minggu",
      date: addDays(weekRange.start, 6),
    },
  ];

  // Helper: Get Monday
  function getMonday(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  }

  // Helper: Add days to date
  function addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  // Submit jadwal
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await createWeeklySchedule({
        employee_id: employeeId,
        week_start: weekStart,
        shifts: selectedShifts,
        notes: notes || undefined,
      });

      if (result.success) {
        alert("Jadwal shift berhasil disimpan!");
        resetForm();
        onSuccess?.();
      } else {
        alert(result.error || "Gagal menyimpan jadwal shift");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy dari minggu sebelumnya
  const handleCopyPreviousWeek = async () => {
    setIsCopying(true);

    try {
      const previousWeek = addDays(weekStart, -7);

      const result = await copyWeeklySchedule(
        employeeId,
        previousWeek,
        weekStart
      );

      if (result.success) {
        alert(result.message || "Jadwal berhasil disalin!");
        onSuccess?.();
      } else {
        alert(result.error || "Gagal menyalin jadwal");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyalin");
      console.error(error);
    } finally {
      setIsCopying(false);
    }
  };

  // Clear jadwal minggu ini
  const handleClearWeek = async () => {
    if (
      !confirm(
        "Hapus semua jadwal shift untuk minggu ini? Tindakan ini tidak bisa dibatalkan."
      )
    ) {
      return;
    }

    setIsClearing(true);

    try {
      const result = await deleteEmployeeSchedulesInRange(
        employeeId,
        weekRange.start,
        weekRange.end
      );

      if (result.success) {
        alert("Jadwal berhasil dihapus!");
        resetForm();
        onSuccess?.();
      } else {
        alert(result.error || "Gagal menghapus jadwal");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const resetForm = () => {
    setSelectedShifts({
      monday: undefined,
      tuesday: undefined,
      wednesday: undefined,
      thursday: undefined,
      friday: undefined,
      saturday: undefined,
      sunday: undefined,
    });
    setNotes("");
  };

  // Navigate week
  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const goToCurrentWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Jadwal Shift Mingguan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {employeeName}
          </p>
        </div>
        <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
      </div>

      {/* Week Navigation */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
        >
          ← Minggu Lalu
        </Button>
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatDateIndonesian(weekRange.start)} -{" "}
            {formatDateIndonesian(weekRange.end)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToCurrentWeek}
        >
          Minggu Ini
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
        >
          Minggu Depan →
        </Button>
      </div>

      {/* Daily Shift Selection */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => {
          const selectedShiftId = selectedShifts[day.key];
          const selectedShift = workShifts.find(
            (s) => s.id === selectedShiftId
          );

          return (
            <div
              key={day.key}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800"
            >
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                {day.label}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {new Date(day.date).getDate()}{" "}
                {new Date(day.date).toLocaleDateString("id-ID", {
                  month: "short",
                })}
              </p>

              <select
                value={selectedShifts[day.key] || ""}
                onChange={(e) =>
                  setSelectedShifts({
                    ...selectedShifts,
                    [day.key]: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 focus:border-teal-500 focus:ring-teal-500"
              >
                <option value="">-- Default --</option>
                {workShifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </select>

              {selectedShift && (
                <div
                  className={`mt-2 text-xs px-2 py-1 rounded ${getShiftBadgeColor(
                    selectedShift.name
                  )}`}
                >
                  {selectedShift.start_time.substring(0, 5)} -{" "}
                  {selectedShift.end_time.substring(0, 5)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          Catatan (Opsional)
        </Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder="Catatan untuk jadwal minggu ini..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Jadwal"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleCopyPreviousWeek}
          disabled={isCopying}
        >
          {isCopying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyalin...
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Salin Minggu Lalu
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleClearWeek}
          disabled={isClearing}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          {isClearing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menghapus...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Minggu Ini
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ℹ️ <strong>Catatan:</strong> Biarkan dropdown &quot;-- Default
          --&quot; jika ingin menggunakan shift default karyawan untuk hari
          tersebut.
        </p>
      </div>
    </div>
  );
}
