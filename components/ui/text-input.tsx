"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormFieldControl } from "@/components/ui/form-field";

export function TextInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const field = useFormFieldControl();

  return (
    <input
      {...field}
      className={cn(
        "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400 aria-invalid:border-red-300 aria-invalid:focus:border-red-400 aria-invalid:focus:ring-red-100",
        className
      )}
      {...props}
    />
  );
}
