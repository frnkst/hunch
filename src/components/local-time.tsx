"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function LocalTime({
  value,
  dateOnly = false,
}: {
  value: string;
  dateOnly?: boolean;
}) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const label = isClient
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        ...(dateOnly ? {} : { timeStyle: "short" }),
      }).format(new Date(value))
    : "…";

  return (
    <time dateTime={value} suppressHydrationWarning>
      {label}
    </time>
  );
}
