import { TableSkeleton } from "@/components/ui/loading";

export default function LoadingWorkShifts() {
  return (
    <div className="container mx-auto p-6">
      <TableSkeleton rows={8} />
    </div>
  );
}
