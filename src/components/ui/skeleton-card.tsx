import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="bg-nord-1 border-nord-2 shadow-md overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-[16/9] w-full">
        <Skeleton className="h-full w-full bg-nord-2" />
      </div>

      {/* Text Skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-2/3 bg-nord-2" />
          <Skeleton className="h-5 w-16 bg-nord-2 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/2 bg-nord-2" />
      </div>
    </Card>
  );
}