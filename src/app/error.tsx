"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <section className="glass-panel w-full max-w-sm rounded-[2rem] p-8 text-center">
        <p className="eyebrow text-rose-600">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-extrabold">That hunch missed.</h1>
        <p className="mt-3 text-sm leading-6 text-[#77708c]">{error.message}</p>
        <button type="button" onClick={reset} className="button-primary mt-6">
          Try again
        </button>
      </section>
    </main>
  );
}
