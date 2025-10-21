import * as Yup from "yup";
import config from "../../config/config.json";

// Yup base pattern for Ref/Alt bases — allows IUPAC codes (excluding U), '.' and '-'
export const basePattern = /^[ACGTRYSWKMBDHVN.\-]+$/;

// Chromosome validator:
// Accepts a variety of chromosome formats:
// - Standard numeric chromosomes: "1" to "22"
// - Sex chromosomes: "X", "Y" (case-insensitive)
// - With or without "chr" prefix: e.g. "chr1", "chrX"
// - RefSeq identifiers: starting with "refseq:" or "nc_"

// Chromosome validator (dynamic from config)
export const chromosomeValidator = Yup.string()
  .required("Chromosome is required")
  .test(
    "valid-chromosome",
    "Invalid chromosome — must match the available list",
    function (input) {
      if (!input) return false;

      const library =
        config.ui.genomicQueries.genomicQueryBuilder.chromosomeLibrary;

      // Normalize input (trim, uppercase)
      const normalized = input.trim().toUpperCase();

      // Only allow exact matches from library from the config
      return library.map((c) => c.toUpperCase()).includes(normalized);
    }
  );

// Required RefBases: must match IUPAC pattern, required
// Combinations of the IUPAC characters are allowed
export const requiredRefBases = Yup.string()
  .matches(
    basePattern,
    "Only valid IUPAC codes (except U) and characters '.' or '-' are allowed"
  )
  .required("Reference Base is required");

// Required AltBases: must match IUPAC pattern, required, and not equal to RefBases
// Combinations of the IUPAC characters are allowed
export const requiredAltBases = Yup.string()
  .matches(
    basePattern,
    "Only valid IUPAC codes (except U) and characters '.' or '-' are allowed"
  )
  .required("Alternate Base is required")
  .test(
    "not-equal-to-ref",
    "Ref and Alt bases must not be the same",
    function (value) {
      const { refBases } = this.parent;
      if (!refBases || !value) return true;
      return refBases !== value;
    }
  );

export const nonRequiredAltBases = Yup.string().matches(
  basePattern,
  "Only valid IUPAC codes (except U) and characters '.' or '-' are allowed"
);

// Aminoacid Change fields (Ref and Alt): optional string
export const refAaValidator = Yup.string().optional();

export const altAaValidator = Yup.string()
  .optional()
  .test(
    "not-equal-to-refAa",
    "Ref AA and Alt AA cannot be the same",
    function (value) {
      const { refAa } = this.parent;
      if (!refAa || !value) return true;
      return refAa !== value;
    }
  );

// As part of Aminoacid Change fields: aaPosition, must be a positive integer number
export const aaPositionValidator = Yup.number()
  .typeError("Position must be a number")
  .integer("Position must be an integer")
  .min(1, "Position must be greater than 0")
  .optional();

// Start position (used for both Start and Start braket): required integer
export const createStartValidator = (label = "Start") =>
  Yup.number()
    .typeError(`${label} must be a number`)
    .integer(`${label} must be an integer`)
    .required(`${label} is required`);

// End position: required, must be ≥ start
export const createEndValidator = (label = "End", startLabel = "Start") =>
  Yup.number()
    .typeError(`${label} must be a number`)
    .integer(`${label} must be an integer`)
    .when("start", (start, schema) =>
      start
        ? schema.min(
            start,
            `${label} must be greater than or equal to ${startLabel}`
          )
        : schema
    )
    .required(`${label} is required`);

// Variant length: optional positive integers, max must be ≥ min
// Min variant length: disabled for SNP, allowed otherwise
export const minVariantLength = Yup.number()
  .transform((val, original) => (original === "" ? undefined : val)) // "" → undefined
  .typeError("Must be a number")
  .integer("Must be an integer")
  .min(1, "Must be at least 1")
  .optional();

// Max variant length
export const maxVariantLength = Yup.number()
  .transform((val, original) => (original === "" ? undefined : val)) // "" → undefined
  .typeError("Must be a number")
  .integer("Must be an integer")
  .min(1, "Must be at least 1")
  .test(
    "is-greater",
    "Max must be greater than or equal to Min",
    function (value) {
      const { minVariantLength } = this.parent;
      if (value === undefined || minVariantLength === undefined) return true;
      return value >= minVariantLength;
    }
  )
  .optional();

// Assembly ID: required or optional depending on context
// This const comes from the config file
export const assemblyIdRequired = Yup.string().required(
  "Assembly ID is required"
);
export const assemblyIdOptional = Yup.string().optional();

// Gene ID: required string, no restrictive rules
export const geneId = Yup.string();

// Genomic HGVS: required string, no restrictive rules
export const genomicHGVSshortForm = Yup.string().required(
  "Genomic HGVS short form is required"
);

const numberField = (label) =>
  Yup.number()
    .typeError(`${label} must be a number`)
    .integer(`${label} must be an integer`)
    .required(`${label} is required`);

export const bracketRangeValidator = Yup.object({
  startMin: numberField("Start Min"),

  startMax: numberField("Start Max").moreThan(
    Yup.ref("startMin"),
    "Start Max must be greater than Start Min"
  ),

  endMin: numberField("End Min")
    // allow overlap, just ensure logical order relative to Start Min
    .moreThan(Yup.ref("startMin"), "End Min must be greater than Start Min"),

  endMax: numberField("End Max")
    .moreThan(Yup.ref("endMin"), "End Max must be greater than End Min")
    .test(
      "endMax-vs-startMax",
      "End Max cannot be smaller than Start Max",
      function (value) {
        const { startMax } = this.parent;
        if (value == null || startMax == null) return true;
        return value >= startMax;
      }
    ),
});
