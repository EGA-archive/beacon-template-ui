export const BEACON_NETWORK_COLUMNS = [
  {
    id: "beacon_dataset",
    label: "Beacon > Dataset",
    align: "left",
    width: "30%",
  },
  {
    id: "maturity",
    label: "Beacon Maturity",
    align: "center",
    width: "20%",
  },
  {
    id: "datasets_count",
    label: "nº of Datasets",
    align: "right",
    numeric: true,
    width: "20%",
  },
  {
    id: "response",
    label: "Response",
    width: "10%",
  },
  {
    id: "detail",
    label: "",
    width: "10%",
  },
  {
    id: "contact",
    label: "Contact",
    width: "10%",
  },
];

export const BEACON_NETWORK_COLUMNS_EXPANDED = {
  beacon_dataset_name: "70%",
  beacon_dataset_response: "10%",
  beacon_dataset_detail: "10%",
  beacon_dataset_contact: "10%",
};

export const FILTERING_TERMS_COLUMNS = [
  {
    id: "id",
    label: "ID",
    width: "30%",
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
    column: 'id',
    label: 'ID',
    width: '10%'
  }, {
    column: 'name',
    label: 'Name',
    width: '50%'
  }, {
    column: 'externalUrl',
    label: 'Url',
    width: '20%'
  }, {
    column: 'version',
    label: 'Version',
    width: '10%'
  }
];

export const DATASET_TABLE_INDIVIDUAL = [
  {
    column: 'id',
    label: 'Id',
    width: '20%'
  }, {
    column: 'diseases',
    label: 'Diseases',
    width: '20%'
  }, {
    column: 'geographicOrigin',
    label: 'Geographic Origin',
    width: '20%'
  }, {
    column: 'phenotypicFeatures',
    label: 'Phenotypic Features',
    width: '20%'
  }, {
    column: 'sex',
    label: 'Sex',
    width: '20%'
  }
]
