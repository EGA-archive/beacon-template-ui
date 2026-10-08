const AMINO_ACID_PAIRS = {
  Ala: "A",
  Cys: "C",
  Asp: "D",
  Glu: "E",
  Phe: "F",
  Gly: "G",
  His: "H",
  Ile: "I",
  Lys: "K",
  Leu: "L",
  Met: "M",
  Asn: "N",
  Pro: "P",
  Gln: "Q",
  Arg: "R",
  Ser: "S",
  Thr: "T",
  Val: "V",
  Trp: "W",
  Tyr: "Y",
  Ter: "*",
};

const THREE_LETTER_AMINO_ACIDS = new Set(Object.keys(AMINO_ACID_PAIRS));
const ONE_LETTER_AMINO_ACIDS = new Set(Object.values(AMINO_ACID_PAIRS));

export const getCompatibleAltAminoAcids = (refAa, aminoAcidList) => {
  if (!refAa) return aminoAcidList;

  const customAminoAcids = aminoAcidList.filter(
    (aa) => !THREE_LETTER_AMINO_ACIDS.has(aa) && !ONE_LETTER_AMINO_ACIDS.has(aa)
  );

  if (THREE_LETTER_AMINO_ACIDS.has(refAa)) {
    return aminoAcidList.filter(
      (aa) => THREE_LETTER_AMINO_ACIDS.has(aa) || customAminoAcids.includes(aa)
    );
  }

  if (ONE_LETTER_AMINO_ACIDS.has(refAa)) {
    return aminoAcidList.filter(
      (aa) => ONE_LETTER_AMINO_ACIDS.has(aa) || customAminoAcids.includes(aa)
    );
  }

  // Custom Ref AA: notation is unknown, so keep all configured values available.
  return aminoAcidList;
};

export const isAltAminoAcidCompatible = (refAa, altAa, aminoAcidList) => {
  if (!altAa) return true;

  return getCompatibleAltAminoAcids(refAa, aminoAcidList).includes(altAa);
};
