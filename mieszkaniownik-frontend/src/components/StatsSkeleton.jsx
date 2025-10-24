import Skeleton from "./Skeleton";

function StatsSkeleton() {
  return (
    <div className="mb-6 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export default StatsSkeleton;
