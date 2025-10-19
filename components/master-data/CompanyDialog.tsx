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
import { createCompany, updateCompany } from "@/lib/actions/masterDataActions";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Company {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

interface CompanyDialogProps {
  mode: "create" | "edit";
  data?: Company;
  children: React.ReactNode;
}

export default function CompanyDialog({
  mode,
  data,
  children,
}: CompanyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: data?.name || "",
    code: data?.code || "",
    address: data?.address || "",
    phone: data?.phone || "",
    email: data?.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result =
        mode === "create"
          ? await createCompany(formData)
          : await updateCompany(data!.id, formData);

      if (result.success) {
        setIsOpen(false);
        router.refresh();
        // Reset form jika create
        if (mode === "create") {
          setFormData({
            name: "",
            code: "",
            address: "",
            phone: "",
            email: "",
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
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
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
                      ? "Tambah Perusahaan"
                      : "Edit Perusahaan"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "create"
                      ? "Tambahkan data perusahaan baru"
                      : "Perbarui data perusahaan"}
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
                      Nama Perusahaan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="PT. Contoh Perusahaan"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="code">
                      Kode Perusahaan <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="PTCP"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">
                      Alamat <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Jl. Contoh No. 123"
                      disabled={isLoading}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">
                      Telepon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="021-12345678"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="info@perusahaan.com"
                      disabled={isLoading}
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
