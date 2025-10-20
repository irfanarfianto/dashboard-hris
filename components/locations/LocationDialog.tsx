"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertLocation, getCompanies } from "@/lib/actions/locationActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

// Dynamic import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/locations/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-muted rounded-md">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface Location {
  id: number;
  company_id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
}

interface Company {
  id: number;
  name: string;
  code: string;
}

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null;
  onSuccess: () => void;
}

export default function LocationDialog({
  isOpen,
  onClose,
  location,
  onSuccess,
}: LocationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    company_id: "",
    name: "",
    latitude: "",
    longitude: "",
    radius_meter: "100",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!location;

  // Fetch companies when dialog opens
  useEffect(() => {
    if (isOpen && !isEdit) {
      fetchCompanies();
    }
  }, [isOpen, isEdit]);

  // Reset form when dialog opens with location data
  useEffect(() => {
    if (isOpen) {
      if (location) {
        setFormData({
          company_id: location.company_id.toString(),
          name: location.name,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          radius_meter: location.radius_meter.toString(),
        });
      } else {
        setFormData({
          company_id: "",
          name: "",
          latitude: "",
          longitude: "",
          radius_meter: "100",
        });
      }
      setErrors({});
    }
  }, [isOpen, location]);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const result = await getCompanies();
      if (result.success && result.data) {
        setCompanies(result.data);
        // Auto-select if only one company exists
        if (result.data.length === 1) {
          setFormData((prev) => ({
            ...prev,
            company_id: result.data![0].id.toString(),
          }));
        }
      } else {
        toast.error(result.error || "Gagal memuat data perusahaan");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Terjadi kesalahan saat memuat perusahaan");
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isEdit && (!formData.company_id || formData.company_id === "")) {
      newErrors.company_id = "Perusahaan wajib dipilih";
    }

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = "Nama lokasi minimal 3 karakter";
    }

    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = "Latitude harus antara -90 dan 90";
    }

    const lng = parseFloat(formData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = "Longitude harus antara -180 dan 180";
    }

    const radius = parseFloat(formData.radius_meter);
    if (isNaN(radius) || radius <= 0) {
      newErrors.radius_meter = "Radius harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      if (location?.id) {
        data.append("id", location.id.toString());
      }
      // Add company_id for new locations
      if (!isEdit && formData.company_id) {
        data.append("company_id", formData.company_id);
      }
      data.append("name", formData.name.trim());
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      data.append("radius_meter", formData.radius_meter);

      const result = await upsertLocation(data);

      if (result.success) {
        toast.success(result.message || "Lokasi berhasil disimpan");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting location:", error);
      toast.error("Terjadi kesalahan saat menyimpan lokasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600" />
            {isEdit ? "Edit Lokasi" : "Tambah Lokasi Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi lokasi kantor"
              : "Tambahkan lokasi kantor baru dengan koordinat GPS"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Selection - Only for new locations */}
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="company_id">
                Perusahaan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, company_id: value }));
                  if (errors.company_id) {
                    setErrors((prev) => ({ ...prev, company_id: "" }));
                  }
                }}
                disabled={isSubmitting || isLoadingCompanies}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih perusahaan..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name} ({company.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company_id && (
                <p className="text-sm text-red-500">{errors.company_id}</p>
              )}
            </div>
          )}

          {/* Nama Lokasi */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Lokasi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Kantor Pusat Jakarta"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Map Picker with Tabs */}
          <div className="space-y-2">
            <Label>
              Koordinat Lokasi <span className="text-red-500">*</span>
            </Label>
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map">📍 Pilih di Peta</TabsTrigger>
                <TabsTrigger value="manual">⌨️ Input Manual</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-4">
                <MapPicker
                  latitude={
                    formData.latitude
                      ? parseFloat(formData.latitude)
                      : undefined
                  }
                  longitude={
                    formData.longitude
                      ? parseFloat(formData.longitude)
                      : undefined
                  }
                  radius={
                    formData.radius_meter
                      ? parseFloat(formData.radius_meter)
                      : 100
                  }
                  onLocationSelect={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat.toFixed(6),
                      longitude: lng.toFixed(6),
                    }));
                    // Clear errors
                    if (errors.latitude) {
                      setErrors((prev) => ({ ...prev, latitude: "" }));
                    }
                    if (errors.longitude) {
                      setErrors((prev) => ({ ...prev, longitude: "" }));
                    }
                  }}
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">
                      Latitude <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="text"
                      placeholder="-6.200000"
                      value={formData.latitude}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Rentang: -90 hingga 90
                    </p>
                    {errors.latitude && (
                      <p className="text-sm text-red-500">{errors.latitude}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">
                      Longitude <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="text"
                      placeholder="106.816666"
                      value={formData.longitude}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Rentang: -180 hingga 180
                    </p>
                    {errors.longitude && (
                      <p className="text-sm text-red-500">{errors.longitude}</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-2 mt-4">
                  <p className="font-medium mb-1">
                    💡 Tips: Cara mendapatkan koordinat GPS
                  </p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Buka Google Maps di browser</li>
                    <li>Klik kanan pada lokasi yang diinginkan</li>
                    <li>Koordinat akan muncul di bagian atas</li>
                    <li>
                      Format: latitude, longitude (contoh: -6.200000,
                      106.816666)
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <Label htmlFor="radius_meter">
              Radius (meter) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="radius_meter"
              name="radius_meter"
              type="text"
              placeholder="100"
              value={formData.radius_meter}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Area radius untuk validasi presensi dalam meter. Circle biru pada
              peta menunjukkan area geofencing.
            </p>
            {errors.radius_meter && (
              <p className="text-sm text-red-500">{errors.radius_meter}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Simpan Perubahan" : "Tambah Lokasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
