import * as Yup from "yup";
import { useState } from "react";
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
import GenomicLocationRage from "./querybuilder/GenomicLocationRage";
import GenomicAlleleQuery from "./querybuilder/GenomicAlleleQuery";
import GenomicLocationBracket from "./querybuilder/GenomicLocationBracket";
import DefinedVariationSequence from "./querybuilder/DefinedVariationSequence";
import GenomicSubmitButton from "../genomic/GenomicSubmitButton";
import { Formik, Form } from "formik";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";

import {
  assemblyIdRequired,
  chromosomeValidator,
  createStartValidator,
  createEndValidator,
  refBasesValidator,
  altBasesValidator,
  refAaValidator,
  aaPositionValidator,
  altAaValidator,
  minVariantLength,
  maxVariantLength,
  assemblyIdOptional,
  requiredRefBases,
  requiredAltBases,
  genomicHGVSshortForm,
  geneId,
} from "../genomic/genomicQueryBuilderValidator";

// List of all query types shown as options in the UI
// Used to display the selection buttons and control which form is shown
const genomicQueryTypes = [
  "GeneID",
  "Genetic location (Range)",
  "Genetic location aprox (Bracket)",
  "Defined short variation (Sequence)",
  "Genomic Allele Query (HGVS)",
];

export default function GenomicQueryBuilderDialog({
  open,
  handleClose,
  selectedFilter,
  setSelectedFilter,
}) {
  // This selectes on load the first query type, without user's interaction
  const [selectedQueryType, setSelectedQueryType] = useState(
    genomicQueryTypes[0]
  );
  const [selectedInput, setSelectedInput] = useState("variationType");
  const [duplicateMessage, setDuplicateMessage] = useState("");

  // This map links each query type label to the corresponding form component
  // It tells the app which form to display based on the user's selection
  const formComponentsMap = {
    GeneID: GeneIdForm,
    "Genetic location (Range)": GenomicLocationRage,
    "Genetic location aprox (Bracket)": GenomicLocationBracket,
    "Defined short variation (Sequence)": DefinedVariationSequence,
    "Genomic Allele Query (HGVS)": GenomicAlleleQuery,
  };

  // The rules of the validation schema can be checked in the component: genomicQueryBuilderValidator
  // Validation rules for each query type form
  // Each type has its own schema to check if required fields are filled
  const validationSchemaMap = {
    GeneID: Yup.object({
      // Gene ID is required
      geneId,

      // These are optional and validated if present
      refBases: refBasesValidator,
      altBases: altBasesValidator,
      refAa: refAaValidator,
      altAa: altAaValidator,
      aaPosition: aaPositionValidator,

      // Assembly ID is optional in this form
      assemblyId: assemblyIdOptional,

      // Start and end must be numbers and integers if provided
      start: Yup.number()
        .typeError("Start must be a number")
        .integer("Start must be an integer")
        .optional(),
      end: Yup.number()
        .typeError("End must be a number")
        .integer("End must be an integer")
        // If start is filled, end must be >= start
        .when("start", (start, schema) =>
          start
            ? schema.min(start, "End must be greater than or equal to Start")
            : schema
        )
        .optional(),
    }),

    // This form requires more positional data and variation info
    "Genetic location (Range)": Yup.object({
      assemblyId: assemblyIdRequired,
      chromosome: chromosomeValidator.required("Chromosome is required"),
      start: createStartValidator("Start"),
      end: createEndValidator("End", "Start"),
      refBases: refBasesValidator,
      altBases: altBasesValidator,
      refAa: refAaValidator,
      altAa: altAaValidator,
      aaPosition: aaPositionValidator,
      minVariantLength,
      maxVariantLength,
    }),

    // Bracket query uses a simpler schema, just needs the chromosome + location range
    "Genetic location aprox (Bracket)": Yup.object({
      assemblyId: assemblyIdRequired,
      chromosome: chromosomeValidator.required("Chromosome is required"),
      start: createStartValidator("Start braket"),
      end: createEndValidator("End braket", "Start braket"),
    }),

    // This query uses defined start + reference and alternate bases
    "Defined short variation (Sequence)": Yup.object({
      assemblyId: assemblyIdOptional,
      chromosome: chromosomeValidator.required("Chromosome is required"),
      start: createStartValidator("Start"),
      refBases: requiredRefBases,
      altBases: requiredAltBases,
    }),

    // This is a shortcut query type using HGVS format
    "Genomic Allele Query (HGVS)": Yup.object({
      genomicHGVSshortForm,
    }),
  };

  // Get the form component that matches the currently selected query type
  // This is used to render the correct form in the UI based on user's selection
  const SelectedFormComponent = formComponentsMap[selectedQueryType];

  return (
    // This is the empty dialog
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "10px",
          padding: "20px",
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
          onClick={handleClose}
          aria-label="close"
          sx={{ mr: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/*The dyamic content of the dialog starts here */}
      <DialogContent sx={{ pt: 1 }}>
        {/* This is the form wrapper that controls validation and submission, 
        it uses dynamic initial values as empty and validation schemas based on the
        selected query type */}
        <Formik
          enableReinitialize
          validateOnMount
          initialValues={{
            geneId: "",
            assemblyId: "",
            chromosome: "",
            start: "",
            end: "",
            variationType: "",
            basesChange: "",
            refBases: "",
            altBases: "",
            aminoacidChange: "",
            minVariantLength: "",
            maxVariantLength: "",
            genomicHGVSshortForm: "",
          }}
          validationSchema={validationSchemaMap[selectedQueryType]}
          onSubmit={(values) => {
            // These are exclusive groups. Only one group should be active based on user selection
            const mutuallyExclusiveGroups = {
              variationType: ["variationType"],
              basesChange: ["basesChange", "refBases", "altBases"],
              aminoacidChange: [
                "aminoacidChange",
                "refAa",
                "altAa",
                "aaPosition",
              ],
            };

            // It collects all field names from all mutually exclusive groups into a single flat array
            const allExclusiveKeys = Object.values(
              mutuallyExclusiveGroups
            ).flat();

            // Get the allowed keys for the currently selected input
            const allowedExclusiveKeys =
              mutuallyExclusiveGroups[selectedInput] || [];

            // Filter submitted values to remove empty and disallowed fields
            const validEntries = Object.entries(values).filter(
              ([key, value]) => {
                if (!value || value.trim() === "") return false;

                if (allExclusiveKeys.includes(key)) {
                  // Allow all exclusive fields if Defined Short Variation is selected
                  if (
                    selectedQueryType === "Defined short variation (Sequence)"
                  ) {
                    return true;
                  }
                  // Allow all if no specific selection logic is active
                  if (!selectedInput) return true;
                  // Allow only if key is part of the selected group
                  return allowedExclusiveKeys.includes(key);
                }
                // Always allow non-exclusive fields
                return true;
              }
            );

            // Generate display label from valid entries
            const labelParts = validEntries.map(
              ([key, value]) => `${key}: ${value}`
            );
            const combinedLabel = `${labelParts.join(" | ")}`;

            const newFilter = {
              id: `genomic-${combinedLabel}`,
              label: combinedLabel,
              key: selectedQueryType,
              scope: "genomicQuery",
              bgColor: "genomic",
            };

            // Prevent duplicates
            const exists = selectedFilter.some((f) => f.id === newFilter.id);
            if (exists) {
              setDuplicateMessage(COMMON_MESSAGES.doubleValue);
              setTimeout(() => setDuplicateMessage(""), 5000);
              return;
            }

            // Save the new filter
            setSelectedFilter((prev) => [...prev, newFilter]);
            setDuplicateMessage("");
            handleClose();
          }}
        >
          {({ resetForm, isValid, dirty }) => (
            <Form>
              {/* Render the selectable query type buttons */}
              {/* When a user clicks a button, the form type changes and the form is reset */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {genomicQueryTypes.map((label, index) => (
                  <StyledGenomicLabels
                    key={index}
                    label={label}
                    selected={selectedQueryType === label}
                    onClick={() => {
                      setSelectedQueryType(label);
                      resetForm(); // Clears the form when switching query type
                    }}
                  />
                ))}
              </Box>
              {/* Render the selected form based on the current query type based on user's selection */}
              <Box sx={{ mt: 4 }}>
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
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <GenomicSubmitButton disabled={!isValid || !dirty} />
              </Box>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
