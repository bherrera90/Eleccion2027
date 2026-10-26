"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-5 py-10 sm:px-8">
      <div className="flex w-full flex-col gap-4 rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-2xl font-semibold text-red-950">
          No pudimos cargar la votación
        </h1>
        <p className="text-sm leading-6 text-red-900">
          Hubo un problema al conectar con la base de datos. Espera un momento e
          inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mx-auto rounded-full bg-red-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
