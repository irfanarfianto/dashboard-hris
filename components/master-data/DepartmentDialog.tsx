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
  createDepartment,
  updateDepartment,
  getCompanies,
} from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Department {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  companies?: {
    name: string;
  } | null;
}

interface Company {
  id: number;
  name: string;
}

interface DepartmentDialogProps {
  mode: "create" | "edit";
  data?: Department;
  children: React.ReactNode;
}

export default function DepartmentDialog({
  mode,
  data,
  children,
}: DepartmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    company_id: data?.company_id || 0,
    name: data?.name || "",
    description: data?.description || "",
  });

  // Load companies saat dialog dibuka
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  const loadCompanies = async () => {
    const result = await getCompanies();
    if (result.success) {
      setCompanies(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.company_id === 0) {
      setError("Pilih perusahaan terlebih dahulu");
      setIsLoading(false);
      return;
    }

    try {
      const result =
        mode === "create"
          ? await createDepartment(formData)
          : await updateDepartment(data!.id, formData);

      if (result.success) {
        setIsOpen(false);
        router.refresh();
        // Reset form jika create
        if (mode === "create") {
          setFormData({
            company_id: 0,
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
        company_id: data.company_id,
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
                    {mode === "create"
                      ? "Tambah Departemen"
                      : "Edit Departemen"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "create"
                      ? "Tambahkan data departemen baru"
                      : "Perbarui data departemen"}
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
                    <Label htmlFor="company_id">
                      Perusahaan <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="company_id"
                      required
                      value={formData.company_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_id: parseInt(e.target.value),
                        })
                      }
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={0}>Pilih Perusahaan</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Nama Departemen <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="IT, Finance, HR, dll"
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
                      placeholder="Deskripsi departemen (opsional)"
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
                  <Button type="submit" disabled={isLoading}>
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
