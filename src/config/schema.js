const Joi = require("joi");

const hexColor = Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/);

const allowedEntryTypes = [
  "analyses",
  "biosamples",
  "cohorts",
  "datasets",
  "g_variants",
  "individuals",
  "runs",
];

const schema = Joi.object({
  beaconType: Joi.string().valid("singleBeacon", "networkBeacon").required(),

  apiUrl: Joi.string().uri().required().messages({
    "string.uri":
      'API_URL must be a valid URL (e.g., "https://example.com/api")',
    "any.required": "API_URL is required",
  }),

  assemblyId: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required()
    .messages({
      "any.required": "assemblyId is required",
      "array.min": "At least one assemblyId must be provided",
      "string.min": "assemblyId values cannot be empty strings",
    }),

  ui: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    entryTypesOrder: Joi.array()
      .items(Joi.string().valid(...allowedEntryTypes))
      .max(7)
      .optional()
      .messages({
        "array.max": "You can specify a maximum of 7 entry types for ordering.",
      }),
  }).required(),
  colors: Joi.object({
    primary: hexColor.required(),
    secondary: hexColor.required(),
    tertiary: hexColor.required(),
  }).required(),

  logos: Joi.object({
    main: Joi.string().uri({ relativeOnly: true }).required(),
    founders: Joi.array()
      .items(Joi.string().uri({ relativeOnly: true }))
      .max(3),
  }).required(),

  commonFilters: Joi.object({
    filterCategories: Joi.array()
      .items(Joi.string().min(1).max(20))
      .max(3)
      .required(),

    filterLabels: Joi.object()
      .pattern(
        Joi.string().valid(...Joi.ref("...filterCategories")),
        Joi.array().items(Joi.string().min(1).max(30)).max(6)
      )
      .required(),
  }).required(),

  genomicAnnotations: Joi.object({
    visibleGenomicCategories: Joi.array()
      .items(
        Joi.string().valid(
          "SNP Examples",
          "CNV Examples",
          "Protein Examples",
          "Molecular Effect"
        )
      )
      .min(1)
      .required()
      .messages({
        "any.required":
          "visibleGenomicCategories is required under genomicAnnotations",
        "array.min":
          "At least one genomicAnnotations category must be provided",
      }),
  }).optional(),
});

module.exports = schema;
