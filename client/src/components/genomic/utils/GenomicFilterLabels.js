const parseAminoAcidChange = (value = "") => {
  const match = value.match(/^([A-Za-z]+)(\d+)([A-Za-z]+)$/);
  if (!match) return null;

  const [, refAa, aaPosition, altAa] = match;
  return { refAa, aaPosition, altAa };
};

const snpExamples = [
  {
    key: "GRCh38 | 22-16050527-C-A",
    id: "GRCh38 | 22-16050527-C-A",
    label: "GRCh38 | 22-16050527-C-A",
    type: "genomic",
    queryType: "Sequence Query",
    queryParams: {
      assemblyId: "GRCh38",
      referenceName: "22",
      start: [16050527],
      referenceBases: "C",
      alternateBases: "A",
    },
  },
  {
    key: "GRCh38 | 22:16050655G>A",
    id: "GRCh38 | 22:16050655G>A",
    label: "GRCh38 | 22:16050655G>A",
    type: "genomic",
    queryType: "Sequence Query",
    queryParams: {
      assemblyId: "GRCh38",
      referenceName: "22",
      start: [16050655],
      referenceBases: "G",
      alternateBases: "A",
    },
  },
  {
    key: "GRCh38 | 22:16050568C>A",
    id: "GRCh38 | 22:16050568C>A",
    label: "GRCh38 | 22:16050568C>A",
    type: "genomic",
    queryType: "Sequence Query",
    queryParams: {
      assemblyId: "GRCh38",
      referenceName: "22",
      start: [16050568],
      referenceBases: "C",
      alternateBases: "A",
    },
  },
];

const HGVSexamples = [
  {
    key: "NC_000022.11:g.16050075A>G",
    id: "NC_000022.11:g.16050075A>G",
    label: "NC_000022.11:g.16050075A>G",
    type: "genomic",
    queryType: "Genomic Allele Query (HGVS)",
    queryParams: {
      genomicAlleleShortForm: "NC_000022.11:g.16050075A>G",
    },
  },
  {
    key: "NC_000022.11:g.16050688C>T",
    id: "NC_000022.11:g.16050688C>T",
    label: "NC_000022.11:g.16050688C>T",
    type: "genomic",
    queryType: "Genomic Allele Query (HGVS)",
    queryParams: {
      genomicAlleleShortForm: "NC_000022.11:g.16050688C>T",
    },
  },
  {
    key: "NC_000022.11:g.16050607G>A",
    id: "NC_000022.11:g.16050607G>A",
    label: "NC_000022.11:g.16050607G>A",
    type: "genomic",
    queryType: "Genomic Allele Query (HGVS)",
    queryParams: {
      genomicAlleleShortForm: "NC_000022.11:g.16050607G>A",
    },
  },
];

const proteinExamples = [
  {
    key: "CHR_START-DUXAP8",
    id: "CHR_START-DUXAP8",
    label: "CHR_START-DUXAP8",
    type: "genomic",
    queryType: "Gene ID",
    queryParams: {
      geneId: "CHR_START-DUXAP8",
    },
  },
];

const molecularEffectLabels = [
  {
    key: "ENSGLOSSARY:0000174",
    id: "ENSGLOSSARY:0000174",
    label: "intergenic_region",
    type: "ontology",
    scope: "genomicVariation",
  },
  {
    key: "ENSGLOSSARY:0000150",
    id: "ENSGLOSSARY:0000150",
    label: "missense_variant",
    type: "ontology",
    scope: "genomicVariation",
  },
];

export const filterLabels = {
  "SNP Examples": snpExamples,
  "HGVS Examples": HGVSexamples,
  "Protein Examples": proteinExamples,
  "Molecular Effect": molecularEffectLabels,
};
