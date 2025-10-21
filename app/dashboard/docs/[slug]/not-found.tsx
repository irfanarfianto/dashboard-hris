import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Dokumentasi Tidak Ditemukan
            </h2>
            <p className="text-muted-foreground mb-6">
              Halaman dokumentasi yang Anda cari tidak tersedia.
            </p>
            <Link href="/dashboard/docs">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Index Docs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
