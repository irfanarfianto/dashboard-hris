"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

// Helper function to generate slug from heading text
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  useEffect(() => {
    // Handle scroll to anchor on initial load
    const hash = window.location.hash;
    if (hash) {
      // Wait for content to be rendered
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  // Custom components to add IDs to headings for anchor links
  const components = {
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = generateSlug(children?.toString() || "");
      return <h1 id={id} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = generateSlug(children?.toString() || "");
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = generateSlug(children?.toString() || "");
      return <h3 id={id} {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = generateSlug(children?.toString() || "");
      return <h4 id={id} {...props}>{children}</h4>;
    },
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
