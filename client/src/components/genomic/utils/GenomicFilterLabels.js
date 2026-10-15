import config from "../../../config/runtimeConfig";

const inferGenomicAnnotationLabel = ({ queryType, queryParams = {} }) => {
  switch (queryType) {
    case "Gene ID": {
      const { geneId, refAa, aaPosition, altAa } = queryParams;

      if (refAa && aaPosition && altAa) {
        return `${geneId}:p.${refAa}${aaPosition}${altAa}`;
      }

      return geneId;
    }

    case "Sequence Query":
      return `${queryParams.assemblyId} | ${queryParams.referenceName}-${queryParams.start?.[0]}-${queryParams.referenceBases}-${queryParams.alternateBases}`;

    case "Range Query":
      return `${queryParams.assemblyId}:${queryParams.referenceName}:${queryParams.start?.[0]}-${queryParams.end?.[0]}`;

    case "Bracket Query":
      return `${queryParams.assemblyId}:${
        queryParams.referenceName
      }:start[${queryParams.start?.join(", ")}] end[${queryParams.end?.join(
        ", "
      )}]`;

    case "Genomic Allele Query (HGVS)":
      return queryParams.genomicAlleleShortForm;

    default:
      return queryType;
  }
};

const normalizeGenomicAnnotation = (annotation) => {
  const label = annotation.label || inferGenomicAnnotationLabel(annotation);

  const id = `${annotation.queryType}:${JSON.stringify(
    annotation.queryParams
  )}`;

  return {
    key: id,
    id,
    label,
    type: "genomic",
    queryType: annotation.queryType,
    queryParams: annotation.queryParams,
  };
};

const annotationCategories =
  config.ui.genomicAnnotations?.annotationCategories || [];

const configuredAnnotationLabels =
  config.ui.genomicAnnotations?.annotationLabels || {};

const configuredGenomicAnnotations = Object.fromEntries(
  annotationCategories.map((category) => [
    category,
    (configuredAnnotationLabels[category] || []).map(
      normalizeGenomicAnnotation
    ),
  ])
);

const molecularEffectLabels = [
  {
    key: "ENSGLOSSARY:0000174",
    id: "ENSGLOSSARY:0000174",
    label: "intergenic_region",
    type: "ontology",
    scope: "genomicVariation",
  },
  {
    key: "ENSGLOSSARY:0000150",
    id: "ENSGLOSSARY:0000150",
    label: "missense_variant",
    type: "ontology",
    scope: "genomicVariation",
  },
];

export const filterLabels = {
  ...configuredGenomicAnnotations,
  "Molecular Effects": molecularEffectLabels,
};
