import { COMMON_MESSAGES } from "../../common/CommonMessage";
import { GENOMIC_LABELS_MAP } from "../genomicLabelHelper";

// Custom hook that centralizes the click logic for Genomic Annotation examples.
//
// It supports:
// 1. Genomic query examples
// 2. Ontology-based genomic annotation filters, such as Molecular Effect
export function useGenomicAnnotationClick({
  selectedFilter,
  setSelectedFilter,
  setMessage,
  setQueryDirty,
  hasSearchResults,
}) {
  return function handleGenomicAnnotationClick(item) {
    /**
     * GENOMIC QUERY EXAMPLES
     *
     * Examples:
     * - Gene ID
     * - Sequence Query
     * - Range Query
     * - Bracket Query
     * - HGVS
     */
    if (item.type === "genomic" && item.queryParams) {
      // Only one genomic query can be applied at a time.
      const alreadyHasGenomic = selectedFilter.some(
        (filter) => filter.type === "genomic" && filter.scope !== "editing"
      );

      if (alreadyHasGenomic) {
        setMessage(COMMON_MESSAGES.singleGenomicQuery);

        setTimeout(() => {
          setMessage(null);
        }, 5000);

        return;
      }

      /**
       * Extract all populated genomic-query parameters.
       */
      const validEntries = Object.entries(item.queryParams).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          !(typeof value === "string" && value.trim() === "")
      );

      /**
       * Build an identifier for the applied genomic query.
       */
      const idLabel = validEntries
        .map(([key, value]) => `${key}:${value}`)
        .join("-");

      /**
       * Build the readable label displayed in Query Applied.
       */
      const combinedLabel = validEntries
        .map(([key, value]) => {
          const displayKey = GENOMIC_LABELS_MAP[key] || key;

          return `${displayKey}: ${value}`;
        })
        .join(" | ");

      const newFilter = {
        id: `genomic-${item.queryType}-${idLabel}`,
        label: combinedLabel,
        key: item.queryType,
        scope: "genomicQueryBuilder",
        bgColor: "genomic",
        type: "genomic",
        queryType: item.queryType,
        queryParams: item.queryParams,
      };

      setSelectedFilter((prev) => [...prev, newFilter]);

      if (hasSearchResults) {
        setQueryDirty(true);
      }

      return;
    }

    /**
     * MOLECULAR EFFECT / ONTOLOGY FILTERS
     *
     * Molecular Effects are not genomic query-builder queries.
     * They are ontology filtering terms scoped to genomic variations.
     *
     * Examples:
     * - missense_variant
     * - synonymous_variant
     */
    if (item.type === "ontology") {
      const normalizedFilter = {
        ...item,

        id: item.id,

        key: item.key ?? item.id,

        label: item.label ?? item.id,

        type: "ontology",

        scope: item.scope ?? "genomicVariation",

        bgColor: item.bgColor ?? "genomic",
      };

      /**
       * Do not add the same ontology term more than once.
       */
      const alreadySelected = selectedFilter.some(
        (filter) =>
          filter.id === normalizedFilter.id &&
          filter.scope === normalizedFilter.scope
      );

      if (alreadySelected) {
        return;
      }

      setSelectedFilter((prev) => [...prev, normalizedFilter]);

      if (hasSearchResults) {
        setQueryDirty(true);
      }

      return;
    }

    /**
     * Any unsupported annotation type still marks an
     * existing result set as outdated.
     */
    if (hasSearchResults) {
      setQueryDirty(true);
    }
  };
}
