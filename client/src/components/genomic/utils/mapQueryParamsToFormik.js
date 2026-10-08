import { EMPTY_INITIAL_VALUES } from "../genomicQueryConfig";

export const mapQueryParamsToFormik = (queryType, queryParams = {}) => {
  const base = { ...EMPTY_INITIAL_VALUES };

  const firstOrEmpty = (value) =>
    Array.isArray(value) ? value[0] ?? "" : value ?? "";

  const hasEnd = queryParams.end !== undefined && queryParams.end !== null;

  switch (queryType) {
    case "Gene ID":
      return {
        ...base,
        geneId: queryParams.geneId || "",
        refAa: queryParams.refAa || "",
        aaPosition: queryParams.aaPosition || "",
        altAa: queryParams.altAa || "",
      };

    case "Genomic Allele Query (HGVS)":
      return {
        ...base,
        genomicHGVSshortForm: queryParams.genomicAlleleShortForm || "",
      };

    case "Sequence Query":
      return {
        ...base,
        assemblyId: queryParams.assemblyId || "",
        chromosome: queryParams.referenceName || "",
        start: firstOrEmpty(queryParams.start),
        refBases: queryParams.referenceBases || "",
        alternateBases: queryParams.alternateBases || "",
      };

    case "Range Query":
      return {
        ...base,
        assemblyId: queryParams.assemblyId || "",
        chromosome: queryParams.referenceName || "",
        start: firstOrEmpty(queryParams.start),
        end: hasEnd ? firstOrEmpty(queryParams.end) : "",
      };

    case "Bracket Query":
      return {
        ...base,
        assemblyId: queryParams.assemblyId || "",
        chromosome: queryParams.referenceName || "",
        startMin: queryParams.start?.[0] ?? "",
        startMax: queryParams.start?.[1] ?? "",
        endMin: queryParams.end?.[0] ?? "",
        endMax: queryParams.end?.[1] ?? "",
      };

    default:
      return base;
  }
};
