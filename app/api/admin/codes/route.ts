import { getAdminSession } from "@/lib/session";
import { getCodes, getSurvey } from "@/lib/survey";

function csvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export async function GET() {
  const admin = await getAdminSession();

  if (!admin) {
    return new Response("No autorizado", { status: 401 });
  }

  const survey = await getSurvey();
  if (!survey) {
    return new Response("La encuesta no está configurada", { status: 404 });
  }

  const rows = await getCodes(survey.id);
  const lines = [
    "cedula,nombres,estado,fecha_uso",
    ...rows.map((row) =>
      [
        csvCell(row.code),
        csvCell(row.fullName ?? ""),
        row.usedAt ? "ya_voto" : "disponible",
        row.usedAt ? row.usedAt.toISOString() : "",
      ].join(","),
    ),
  ];

  return new Response(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="padron_electoral.csv"',
      "Cache-Control": "no-store",
    },
  });
}
