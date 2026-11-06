"use client";

import { createContext, useContext, useId, type ReactNode } from "react";

type FormFieldContextValue = {
  id: string;
  describedBy?: string;
  invalid: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/**
 * Used by TextInput, TextArea and SelectInput.
 *
 * Inside a <FormField> it returns the id and aria attributes that connect the
 * control to its label, description and error message. Outside a <FormField>
 * it returns nothing, so standalone controls behave exactly as before.
 *
 * Props passed directly to a control win over these values. If you pass your
 * own `id` to a control, pass the same `id` to its <FormField> too, otherwise
 * the label will point at the wrong element.
 */
export function useFormFieldControl() {
  const field = useContext(FormFieldContext);

  if (!field) return {};

  return {
    id: field.id,
    "aria-describedby": field.describedBy,
    "aria-invalid": field.invalid || undefined,
  };
}

export function FormField({
  id,
  label,
  description,
  error,
  children,
}: {
  /** Optional. Only needed when something else must reference the control's id. */
  id?: string;
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FormFieldContext.Provider
      value={{ id: controlId, describedBy, invalid: Boolean(error) }}
    >
      <div>
        <label
          htmlFor={controlId}
          className="block text-sm font-semibold text-slate-800"
        >
          {label}
        </label>

        {description && (
          <p
            id={descriptionId}
            className="mt-1 text-xs leading-5 text-slate-500"
          >
            {description}
          </p>
        )}

        <div className="mt-2">{children}</div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-2 text-xs font-medium text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}
