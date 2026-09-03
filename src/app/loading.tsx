export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl animate-pulse px-4 py-6">
      <div className="h-10 w-32 rounded-xl bg-violet-100" />
      <div className="mt-10 h-20 w-64 rounded-2xl bg-violet-100" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-[1.5rem] bg-white/70" />
        <div className="h-48 rounded-[1.5rem] bg-white/70" />
      </div>
    </main>
  );
}
