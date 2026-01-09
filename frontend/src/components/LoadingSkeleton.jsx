export default function LoadingSkeleton() {
    return (
      <div className="card animate-pulse">
        <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  
  