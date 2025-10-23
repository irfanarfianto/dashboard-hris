"use client";

import { useState, useEffect } from "react";
import { Loader2, Wifi } from "lucide-react";
import { toast } from "react-hot-toast";
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
import { upsertLocationWifi } from "@/lib/actions/locationActions";

interface LocationWifi {
  id: number;
  ssid_name: string;
  mac_address: string;
}

interface LocationWifiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: number;
  locationName: string;
  wifi?: LocationWifi | null;
  onSuccess: () => void;
}

export default function LocationWifiDialog({
  isOpen,
  onClose,
  locationId,
  locationName,
  wifi,
  onSuccess,
}: LocationWifiDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ssid_name: "",
    mac_address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!wifi;

  // Reset form when dialog opens with wifi data
  useEffect(() => {
    if (isOpen) {
      if (wifi) {
        setFormData({
          ssid_name: wifi.ssid_name,
          mac_address: wifi.mac_address,
        });
      } else {
        setFormData({
          ssid_name: "",
          mac_address: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, wifi]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ssid_name || formData.ssid_name.trim() === "") {
      newErrors.ssid_name = "SSID wajib diisi";
    }

    const bssidRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (!formData.mac_address || !bssidRegex.test(formData.mac_address)) {
      newErrors.mac_address =
        "Format mac_address tidak valid. Contoh: AA:BB:CC:DD:EE:FF";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format mac_address as user types
  const handleBssidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, "");

    // Add colons automatically
    if (value.length > 0) {
      const formatted = value.match(/.{1,2}/g)?.join(":") || value;
      setFormData((prev) => ({
        ...prev,
        mac_address: formatted.substring(0, 17), // Max length with colons
      }));
    } else {
      setFormData((prev) => ({ ...prev, mac_address: "" }));
    }

    // Clear error when user types
    if (errors.mac_address) {
      setErrors((prev) => ({ ...prev, mac_address: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      if (wifi?.id) {
        data.append("id", wifi.id.toString());
      }
      data.append("ssid_name", formData.ssid_name.trim());
      data.append("mac_address", formData.mac_address);

      const result = await upsertLocationWifi(locationId, data);

      if (result.success) {
        toast.success(result.message || "WiFi berhasil disimpan");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting wifi:", error);
      toast.error("Terjadi kesalahan saat menyimpan WiFi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-teal-600" />
            {isEdit ? "Edit WiFi Network" : "Tambah WiFi Network"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi WiFi network"
              : `Tambahkan WiFi network untuk ${locationName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SSID */}
          <div className="space-y-2">
            <Label htmlFor="ssid_name">
              SSID (Nama WiFi) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ssid_name"
              name="ssid_name"
              placeholder="Office_WiFi_5G"
              value={formData.ssid_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Nama jaringan WiFi yang terlihat oleh pengguna
            </p>
            {errors.ssid_name && (
              <p className="text-sm text-red-500">{errors.ssid_name}</p>
            )}
          </div>

          {/* mac_address */}
          <div className="space-y-2">
            <Label htmlFor="mac_address">
              mac_address (MAC Address) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mac_address"
              name="mac_address"
              placeholder="AA:BB:CC:DD:EE:FF"
              value={formData.mac_address}
              onChange={handleBssidChange}
              disabled={isSubmitting}
              maxLength={17}
              style={{ fontFamily: "monospace" }}
            />
            <p className="text-xs text-muted-foreground">
              MAC address unik dari access point WiFi
            </p>
            {errors.mac_address && (
              <p className="text-sm text-red-500">{errors.mac_address}</p>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3">
            <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
              💡 Tips: Cara mendapatkan mac_address
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc">
              <li>
                <strong>Android:</strong> Settings → WiFi → Tap connected
                network → mac_address
              </li>
              <li>
                <strong>iOS:</strong> Gunakan aplikasi &quot;WiFi Analyzer&quot;
                atau &quot;Network Analyzer&quot;
              </li>
              <li>
                <strong>Windows:</strong> CMD → ketik &quot;netsh wlan show
                interfaces&quot;
              </li>
              <li>
                <strong>Mac:</strong> Option + Click WiFi icon → mac_address
              </li>
            </ul>
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3">
            <p className="text-xs text-yellow-900 dark:text-yellow-100 font-medium mb-1">
              ⚠️ Penting
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              mac_address adalah identifier unik untuk setiap access point WiFi.
              Pastikan memasukkan mac_address yang benar untuk validasi presensi
              yang akurat.
            </p>
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
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Simpan Perubahan" : "Tambah WiFi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
