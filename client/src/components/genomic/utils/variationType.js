// Simple normalizer to make the jsonName case insensitive
export const normalizeVariationType = (jsonName) => {
  if (!jsonName) return "";
  return jsonName.trim().toUpperCase();
};
