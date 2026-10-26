"use client";

import { useActionState } from "react";
import { enterCode, type ActionState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

const initialState: ActionState = {};

export function CodeForm() {
  const [state, formAction] = useActionState(enterCode, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="code"
          className="text-sm font-medium text-stone-700"
        >
          Número de cédula
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          required
          placeholder="1719663492"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "code-error" : "code-help"}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 font-mono text-xl tracking-[0.12em] text-stone-900 shadow-sm outline-none transition placeholder:text-stone-300 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
        />
        <p id="code-help" className="text-xs leading-5 text-stone-500">
          Ingresa tus 10 dígitos de cédula. Cada cédula permite un único voto.
        </p>
      </div>

      {state.error ? (
        <p
          id="code-error"
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Verificando cédula…" className="w-full">
        Ingresar a votar
      </SubmitButton>
    </form>
  );
}
