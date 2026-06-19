import config from "../../../config/config.json";

export function getGenomicTooltipContent() {
  const queryTypes = config.ui.genomicQueries?.genomicQueryTypes || {};

  return {
    sequenceQuery: queryTypes.sequenceQuery,
    geneId: queryTypes.geneId,
    rangeQuery: queryTypes.rangeQuery,
    bracketQuery: queryTypes.bracketQuery,
    hgvsQuery: queryTypes.hgvsQuery,
  };
}
