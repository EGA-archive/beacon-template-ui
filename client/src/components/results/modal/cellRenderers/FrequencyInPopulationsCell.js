import AlleleFrequenciesButton from "../AlleleFrequenciesButton";

const hasAlleleFrequencies = (value) =>
  Array.isArray(value) &&
  value.some(
    (populationGroup) =>
      Array.isArray(populationGroup?.frequencies) &&
      populationGroup.frequencies.length > 0
  );

export default function FrequencyInPopulationsCell({
  value,
  item,
  onOpenAlleleFrequency,
}) {
  if (!hasAlleleFrequencies(value)) {
    return "-";
  }

  return (
    <AlleleFrequenciesButton onClick={() => onOpenAlleleFrequency?.(item)} />
  );
}
