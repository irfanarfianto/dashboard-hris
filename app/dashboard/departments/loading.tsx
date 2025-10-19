import { TableSkeleton } from "@/components/ui/loading";

export default function LoadingDepartments() {
  return (
    <div className="container mx-auto p-6">
      <TableSkeleton rows={8} />
    </div>
  );
}
