"use client";

import { useActionState, useState } from "react";
import { submitVote, type ActionState } from "@/app/actions";
import { ImageDialog } from "./ImageDialog";
import { OptionCard } from "./OptionCard";
import { SubmitButton } from "./SubmitButton";
import type { VoteOption } from "./types";

const initialState: ActionState = {};

export function VoteForm({ options }: { options: VoteOption[] }) {
  const [state, formAction] = useActionState(submitVote, initialState);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openOption, setOpenOption] = useState<VoteOption | null>(null);

  const selectedOption = options.find((option) => option.id === selectedId);

  return (
    <>
      <form action={formAction} className="flex flex-col gap-6">
        <fieldset>
          <legend className="sr-only">Elige una sola opción</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                selected={selectedId === option.id}
                loading={index === 0 ? "eager" : "lazy"}
                onSelect={() => setSelectedId(option.id)}
                onOpenImage={() => setOpenOption(option)}
              />
            ))}
          </div>
        </fieldset>

        {state.error ? (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {state.error}
          </p>
        ) : null}

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-stone-900/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-600">
              {selectedOption ? (
                <>
                  Has elegido{" "}
                  <span className="font-semibold text-stone-900">
                    {selectedOption.title}
                  </span>
                  . Tu voto es definitivo.
                </>
              ) : (
                "Selecciona una opción para continuar."
              )}
            </p>
            <SubmitButton
              pendingLabel="Registrando voto…"
              disabled={!selectedOption}
              className="w-full sm:w-auto"
            >
              Confirmar voto
            </SubmitButton>
          </div>
        </div>
      </form>

      <ImageDialog
        option={openOption}
        onClose={() => setOpenOption(null)}
      />
    </>
  );
}
