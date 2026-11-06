"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormFieldControl } from "@/components/ui/form-field";

export function TextArea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  const field = useFormFieldControl();

  return (
    <textarea
      {...field}
      className={cn(
        "min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400 aria-invalid:border-red-300 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-100",
        className
      )}
      {...props}
    />
  );
}
