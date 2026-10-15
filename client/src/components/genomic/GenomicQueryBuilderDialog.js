import { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// Formik manages form state and submission.
import { Form, Formik } from "formik";
// Shared message component and message texts.
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import config from "../../config/runtimeConfig";
import GenomicSubmitButton from "./GenomicSubmitButton";
import GenomicQueryBuilderHelp from "./querybuilder/GenomicQueryBuilderHelp";
import StyledGenomicLabels from "./styling/StyledGenomicLabels";
import { buildGenomicFilter } from "./utils/buildGenomicFilter";
import { mapQueryParamsToFormik } from "./utils/mapQueryParamsToFormik";

// Shared genomic query configuration.
import {
  EMPTY_INITIAL_VALUES,
  QUERY_TYPE_CONFIG,
  VALIDATION_SCHEMA_MAP,
} from "./genomicQueryConfig";

// Label used for the help page.
const HELP_QUERY_TYPE = "Need Help?";

// Default genomic input selected when the builder starts.
const DEFAULT_SELECTED_INPUT = "variantType";

// Value used to identify genomic filters.
const GENOMIC_FILTER_TYPE = "genomic";

// Read the enabled query types from the runtime configuration.
const enabledQueryTypes = Object.entries(
  config.ui?.genomicQueries?.genomicQueryTypes || {}
)
  // Keep only enabled query types that exist in QUERY_TYPE_CONFIG.
  .filter(([key, enabled]) => enabled && QUERY_TYPE_CONFIG[key])

  // Add the label and component defined for each query type.
  .map(([key]) => ({
    key,
    ...QUERY_TYPE_CONFIG[key],
  }));

// Create a direct lookup from query label to React component.
// Example: "Gene ID" -> GeneIdForm.
const QUERY_COMPONENTS = Object.fromEntries(
  enabledQueryTypes.map(({ label, component }) => [label, component])
);

export default function GenomicQueryBuilderDialog({
  open,
  handleClose,
  selectedFilter,
  setSelectedFilter,
  setActiveInput,
}) {
  // Stores the query type currently displayed.
  const [selectedQueryType, setSelectedQueryType] = useState(HELP_QUERY_TYPE);

  // Stores the active genomic input group.
  const [selectedInput, setSelectedInput] = useState(DEFAULT_SELECTED_INPUT);

  // Stores an error message shown inside the dialog.
  const [duplicateMessage, setDuplicateMessage] = useState("");

  // Stores unfinished form values for each query type.
  const [tabDrafts, setTabDrafts] = useState({});

  // Read genomic edit and prefill information from context.
  const {
    genomicPrefill,
    clearGenomicPrefill,
    editingGenomicFilter,
    setEditingGenomicFilter,
  } = useSelectedEntry();

  // Get the form component for the currently selected query type.
  const SelectedFormComponent = QUERY_COMPONENTS[selectedQueryType];

  // True when the help page is currently selected.
  const isHelpPage = selectedQueryType === HELP_QUERY_TYPE;

  // Check whether the current query type has matching prefill data.
  const hasMatchingPrefill =
    open &&
    genomicPrefill?.queryType === selectedQueryType &&
    genomicPrefill?.queryParams;

  // Formik first uses a saved draft if one exists.
  // Otherwise it uses matching prefill data or empty values.
  const initialValues =
    tabDrafts[selectedQueryType] ??
    (hasMatchingPrefill
      ? mapQueryParamsToFormik(selectedQueryType, genomicPrefill.queryParams)
      : EMPTY_INITIAL_VALUES);

  // When the dialog opens with genomic prefill data,
  // automatically open the matching query type.
  useEffect(() => {
    if (open && genomicPrefill?.queryType) {
      setSelectedQueryType(genomicPrefill.queryType);
    }
  }, [open, genomicPrefill]);

  // Reset local state and close the dialog.
  const handleDialogClose = () => {
    // Return to the help page.
    setSelectedQueryType(HELP_QUERY_TYPE);

    // Return to the default selected genomic input.
    setSelectedInput(DEFAULT_SELECTED_INPUT);

    // Clear any visible error message.
    setDuplicateMessage("");

    // Remove saved tab drafts.
    setTabDrafts({});

    // Clear genomic prefill data from context.
    clearGenomicPrefill();

    // Stop editing the current genomic filter.
    setEditingGenomicFilter(null);

    // Call the close function received from the parent.
    handleClose();
  };

  // Show a message and remove it after 5 seconds.
  const showTemporaryMessage = (message) => {
    setDuplicateMessage(message);

    setTimeout(() => {
      setDuplicateMessage("");
    }, 5000);
  };

  // Handle Formik submission.
  const handleSubmit = (values) => {
    // Convert the current form values into a genomic filter.
    const newFilter = buildGenomicFilter(
      selectedQueryType,
      values,
      selectedInput
    );

    // Check whether exactly the same filter already exists.
    const isDuplicate = selectedFilter.some(
      (filter) => filter.id === newFilter.id
    );

    // Stop submission when the same filter already exists.
    if (isDuplicate) {
      console.warn("[GQB] Duplicate genomic query prevented");

      showTemporaryMessage(COMMON_MESSAGES.doubleValue);

      return;
    }

    // Check whether any genomic filter already exists.
    const alreadyHasGenomic = selectedFilter.some(
      (filter) => filter.type === GENOMIC_FILTER_TYPE
    );

    // Block a second genomic filter unless the current one is being edited.
    if (alreadyHasGenomic && !editingGenomicFilter) {
      console.warn("[GQB] Attempted to add a second genomic query — blocked");

      // Show the message until the dialog closes.
      setDuplicateMessage(COMMON_MESSAGES.singleGenomicQuery);

      // Close and reset the dialog after 3 seconds.
      setTimeout(handleDialogClose, 3000);

      return;
    }

    // Update the selected filters.
    setSelectedFilter((previousFilters) =>
      editingGenomicFilter
        ? [
            // When editing, remove the previous genomic filter.
            ...previousFilters.filter(
              (filter) => filter.type !== GENOMIC_FILTER_TYPE
            ),

            // Add the updated genomic filter.
            newFilter,
          ]
        : [
            // When adding, keep the existing filters.
            ...previousFilters,

            // Add the new genomic filter.
            newFilter,
          ]
    );

    // Close the dialog and reset its local state.
    handleDialogClose();
  };

  return (
    <Dialog
      // Controls whether the dialog is visible.
      open={open}
      // Reset state when the dialog is closed.
      onClose={handleDialogClose}
      // Use the extra-large dialog width.
      maxWidth="xl"
      // Allow the dialog to use the available width.
      fullWidth
      // Style the dialog container.
      PaperProps={{
        sx: {
          borderRadius: "10px",
          padding: "9px",
          height: "100%",
        },
      }}
    >
      {/* Header containing the title and close button. */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Dialog title. */}
        <DialogTitle
          sx={{
            fontSize: "16px",
            fontWeight: 700,
            fontFamily: '"Open Sans", sans-serif',
            py: 1.5,
          }}
        >
          Genomic Query Builder
        </DialogTitle>

        {/* Button used to close the dialog. */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleDialogClose}
          aria-label="close"
          sx={{ mr: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main dialog content. */}
      <DialogContent sx={{ pt: 0 }}>
        <Formik
          // Recreate Formik when the selected query type changes.
          key={selectedQueryType}
          // Run validation when the form is created.
          validateOnMount
          // Load values for the selected query type.
          initialValues={initialValues}
          // Use the validation schema for the selected query type.
          validationSchema={VALIDATION_SCHEMA_MAP[selectedQueryType]}
          // Submit using the shared handler above.
          onSubmit={handleSubmit}
        >
          {({ isValid, values }) => {
            // Save the current tab and switch to another query type.
            const switchQueryType = (nextQueryType) => {
              // Do nothing when the selected tab is clicked again.
              if (nextQueryType === selectedQueryType) {
                return;
              }

              // Save current values before leaving a query form.
              if (selectedQueryType !== HELP_QUERY_TYPE) {
                setTabDrafts((previousDrafts) => ({
                  ...previousDrafts,
                  [selectedQueryType]: values,
                }));
              }

              // Open the requested query type.
              setSelectedQueryType(nextQueryType);
            };

            return (
              <Form>
                {/* Query type selection buttons. */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Help button is always displayed. */}
                  <StyledGenomicLabels
                    label={HELP_QUERY_TYPE}
                    isHelpButton
                    selected={isHelpPage}
                    onClick={() => switchQueryType(HELP_QUERY_TYPE)}
                  />

                  {/* Display each enabled genomic query type. */}
                  {enabledQueryTypes.map(({ key, label }) => (
                    <StyledGenomicLabels
                      key={key}
                      label={label}
                      selected={selectedQueryType === label}
                      onClick={() => switchQueryType(label)}
                    />
                  ))}
                </Box>

                {/* Display either help content or the selected query form. */}
                <Box sx={{ mt: 2 }}>
                  {isHelpPage ? (
                    // Help page.
                    <GenomicQueryBuilderHelp
                      setSelectedQueryType={setSelectedQueryType}
                      handleClose={handleClose}
                      setActiveInput={setActiveInput}
                      setTabDrafts={setTabDrafts}
                    />
                  ) : (
                    // Query form matching the selected query type.
                    SelectedFormComponent && (
                      <SelectedFormComponent
                        selectedInput={selectedInput}
                        setSelectedInput={setSelectedInput}
                      />
                    )
                  )}
                </Box>

                {/* Show an error message only when one exists. */}
                {duplicateMessage && (
                  <Box sx={{ mt: 2 }}>
                    <CommonMessage text={duplicateMessage} type="error" />
                  </Box>
                )}

                {/* The help page does not have a submit button. */}
                {!isHelpPage && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 2,
                    }}
                  >
                    {/* Disable submission while the form is invalid. */}
                    <GenomicSubmitButton disabled={!isValid} />
                  </Box>
                )}
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
