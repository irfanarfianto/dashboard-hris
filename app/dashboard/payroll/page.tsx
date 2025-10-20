import { Wallet, DollarSign, Receipt, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Penggajian</h1>
        <p className="text-muted-foreground">
          Manajemen penggajian dan komponen gaji karyawan
        </p>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-lime-500">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fitur Dalam Pengembangan</CardTitle>
          <CardDescription className="text-base">
            Modul penggajian sedang dikembangkan dan akan segera hadir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-4">
              <DollarSign className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Komponen Gaji</h4>
                <p className="text-xs text-muted-foreground">
                  Kelola gaji pokok, tunjangan, dan potongan
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Receipt className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Slip Gaji</h4>
                <p className="text-xs text-muted-foreground">
                  Generate slip gaji otomatis
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <TrendingUp className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Pajak & BPJS</h4>
                <p className="text-xs text-muted-foreground">
                  Perhitungan pajak dan BPJS otomatis
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <Wallet className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Laporan Payroll</h4>
                <p className="text-xs text-muted-foreground">
                  Rekap penggajian periode tertentu
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
