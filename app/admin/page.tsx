import { Suspense } from "react";
import {
  AdminLoginForm,
  CopyCodeButton,
  ImportCedulasForm,
  LogoutForm,
  ToggleSurveyForm,
} from "@/components/AdminForms";
import { LoadingPanel } from "@/components/LoadingPanel";
import { ResultsBars } from "@/components/ResultsBars";
import { getAdminSession } from "@/lib/session";
import {
  getCodeUsage,
  getCodes,
  getResults,
  getSurveyWithOptions,
} from "@/lib/survey";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-12">
      <Suspense fallback={<LoadingPanel label="Abriendo el panel…" />}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent() {
  const admin = await getAdminSession();

  if (!admin) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-900/5 sm:p-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800">
            Administración
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            Panel de control
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Introduce la contraseña configurada en{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-700">
              ADMIN_PASSWORD
            </code>{" "}
            dentro de{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-700">
              .env.local
            </code>
            .
          </p>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    );
  }

  const survey = await getSurveyWithOptions();

  if (!survey) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm leading-6 text-amber-900">
        La encuesta todavía no está configurada. Ejecuta{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
          npm run setup
        </code>
        .
      </div>
    );
  }

  const [results, codeRows, usage] = await Promise.all([
    getResults(survey.id),
    getCodes(survey.id),
    getCodeUsage(survey.id),
  ]);

  const totalVotes = results.reduce((total, result) => total + result.total, 0);
  const unusedCodes = Math.max(0, usage.total - usage.used);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              Administración
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                survey.isOpen
                  ? "bg-teal-100 text-teal-900"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {survey.isOpen ? "Abierta" : "Cerrada"}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">
            {survey.title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-stone-600">
            Genera códigos, controla el estado de la encuesta y revisa los
            resultados.
          </p>
        </div>
        <LogoutForm />
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Estado
            </span>
            <span className="text-2xl font-semibold tracking-tight text-stone-950">
              {survey.isOpen ? "Recibiendo votos" : "Votación cerrada"}
            </span>
          </div>
          <ToggleSurveyForm isOpen={survey.isOpen} />
        </div>

        <div className="flex flex-col gap-2 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            Votos emitidos
          </span>
          <span className="text-4xl font-semibold tracking-tight text-stone-950">
            {totalVotes}
          </span>
          <span className="text-xs text-stone-500">
            {totalVotes === 1 ? "Una persona ha votado" : "Personas que han votado"}
          </span>
        </div>

        <div className="flex flex-col gap-2 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            Códigos
          </span>
          <span className="text-4xl font-semibold tracking-tight text-stone-950">
            {unusedCodes}
          </span>
          <span className="text-xs text-stone-500">
            disponibles · {usage.used} usados de {usage.total}
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Resultados
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              Distribución de votos
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            {totalVotes} {totalVotes === 1 ? "voto registrado" : "votos registrados"}
          </span>
        </div>

        {totalVotes === 0 ? (
          <p className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
            Todavía no hay votos. Comparte los códigos para empezar.
          </p>
        ) : (
          <ResultsBars results={results} totalVotes={totalVotes} />
        )}
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Padrón Electoral
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                Cédulas de Estudiantes
              </h2>
              <p className="max-w-xl text-sm leading-6 text-stone-500">
                Cada cédula registrada permite emitir un único voto. Puedes importar
                nuevos estudiantes o descargar el listado en formato CSV.
              </p>
            </div>
            <a
              href="/api/admin/codes"
              className="inline-flex w-fit items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500"
            >
              Descargar padrón en CSV
            </a>
          </div>

          <div className="rounded-2xl bg-stone-50 p-4 sm:p-5">
            <ImportCedulasForm />
          </div>

          <div className="max-h-[30rem] overflow-auto rounded-2xl border border-stone-200">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-stone-50 text-[11px] uppercase tracking-[0.12em] text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cédula</th>
                  <th className="px-4 py-3 font-semibold">Nombres Completos</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Fecha Voto</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {codeRows.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] font-semibold tracking-[0.06em] text-stone-900">
                      {row.code}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-stone-700">
                      {row.fullName ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                          row.usedAt
                            ? "bg-red-100 text-red-800"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {row.usedAt ? "Ya votó" : "Disponible"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-stone-500">
                      {row.usedAt ? dateFormatter.format(row.usedAt) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {row.usedAt ? null : <CopyCodeButton code={row.code} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {codeRows.length === 0 ? (
            <p className="rounded-2xl bg-amber-50 px-4 py-5 text-sm text-amber-900">
              No hay cédulas registradas en el padrón electoral todavía.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
