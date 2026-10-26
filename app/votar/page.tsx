import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoadingPanel } from "@/components/LoadingPanel";
import { VoteForm } from "@/components/VoteForm";
import { getVoterState } from "@/lib/session";
import {
  getSurveyWithOptions,
} from "@/lib/survey";

export default function VotePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-12">
      <Suspense fallback={<LoadingPanel label="Preparando tu papeleta…" />}>
        <VoteContent />
      </Suspense>
    </main>
  );
}

async function VoteContent() {
  const voter = await getVoterState();

  if (voter.status === "anonymous") {
    redirect("/");
  }

  if (voter.status === "voted") {
    redirect("/resultados");
  }

  const survey = await getSurveyWithOptions();

  if (!survey) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm leading-6 text-amber-900">
        La encuesta todavía no está configurada.
      </div>
    );
  }

  if (!survey.isOpen) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
          La encuesta está cerrada
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Ya no se aceptan votos. Gracias por tu interés.
        </p>
      </div>
    );
  }

  if (survey.options.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm leading-6 text-amber-900">
        La encuesta no tiene opciones configuradas.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            Paso 1 de 2
          </span>
          <span className="text-xs font-medium text-stone-500">
            {survey.options.length} opciones · elige solo una
          </span>
          {voter.code.fullName ? (
            <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-900">
              Estudiante: <strong>{voter.code.fullName}</strong> ({voter.code.code})
            </span>
          ) : (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
              Cédula: <strong>{voter.code.code}</strong>
            </span>
          )}
        </div>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-stone-950 sm:text-4xl">
          {survey.title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
          {survey.description} Toca una imagen para verla en grande y vuelve
          a la encuesta cuando quieras.
        </p>
      </header>

      <VoteForm
        options={survey.options.map((option) => ({
          id: option.id,
          title: option.title,
          description: option.description,
          tag: option.tag,
          imagePath: option.imagePath,
        }))}
      />
    </div>
  );
}
