"use client";

import { useState, useEffect, Fragment } from "react";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Wifi,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import LocationDialog from "@/components/locations/LocationDialog";
import LocationWifiDialog from "@/components/locations/LocationWifiDialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  getLocations,
  deleteLocation,
  deleteLocationWifi,
} from "@/lib/actions/locationActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LocationWifi {
  id: number;
  ssid_name: string;
  mac_address: string;
}

interface Company {
  id: number;
  name: string;
  code: string;
}

interface Location {
  id: number;
  company_id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  companies?: Company;
  location_wifis?: LocationWifi[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  // Dialog states
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [wifiDialogOpen, setWifiDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteWifiDialogOpen, setDeleteWifiDialogOpen] = useState(false);

  // Selected items
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedWifi, setSelectedWifi] = useState<LocationWifi | null>(null);
  const [selectedLocationForWifi, setSelectedLocationForWifi] =
    useState<Location | null>(null);

  // Delete states
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const result = await getLocations();
      if (result.success && result.data) {
        setLocations(result.data);
      } else {
        toast.error("Gagal memuat data lokasi");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (locationId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId);
    } else {
      newExpanded.add(locationId);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddLocation = () => {
    setSelectedLocation(null);
    setLocationDialogOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setLocationDialogOpen(true);
  };

  const handleDeleteLocation = (location: Location) => {
    setSelectedLocation(location);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!selectedLocation) return;

    setIsDeleting(true);
    try {
      const result = await deleteLocation(selectedLocation.id);
      if (result.success) {
        toast.success(result.message || "Lokasi berhasil dihapus");
        fetchLocations();
        setDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "Gagal menghapus lokasi");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Terjadi kesalahan saat menghapus lokasi");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddWifi = (location: Location) => {
    setSelectedLocationForWifi(location);
    setSelectedWifi(null);
    setWifiDialogOpen(true);
  };

  const handleEditWifi = (location: Location, wifi: LocationWifi) => {
    setSelectedLocationForWifi(location);
    setSelectedWifi(wifi);
    setWifiDialogOpen(true);
  };

  const handleDeleteWifi = (location: Location, wifi: LocationWifi) => {
    setSelectedLocationForWifi(location);
    setSelectedWifi(wifi);
    setDeleteWifiDialogOpen(true);
  };

  const confirmDeleteWifi = async () => {
    if (!selectedWifi) return;

    setIsDeleting(true);
    try {
      const result = await deleteLocationWifi(selectedWifi.id);
      if (result.success) {
        toast.success(result.message || "WiFi berhasil dihapus");
        fetchLocations();
        setDeleteWifiDialogOpen(false);
      } else {
        toast.error(result.error || "Gagal menghapus WiFi");
      }
    } catch (error) {
      console.error("Error deleting wifi:", error);
      toast.error("Terjadi kesalahan saat menghapus WiFi");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lokasi & WiFi</h1>
          <p className="text-muted-foreground">
            Manajemen lokasi kantor dan jaringan WiFi untuk geofencing
          </p>
        </div>
        <Button onClick={handleAddLocation}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Lokasi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lokasi</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">
              Lokasi kantor terdaftar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total WiFi Network
            </CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce(
                (sum, loc) => sum + (loc.location_wifis?.length || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Jaringan WiFi terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lokasi</CardTitle>
          <CardDescription>
            Kelola lokasi kantor dan WiFi network untuk sistem geofencing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Memuat data...
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Belum ada lokasi terdaftar
              </p>
              <Button onClick={handleAddLocation}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Lokasi Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nama Lokasi</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Koordinat</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>WiFi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => {
                  const isExpanded = expandedRows.has(location.id);
                  const wifiCount = location.location_wifis?.length || 0;

                  return (
                    <Fragment key={location.id}>
                      <TableRow>
                        <TableCell>
                          {wifiCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRow(location.id)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {location.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {location.companies?.name || "N/A"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {location.companies?.code || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {location.latitude.toFixed(6)},
                          <br />
                          {location.longitude.toFixed(6)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {location.radius_meter}m
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={wifiCount > 0 ? "default" : "outline"}
                            >
                              {wifiCount} WiFi
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddWifi(location)}
                              className="h-7 px-2"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLocation(location)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLocation(location)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded WiFi Row */}
                      {isExpanded && wifiCount > 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/50 p-0">
                            <div className="p-4">
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Wifi className="h-4 w-4" />
                                WiFi Networks
                              </h4>
                              <div className="space-y-2">
                                {location.location_wifis?.map((wifi) => (
                                  <div
                                    key={wifi.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-background"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">
                                        {wifi.ssid_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        mac_address: {wifi.mac_address}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleEditWifi(location, wifi)
                                        }
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteWifi(location, wifi)
                                        }
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <LocationDialog
        isOpen={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        location={selectedLocation}
        onSuccess={fetchLocations}
      />

      {selectedLocationForWifi && (
        <LocationWifiDialog
          isOpen={wifiDialogOpen}
          onClose={() => setWifiDialogOpen(false)}
          locationId={selectedLocationForWifi.id}
          locationName={selectedLocationForWifi.name}
          wifi={selectedWifi}
          onSuccess={fetchLocations}
        />
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteLocation}
        title="Hapus Lokasi"
        description="Apakah Anda yakin ingin menghapus lokasi ini?"
        itemName={selectedLocation?.name || ""}
        isDeleting={isDeleting}
      />

      <DeleteConfirmDialog
        isOpen={deleteWifiDialogOpen}
        onClose={() => setDeleteWifiDialogOpen(false)}
        onConfirm={confirmDeleteWifi}
        title="Hapus WiFi Network"
        description="Apakah Anda yakin ingin menghapus WiFi network ini?"
        itemName={selectedWifi?.ssid_name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
