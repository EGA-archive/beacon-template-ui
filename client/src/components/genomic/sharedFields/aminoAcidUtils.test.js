import {
  getCompatibleAltAminoAcids,
  isAltAminoAcidCompatible,
} from "./aminoAcidUtils";

const aminoAcidList = [
  "Glu",
  "Ser",
  "Pro",
  "Val",
  "V",
  "Gly",
  "CUSTOM",
  "Ter",
  "*",
];

describe("getCompatibleAltAminoAcids", () => {
  test("returns three-letter amino acids and custom values for a three-letter Ref AA", () => {
    expect(getCompatibleAltAminoAcids("Val", aminoAcidList)).toEqual([
      "Glu",
      "Ser",
      "Pro",
      "Val",
      "Gly",
      "CUSTOM",
      "Ter",
    ]);
  });

  test("returns one-letter amino acids and custom values for a one-letter Ref AA", () => {
    expect(getCompatibleAltAminoAcids("V", aminoAcidList)).toEqual([
      "V",
      "CUSTOM",
      "*",
    ]);
  });

  test("returns all configured values for a custom Ref AA", () => {
    expect(getCompatibleAltAminoAcids("CUSTOM", aminoAcidList)).toEqual(
      aminoAcidList
    );
  });

  test("returns all configured values when Ref AA is empty", () => {
    expect(getCompatibleAltAminoAcids("", aminoAcidList)).toEqual(
      aminoAcidList
    );
  });
});

test("returns false when Alt AA becomes incompatible with the selected Ref AA notation", () => {
  expect(isAltAminoAcidCompatible("Val", "*", aminoAcidList)).toBe(false);
});

test("returns true when Alt AA remains compatible with the selected Ref AA notation", () => {
  expect(isAltAminoAcidCompatible("Val", "Gly", aminoAcidList)).toBe(true);
});
