"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Crosshair } from "lucide-react";
import toast from "react-hot-toast";

// Fix Leaflet default marker icon issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  radius?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

export default function MapPicker({
  latitude,
  longitude,
  radius = 100,
  onLocationSelect,
  height = "400px",
}: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Helper function to update circle
  const updateCircle = (lat: number, lng: number) => {
    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
    } else if (mapRef.current) {
      const circle = L.circle([lat, lng], {
        color: "#0ea5e9",
        fillColor: "#0ea5e9",
        fillOpacity: 0.2,
        radius: radius,
      }).addTo(mapRef.current);

      circleRef.current = circle;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default to Jakarta if no coordinates provided
    const defaultLat = latitude || -6.2088;
    const defaultLng = longitude || 106.8456;

    // Create map
    const map = L.map(mapContainerRef.current).setView(
      [defaultLat, defaultLng],
      15
    );

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker if coordinates exist
    if (latitude && longitude) {
      const marker = L.marker([latitude, longitude], {
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onLocationSelect(position.lat, position.lng);
        updateCircle(position.lat, position.lng);
      });

      markerRef.current = marker;

      // Add radius circle
      const circle = L.circle([latitude, longitude], {
        color: "#0ea5e9",
        fillColor: "#0ea5e9",
        fillOpacity: 0.2,
        radius: radius,
      }).addTo(map);

      circleRef.current = circle;
    }

    // Click on map to add/move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!markerRef.current) {
        // Create new marker
        const marker = L.marker([lat, lng], {
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const position = marker.getLatLng();
          onLocationSelect(position.lat, position.lng);
          updateCircle(position.lat, position.lng);
        });

        markerRef.current = marker;

        // Create circle
        const circle = L.circle([lat, lng], {
          color: "#0ea5e9",
          fillColor: "#0ea5e9",
          fillOpacity: 0.2,
          radius: radius,
        }).addTo(map);

        circleRef.current = circle;
      } else {
        // Move existing marker
        markerRef.current.setLatLng([lat, lng]);
        updateCircle(lat, lng);
      }

      onLocationSelect(lat, lng);
    });

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update marker and circle when coordinates change
  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      updateCircle(latitude, longitude);
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  // Update circle radius when radius changes
  useEffect(() => {
    if (circleRef.current && latitude && longitude) {
      circleRef.current.setRadius(radius);
    }
  }, [radius, latitude, longitude]);

  const getCurrentLocation = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      setIsLocating(false);
      return;
    }

    // Check permission state first (if supported)
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          console.log("Permission state:", permissionStatus.state);

          if (permissionStatus.state === "denied") {
            toast.error(
              "Izin lokasi ditolak. Klik ikon 🔒 di address bar → Site Settings → Location → Allow",
              { duration: 6000 }
            );
            setIsLocating(false);
            return;
          }

          // Proceed with geolocation
          requestLocation();
        })
        .catch((err) => {
          console.log("Permission query not supported:", err);
          // Fallback: try anyway
          requestLocation();
        });
    } else {
      // Permissions API not supported, try anyway
      requestLocation();
    }
  };

  const requestLocation = () => {
    // Options untuk geolocation
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);

          if (!markerRef.current) {
            const marker = L.marker([lat, lng], {
              draggable: true,
            }).addTo(mapRef.current);

            marker.on("dragend", () => {
              const pos = marker.getLatLng();
              onLocationSelect(pos.lat, pos.lng);
              updateCircle(pos.lat, pos.lng);
            });

            markerRef.current = marker;

            const circle = L.circle([lat, lng], {
              color: "#0ea5e9",
              fillColor: "#0ea5e9",
              fillOpacity: 0.2,
              radius: radius,
            }).addTo(mapRef.current);

            circleRef.current = circle;
          } else {
            markerRef.current.setLatLng([lat, lng]);
            updateCircle(lat, lng);
          }

          onLocationSelect(lat, lng);
          toast.success("Lokasi berhasil terdeteksi!");
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Izin lokasi ditolak. Periksa pengaturan browser Anda dan pastikan menggunakan HTTPS.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Informasi lokasi tidak tersedia. Pastikan GPS/WiFi aktif dan coba lagi.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Permintaan lokasi timeout (10 detik). Coba lagi atau gunakan input manual.";
            break;
          default:
            errorMessage =
              "Gagal mendapatkan lokasi. Coba lagi atau gunakan input manual.";
        }

        // Log detailed error for debugging
        console.error("Geolocation error details:", {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT,
        });

        toast.error(errorMessage);
        setIsLocating(false);
      },
      options
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Klik pada peta atau drag marker untuk memilih lokasi</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLocating}
          title="Deteksi lokasi Anda saat ini (memerlukan izin browser)"
        >
          <Crosshair className="mr-2 h-4 w-4" />
          {isLocating ? "Mencari..." : "Gunakan Lokasi Saya"}
        </Button>
      </div>

      {/* Alert untuk permission denied */}
      <div className="text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-2">
        <p className="text-amber-900 dark:text-amber-100">
          <span className="font-medium">💡 Tips Izin Lokasi:</span>
        </p>
        <ul className="text-amber-700 dark:text-amber-300 mt-1 ml-4 list-disc space-y-0.5">
          <li>
            Klik ikon 🔒 di address bar → Site Settings → Location → Allow
          </li>
          <li>Pastikan menggunakan HTTPS (https://...)</li>
          <li>Enable Location Services di sistem operasi Anda</li>
          <li>
            Jika gagal, gunakan input manual dengan koordinat dari Google Maps
          </li>
        </ul>
      </div>

      <Card className="overflow-hidden">
        <div
          ref={mapContainerRef}
          style={{ height, width: "100%" }}
          className="z-0"
        />
      </Card>

      <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-2">
        <p>
          💡 <span className="font-medium">Tips:</span> Marker bisa di-drag
          untuk penyesuaian presisi. Circle biru menunjukkan area radius untuk
          geofencing.
        </p>
      </div>
    </div>
  );
}
