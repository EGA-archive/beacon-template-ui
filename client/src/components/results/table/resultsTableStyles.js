import config from "../../../config/runtimeConfig";

const COMPACT_RESULTS_TABLE_MAX_WIDTH = 764;
const MOBILE_RESULTS_TABLE_MAX_WIDTH = 535;
const SMALL_MOBILE_RESULTS_TABLE_MAX_WIDTH = 467;

/**
 * Main Results table container.
 */
export const resultsTablePaperStyle = {
  width: "100%",
  overflow: "hidden",
  boxShadow: "none",
  borderRadius: 0,
};

/**
 * Responsive styles shared by Single and Network Beacon result tables.
 * These rules also affect nested dataset rows and the Details / AF buttons.
 */
export const resultsTableStyle = {
  tableLayout: "fixed",
  width: "100%",

  [`@media (max-width: ${COMPACT_RESULTS_TABLE_MAX_WIDTH}px)`]: {
    "& .MuiTableCell-root": {
      fontSize: "12px",
      lineHeight: 1.2,
    },

    "& > thead > tr > th": {
      px: 1,
    },

    "& > tbody > tr > td:not([colspan])": {
      px: 1,
    },

    "& .MuiTableBody-root .MuiTypography-root": {
      fontSize: "12px",
      lineHeight: 1.2,
    },

    '& [data-cy="results-table-details-button"]': {
      fontSize: "10px",
      lineHeight: 1,
      minWidth: "60px",
      minHeight: "22px",
      height: "24px",
      px: 0.75,
      py: 0,
      borderRadius: "6px",
    },

    '& [data-cy="results-table-details-button"] .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: "3px",
    },

    '& [data-cy="results-table-details-button"] .MuiSvgIcon-root': {
      fontSize: "14px",
    },

    '& [data-cy="results-table-af-button"]': {
      fontSize: "10px",
      lineHeight: 1,
      width: "48px",
      minWidth: "48px",
      minHeight: "22px",
      height: "24px",
      borderRadius: "6px",
      gap: "4px",
    },

    '& [data-cy="results-table-af-button"] .af-label': {
      fontSize: "10px",
    },
  },

  [`@media (max-width: ${MOBILE_RESULTS_TABLE_MAX_WIDTH}px)`]: {
    '& .MuiTableBody-root [data-cy="results-subrow-dataset-name"]': {
      fontSize: "11px",
      lineHeight: 1.15,
    },
  },

  [`@media (max-width: ${SMALL_MOBILE_RESULTS_TABLE_MAX_WIDTH}px)`]: {
    '& .MuiTableBody-root [data-cy="results-subrow-dataset-name"]': {
      fontSize: "10px",
      lineHeight: 1.1,
    },
  },
};

/**
 * Shared Results table header cell style.
 */
export const resultsTableHeaderCellStyle = {
  backgroundColor: config.ui.colors.primary,
  fontWeight: 700,
  color: "white",
  fontSize: "14px",
  lineHeight: 1.3,
  transition: "background-color 0.3s ease",
};

/**
 * Columns that are hidden on compact/tablet layouts.
 */
export const hiddenOnTabletStyle = {
  display: {
    xs: "none",
    sm: "none",
    md: "none",
    lg: "table-cell",
  },
};

/**
 * Entry type shown underneath the Search Results header.
 */
export const resultsHeaderSubtitleStyle = {
  fontStyle: "italic",
  fontWeight: 400,
  fontSize: "12px",
  lineHeight: 1.4,

  [`@media (max-width: ${COMPACT_RESULTS_TABLE_MAX_WIDTH}px)`]: {
    fontSize: "10px",
    lineHeight: 1.25,
  },
};
