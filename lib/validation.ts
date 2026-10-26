import { z } from "zod";
import { CEDULA_PATTERN, normalizeCode } from "./codes";

export const codeSchema = z
  .string()
  .min(1, "Introduce tu número de cédula.")
  .transform(normalizeCode)
  .refine(
    (value) => CEDULA_PATTERN.test(value),
    "La cédula debe tener 10 dígitos (ej: 1719663492).",
  );

export const optionIdSchema = z.coerce
  .number()
  .int()
  .positive("Selecciona una opción válida.");

export const codeCountSchema = z.coerce
  .number()
  .int()
  .min(1, "Genera al menos un código.")
  .max(500, "Puedes generar como máximo 500 códigos a la vez.");
