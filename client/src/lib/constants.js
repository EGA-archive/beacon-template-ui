import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { Box, Tooltip } from "@mui/material";
import config from "../config/config.json";

const primaryColor = config.ui.colors.primary;

export const BEACON_NETWORK_COLUMNS = [
  {
    id: "beacon_dataset",
    label: (
      <Box display="flex" alignItems="center" gap={1} ml={4}>
        Beacon
        <KeyboardArrowRightRoundedIcon sx={{ fontSize: "26px" }} />
        Dataset
      </Box>
    ),
    align: "left",
    width: "30%",
  },
  {
    id: "maturity",
    label: "Beacon Maturity",
    align: "left",
    width: "15%",
  },
  {
    id: "datasets_count",
    label: (
      <Box display="flex" alignItems="center" gap={1}>
        nº of Datasets
        <Tooltip
          title={
            <Box
              sx={{
                p: 1,
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              Beacons that restrict dataset-level responses, return only
              Beacon-level data aggregated across datasets.
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
    numeric: true,
    width: "20%",
  },

  {
    id: "response",
    label: "Response",
    width: "15%",
    align: "left",
  },

  {
    id: "contact",
    label: "Contact",
    width: "10%",
    align: "left",
  },
];

export const BEACON_NETWORK_COLUMNS_EXPANDED = {
  beacon_dataset_name: {
    width: "25%",
    align: "left",
  },
  beacon_dataset_empty_one: {
    width: "20%",
    align: "left",
  },
  beacon_dataset_empty_two: {
    width: "20%",
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

export const BEACON_SINGLE_COLUMNS = [
  {
    id: "beacon_dataset",
    label: (
      <Box display="flex" alignItems="center">
        Dataset
      </Box>
    ),
    align: "left",
    width: "20%",
  },

  // {
  //   id: "maturity",
  //   label: "Beacon Maturity",
  //   align: "left",
  //   width: "15%",
  // },

  {
    id: "response",
    label: (
      <Box display="flex" alignItems="center" gap={1}>
        Response
        <Tooltip
          title={
            <Box
              sx={{
                p: 1,
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              The response can be a Boolean (yes/no), a count, or records at the
              dataset level.
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
    width: "20%",
    align: "left",
  },
  {
    id: "details",
    label: "Details",
    width: "15%",
    align: "left",
  },
  {
    id: "contact",
    label: "Contact",
    width: "10%",
    align: "left",
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
    label: "Age Range Distribution",
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
    width: "5%",
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
    width: "45%",
    align: "left",
  },
  {
    id: "scope",
    label: "Scope",
    width: "25%",
    align: "left",
  },
];
