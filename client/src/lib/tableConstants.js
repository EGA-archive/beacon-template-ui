import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { Box, Tooltip } from "@mui/material";
import config from "../config/runtimeConfig";

// This is a helper component for the tables' structure

const primaryColor = config.ui.colors.primary;

export const BEACON_NETWORK_COLUMNS = [
  {
    id: "beacon_dataset",
    label: (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          ml: 4,
          width: "fit-content",
          "@media (max-width: 764px)": {
            flexDirection: "column",
            alignItems: "center",
            gap: 0.25,
            ml: 3,
          },
        }}
      >
        <Box>Beacon</Box>

        <KeyboardArrowRightRoundedIcon
          sx={{
            fontSize: "26px",

            "@media (max-width: 764px)": {
              fontSize: "16px",
              transform: "rotate(90deg)",
            },
          }}
        />

        <Box>Dataset</Box>
      </Box>
    ),
    align: "left",
    width: "30%",
  },
  {
    id: "maturity",
    label: (
      <Box display="flex" alignItems="center" gap={1}>
        Beacon Maturity
        <Tooltip
          title={
            <Box
              sx={{
                p: 1,
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              <b>Beacon Maturity:</b> Declares the level of maturity of the
              Beacon instance. Available values are:
              <br></br>
              <ul>
                <br></br>
                <li>
                  <b>Development:</b> Service potentially unstable, not using
                  real data, which availability and data should not be used in
                  production setups.
                </li>
                <br></br>
                <li>
                  <b>Test:</b> The service is expected to be stable, meaning up
                  and available, but does <b>not include real data.</b>
                </li>
                <br></br>
                <li>
                  <b>Production:</b> Service stable, at production level
                  standards,
                  <b> containing actual data.</b>
                </li>
              </ul>
            </Box>
          }
          placement="top-start"
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "#fff",
                color: "#000",
                border: "1px solid black",
                maxWidth: "300px",
              },
            },
            arrow: {
              sx: {
                color: "#fff",
                "&::before": { border: "1px solid black" },
              },
            },
          }}
        >
          <Box
            component="span"
            sx={{
              cursor: "pointer",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: "white",
              color: primaryColor,
              textAlign: "center",
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            i
          </Box>
        </Tooltip>
      </Box>
    ),
    align: "left",
    width: "15%",
  },
  {
    id: "data_visibility",
    label: (
      <Box display="flex" alignItems="center" gap={1}>
        Data Visibility
        <Tooltip
          title={
            <Box
              sx={{
                p: 1,
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              <b>Results Visibility</b>
              <br></br>
              Data owners decide how much information can be displayed for each
              dataset based on privacy, consent, and data-sharing policies.
              <br></br>
              <ul>
                <br></br>
                <li>
                  <b>Presence only (boolean):</b>
                  <br></br>The dataset only indicates whether matching data
                  exists.
                </li>
                <br></br>
                <li>
                  <b>Count:</b>
                  <br></br>The dataset reports the number of matching records.
                </li>
                <br></br>
                <li>
                  <b>Detailed records:</b>
                  <br></br>The dataset allows viewing individual matching
                  records.
                </li>
              </ul>
            </Box>
          }
          placement="top-start"
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "#fff",
                color: "#000",
                border: "1px solid black",
                maxWidth: "300px",
              },
            },
            arrow: {
              sx: {
                color: "#fff",
                "&::before": { border: "1px solid black" },
              },
            },
          }}
        >
          <Box
            component="span"
            sx={{
              cursor: "pointer",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: "white",
              color: primaryColor,
              textAlign: "center",
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            i
          </Box>
        </Tooltip>
      </Box>
    ),
    align: "left",
    width: "15%",
  },
  // {
  //   id: "datasets_count",
  //   label: "nº of Datasets",
  //   align: "left",
  //   numeric: true,
  //   width: "15%",
  // },
  {
    id: "datasets_count",
    label: (
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          gap: 0.5,
          "@media (max-width: 764px)": {
            flexDirection: "column",
            gap: 0,
            lineHeight: 1.5,
          },
        }}
      >
        <Box component="span">nº</Box>
        <Box component="span">of</Box>
        <Box component="span">Datasets</Box>
      </Box>
    ),
    align: "left",
    numeric: true,
    width: "15%",
  },
  {
    id: "response",
    label: "Search Results",
    width: "15%",
    align: "left",
  },
  {
    id: "contact",
    label: "Contact",
    width: "10%",
    align: "center",
  },
];

export const BEACON_NETWORK_COLUMNS_EXPANDED = {
  beacon_dataset_name: {
    width: "40%",
    align: "left",
  },
  beacon_dataset_empty_one: {
    width: "5%",
    align: "left",
  },
  beacon_dataset_empty_two: {
    width: "20%",
    align: "left",
  },
  beacon_dataset_empty_three: {
    width: "10%",
    align: "left",
  },

  beacon_dataset_response: {
    width: "25%",
    align: "left",
  },
  beacon_empty_three: {
    width: "0%",
    align: "left",
  },
};

export const BEACON_NETWORK_TABLET_COLUMN_WIDTHS = {
  beacon_dataset: "43%",
  datasets_count: "20%",
  response: "30%",
  contact: "20%",
};

const dataVisibilityColumn = BEACON_NETWORK_COLUMNS.find(
  (column) => column.id === "data_visibility"
);

const responseColumn = BEACON_NETWORK_COLUMNS.find(
  (column) => column.id === "response"
);

const contactColumn = BEACON_NETWORK_COLUMNS.find(
  (column) => column.id === "contact"
);

export const BEACON_SINGLE_COLUMNS = [
  {
    id: "beacon_dataset",
    label: (
      <Box display="flex" alignItems="center">
        Dataset
      </Box>
    ),
    align: "left",
    width: "35%",
  },
  {
    ...dataVisibilityColumn,
    width: "25%",
  },
  {
    ...responseColumn,
    width: "30%",
  },
  {
    ...contactColumn,
    width: "10%",
  },
];

export const COHORTS_TABLE = [
  {
    id: "cohort_id",
    label: (
      <Box display="flex" alignItems="left">
        ID
      </Box>
    ),
    align: "left",
    width: "10%",
  },

  {
    id: "cohort_name",
    label: "Name",
    align: "left",
    width: "20%",
  },
  {
    id: "cohort_type",
    label: "Type",
    align: "left",
    numeric: true,
    width: "10%",
  },
  {
    id: "cohort_size",
    label: "Size",
    width: "10%",
    align: "left",
  },
  {
    id: "cohort_gender",
    label: "Gender Distribution",
    width: "20%",
    align: "left",
  },
  {
    id: "cohort_age_range",
    label: "Disease Distribution",
    width: "20%",
    align: "left",
  },
];

export const DATASETS_TABLE = [
  {
    id: "dataset_id",
    label: (
      <Box display="flex" alignItems="left">
        ID
      </Box>
    ),
    align: "left",
    width: "10%",
  },

  {
    id: "dataset_name",
    label: "Name",
    align: "left",
    width: "20%",
  },
  {
    id: "dataset_description",
    label: "Description",
    align: "left",
    numeric: true,
    width: "35%",
  },
  {
    id: "dataset_external_url",
    label: "External URL",
    width: "20%",
    align: "left",
  },
  {
    id: "dataset_duo",
    label: "DUO",
    width: "25%",
    align: "left",
  },
];

export const FILTERING_TERMS_COLUMNS = [
  {
    id: "Select",
    label: "Select",
    width: "10%",
    align: "left",
  },
  {
    id: "id",
    label: "ID",
    width: "25%",
    align: "left",
  },
  {
    id: "label",
    label: "Label",
    width: "30%",
    align: "left",
  },
  {
    id: "Type",
    label: "Filter Type",
    width: "15%",
    align: "left",
  },
  {
    id: "scope",
    label: "Scope",
    width: "20%",
    align: "left",
  },
];
