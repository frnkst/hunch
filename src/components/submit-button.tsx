"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { HunchLoader } from "@/components/hunch-loader";

type SubmitButtonProps = ComponentProps<"button"> & {
  hidePendingLabel?: boolean;
  inverted?: boolean;
  pendingLabel: string;
};

export function SubmitButton({
  children,
  disabled,
  hidePendingLabel = false,
  inverted = false,
  pendingLabel,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button {...props} disabled={disabled || pending}>
      {pending ? (
        <HunchLoader
          compact
          hideLabel={hidePendingLabel}
          inverted={inverted}
          label={pendingLabel}
        />
      ) : (
        children
      )}
    </button>
  );
}
