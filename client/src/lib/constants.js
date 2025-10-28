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
    width: "20%",
  },
  {
    id: "datasets_count",
    label: "nº of Datasets",
    align: "left",
    numeric: true,
    width: "20%",
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
    width: "30%",
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
    width: "20%",
    align: "left",
  },
  beacon_dataset_detail: {
    width: "0%",
    align: "left",
  },
};

export const BEACON_SINGLE_COLUMNS = [
  {
    id: "beacon_dataset",
    label: (
      <Box display="flex" alignItems="center" ml={4}>
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
    width: "20%",
  },
  {
    id: "datasets_count",
    label: "nº of Datasets",
    align: "left",
    numeric: true,
    width: "20%",
  },
  {
    id: "response",
    label: "Response",
    width: "10%",
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

export const DATASET_TABLE = [
  {
    column: "id",
    label: "ID",
    width: "10%",
  },
  {
    column: "name",
    label: "Name",
    width: "50%",
  },
  {
    column: "externalUrl",
    label: "Url",
    width: "20%",
  },
  {
    column: "version",
    label: "Version",
    width: "10%",
  },
];

export const DATASET_TABLE_NETWORK = [
  {
    column: "id",
    label: "Id",
    width: "20%",
  },
  {
    column: "diseases",
    label: "Diseases",
    width: "20%",
  },
  {
    column: "geographicOrigin",
    label: "Geographic Origin",
    width: "20%",
  },
  {
    column: "phenotypicFeatures",
    label: "Phenotypic Features",
    width: "20%",
  },
  {
    column: "sex",
    label: "Sex",
    width: "20%",
  },
];

export const DATASET_TABLE_SINGLE = [
  {
    column: "id",
    label: "Id",
    width: "20%",
  },
  {
    column: "diseases",
    label: "Diseases",
    width: "20%",
  },
  {
    column: "geographicOrigin",
    label: "Geographic Origin",
    width: "20%",
  },
  {
    column: "phenotypicFeatures",
    label: "Phenotypic Features",
    width: "20%",
  },
  {
    column: "sex",
    label: "Sex",
    width: "20%",
  },
];
