import config from "../../../config/runtimeConfig";

export default function getGenomicQueryDescription() {
  const queryTypes = config.ui.genomicQueries?.genomicQueryTypes || {};

  const description = [];

  if (queryTypes.sequenceQuery) {
    description.push("Search by SNV or INDEL.");
  }

  const rangeBracket = [];

  if (queryTypes.rangeQuery) rangeBracket.push("Range");
  if (queryTypes.bracketQuery) rangeBracket.push("Bracket");

  const annotations = [];

  if (queryTypes.geneId) annotations.push("Gene");
  if (queryTypes.hgvsQuery) annotations.push("HGVS annotation");

  if (rangeBracket.length || annotations.length) {
    let text = "Use Genomic Query Builder to ";

    if (rangeBracket.length) {
      text += `do ${rangeBracket.join("/")} quer${
        rangeBracket.length > 1 ? "ies" : "y"
      }`;
    }

    if (annotations.length) {
      if (rangeBracket.length) {
        text += ` or search by ${annotations.join(" or ")}`;
      } else {
        text += `search by ${annotations.join(" or ")}`;
      }
    }

    text += ".";
    description.push(text);
  }

  return description.join(" ");
}
