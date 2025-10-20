function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
      <p className="ml-4 font-semibold text-blue-950">Ładowanie...</p>
    </div>
  );
}

export default Loading;
