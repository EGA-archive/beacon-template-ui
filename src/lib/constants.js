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
    id: 'contact',
    label: "Contact",
    width: '10%',
    align: 'left'
  }
];

export const BEACON_SINGLE_COLUMNS = [
  { 
    id: 'beacon_dataset',
    label: "Dataset",
    align: 'left',
    width: '30%'
  },
  {
    id: 'maturity',
    label: "Beacon Maturity",
    align: 'center',
    width: '20%'
  },
  {
    id: 'datasets_count',
    label: "nº of Datasets",
    align: 'right',
    numeric: true,
    width: '20%'
  },
  {
    id: 'response',
    label: "Response",
    width: '10%'
  },
  {
    id: 'details',
    label: "Details",
    width: '10%'
  },
  {
    id: "contact",
    label: "Contact",
    width: "10%",
    align: 'left'
  }
];

export const BEACON_NETWORK_COLUMNS_EXPANDED = {
  'beacon_dataset_name': '70%',
  'beacon_dataset_response': '10%',
  'beacon_dataset_detail': {
    width: '20%',
    float: 'right'
  }
}

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

export const DATASET_TABLE_NETWORK = [
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
];

export const DATASET_TABLE_SINGLE = [
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
