"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  adminLogin,
  adminLogout,
  generateCodes,
  importCedulas,
  resetAllVotes,
  resetVoter,
  toggleSurvey,
  type ActionState,
} from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

const initialState: ActionState = {};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLogin, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-stone-700"
        >
          Contraseña de administrador
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "admin-error" : undefined}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 shadow-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
        />
      </div>

      {state.error ? (
        <p
          id="admin-error"
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Entrando…" className="w-full">
        Entrar al panel
      </SubmitButton>
    </form>
  );
}

export function GenerateCodesForm() {
  const [state, formAction] = useActionState(generateCodes, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="count" className="text-sm font-medium text-stone-700">
        Cantidad de códigos nuevos
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="count"
          name="count"
          type="number"
          min={1}
          max={500}
          defaultValue={10}
          required
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 shadow-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10 sm:w-32"
        />
        <SubmitButton pendingLabel="Generando…" className="sm:px-5">
          Generar códigos
        </SubmitButton>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-sm text-teal-800">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function ImportCedulasForm() {
  const [state, formAction] = useActionState(importCedulas, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="cedulas" className="text-sm font-semibold text-stone-800">
          Cargar cédulas al padrón electoral
        </label>
        <p className="text-xs text-stone-500">
          Pega una cédula por línea. Puedes incluir el nombre completo: <code>0000000000, Juan Perez</code> o pegarlo directamente desde las columnas de Excel.
        </p>
      </div>
      <textarea
        id="cedulas"
        name="cedulas"
        rows={4}
        required
        placeholder={"1728968627, ABAD LARREA ALAN JAHIR\n1753924909, AMAGUAÑA CUMBAJIN KIMBERLY ANAHI"}
        className="w-full rounded-2xl border border-stone-300 bg-white p-3 font-mono text-xs text-stone-900 shadow-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
      />
      <div>
        <SubmitButton pendingLabel="Cargando cédulas…" className="sm:px-6">
          Importar al padrón
        </SubmitButton>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-sm font-medium text-teal-800">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function LogoutForm() {
  return (
    <form action={adminLogout}>
      <SubmitButton
        pendingLabel="Saliendo…"
        className="border border-stone-300 !bg-white !text-stone-700 shadow-none hover:!bg-stone-50"
      >
        Cerrar sesión
      </SubmitButton>
    </form>
  );
}

export function ToggleSurveyForm({ isOpen }: { isOpen: boolean }) {
  return (
    <form action={toggleSurvey}>
      <SubmitButton
        pendingLabel="Actualizando…"
        className={
          isOpen
            ? "border border-amber-300 !bg-amber-50 !text-amber-900 shadow-none hover:!bg-amber-100"
            : "border border-teal-300 !bg-teal-50 !text-teal-900 shadow-none hover:!bg-teal-100"
        }
      >
        {isOpen ? "Cerrar encuesta" : "Abrir encuesta"}
      </SubmitButton>
    </form>
  );
}

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
      aria-label={`Copiar código ${code}`}
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export function ResetVoterButton({
  codeId,
  code,
}: {
  codeId: number;
  code: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          window.confirm(
            `¿Reactivar el voto para la cédula ${code}? Se borrará su voto actual y el estudiante podrá volver a votar.`,
          )
        ) {
          startTransition(async () => {
            await resetVoter(codeId);
          });
        }
      }}
      className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
    >
      {isPending ? "Reactivando…" : "Reactivar voto"}
    </button>
  );
}

export function ResetAllVotesButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          window.confirm(
            "⚠️ ¿ATENCIÓN: Estás seguro de borrar TODOS los votos registrados? Esta acción reiniciará todas las cédulas a estado 'Disponible' para que puedas comenzar la votación oficial desde cero.",
          )
        ) {
          startTransition(async () => {
            await resetAllVotes();
          });
        }
      }}
      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
    >
      {isPending ? "Reiniciando…" : "Reiniciar todos los votos (Limpiar pruebas)"}
    </button>
  );
}

