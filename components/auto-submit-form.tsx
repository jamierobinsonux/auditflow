"use client";

import { useRef } from "react";
import type { ChangeEvent, FormEvent, FormHTMLAttributes } from "react";
import { useRouter } from "next/navigation";

type AutoSubmitFormProps = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onChange" | "onSubmit"
> & {
  debounceMs?: number;
  onChange?: (event: ChangeEvent<HTMLFormElement>) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

function buildUrlFromForm(form: HTMLFormElement) {
  const action = form.getAttribute("action") || window.location.pathname;
  const url = new URL(action, window.location.origin);
  const params = new URLSearchParams();
  const formData = new FormData(form);

  for (const [key, value] of formData.entries()) {
    const stringValue = String(value).trim();
    if (stringValue) params.set(key, stringValue);
  }

  const query = params.toString();
  return `${url.pathname}${query ? `?${query}` : ""}`;
}

export function AutoSubmitForm({ debounceMs = 300, onChange, onSubmit, children, ...props }: AutoSubmitFormProps) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function submitWithoutReload(form: HTMLFormElement) {
    const nextUrl = buildUrlFromForm(form);
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    onChange?.(event);

    if (event.defaultPrevented) return;

    const form = event.currentTarget;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      submitWithoutReload(form);
    }, debounceMs);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    onSubmit?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    submitWithoutReload(event.currentTarget);
  }

  return (
    <form {...props} onChange={handleChange} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
