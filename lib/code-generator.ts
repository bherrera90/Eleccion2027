import { randomInt } from "node:crypto";
import { CODE_ALPHABET, CODE_LENGTH, formatCode } from "./codes";

export function generateCode() {
  let raw = "";
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    raw += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return formatCode(raw);
}
