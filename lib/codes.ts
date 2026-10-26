export const CEDULA_LENGTH = 10;
export const CEDULA_PATTERN = /^\d{10}$/;
export const CODE_LENGTH = CEDULA_LENGTH;
export const CODE_PATTERN = CEDULA_PATTERN;
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function cleanCedula(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 9) {
    return `0${digits}`;
  }
  return digits;
}

export function cleanCode(input: string): string {
  return cleanCedula(input);
}

export function formatCode(raw: string): string {
  return cleanCedula(raw);
}

export function normalizeCode(input: string): string {
  return cleanCedula(input);
}

export function isValidCedula(input: string): boolean {
  const cleaned = cleanCedula(input);
  return CEDULA_PATTERN.test(cleaned);
}

