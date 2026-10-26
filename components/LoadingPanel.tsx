export function LoadingPanel({ label = "Cargando…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-64 items-center justify-center rounded-3xl border border-stone-200 bg-white/60 p-8 text-sm text-stone-500"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-teal-700"
        />
        {label}
      </span>
    </div>
  );
}
