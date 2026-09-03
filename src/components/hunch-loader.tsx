import { cn } from "@/lib/utils";

export function HunchLoader({
  compact = false,
  hideLabel = false,
  inverted = false,
  label = "Loading",
}: {
  compact?: boolean;
  hideLabel?: boolean;
  inverted?: boolean;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact && !hideLabel ? "gap-2.5" : "flex-col gap-5",
      )}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <div
        className={cn(
          "relative isolate",
          compact ? "size-6" : "size-20",
        )}
        aria-hidden="true"
      >
        <span className="hunch-loader-orbit absolute inset-0 rounded-full" />
        <span className="hunch-loader-orbit-reverse absolute inset-[12%] rounded-full" />
        <span className="hunch-loader-core absolute inset-[31%] rounded-[38%]" />
      </div>
      {!hideLabel ? (
        <div className={cn("text-center", compact && "text-left")}>
          <p
            className={cn(
              "font-bold tracking-[-0.025em] text-violet-950",
              compact ? "text-xs" : "text-base",
              inverted && "text-white",
            )}
          >
            {label}
          </p>
          {!compact ? (
            <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  key={index}
                  className="hunch-loader-dot size-1.5 rounded-full bg-violet-500"
                  style={{ animationDelay: `${index * 160}ms` }}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
