// Components that checks if AF is present in a specific set of results

export const hasAlleleFrequencies = (value) =>
  Array.isArray(value) &&
  value.some(
    (populationGroup) =>
      Array.isArray(populationGroup?.frequencies) &&
      populationGroup.frequencies.length > 0
  );
