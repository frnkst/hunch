import { CalendarDays } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type DateTimeFieldProps = Omit<ComponentProps<"input">, "type"> & {
  placeholder?: string;
};

export function DateTimeField({
  className,
  placeholder = "Select date and time",
  ...props
}: DateTimeFieldProps) {
  return (
    <div className="date-time-field">
      <input
        {...props}
        type="datetime-local"
        className={cn("field date-time-input", className)}
      />
      <span className="date-time-placeholder" aria-hidden="true">
        {placeholder}
      </span>
      <CalendarDays
        className="date-time-icon size-4"
        aria-hidden="true"
      />
    </div>
  );
}
