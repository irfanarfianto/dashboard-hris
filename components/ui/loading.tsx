import { Loader2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  size = "md",
  text = "Memuat data...",
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner dengan gradient dan animasi */}
        <div className="relative">
          {/* Background circle */}
          <div
            className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 dark:border-gray-700`}
          />
          {/* Animated gradient circle */}
          <Loader2
            className={`${sizeClasses[size]} absolute inset-0 animate-spin text-blue-600 dark:text-blue-400`}
          />
        </div>

        {/* Loading text */}
        {text && (
          <p
            className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300 animate-pulse`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Komponen LoadingSpinner sederhana untuk inline use
export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <Loader2
      className={`animate-spin text-blue-600 dark:text-blue-400 ${className}`}
    />
  );
}

// Komponen LoadingDots untuk variasi
export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400 [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400 [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400"></div>
    </div>
  );
}

// Komponen LoadingSkeleton untuk placeholder content
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton height={32} width="75%" />
      <Skeleton count={3} />
    </div>
  );
}

// Skeleton untuk Table
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton height={40} width={256} />
        <Skeleton height={40} width={128} />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <Skeleton count={6} containerClassName="contents" />
        </div>

        {/* Table Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <Skeleton count={6} containerClassName="contents" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton untuk Detail Page
export function DetailSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton height={32} width={300} />
          <Skeleton height={16} width={200} />
        </div>
        <Skeleton height={40} width={128} />
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
          >
            <Skeleton height={24} width={160} />
            <div className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton height={12} width={96} />
                  <Skeleton height={16} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton untuk Dashboard Cards
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-2"
          >
            <Skeleton height={16} width={96} />
            <Skeleton height={32} width={64} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
          >
            <Skeleton height={24} width={192} />
            <Skeleton height={256} />
          </div>
        ))}
      </div>
    </div>
  );
}
