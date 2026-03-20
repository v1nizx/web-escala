export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3 animate-pulse">
      <div className="h-3 w-32 bg-slate-800 rounded-full" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 bg-slate-800 rounded-full" />
        <div className="h-6 w-20 bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}
