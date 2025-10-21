import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/docs/markdown-content";

interface DocPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const docFiles: Record<string, { title: string; file: string }> = {
  "dev-guide": {
    title: "Developer Guide",
    file: "DEV_GUIDE.md",
  },
  "create-crud": {
    title: "Create CRUD Feature",
    file: "how-to/CREATE_CRUD_FEATURE.md",
  },
  "search-pagination": {
    title: "Search & Pagination",
    file: "how-to/ADD_SEARCH_PAGINATION.md",
  },
  migration: {
    title: "Migration Guide",
    file: "migration/MIGRATE_FROM_SUPABASE.md",
  },
};

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const docInfo = docFiles[slug];

  if (!docInfo) {
    notFound();
  }

  let content = "";
  try {
    const filePath = path.join(process.cwd(), "public", "docs", docInfo.file);
    content = await readFile(filePath, "utf-8");
  } catch (error) {
    console.error("Error loading doc:", error);
    content = "# Error\n\nGagal memuat dokumentasi.";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/docs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <a
          href={`https://github.com/irfanarfianto/dashboard-hris/blob/main/public/docs/${docInfo.file}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Lihat di GitHub
          </Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{docInfo.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={content} />
        </CardContent>
      </Card>
    </div>
  );
}

// Generate static params for better performance
export async function generateStaticParams() {
  return Object.keys(docFiles).map((slug) => ({
    slug,
  }));
}
