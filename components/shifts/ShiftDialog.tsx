"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import {
  upsertWorkShift,
  bulkCreateWorkShift,
  getPositions,
} from "@/lib/actions/shiftActions";

interface Position {
  id: number;
  name: string;
  departments?: {
    id: number;
    name: string;
  } | null;
}

interface WorkShift {
  id: number;
  position_id: number;
  name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  is_regular: boolean;
  tolerance_minutes: number;
}

interface ShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shift: WorkShift | null;
  onSuccess: () => void;
}

export default function ShiftDialog({
  isOpen,
  onClose,
  shift,
  onSuccess,
}: ShiftDialogProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    position_id: "",
    name: "",
    start_time: "",
    end_time: "",
    duration_hours: "",
    is_regular: true,
    tolerance_minutes: "5",
  });

  // Load positions
  useEffect(() => {
    const loadPositions = async () => {
      const result = await getPositions();
      if (result.success && result.data) {
        setPositions(result.data as unknown as Position[]);
      }
    };
    loadPositions();
  }, []);

  // Initialize form when shift changes
  useEffect(() => {
    if (shift) {
      // Edit mode - disable multi-select
      setIsMultiSelect(false);
      setSelectedPositions([]);
      setFormData({
        position_id: shift.position_id.toString(),
        name: shift.name,
        start_time: shift.start_time.substring(0, 5), // HH:MM
        end_time: shift.end_time.substring(0, 5), // HH:MM
        duration_hours: shift.duration_hours.toString(),
        is_regular: shift.is_regular,
        tolerance_minutes: shift.tolerance_minutes.toString(),
      });
    } else {
      // Create mode - reset form
      setIsMultiSelect(false);
      setSelectedPositions([]);
      setFormData({
        position_id: "",
        name: "",
        start_time: "",
        end_time: "",
        duration_hours: "",
        is_regular: true,
        tolerance_minutes: "5",
      });
    }
  }, [shift, isOpen]);

  // Calculate duration when start_time or end_time changes
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const [startHour, startMinute] = formData.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = formData.end_time.split(":").map(Number);

      let durationHours = endHour - startHour;
      const durationMinutes = endMinute - startMinute;

      // Handle overnight shifts
      if (durationHours < 0) {
        durationHours += 24;
      }

      // Convert minutes to decimal hours
      const totalDuration = durationHours + durationMinutes / 60;

      setFormData((prev) => ({
        ...prev,
        duration_hours: totalDuration.toFixed(2),
      }));
    }
  }, [formData.start_time, formData.end_time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (isMultiSelect) {
      if (selectedPositions.length === 0) {
        toast.error("Pilih minimal 1 posisi");
        return;
      }
    } else {
      if (!formData.position_id) {
        toast.error("Posisi wajib dipilih");
        return;
      }
    }

    if (!formData.name) {
      toast.error("Nama shift wajib diisi");
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      toast.error("Waktu mulai dan selesai wajib diisi");
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();

    // Use different action based on mode
    if (isMultiSelect && !shift) {
      // Bulk create mode
      data.append("position_ids", selectedPositions.join(","));
      data.append("name", formData.name);
      data.append("start_time", formData.start_time + ":00");
      data.append("end_time", formData.end_time + ":00");
      data.append("duration_hours", formData.duration_hours);
      data.append("is_regular", formData.is_regular.toString());
      data.append("tolerance_minutes", formData.tolerance_minutes);

      try {
        const result = await bulkCreateWorkShift(data);

        if (result.success) {
          toast.success(
            result.message || "Shift berhasil dibuat untuk multiple posisi"
          );
          onSuccess();
          onClose();
        } else {
          toast.error(result.error || "Gagal membuat shift");
        }
      } catch (error) {
        console.error("Error bulk creating shift:", error);
        toast.error("Terjadi kesalahan saat membuat shift");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Single create/update mode
      if (shift?.id) {
        data.append("id", shift.id.toString());
      }
      data.append("position_id", formData.position_id);
      data.append("name", formData.name);
      data.append("start_time", formData.start_time + ":00");
      data.append("end_time", formData.end_time + ":00");
      data.append("duration_hours", formData.duration_hours);
      data.append("is_regular", formData.is_regular.toString());
      data.append("tolerance_minutes", formData.tolerance_minutes);

      try {
        const result = await upsertWorkShift(data);

        if (result.success) {
          toast.success(result.message || "Shift berhasil disimpan");
          onSuccess();
          onClose();
        } else {
          toast.error(result.error || "Gagal menyimpan shift");
        }
      } catch (error) {
        console.error("Error submitting shift:", error);
        toast.error("Terjadi kesalahan saat menyimpan shift");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            {shift ? "Edit Shift" : "Tambah Shift Baru"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {/* Multi-Select Toggle - Only in Create Mode */}
          {!shift && (
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex-1">
                <Label htmlFor="multi-select" className="text-sm font-medium">
                  Terapkan ke Multiple Posisi
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Aktifkan untuk membuat shift yang sama untuk beberapa posisi
                  sekaligus
                </p>
              </div>
              <Switch
                id="multi-select"
                checked={isMultiSelect}
                onCheckedChange={(checked) => {
                  setIsMultiSelect(checked);
                  if (checked) {
                    setFormData({ ...formData, position_id: "" });
                    setSelectedPositions([]);
                  }
                }}
              />
            </div>
          )}

          {/* Position Selection */}
          {isMultiSelect && !shift ? (
            // Multi-Select Checkboxes
            <div className="space-y-2">
              <Label>
                Pilih Posisi <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {selectedPositions.length} posisi dipilih
              </p>
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                {positions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Tidak ada posisi tersedia
                  </p>
                ) : (
                  positions.map((pos) => (
                    <div key={pos.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`position-${pos.id}`}
                        checked={selectedPositions.includes(pos.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPositions([
                              ...selectedPositions,
                              pos.id,
                            ]);
                          } else {
                            setSelectedPositions(
                              selectedPositions.filter((id) => id !== pos.id)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`position-${pos.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        <span className="font-medium">{pos.name}</span>
                        {pos.departments && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({pos.departments.name})
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              {selectedPositions.length > 0 && (
                <div className="flex items-center justify-between text-xs mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedPositions(positions.map((p) => p.id))
                    }
                  >
                    Pilih Semua
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPositions([])}
                  >
                    Batal Pilih
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Single Select Dropdown
            <div className="space-y-2">
              <Label htmlFor="position_id">
                Posisi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.position_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, position_id: value })
                }
                disabled={shift !== null} // Disable on edit
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih posisi" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id.toString()}>
                      {pos.name}
                      {pos.departments && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({pos.departments.name})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Shift <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Shift Pagi, Shift Siang, Shift Malam"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">
                Waktu Mulai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">
                Waktu Selesai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Duration (Auto-calculated) */}
          <div className="space-y-2">
            <Label htmlFor="duration_hours">
              Durasi (Jam){" "}
              <span className="text-gray-500 text-sm">- Auto-calculated</span>
            </Label>
            <Input
              id="duration_hours"
              type="number"
              step="0.01"
              value={formData.duration_hours}
              onChange={(e) =>
                setFormData({ ...formData, duration_hours: e.target.value })
              }
              placeholder="Durasi akan dihitung otomatis"
            />
          </div>

          {/* Tolerance */}
          <div className="space-y-2">
            <Label htmlFor="tolerance_minutes">
              Toleransi Keterlambatan (Menit)
            </Label>
            <Input
              id="tolerance_minutes"
              type="number"
              min="0"
              value={formData.tolerance_minutes}
              onChange={(e) =>
                setFormData({ ...formData, tolerance_minutes: e.target.value })
              }
            />
          </div>

          {/* Is Regular */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_regular">Shift Regular</Label>
              <p className="text-sm text-muted-foreground">
                Shift regular berlaku untuk karyawan tetap (Senin-Jumat)
              </p>
            </div>
            <Switch
              id="is_regular"
              checked={formData.is_regular}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, is_regular: checked })
              }
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
