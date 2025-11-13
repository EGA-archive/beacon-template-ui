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
        exists: false,
        id: "EGA0",
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
        id: "EGA2",
        resultsCount: 2,
        results: [
          { id: "record_1", something: "value" },
          { id: "record_2", something: "value" },
        ],
        setType: "dataset",
      },
      {
        exists: true,
        id: "EGA3",
        resultsCount: 4,
        results: [],
        setType: "dataset",
      },
    ],
  },
};
