import Skeleton from './Skeleton'

function CardSkeleton() {
  {
    /* Render */
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-4">
      <div className="mb-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export default CardSkeleton
