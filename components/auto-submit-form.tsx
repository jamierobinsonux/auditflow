"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent, FormHTMLAttributes } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AutoSubmitFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onChange" | "onSubmit"> & {
  debounceMs?: number;
  onChange?: (event: ChangeEvent<HTMLFormElement>) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

function buildQueryString(form: HTMLFormElement) {
  const params = new URLSearchParams();
  const formData = new FormData(form);

  formData.forEach((value, key) => {
    const stringValue = String(value).trim();

    if (!stringValue) return;
    params.set(key, stringValue);
  });

  return params.toString();
}

function getActionPath(form: HTMLFormElement, fallbackPathname: string) {
  const rawAction = form.getAttribute("action");

  if (!rawAction) return fallbackPathname;

  try {
    return new URL(rawAction, window.location.origin).pathname;
  } catch {
    return fallbackPathname;
  }
}

export function AutoSubmitForm({ debounceMs = 250, onChange, onSubmit, children, ...props }: AutoSubmitFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedFieldRef = useRef<{ name: string; start: number | null; end: number | null } | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const focusedField = focusedFieldRef.current;
    if (!focusedField) return;

    const field = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[name="${CSS.escape(focusedField.name)}"]`
    );

    if (!field) return;

    field.focus({ preventScroll: true });

    if ("setSelectionRange" in field && focusedField.start !== null && focusedField.end !== null) {
      try {
        field.setSelectionRange(focusedField.start, focusedField.end);
      } catch {
        // Some input types do not support selection ranges.
      }
    }
  }, [searchParams]);

  function rememberFocusedField(form: HTMLFormElement) {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLSelectElement || activeElement instanceof HTMLTextAreaElement)) {
      focusedFieldRef.current = null;
      return;
    }

    if (!form.contains(activeElement) || !activeElement.name) {
      focusedFieldRef.current = null;
      return;
    }

    focusedFieldRef.current = {
      name: activeElement.name,
      start: "selectionStart" in activeElement ? activeElement.selectionStart : null,
      end: "selectionEnd" in activeElement ? activeElement.selectionEnd : null,
    };
  }

  function submitWithRouter(form: HTMLFormElement) {
    rememberFocusedField(form);

    const actionPath = getActionPath(form, pathname);
    const queryString = buildQueryString(form);
    const href = queryString ? `${actionPath}?${queryString}` : actionPath;

    router.replace(href, { scroll: false });
  }

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    onChange?.(event);

    if (event.defaultPrevented) return;

    const form = event.currentTarget;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      submitWithRouter(form);
    }, debounceMs);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    onSubmit?.(event);

    if (event.defaultPrevented) return;

    event.preventDefault();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    submitWithRouter(event.currentTarget);
  }

  return (
    <form {...props} onChange={handleChange} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
