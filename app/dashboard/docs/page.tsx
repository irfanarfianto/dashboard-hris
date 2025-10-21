"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Code,
  FileText,
  GitBranch,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const docLinks = [
  {
    title: "Developer Guide",
    description:
      "Panduan lengkap untuk developer: arsitektur, setup, konvensi kode",
    href: "/dashboard/docs/dev-guide",
    icon: Code,
    badge: "Start Here",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Create CRUD Feature",
    description: "Tutorial step-by-step membuat fitur CRUD baru dari awal",
    href: "/dashboard/docs/create-crud",
    icon: FileText,
    badge: "Popular",
    color: "text-green-600 dark:text-green-400",
  },
  {
    title: "Search & Pagination",
    description: "Implementasi search dan pagination pada halaman existing",
    href: "/dashboard/docs/search-pagination",
    icon: FileText,
    badge: null,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Migration Guide",
    description: "Panduan lengkap migrasi dari Supabase ke backend alternatif",
    href: "/dashboard/docs/migration",
    icon: GitBranch,
    badge: null,
    color: "text-orange-600 dark:text-orange-400",
  },
];

const quickLinks = [
  {
    title: "📚 Complete Index",
    description: "Index lengkap semua dokumentasi",
    href: "https://github.com/irfanarfianto/dashboard-hris/blob/main/docs/INDEX.md",
  },
  {
    title: "📖 All Documentation",
    description: "Browse semua file dokumentasi",
    href: "https://github.com/irfanarfianto/dashboard-hris/tree/main/docs",
  },
  {
    title: "🐛 Report Issue",
    description: "Laporkan bug atau request feature",
    href: "https://github.com/irfanarfianto/dashboard-hris/issues",
  },
];

export default function DocsIndexPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Dokumentasi Developer</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Panduan lengkap untuk development, maintenance, dan migrasi HRIS
          Bharata
        </p>
      </div>

      {/* Main Documentation Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {docLinks.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card
              key={doc.href}
              className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${doc.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{doc.title}</CardTitle>
                      {doc.badge && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                          {doc.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={doc.href}>
                  <Button className="w-full" variant="default">
                    Baca Dokumentasi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Link cepat ke resource penting lainnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <div className="font-medium">{link.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {link.description}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Section */}
      <Card className="mt-8 border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>🚀 Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Untuk Developer Baru:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Mulai dengan{" "}
                <span className="font-medium text-foreground">
                  Developer Guide
                </span>
              </li>
              <li>Setup development environment</li>
              <li>
                Baca{" "}
                <span className="font-medium text-foreground">
                  Create CRUD Feature
                </span>
              </li>
              <li>Coba buat fitur sederhana</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Untuk Developer Existing:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Gunakan{" "}
                <span className="font-medium text-foreground">
                  Complete Index
                </span>{" "}
                sebagai quick reference
              </li>
              <li>Lihat how-to guides untuk pattern baru</li>
              <li>Contribute dokumentasi untuk fitur baru</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Untuk Migration Planning:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Baca{" "}
                <span className="font-medium text-foreground">
                  Migration Guide
                </span>
              </li>
              <li>Evaluate backend alternatives</li>
              <li>Plan dengan migration checklist</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Semua dokumentasi tersedia di{" "}
          <a
            href="https://github.com/irfanarfianto/dashboard-hris/tree/main/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub Repository
          </a>
        </p>
      </div>
    </div>
  );
}
