"use client";

import { useState, useEffect } from "react";
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
import {
  createPosition,
  updatePosition,
  getDepartments,
  getPositionLevels,
} from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Position {
  id: number;
  department_id: number;
  level_id: number;
  name: string;
  description: string | null;
  departments?: {
    name: string;
    companies?: {
      name: string;
    } | null;
  } | null;
  position_levels?: {
    name: string;
    rank_order: number;
  } | null;
}

interface Department {
  id: number;
  name: string;
  companies: {
    name: string;
  } | null;
}

interface PositionLevel {
  id: number;
  name: string;
  rank_order: number;
}

interface PositionDialogProps {
  mode: "create" | "edit";
  data?: Position;
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function PositionDialog({
  mode,
  data,
  children,
  onSuccess,
}: PositionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positionLevels, setPositionLevels] = useState<PositionLevel[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    department_id: data?.department_id || 0,
    level_id: data?.level_id || 0,
    name: data?.name || "",
    description: data?.description || "",
  });

  // Load departments dan position levels saat dialog dibuka
  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      loadPositionLevels();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    const result = await getDepartments();
    if (result.success) {
      setDepartments(result.data);
    }
  };

  const loadPositionLevels = async () => {
    const result = await getPositionLevels();
    if (result.success) {
      setPositionLevels(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.department_id === 0) {
      setError("Pilih departemen terlebih dahulu");
      setIsLoading(false);
      return;
    }

    if (formData.level_id === 0) {
      setError("Pilih level jabatan terlebih dahulu");
      setIsLoading(false);
      return;
    }

    try {
      const result =
        mode === "create"
          ? await createPosition(formData)
          : await updatePosition(data!.id, formData);

      if (result.success) {
        setIsOpen(false);

        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }

        // Reset form jika create
        if (mode === "create") {
          setFormData({
            department_id: 0,
            level_id: 0,
            name: "",
            description: "",
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
        department_id: data.department_id,
        level_id: data.level_id,
        name: data.name,
        description: data.description || "",
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
                    {mode === "create" ? "Tambah Posisi" : "Edit Posisi"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "create"
                      ? "Tambahkan data posisi/jabatan baru"
                      : "Perbarui data posisi/jabatan"}
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
                    <Label htmlFor="department_id">
                      Departemen <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="department_id"
                      required
                      value={formData.department_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department_id: parseInt(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={0}>Pilih Departemen</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}{" "}
                          {dept.companies && `- ${dept.companies.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="level_id">
                      Level Jabatan <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="level_id"
                      required
                      value={formData.level_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level_id: parseInt(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={0}>Pilih Level</option>
                      {positionLevels
                        .sort((a, b) => a.rank_order - b.rank_order)
                        .map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name} (Rank: {level.rank_order})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Nama Posisi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Manager, Staff, Supervisor, dll"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Deskripsi posisi (opsional)"
                      disabled={isLoading}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
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
