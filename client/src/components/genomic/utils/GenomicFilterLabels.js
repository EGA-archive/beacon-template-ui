const snpExamples = [
  {
    key: "TP53",
    id: "TP53",
    label: "TP53",
    type: "genomic",
    field: "geneId",
    queryParams: { geneId: "TP53" },
  },
  {
    key: "GRCh38:17:7661960T>C",
    id: "GRCh38:17:7661960T>C",
    label: "GRCh38:17:7661960T>C",
    type: "genomic",
    queryParams: {
      assemblyId: "GRCh38",
      referenceName: "17",
      start: [7661960],
      referenceBases: "T",
      alternateBases: "C",
    },
  },
  {
    key: "NC_000017.11:g.43057063G>A",
    id: "NC_000017.11:g.43057063G>A",
    label: "NC_000017.11:g.43057063G>A",
    type: "genomic",
    queryParams: {
      genomicAlleleShortForm: "NC_000017.11:g.43057063G>A",
    },
  },
];

const genomicVariantExamples = [
  {
    key: "BRCA1:Pro1856Ser",
    id: "BRCA1:Pro1856Ser",
    label: "BRCA1[Pro1856Ser]",
    type: "genomic",
    queryParams: {
      geneId: "BRCA1",
      aminoacidChange: "Pro1856Ser",
    },
  },
  {
    key: "NC_000008.10:g.467881_467885delinsA",
    id: "NC_000008.10:g.467881_467885delinsA",
    label: "NC_000008.10[g.467881_467885delinsA]",
    type: "genomic",
    queryParams: {
      genomicAlleleShortForm: "NC_000008.10:g.467881_467885delinsA",
    },
  },
  {
    key: "GRCh37:17[43045703,43045704]:[43045704,43045705]",
    id: "GRCh37:17[43045703,43045704]:[43045704,43045705]",
    label: "GRCh37:17[43045703,43045704]:[43045704,43045705]",
    type: "genomic",
    queryParams: {
      assemblyId: "GRCh37",
      referenceName: "17",
      start: [43045703, 43045704],
      end: [43045704, 43045705],
    },
  },
  {
    key: "GRCh37:2[343675,345681]",
    id: "GRCh37:2[343675,345681]",
    label: "GRCh37:2[343675,345681]",
    type: "genomic",
    queryParams: {
      assemblyId: "GRCh37",
      referenceName: "2",
      start: [343675],
      end: [345681],
    },
  },
];

const proteinExamples = [
  {
    key: "NP_009225.1:p.Glu1817Ter",
    id: "NP_009225.1:p.Glu1817Ter",
    label: "NP_009225.1:p.Glu1817Ter",
    type: "genomic",
    queryParams: {
      geneId: "BRCA1",
      aminoacidChange: "Glu1817Ter",
    },
  },
  {
    key: "LRG 199p1:p.Val25Gly",
    id: "LRG 199p1:p.Val25Gly",
    label: "LRG 199p1:p.Val25Gly",
    type: "genomic",
    queryParams: {
      geneId: "BRCA2",
      aminoacidChange: "Val25Gly",
    },
  },
];

const molecularEffectLabels = [
  {
    key: "SO:0001583",
    id: "SO:0001583",
    value: "SO:0001583",
    label: "Missense Variant",
    type: "filter",
  },
  {
    key: "SO:0002322",
    id: "SO:0002322",
    value: "SO:0002322",
    label: "Stop gained NMD escaping",
    type: "filter",
  },
];

export const filterLabels = {
  "SNP Examples": snpExamples,
  "Genomic Variant Examples": genomicVariantExamples,
  "Protein Examples": proteinExamples,
  "Molecular Effect": molecularEffectLabels,
};
