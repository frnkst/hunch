export function Notice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mb-5 rounded-2xl px-4 py-3 text-sm font-semibold ${
        error
          ? "bg-rose-50 text-rose-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? success}
    </p>
  );
}
