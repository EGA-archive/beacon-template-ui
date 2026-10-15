export const MOLECULAR_EFFECT_IDS = [
  "ENSGLOSSARY:0000150",
  "ENSGLOSSARY:0000161",
  "SO:0001631",
  "SO:0001623",
  "SO:0001819",
  "SO:0001632",
  "SO:0001792",
  "SO:0001988",
  "SO:0001630",
  "SO:0000605",
  "SO:0001575",
  "SO:0001624",
  "SO:0001574",
  "SO:0001567",
  "SO:0001580",
];

export function isMolecularEffect(id) {
  return MOLECULAR_EFFECT_IDS.includes(id);
}
