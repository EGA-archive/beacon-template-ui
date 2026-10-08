import * as Yup from "yup";

import GeneIdForm from "./querybuilder/GeneIdForm";
import GenomicLocationRange from "./querybuilder/GenomicLocationRange";
import GenomicAlleleQuery from "./querybuilder/GenomicAlleleQuery";
import GenomicLocationBracket from "./querybuilder/GenomicLocationBracket";
import DefinedVariationSequence from "./querybuilder/DefinedVariationSequence";

import {
  bracketRangeValidator,
  assemblyIdRequired,
  chromosomeValidator,
  createStartValidator,
  createEndValidator,
  refAaValidator,
  aaPositionValidator,
  altAaValidator,
  minVariantLength,
  maxVariantLength,
  requiredRefBases,
  requiredAltBases,
  nonRequiredAltBases,
  genomicHGVSshortForm,
  aminoAcidChangeGroupValidator,
} from "./genomicQueryBuilderValidator";

const OPTIONAL_VARIATION_VALIDATORS = {
  alternateBases: nonRequiredAltBases,
  refAa: refAaValidator,
  altAa: altAaValidator,
  aaPosition: aaPositionValidator,
  minVariantLength,
  maxVariantLength,
};

export const QUERY_TYPE_CONFIG = {
  sequenceQuery: {
    label: "Sequence Query",
    component: DefinedVariationSequence,
  },
  geneId: {
    label: "Gene ID",
    component: GeneIdForm,
  },
  rangeQuery: {
    label: "Range Query",
    component: GenomicLocationRange,
  },
  bracketQuery: {
    label: "Bracket Query",
    component: GenomicLocationBracket,
  },
  hgvsQuery: {
    label: "Genomic Allele Query (HGVS)",
    component: GenomicAlleleQuery,
  },
};

export const VALIDATION_SCHEMA_MAP = {
  "Sequence Query": Yup.object({
    assemblyId: assemblyIdRequired.required("Assembly ID is required"),
    chromosome: chromosomeValidator.required("Chromosome is required"),
    start: createStartValidator("Start"),
    alternateBases: requiredAltBases,
    refBases: requiredRefBases,
  }),

  "Gene ID": Yup.object({
    geneId: Yup.string().required("Gene ID is required"),
    ...OPTIONAL_VARIATION_VALIDATORS,
  }).concat(aminoAcidChangeGroupValidator),

  "Range Query": Yup.object({
    assemblyId: assemblyIdRequired,
    chromosome: chromosomeValidator.required("Chromosome is required"),
    start: createStartValidator("Start"),
    end: createEndValidator("End", "Start"),
    ...OPTIONAL_VARIATION_VALIDATORS,
  }).concat(aminoAcidChangeGroupValidator),

  "Bracket Query": bracketRangeValidator.shape({
    assemblyId: assemblyIdRequired,
    chromosome: chromosomeValidator.required("Chromosome is required"),
  }),

  "Genomic Allele Query (HGVS)": Yup.object({
    genomicHGVSshortForm,
  }),
};

export const EMPTY_INITIAL_VALUES = {
  geneId: "",
  assemblyId: "",
  chromosome: "",
  start: "",
  end: "",
  variantType: "",
  alternateBases: "",
  refBases: "",
  altBases: "",
  aminoacidChange: "",
  minVariantLength: "",
  maxVariantLength: "",
  genomicHGVSshortForm: "",
  startMin: "",
  startMax: "",
  endMin: "",
  endMax: "",
  refAa: "",
  altAa: "",
  aaPosition: "",
};
