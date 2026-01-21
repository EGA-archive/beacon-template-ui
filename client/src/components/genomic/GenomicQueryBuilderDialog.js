import * as Yup from "yup";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StyledGenomicLabels from "./styling/StyledGenomicLabels";
import GeneIdForm from "./querybuilder/GeneIdForm";
import GenomicLocationRage from "./querybuilder/GenomicLocationRange";
import GenomicAlleleQuery from "./querybuilder/GenomicAlleleQuery";
import GenomicLocationBracket from "./querybuilder/GenomicLocationBracket";
import DefinedVariationSequence from "./querybuilder/DefinedVariationSequence";
import GenomicSubmitButton from "../genomic/GenomicSubmitButton";
import { Formik, Form } from "formik";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import { buildGenomicParams } from "../genomic/utils/buildGenomicParams";
import { GENOMIC_LABELS_MAP } from "../genomic/genomicLabelHelper";
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
} from "../genomic/genomicQueryBuilderValidator";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";

// List of all query types shown as options in the UI
// Used to display the selection buttons and control which form is shown
// This list comes from the configuration file
const QUERY_TYPE_LABELS = {
  sequenceQuery: "Sequence Query",
  geneId: "Gene ID",
  rangeQuery: "Range Query",
  bracketQuery: "Bracket Query",
  hgvsQuery: "Genomic Allele Query (HGVS)",
};

const enabledQueryTypes = Object.entries(
  config.ui.genomicQueries.genomicQueryTypes
)
  .filter(([_, enabled]) => enabled)
  .map(([key]) => ({
    key,
    label: QUERY_TYPE_LABELS[key],
  }));

// Helper, most probably will need to move it
const EMPTY_INITIAL_VALUES = {
  geneId: "",
  assemblyId: "",
  chromosome: "",
  start: "",
  end: "",
  variationType: "",
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

const mapQueryParamsToFormik = (queryType, queryParams = {}) => {
  const base = { ...EMPTY_INITIAL_VALUES };
  const firstOrEmpty = (v) => (Array.isArray(v) ? v[0] ?? "" : v ?? "");
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

export default function GenomicQueryBuilderDialog({
  open,
  handleClose,
  selectedFilter,
  setSelectedFilter,
}) {
  // This selectes on load the first query type, without user's interaction
  const [selectedQueryType, setSelectedQueryType] = useState(
    enabledQueryTypes[0]?.label
  );
  const [selectedInput, setSelectedInput] = useState("variationType");
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const { genomicPrefill, clearGenomicPrefill } = useSelectedEntry();

  // This map links each query type label to the corresponding form component
  // It tells the app which form to display based on the user's selection
  const formComponentsMap = {
    "Gene ID": GeneIdForm,
    "Range Query": GenomicLocationRage,
    "Bracket Query": GenomicLocationBracket,
    "Sequence Query": DefinedVariationSequence,
    "Genomic Allele Query (HGVS)": GenomicAlleleQuery,
  };

  // The rules of the validation schema can be checked in the component: genomicQueryBuilderValidator
  // Validation rules for each query type form
  // Each type has its own schema to check if required fields are filled
  const validationSchemaMap = {
    "Sequence Query": Yup.object({
      assemblyId: assemblyIdRequired.required("Assembly ID is required"),
      chromosome: chromosomeValidator.required("Chromosome is required"),
      start: createStartValidator("Start"),
      alternateBases: requiredAltBases,
      refBases: requiredRefBases,
    }),

    "Gene ID": Yup.object({
      // Gene ID is required
      geneId: Yup.string().required("Gene ID is required"),
      // These are optional and validated if present
      alternateBases: nonRequiredAltBases,
      refAa: refAaValidator,
      altAa: altAaValidator,
      aaPosition: aaPositionValidator,
      minVariantLength,
      maxVariantLength,
    }).concat(aminoAcidChangeGroupValidator),

    // This form requires more positional data and variation info
    "Range Query": Yup.object({
      assemblyId: assemblyIdRequired,
      chromosome: chromosomeValidator.required("Chromosome is required"),
      start: createStartValidator("Start"),
      end: createEndValidator("End", "Start"),
      alternateBases: nonRequiredAltBases,
      refAa: refAaValidator,
      altAa: altAaValidator,
      aaPosition: aaPositionValidator,
      minVariantLength,
      maxVariantLength,
    }).concat(aminoAcidChangeGroupValidator),

    // Bracket query uses a simpler schema, just needs the chromosome + location range
    "Bracket Query": bracketRangeValidator.shape({
      assemblyId: assemblyIdRequired,
      chromosome: chromosomeValidator.required("Chromosome is required"),
    }),

    // This is a shortcut query type using HGVS format
    "Genomic Allele Query (HGVS)": Yup.object({
      genomicHGVSshortForm,
    }),
  };

  // Get the form component that matches the currently selected query type
  // This is used to render the correct form in the UI based on user's selection
  const SelectedFormComponent = formComponentsMap[selectedQueryType];

  // Compute initial values: ONLY the tab matching genomicPrefill.queryType gets values
  const initialValues =
    open &&
    genomicPrefill?.queryType &&
    genomicPrefill?.queryParams &&
    selectedQueryType === genomicPrefill.queryType
      ? mapQueryParamsToFormik(selectedQueryType, genomicPrefill.queryParams)
      : EMPTY_INITIAL_VALUES;

  useEffect(() => {
    if (open && genomicPrefill?.queryType) {
      setSelectedQueryType(genomicPrefill.queryType);
    }
  }, [open, genomicPrefill]);

  const resetBuilderState = () => {
    setSelectedQueryType(enabledQueryTypes[0]?.label);
    setSelectedInput("variationType");
    setDuplicateMessage("");
  };

  return (
    // This is the empty dialog
    <Dialog
      open={open}
      onClose={() => {
        resetBuilderState();
        clearGenomicPrefill();
        handleClose();
      }}
      disablePortal={false}
      disableAutoFocus={false}
      disableEnforceFocus={false}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "10px",
          padding: "20px",
          height: "75%",
        },
      }}
    >
      {/* This is the box in which the title is contained */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Title that is consistent across all query types */}
        <DialogTitle
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            fontFamily: '"Open Sans", sans-serif',
          }}
        >
          Genomic Query Builder
        </DialogTitle>
        {/* This is the icon to close the dialog + the dialog closes by tapping outside of it  */}
        <IconButton
          edge="start"
          color="inherit"
          // onClick={handleClose}
          onClick={() => {
            resetBuilderState();
            clearGenomicPrefill();
            handleClose();
          }}
          aria-label="close"
          sx={{ mr: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/*The dyamic content of the dialog starts here */}
      <DialogContent
        sx={{
          pt: 1,
        }}
      >
        {/* This is the form wrapper that controls validation and submission, 
        it uses dynamic initial values as empty and validation schemas based on the
        selected query type */}
        <Formik
          key={selectedQueryType}
          enableReinitialize
          validateOnMount
          initialValues={initialValues}
          validationSchema={validationSchemaMap[selectedQueryType]}
          onSubmit={(values) => {
            if (values.chromosome) {
              values.chromosome = values.chromosome.trim().toUpperCase();
            }

            // STEP 2A: build Beacon-compatible query params
            const queryParams = buildGenomicParams(
              selectedQueryType,
              values,
              selectedInput
            );

            // These are exclusive groups...
            const mutuallyExclusiveGroups = {
              variationType: ["variationType"],
              alternateBases: ["alternateBases", "refBases", "altBases"],
              aminoacidChange: [
                "aminoacidChange",
                "refAa",
                "altAa",
                "aaPosition",
              ],
            };

            const allExclusiveKeys = Object.values(
              mutuallyExclusiveGroups
            ).flat();
            const allowedExclusiveKeys =
              mutuallyExclusiveGroups[selectedInput] || [];

            const validEntries = Object.entries(values).filter(
              ([key, value]) => {
                if (
                  value === undefined ||
                  value === null ||
                  (typeof value === "string" && value.trim() === "")
                ) {
                  return false;
                }
                if (allExclusiveKeys.includes(key)) {
                  if (selectedQueryType === "Sequence Query") return true;
                  if (!selectedInput) return true;
                  return allowedExclusiveKeys.includes(key);
                }
                return true;
              }
            );

            const idLabel = validEntries
              .map(([key, value]) => `${key}:${value}`)
              .join("-");

            const combinedLabel = validEntries
              .map(([key, value]) => {
                const displayKey = GENOMIC_LABELS_MAP[key] || key;
                return `${displayKey}: ${value}`;
              })
              .join(" | ");

            // STEP 2B: add queryParams to the filter
            const newFilter = {
              id: `genomic-${selectedQueryType}-${idLabel}`,
              label: combinedLabel,
              key: selectedQueryType,
              scope: "genomicQueryBuilder",
              bgColor: "genomic",
              type: "genomic",
              queryType: selectedQueryType,
              queryParams,
            };

            // Prevent duplicates
            const exists = selectedFilter.some((f) => f.id === newFilter.id);
            if (exists) {
              console.warn("[GQB] Duplicate genomic query prevented");
              setDuplicateMessage(COMMON_MESSAGES.doubleValue);
              setTimeout(() => setDuplicateMessage(""), 5000);
              return;
            }

            const alreadyHasGenomic = selectedFilter.some(
              (f) => f.type === "genomic"
            );
            if (alreadyHasGenomic) {
              console.warn(
                "[GQB] Attempted to add a second genomic query — blocked"
              );
              setDuplicateMessage(COMMON_MESSAGES.singleGenomicQuery);
              setTimeout(() => setDuplicateMessage(""), 5000);
              setTimeout(() => handleClose(), 3000);
              return;
            }

            // STEP 2C: update applied filters
            setSelectedFilter((prev) => {
              const next = [...prev, newFilter];
              return next;
            });

            setDuplicateMessage("");
            resetBuilderState();
            clearGenomicPrefill();
            handleClose();
          }}
        >
          {({ resetForm, isValid, dirty, values, errors }) => {
            console.log("[GQB DEBUG]", {
              selectedQueryType,
              isValid,
              dirty,
              values,
              initialValues,
            });

            return (
              <Form>
                {/* Render the selectable query type buttons */}
                {/* When a user clicks a button, the form type changes and the form is reset */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {enabledQueryTypes.map(({ key, label }) => (
                    <StyledGenomicLabels
                      key={key}
                      label={label}
                      selected={selectedQueryType === label}
                      onClick={() => {
                        setSelectedQueryType(label);
                        resetForm({ values: EMPTY_INITIAL_VALUES });
                      }}
                    />
                  ))}
                </Box>
                {/* Render the selected form based on the current query type based on user's selection */}
                <Box
                  sx={{
                    mt: 4,
                  }}
                >
                  {SelectedFormComponent && (
                    <SelectedFormComponent
                      selectedInput={selectedInput}
                      setSelectedInput={setSelectedInput}
                    />
                  )}
                </Box>
                <Box sx={{ mt: 2, mb: 0 }}>
                  {duplicateMessage && (
                    <CommonMessage text={duplicateMessage} type="error" />
                  )}
                </Box>
                {/* Submit button is shown at the bottom right of all the query types and is disabled if the form is invalid or untouched */}
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                >
                  <GenomicSubmitButton disabled={!isValid} />
                </Box>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
