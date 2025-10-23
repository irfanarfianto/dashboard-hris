"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createWorkShift,
  updateWorkShift,
} from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface WorkShift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_regular: boolean;
}

interface WorkShiftDialogProps {
  mode: "create" | "edit";
  data?: WorkShift;
  children: React.ReactNode;
}

export default function WorkShiftDialog({
  mode,
  data,
  children,
}: WorkShiftDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: data?.name || "",
    start_time: data?.start_time || "",
    end_time: data?.end_time || "",
    is_regular: data?.is_regular ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result =
        mode === "create"
          ? await createWorkShift(formData)
          : await updateWorkShift(data!.id, formData);

      if (result.success) {
        setIsOpen(false);
        router.refresh();
        // Reset form jika create
        if (mode === "create") {
          setFormData({
            name: "",
            start_time: "",
            end_time: "",
            is_regular: true,
          });
        }
      } else {
        setError(result.error || "Terjadi kesalahan");
      }
    } catch {
      setError("Terjadi kesalahan yang tidak terduga");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    // Reset form ke data awal
    if (mode === "edit" && data) {
      setFormData({
        name: data.name,
        start_time: data.start_time,
        end_time: data.end_time,
        is_regular: data.is_regular,
      });
    }
  };

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {mode === "create"
                      ? "Tambah Shift Kerja"
                      : "Edit Shift Kerja"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "create"
                      ? "Tambahkan data shift kerja baru"
                      : "Perbarui data shift kerja"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Nama Shift <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Pagi, Siang, Malam, dll"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_time">
                        Jam Mulai <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="start_time"
                        type="time"
                        required
                        value={formData.start_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_time: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="end_time">
                        Jam Selesai <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="end_time"
                        type="time"
                        required
                        value={formData.end_time}
                        onChange={(e) =>
                          setFormData({ ...formData, end_time: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_regular"
                      checked={formData.is_regular}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_regular: checked as boolean,
                        })
                      }
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="is_regular"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Shift Regular
                    </Label>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/20 dark:text-blue-300">
                    <p className="font-medium">💡 Informasi:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>
                        • <strong>Shift Regular:</strong> Shift kerja normal
                        (Senin-Jumat)
                      </li>
                      <li>
                        • <strong>Shift Non-Regular:</strong> Shift khusus
                        (malam, weekend, dll)
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                  >
                    {isLoading ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
