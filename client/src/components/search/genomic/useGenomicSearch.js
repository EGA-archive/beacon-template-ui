import config from "../../../config/runtimeConfig";
import { COMMON_MESSAGES } from "../../common/CommonMessage";
import {
  buildGenomicLabel,
  buildSequenceQueryLabel,
} from "../../genomic/genomicLabelHelper";
import {
  buildGenomicFilterId,
  detectAndCleanVariant,
  validateGenomicVariant,
} from "../genomicSearchUtils";

export default function useGenomicSearch({
  assembly,
  setAssembly,
  genomicDraft,
  setGenomicDraft,
  selectedFilter,
  setSelectedFilter,
  setMessage,
}) {
  const commitGenomicDraft = () => {
    const chromosomeLibrary =
      config?.ui?.genomicQueries?.chromosomeLibrary ?? [];

    const { isVariant, cleanedValue, detectedAssembly } = detectAndCleanVariant(
      genomicDraft,
      config?.assemblyId ?? [],
      chromosomeLibrary
    );

    if (!cleanedValue) return;

    if (detectedAssembly && detectedAssembly !== assembly) {
      setAssembly(detectedAssembly);
    }

    const finalAssembly = detectedAssembly || assembly;

    const alreadyHasGenomic = selectedFilter.some(
      (filter) => filter.type === "genomic" && filter.scope !== "editing"
    );

    if (alreadyHasGenomic) {
      setMessage(COMMON_MESSAGES.singleGenomicQuery);
      setTimeout(() => setMessage(null), 3000);
      setTimeout(() => setGenomicDraft(""), 3000);
      return;
    }

    const labelForCheck = `${finalAssembly} | ${cleanedValue}`
      .replace(/\|{2,}/g, "|")
      .replace(/\|\s*\|/g, "|")
      .replace(/\|\s+$/, "")
      .replace(/^\s+\|/, "");

    const isDuplicate = selectedFilter.some(
      (filter) =>
        filter.label.trim().toLowerCase() === labelForCheck.toLowerCase()
    );

    if (isDuplicate) {
      setMessage(COMMON_MESSAGES.doubleValue);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (isVariant) {
      const validationError = validateGenomicVariant(
        cleanedValue,
        chromosomeLibrary
      );

      if (validationError) {
        setMessage(validationError);
        setTimeout(() => setMessage(null), 9000);
        return;
      }
    } else {
      setMessage(COMMON_MESSAGES.invalidGenomicQuery);
      setTimeout(() => setMessage(null), 9000);
      return;
    }

    const [chromosome, position, ref, alt] = cleanedValue.split("-");

    const queryParams = {
      assemblyId: finalAssembly,
      referenceName: chromosome,
      start: [Number(position)],
      referenceBases: ref,
      alternateBases: alt,
    };

    const id = buildGenomicFilterId("Sequence Query", queryParams);
    const label = buildSequenceQueryLabel(queryParams);

    const newGenomicFilter = {
      id,
      key: "Sequence Query",
      label,
      scope: "genomicVariant",
      bgColor: "genomic",
      type: "genomic",
      queryType: "Sequence Query",
      queryParams,
    };

    setSelectedFilter((prev) => [...prev, newGenomicFilter]);
    setGenomicDraft("");
  };

  const commitStringQuery = (queryType) => {
    const value = genomicDraft.trim();

    if (!value) return;

    const alreadyHasGenomic = selectedFilter.some(
      (filter) => filter.type === "genomic" && filter.scope !== "editing"
    );

    if (alreadyHasGenomic) {
      setMessage(COMMON_MESSAGES.singleGenomicQuery);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const queryParams =
      queryType === "Gene ID"
        ? { geneId: value }
        : { genomicAlleleShortForm: value };

    const id = buildGenomicFilterId(queryType, queryParams);
    const label = buildGenomicLabel(queryParams);

    const newGenomicFilter = {
      id,
      key: queryType,
      label,
      scope: "genomicQueryBuilder",
      bgColor: "genomic",
      type: "genomic",
      queryType,
      queryParams,
    };

    setSelectedFilter((prev) => [...prev, newGenomicFilter]);
    setGenomicDraft("");
    setMessage(null);
  };

  return {
    commitGenomicDraft,
    commitStringQuery,
  };
}
