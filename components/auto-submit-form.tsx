"use client";

import { useRef } from "react";
import type { ChangeEvent, FormHTMLAttributes } from "react";

type AutoSubmitFormProps = FormHTMLAttributes<HTMLFormElement> & {
  debounceMs?: number;
};

export function AutoSubmitForm({ debounceMs = 350, onChange, children, ...props }: AutoSubmitFormProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    onChange?.(event);

    if (event.defaultPrevented) return;

    const form = event.currentTarget;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      form.requestSubmit();
    }, debounceMs);
  }

  return (
    <form {...props} onChange={handleChange}>
      {children}
    </form>
  );
}
