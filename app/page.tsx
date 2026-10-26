import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CodeForm } from "@/components/CodeForm";
import { LoadingPanel } from "@/components/LoadingPanel";
import { getVoterState } from "@/lib/session";
import { getSurvey } from "@/lib/survey";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 sm:px-8 lg:py-16">
      <Suspense fallback={<div className="w-full"><LoadingPanel /></div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}

async function HomeContent() {
  const voter = await getVoterState();

  if (voter.status === "voted") {
    redirect("/resultados");
  }

  if (voter.status === "ready") {
    redirect("/votar");
  }

  const survey = await getSurvey();

  if (!survey) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-2xl font-semibold text-amber-950">
          La encuesta todavía no está configurada
        </h1>
        <p className="text-sm leading-6 text-amber-900">
          Abre una terminal en el proyecto y ejecuta{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
            npm run setup
          </code>{" "}
          para crear la base de datos y los primeros códigos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
      <section className="flex flex-col gap-6">
        <span className="w-fit rounded-full border border-teal-800/20 bg-teal-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-900">
          Elección 2027 · 1 voto por cédula
        </span>
        <div className="flex flex-col gap-4">
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-stone-950 sm:text-5xl lg:text-6xl">
            {survey.title}
          </h1>
          <p className="max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            {survey.description}
          </p>
        </div>

        <ul className="flex flex-col gap-3 text-sm text-stone-600">
          {[
            "Cada cédula registrada permite emitir un único voto.",
            "Puedes ver los detalles de cada lista o candidato antes de decidir.",
            "Los resultados se actualizan en tiempo real.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-800/10 text-teal-800">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-xl shadow-stone-900/5 backdrop-blur sm:p-8">
        {survey.isOpen ? (
          <>
            <div className="mb-6 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800">
                Padrón Electoral
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
                Accede con tu cédula
              </h2>
            </div>

            <CodeForm />

            <div className="my-6 h-px bg-stone-200" />

            <p className="text-sm leading-6 text-stone-500">
              ¿Problemas al ingresar? Verifica que tu cédula esté en el padrón electoral de la institución.
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-3 py-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
              Votación finalizada
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              La encuesta está cerrada
            </h2>
            <p className="text-sm leading-6 text-stone-600">
              Gracias por participar. Si ya votaste, tus resultados siguen
              disponibles en tu sesión.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <span className="text-xs text-stone-400">
            Acceso con código de invitación
          </span>
          <Link
            href="/admin"
            className="text-xs font-medium text-stone-500 underline-offset-4 transition hover:text-stone-900 hover:underline"
          >
            Administración
          </Link>
        </div>
      </section>
    </div>
  );
}
