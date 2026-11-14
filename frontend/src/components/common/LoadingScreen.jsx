export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 loading-spinner border-4 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
