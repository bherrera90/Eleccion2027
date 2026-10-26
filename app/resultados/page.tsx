import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { voterLogout } from "@/app/actions";
import { LoadingPanel } from "@/components/LoadingPanel";
import { ResultsBars } from "@/components/ResultsBars";
import { getVoterSession } from "@/lib/session";
import {
  getResults,
  getSurveyWithOptions,
  getVoteByCode,
} from "@/lib/survey";

export const dynamic = "force-dynamic";

export default function ResultsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-12">
      <Suspense fallback={<LoadingPanel label="Calculando resultados…" />}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}

async function ResultsContent() {
  const session = await getVoterSession();

  if (!session?.codeId) {
    redirect("/");
  }

  const vote = await getVoteByCode(session.codeId);
  if (!vote) {
    redirect("/votar");
  }

  const survey = await getSurveyWithOptions();
  if (!survey) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm leading-6 text-amber-900">
        La encuesta todavía no está configurada.
      </div>
    );
  }

  const results = await getResults(survey.id);
  const totalVotes = results.reduce((total, result) => total + result.total, 0);
  const selectedOption = results.find((result) => result.id === vote.optionId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            Paso 2 de 2 · Resultados
          </span>
          <span className="text-xs font-medium text-stone-500">
            Tu voto quedó registrado
          </span>
        </div>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-stone-950 sm:text-4xl">
          Gracias por votar
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
          Estos son los resultados actuales de{" "}
          <span className="font-medium text-stone-800">{survey.title}</span>.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        {selectedOption ? (
          <section className="overflow-hidden rounded-3xl border border-teal-800/20 bg-white shadow-sm">
            <div className="border-b border-teal-800/10 bg-teal-50/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-900">
              Tu elección
            </div>
            <div className="relative aspect-[4/3] w-full bg-stone-100">
              <Image
                src={selectedOption.imagePath}
                alt={selectedOption.title}
                fill
                unoptimized
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-3 p-5">
              <span className="w-fit rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                {selectedOption.tag}
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                {selectedOption.title}
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                {selectedOption.description}
              </p>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Resultados en vivo
              </span>
              <span className="text-2xl font-semibold tracking-tight text-stone-950">
                {totalVotes} {totalVotes === 1 ? "voto" : "votos"} en total
              </span>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
              Recarga para actualizar
            </span>
          </div>

          <ResultsBars
            results={results}
            selectedOptionId={vote.optionId}
            totalVotes={totalVotes}
          />

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
            <form action={voterLogout}>
              <button
                type="submit"
                className="text-xs font-medium text-stone-500 underline-offset-4 transition hover:text-stone-900 hover:underline"
              >
                Salir de esta sesión
              </button>
            </form>
            <span className="text-xs text-stone-400">
              Un código, un voto
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
