import Skeleton from "./Skeleton";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export default CardSkeleton;
