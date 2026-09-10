/**
 Convert a value into a valid number that follows the same rules as the EGA AF Browser.
 * Returns:
 * - the number when the value is valid;
 * - 0 when the value is zero;
 * - null when the value is missing.
 */
export const getNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

/**
 * Normalize genotype count names used by different datasets or versions.
 *
 * Some datasets use:
 * - alleleCountHomozygous
 * - alleleCountHeterozygous
 * - alleleCountHemizygous
 *
 * Other datasets use:
 * - genotypeHomozygous
 * - genotypeHeterozygous
 * - genotypeHemizygous
 */
export const normalizeGenotypeCounts = (frequency = {}) => {
  const pickFirstAvailableValue = (...values) =>
    values.find((value) => value !== undefined && value !== null);

  return {
    homozygous: getNullableNumber(
      pickFirstAvailableValue(
        frequency.alleleCountHomozygous,
        frequency.genotypeHomozygous
      )
    ),

    heterozygous: getNullableNumber(
      pickFirstAvailableValue(
        frequency.alleleCountHeterozygous,
        frequency.genotypeHeterozygous
      )
    ),

    hemizygous: getNullableNumber(
      pickFirstAvailableValue(
        frequency.alleleCountHemizygous,
        frequency.genotypeHemizygous
      )
    ),
  };
};

/**
 * Format an allele-frequency value for display.
 *
 * Rules:
 * - missing or invalid values become "-";
 * - zero stays "0";
 * - values below 1e-5 use scientific notation;
 * - values equal to or above 1e-5 use normal decimal notation;
 * - unnecessary trailing zeros are removed.
 */
export const formatAlleleFrequency = (
  value,
  { threshold = 1e-5, decimalDigits = 6, exponentDigits = 2 } = {}
) => {
  const numericValue = getNullableNumber(value);

  if (numericValue === null) {
    return "-";
  }

  const absoluteValue = Math.abs(numericValue);

  if (absoluteValue !== 0 && absoluteValue < threshold) {
    return numericValue.toExponential(exponentDigits).replace("+", "");
  }

  const formattedValue = numericValue.toFixed(decimalDigits);

  return formattedValue.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
};

/**
 * Format a normal count value for display.
 *
 * Missing values become "-".
 * Zero stays "0".
 */
export const formatCount = (value) => {
  const numericValue = getNullableNumber(value);

  return numericValue === null ? "-" : String(numericValue);
};
