// Simple normalizer to make Variant Type comparisons case-insensitive
export const normalizeVariantType = (variantType) => {
  if (!variantType) return "";

  return variantType.trim().toUpperCase();
};
