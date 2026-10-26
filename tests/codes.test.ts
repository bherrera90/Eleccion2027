import { describe, expect, it } from "vitest";
import { normalizeCode } from "../lib/codes";

describe("cédulas ecuatorianas de votación", () => {
  it("normaliza espacios, guiones y puntos en la cédula", () => {
    expect(normalizeCode(" 1719663492 ")).toBe("1719663492");
    expect(normalizeCode("17-1966-3492")).toBe("1719663492");
    expect(normalizeCode("17.196.634-92")).toBe("1719663492");
  });

  it("completa el cero a la izquierda si tiene 9 dígitos", () => {
    expect(normalizeCode("956346283")).toBe("0956346283");
  });

  it("valida formato de 10 dígitos", () => {
    expect(normalizeCode("1719663492")).toHaveLength(10);
  });
});
