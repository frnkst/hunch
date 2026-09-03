"use client";

import { useEffect, useRef } from "react";

export function Notice({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const noticeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!error) return;
    noticeRef.current?.scrollIntoView({ block: "start" });
    noticeRef.current?.focus({ preventScroll: true });
  }, [error]);

  if (!error && !success) return null;
  return (
    <p
      ref={noticeRef}
      id="notice"
      tabIndex={-1}
      role={error ? "alert" : "status"}
      className={`mb-5 scroll-mt-4 rounded-2xl px-4 py-3 text-sm font-semibold outline-none ${
        error
          ? "bg-rose-50 text-rose-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? success}
    </p>
  );
}
