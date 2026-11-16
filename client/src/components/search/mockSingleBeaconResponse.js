export const mockSingleBeaconResponse = {
  meta: {
    apiVersion: "v2.0.0",
    beaconId: "org.ega-archive.beacon-ri-demo",
  },
  responseSummary: {
    exists: true,
    numTotalResults: 14,
  },
  response: {
    resultSets: [
      {
        exists: true,
        setType: "dataset",
      },
      {
        exists: false,
        setType: "dataset",
      },
      {
        exists: true,
        id: "EGA00",
        setType: "dataset",
      },
      {
        exists: true,
        id: "EGA1",
        resultsCount: 8,
        setType: "dataset",
      },

      {
        exists: true,
        id: "EGA3",
        resultsCount: 4,
        results: [],
        setType: "dataset",
      },
      {
        exists: true,
        id: "EGA2",
        resultsCount: 2,
        results: [
          { id: "record_1", something: "value" },
          { id: "record_2", something: "value" },
        ],
        setType: "dataset",
      },
    ],
  },
};

export const mockSingleBeaconDatasetResponse = {
  response: {
    resultSets: [
      {
        id: "EGA0",
        setType: "dataset",
        exists: false,
      },
      {
        id: "EGA1",
        setType: "dataset",
        exists: true,
        resultsCount: 8,
      },
      {
        id: "EGA2",
        setType: "dataset",
        exists: true,
        resultsCount: 2,
        results: [
          {
            id: "record_1",
            something: "value",
          },
          {
            id: "record_2",
            something: "value",
          },
        ],
      },
      // Count response without dataset information
      {
        setType: "dataset",
        exists: true,
        resultsCount: 5,
      },
    ],
  },
};

export const mockMapNoDatasets = {
  meta: { apiVersion: "2.0" },
  response: {
    entryTypes: [
      {
        id: "individuals",
        name: "Individuals",
        pathSegment: "individuals",
      },
      {
        id: "biosamples",
        name: "Biosamples",
        pathSegment: "biosamples",
      },
      {
        id: "g_variants",
        name: "Genomic Variants",
        pathSegment: "g_variants",
      },
    ],
  },
};
