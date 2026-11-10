"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { SignupSchema } from "@/lib/schemas/customer";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "password";
type FieldErrors = Partial<Record<Field, string>>;

const FIELDS: readonly Field[] = ["name", "email", "password"];

const inputClass =
  "min-h-11 rounded-[6px] border bg-[var(--background)] px-3 py-2 text-base text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:outline-none";

/** Optional customer signup (FR-7, US-10). */
export function SignupForm() {
  const router = useRouter();
  const ids = { name: useId(), email: useId(), password: useId() };
  const hintId = useId();
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<{
    message: string;
    loginUrl?: string;
  } | null>(null);
  const [pending, setPending] = useState(false);

  function showFieldErrors(errors: FieldErrors) {
    setFieldErrors(errors);
    const first = FIELDS.find((field) => errors[field]);
    if (first) refs[first].current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setFormError(null);

    const parsed = SignupSchema.safeParse(values);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        errors[field] ??= issue.message;
      }
      showFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (response.ok) {
        router.replace("/menu");
        router.refresh();
        return;
      }
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        login_url?: string;
        field_errors?: FieldErrors;
      } | null;
      if (data?.field_errors) {
        showFieldErrors(data.field_errors);
      } else {
        setFormError({
          message:
            data?.error ?? "Could not create your account. Please try again.",
          loginUrl: data?.login_url,
        });
      }
    } catch {
      setFormError({
        message: "Network error. Check your connection and try again.",
      });
    } finally {
      setPending(false);
    }
  }

  function renderField(
    field: Field,
    label: string,
    input: { type: string; autoComplete: string; hint?: string },
  ) {
    const error = fieldErrors[field];
    const errorId = `${ids[field]}-error`;
    const describedBy = error ? errorId : input.hint ? hintId : undefined;
    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={ids[field]}
          className="text-sm font-medium text-[var(--foreground)]"
        >
          {label}
        </label>
        <input
          ref={refs[field]}
          id={ids[field]}
          name={field}
          type={input.type}
          autoComplete={input.autoComplete}
          value={values[field]}
          onChange={(e) =>
            setValues((current) => ({ ...current, [field]: e.target.value }))
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            inputClass,
            error
              ? "border-[var(--status-cancelled)]"
              : "border-[var(--border)]",
          )}
        />
        {error ? (
          <p
            id={errorId}
            className="text-sm font-medium text-[var(--status-cancelled)]"
          >
            {error}
          </p>
        ) : (
          input.hint && (
            <p id={hintId} className="text-sm text-[var(--muted-foreground)]">
              {input.hint}
            </p>
          )
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {renderField("name", "Name", { type: "text", autoComplete: "name" })}
      {renderField("email", "Email", { type: "email", autoComplete: "email" })}
      {renderField("password", "Password", {
        type: "password",
        autoComplete: "new-password",
        hint: "At least 8 characters.",
      })}

      {formError && (
        <p
          role="alert"
          className="rounded-[6px] border border-[var(--status-cancelled)] p-3 text-sm text-[var(--foreground)]"
        >
          {formError.message}
          {formError.loginUrl && (
            <>
              {". "}
              <Link
                href={formError.loginUrl}
                className={cn(
                  "font-medium text-[var(--primary)] underline",
                  focusRing,
                )}
              >
                Log in
              </Link>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60",
          focusRing,
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Creating account…
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Create account
          </>
        )}
      </button>

      <Link
        href="/menu"
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--background)] px-5 py-3 text-sm font-medium text-[var(--primary)] hover:bg-[var(--muted)]",
          focusRing,
        )}
      >
        Continue as guest
      </Link>
    </form>
  );
}
