import {
  getNullableNumber,
  normalizeGenotypeCounts,
} from "./alleleFrequencyUtils";

/**
 * Convert the nested Beacon allele-frequency response into simple rows.
 *
 * The same rows can be reused by:
 * - the allele-frequency table;
 * - the allele-frequency graph;
 * - future downloads or filters.
 */
export const buildAlleleFrequencyRows = (frequencyInPopulations = []) => {
  if (!Array.isArray(frequencyInPopulations)) {
    return [];
  }

  return frequencyInPopulations.flatMap((populationGroup, groupIndex) => {
    const frequencies = Array.isArray(populationGroup?.frequencies)
      ? populationGroup.frequencies
      : [];

    return frequencies.map((frequency, rowIndex) => {
      const genotypeCounts = normalizeGenotypeCounts(frequency);

      return {
        id: `${groupIndex}-${rowIndex}-${frequency.population || "unknown"}`,

        population: frequency.population || "Unknown",

        alleleFrequency: getNullableNumber(frequency.alleleFrequency),

        alleleCount: getNullableNumber(frequency.alleleCount),

        alleleNumber: getNullableNumber(frequency.alleleNumber),

        homozygous: genotypeCounts.homozygous,
        heterozygous: genotypeCounts.heterozygous,
        hemizygous: genotypeCounts.hemizygous,
      };
    });
  });
};
