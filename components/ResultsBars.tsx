type ResultOption = {
  id: number;
  title: string;
  tag: string;
  total: number;
};

export function ResultsBars({
  results,
  selectedOptionId,
  totalVotes,
}: {
  results: ResultOption[];
  selectedOptionId?: number;
  totalVotes: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {results.map((result) => {
        const percentage = totalVotes
          ? Math.round((result.total / totalVotes) * 100)
          : 0;
        const isSelected = result.id === selectedOptionId;

        return (
          <div key={result.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={
                    isSelected
                      ? "font-semibold text-teal-900"
                      : "font-medium text-stone-800"
                  }
                >
                  {result.title}
                </span>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  {result.tag}
                </span>
                {isSelected ? (
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-800">
                    Tu voto
                  </span>
                ) : null}
              </div>
              <span className="font-mono text-xs text-stone-500">
                {result.total} {result.total === 1 ? "voto" : "votos"} ·{" "}
                {percentage}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${result.title}: ${percentage}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
              className="h-3 overflow-hidden rounded-full bg-stone-100"
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isSelected
                    ? "bg-teal-700"
                    : "bg-stone-400"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
