// This is a helper to help translat from UI to Beacon-ready request parameters

export const buildGenomicParams = (queryType, values, selectedInput) => {
  let params = {};

  switch (queryType) {
    case "Sequence Query":
      params = {
        assemblyId: values.assemblyId,
        referenceName: values.chromosome,
        start: [Number(values.start)],
        referenceBases: values.refBases,
        alternateBases: values.alternateBases || values.altBases,
      };
      break;

    case "Range Query": {
      const refAa = values.refAa?.trim();
      const altAa = values.altAa?.trim();
      const aaPos = values.aaPosition?.trim();

      // derive aminoacidChange if needed
      let aminoacidChange = values.aminoacidChange;
      if (!aminoacidChange && refAa && altAa && aaPos) {
        aminoacidChange = `${refAa}${aaPos}${altAa}`;
      }

      // Define the exclusive groups (same as in Dialog)
      const mutuallyExclusiveGroups = {
        variationType: ["variationType"],
        alternateBases: ["alternateBases", "refBases", "altBases"],
        aminoacidChange: ["aminoacidChange", "refAa", "altAa", "aaPosition"],
      };

      // Determine active group based on selectedInput
      const allowedKeys = mutuallyExclusiveGroups[selectedInput] || [];

      // Build base params (always required)
      params = {
        assemblyId: values.assemblyId,
        referenceName: values.chromosome,
        start: [Number(values.start)],
        end: [Number(values.end)],
        variantMinLength: values.minVariantLength || undefined,
        variantMaxLength: values.maxVariantLength || undefined,
      };

      // Add only the active exclusive group
      if (selectedInput === "variationType" && values.variationType) {
        params.variantType = values.variationType;
      }

      if (selectedInput === "alternateBases" && values.alternateBases) {
        params.alternateBases = values.alternateBases;
      }

      if (selectedInput === "aminoacidChange" && aminoacidChange) {
        params.aminoacidChange = aminoacidChange;
      }

      break;
    }

    case "Bracket Query":
      params = {
        assemblyId: values.assemblyId,
        referenceName: values.chromosome,
        start: [Number(values.startMin), Number(values.startMax)],
        end: [Number(values.endMin), Number(values.endMax)],
        variantType: values.variationType || undefined,
      };
      break;

    case "Gene ID": {
      const refAa = values.refAa?.trim();
      const altAa = values.altAa?.trim();
      const aaPos = values.aaPosition?.trim();

      // derive aminoacidChange if needed
      let aminoacidChange = values.aminoacidChange;
      if (!aminoacidChange && refAa && altAa && aaPos) {
        aminoacidChange = `${refAa}${aaPos}${altAa}`;
      }

      // Define the exclusive groups (same as in Dialog)
      const mutuallyExclusiveGroups = {
        variationType: ["variationType"],
        alternateBases: ["alternateBases", "refBases", "altBases"],
        aminoacidChange: ["aminoacidChange", "refAa", "altAa", "aaPosition"],
      };

      // Determine active group based on selectedInput
      const allowedKeys = mutuallyExclusiveGroups[selectedInput] || [];

      // Build the base params
      params = {
        geneId: values.geneId,
        assemblyId: values.assemblyId || undefined,
        referenceName: values.chromosome || undefined,
        variantMinLength: values.minVariantLength || undefined,
        variantMaxLength: values.maxVariantLength || undefined,
      };

      // Add only the fields from the active group
      if (selectedInput === "variationType" && values.variationType) {
        params.variantType = values.variationType;
      }

      if (selectedInput === "alternateBases" && values.alternateBases) {
        params.alternateBases = values.alternateBases;
      }

      if (selectedInput === "aminoacidChange" && aminoacidChange) {
        params.aminoacidChange = aminoacidChange;
      }
      break;
    }

    case "Genomic Allele Query (HGVS)":
      params = {
        genomicAlleleShortForm: values.genomicHGVSshortForm,
      };
      break;

    default:
      console.warn("[GQB] Unknown queryType:", queryType);
      params = {};
  }

  // Remove empty / undefined / NaN fields
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.some((v) => isNaN(v)))
    ) {
      delete params[key];
    }
  });

  // console.log("[GQB] buildGenomicParams.output ➜", params);
  return params;
};
