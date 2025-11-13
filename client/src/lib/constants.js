import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { Box } from "@mui/material";

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
    width: "10%",
  },
  {
    id: "datasets_count",
    label: "nº of Datasets",
    align: "left",
    numeric: true,
    width: "15%",
  },
  {
    id: "response_type",
    label: "Response Type",
    width: "15%",
    align: "left",
  },
  {
    id: "response",
    label: "Response",
    width: "10%",
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
    width: "10%",
    align: "left",
  },
  beacon_dataset_type_response: {
    width: "15%",
    align: "left",
  },
  beacon_dataset_response: {
    width: "20%",
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

  {
    id: "maturity",
    label: "Beacon Maturity",
    align: "left",
    width: "15%",
  },
  {
    id: "datasets_count",
    label: "nº of Datasets",
    align: "left",
    numeric: true,
    width: "10%",
  },
  {
    id: "response_type",
    label: "Response Type",
    width: "15%",
    align: "left",
  },
  {
    id: "response",
    label: "Response",
    width: "15%",
    align: "left",
  },
  {
    id: "details",
    label: "Details",
    width: "10%",
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
