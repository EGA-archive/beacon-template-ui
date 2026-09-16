const Joi = require("joi");

/**
 * Reusable validation rules
 */

const nonEmptyString = Joi.string().trim().min(1);

const hexColor = Joi.string()
  .pattern(/^#[0-9A-Fa-f]{6}$/)
  .messages({
    "string.pattern.base":
      'Color must be a valid 6-digit hex value (e.g. "#3176B1")',
  });

const httpUrl = Joi.string()
  .uri({ scheme: ["http", "https"] })
  .messages({
    "string.uri": "URL must be a valid HTTP or HTTPS URL",
  });

const httpsUrl = Joi.string()
  .uri({ scheme: ["https"] })
  .messages({
    "string.uri": "URL must be a valid HTTPS URL",
  });

const relativePath = Joi.string().uri({ relativeOnly: true });

/**
 * Accepted reference names:
 * 1-22, X, Y, M, MT
 * Optionally prefixed with "chr".
 */
const referenceName = Joi.string()
  .pattern(/^(?:chr)?(?:[1-9]|1[0-9]|2[0-2]|X|Y|M|MT)$/)
  .messages({
    "string.pattern.base":
      'referenceName must be 1-22, X, Y, M or MT, optionally prefixed with "chr"',
  });

/**
 * Uppercase IUPAC nucleotide codes, excluding U.
 * "." and "-" are accepted as standalone values.
 */
const nucleotideSequence = Joi.string()
  .pattern(/^(?:[ACGTRYSWKMBDHVN]+|[.-])$/)
  .messages({
    "string.pattern.base":
      "Only uppercase IUPAC nucleotide codes excluding U are allowed. '.' and '-' are allowed as standalone values.",
  });

/**
 * Backend identifiers currently recognized as genomic variation.
 *
 * These are not display labels and are not used to restrict
 * entryTypesOrder.
 */
const GENOMIC_VARIATION_ENTRY_TYPES = [
  "g_variants",
  "genomicVariations",
  "genomicVariation",
];

/**
 * Maps annotation queryType labels to the corresponding
 * genomicQueryTypes configuration switch.
 */
const GENOMIC_QUERY_TYPE_CONFIG_KEYS = {
  "Gene ID": "geneId",
  "Range Query": "rangeQuery",
  "Bracket Query": "bracketQuery",
  "Sequence Query": "sequenceQuery",
  "Genomic Allele Query (HGVS)": "hgvsQuery",
};

const CODE_PROVIDED_GENOMIC_ANNOTATION_CATEGORY = "Molecular Effects";

const DEFAULT_COOKIE_MESSAGE =
  "This website requires cookies, and the limited processing of your personal data in order to function. By using the site you agree to this as outlined in our Privacy Notice and Terms of Use.";

const DEFAULT_COOKIE_BUTTON_TEXT = "I understand";

/**
 * About page content.
 *
 * All three sections are individually optional.
 */
const aboutContentSchema = Joi.object({
  logos: Joi.array().items(relativePath).min(1).optional(),

  descriptions: Joi.array().items(nonEmptyString).min(1).optional(),

  fundingOrgs: Joi.array()
    .items(
      Joi.object({
        title: nonEmptyString.required(),

        logos: Joi.array().items(relativePath).min(1).required(),
      })
    )
    .min(1)
    .optional(),
});

/**
 * OIDC configuration.
 *
 * Fields are optional in the base schema so an incomplete
 * authentication configuration may remain when login is disabled.
 * The required fields are enforced when showLogin is true.
 */
const oidcSchema = Joi.object({
  clientId: nonEmptyString,

  authority: httpsUrl,

  autoSignIn: Joi.boolean(),

  responseType: Joi.string().valid("code"),

  automaticSilentRenew: Joi.boolean(),

  redirectUri: httpUrl,

  scope: nonEmptyString,

  revokeAccessTokenOnSignout: Joi.boolean(),
});

const authSchema = Joi.object({
  providerType: Joi.string().valid("private", "public"),

  oidc: oidcSchema,
});

const requiredAuthSchema = authSchema
  .fork(
    [
      "providerType",
      "oidc",
      "oidc.clientId",
      "oidc.authority",
      "oidc.responseType",
      "oidc.redirectUri",
      "oidc.scope",
    ],
    (field) => field.required()
  )
  .required();

/**
 * Genomic query type switches.
 *
 * The relationship requiring at least one enabled query type
 * is validated at UI level when a genomic variation entry type
 * is present.
 */
const genomicQueryTypesSchema = Joi.object({
  sequenceQuery: Joi.boolean(),
  geneId: Joi.boolean(),
  rangeQuery: Joi.boolean(),
  bracketQuery: Joi.boolean(),
  hgvsQuery: Joi.boolean(),
});

/**
 * Genomic query configuration.
 *
 * The query builder is optional.
 * If provided, its internal rules still apply.
 */
const genomicQueriesSchema = Joi.object({
  genomicQueryTypes: genomicQueryTypesSchema.required(),

  searchInputExample: Joi.object({
    referenceName: referenceName.required(),

    position: Joi.number().integer().min(0).required().messages({
      "number.base": "position must be a number",
      "number.integer": "position must be an integer",
      "number.min": "position cannot be negative",
    }),

    referenceBases: nucleotideSequence.required(),

    alternateBases: nucleotideSequence.required(),
  }).optional(),

  genomicQueryBuilder: Joi.object({
    showAlternateBases: Joi.boolean().default(true),

    showAminoacidChange: Joi.boolean().default(true),

    chromosomeLibrary: Joi.array()
      .items(nonEmptyString)
      .min(1)
      .required()
      .messages({
        "any.required":
          "chromosomeLibrary is required under genomicQueryBuilder",
      }),

    aminoAcidNotation: Joi.alternatives().conditional("showAminoacidChange", {
      is: true,

      then: Joi.array().items(nonEmptyString).min(1).required().messages({
        "any.required":
          "aminoAcidNotation is required when showAminoacidChange is true",
      }),

      otherwise: Joi.forbidden(),
    }),
  }).optional(),
});

/**
 * Genomic annotation query examples.
 *
 * Categories are configurable.
 * Each example contains:
 * - queryType
 * - queryParams
 * - optional custom label
 *
 * If label is omitted, the UI will infer it from queryParams.
 */

const geneIdAnnotationSchema = Joi.object({
  label: nonEmptyString.optional(),

  queryType: Joi.string().valid("Gene ID").required(),

  queryParams: Joi.object({
    geneId: nonEmptyString.required(),

    refAa: nonEmptyString.optional(),

    aaPosition: Joi.alternatives()
      .try(Joi.number().integer().positive(), Joi.string().pattern(/^\d+$/))
      .optional(),

    altAa: nonEmptyString.optional(),
  })
    /**
     * Amino-acid information must either be fully provided
     * or fully omitted.
     */
    .and("refAa", "aaPosition", "altAa")
    .required(),
});

const sequenceAnnotationSchema = Joi.object({
  label: nonEmptyString.optional(),

  queryType: Joi.string().valid("Sequence Query").required(),

  queryParams: Joi.object({
    assemblyId: nonEmptyString.required(),

    referenceName: nonEmptyString.required(),

    start: Joi.array()
      .items(Joi.number().integer().min(0))
      .length(1)
      .required(),

    referenceBases: nucleotideSequence.required(),

    alternateBases: nucleotideSequence.required(),
  }).required(),
});

const rangeAnnotationSchema = Joi.object({
  label: nonEmptyString.optional(),

  queryType: Joi.string().valid("Range Query").required(),

  queryParams: Joi.object({
    assemblyId: nonEmptyString.required(),

    referenceName: nonEmptyString.required(),

    start: Joi.array()
      .items(Joi.number().integer().min(0))
      .length(1)
      .required(),

    end: Joi.array().items(Joi.number().integer().min(0)).length(1).required(),
  }).required(),
});

const bracketAnnotationSchema = Joi.object({
  label: nonEmptyString.optional(),

  queryType: Joi.string().valid("Bracket Query").required(),

  queryParams: Joi.object({
    assemblyId: nonEmptyString.required(),

    referenceName: nonEmptyString.required(),

    start: Joi.array()
      .items(Joi.number().integer().min(0))
      .length(2)
      .required(),

    end: Joi.array().items(Joi.number().integer().min(0)).length(2).required(),
  }).required(),
});

const hgvsAnnotationSchema = Joi.object({
  label: nonEmptyString.optional(),

  queryType: Joi.string().valid("Genomic Allele Query (HGVS)").required(),

  queryParams: Joi.object({
    genomicAlleleShortForm: nonEmptyString.required(),
  }).required(),
});

/**
 * Any configured genomic annotation example must match
 * one of the supported genomic query structures.
 */
const genomicAnnotationExampleSchema = Joi.alternatives().try(
  geneIdAnnotationSchema,
  sequenceAnnotationSchema,
  rangeAnnotationSchema,
  bracketAnnotationSchema,
  hgvsAnnotationSchema
);

/**
 * Main runtime configuration schema.
 */
const schema = Joi.object({
  /**
   * Beacon configuration
   */

  beaconType: Joi.string().valid("singleBeacon", "networkBeacon").required(),

  apiUrl: httpUrl.required(),

  assemblyId: Joi.array().items(nonEmptyString).min(1).required().messages({
    "any.required": "assemblyId is required",
    "array.min": "At least one assemblyId must be provided",
  }),

  queryCoordinatesAre0Based: Joi.boolean().default(true),

  /**
   * Variant types available in the UI.
   */
  variationType: Joi.array()
    .items(
      Joi.object({
        jsonName: Joi.string()
          .pattern(/^[A-Za-z0-9_]+$/)
          .required()
          .messages({
            "string.pattern.base":
              "jsonName must contain only letters, numbers, or underscores",
            "any.required": "Each variationType entry must include a jsonName",
          }),

        displayName: nonEmptyString.required().messages({
          "any.required": "Each variationType entry must include a displayName",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "variationType is required",
      "array.min": "At least one variationType must be provided",
    }),

  /**
   * UI configuration
   */
  ui: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),

    favicon: Joi.alternatives().try(relativePath, httpUrl).optional(),

    /**
     * UI colors
     */
    colors: Joi.object({
      primary: hexColor.required(),
      darkPrimary: hexColor.required(),
      secondary: hexColor.required(),
    }).required(),

    /**
     * Main and founder logos.
     *
     * The main logo is optional.
     * Founder logos use objects with src and url.
     */
    logos: Joi.object({
      main: relativePath.optional(),

      founders: Joi.array()
        .items(
          Joi.object({
            src: relativePath.required(),
            url: httpsUrl.required(),
          })
        )
        .max(3)
        .optional(),
    }).required(),

    /**
     * External navigation links
     */
    showExternalNavBarLink: Joi.boolean().default(false),

    externalNavBarLink: Joi.alternatives().conditional(
      "showExternalNavBarLink",
      {
        is: true,

        then: Joi.array()
          .items(
            Joi.object({
              label: Joi.string().trim().min(1).max(30).required(),

              url: httpUrl.required(),
            })
          )
          .min(1)
          .required(),

        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "externalNavBarLink is not allowed when showExternalNavBarLink is false",
        }),
      }
    ),

    /**
     * About page
     *
     * Each content section is optional.
     * When the page is enabled, at least one section
     * must be provided.
     */
    showAboutPage: Joi.boolean().default(false),

    about: aboutContentSchema.when("showAboutPage", {
      is: true,

      then: aboutContentSchema
        .or("logos", "descriptions", "fundingOrgs")
        .required(),

      otherwise: aboutContentSchema.optional(),
    }),

    // Download funcionality
    download: Joi.object({
      enabled: Joi.boolean().default(true),

      maxRecordsDownloadableLimit: Joi.number().integer().min(1).default(10000),
    }).default(),

    /**
     * Cookie consent
     *
     * Text receives defaults when omitted.
     * Links are optional and may be replaced, removed,
     * or extended by deployers.
     *
     * Every link object must contain both label and URL.
     */
    cookies: Joi.object({
      enabled: Joi.boolean().default(true),

      message: nonEmptyString.when("enabled", {
        is: true,
        then: Joi.required().default(DEFAULT_COOKIE_MESSAGE),
        otherwise: Joi.optional(),
      }),

      buttonText: nonEmptyString.when("enabled", {
        is: true,
        then: Joi.required().default(DEFAULT_COOKIE_BUTTON_TEXT),
        otherwise: Joi.optional(),
      }),

      links: Joi.array()
        .items(
          Joi.object({
            label: nonEmptyString.required().messages({
              "string.empty": "Cookie link label cannot be empty",
              "any.required": "Cookie link label is required",
            }),

            url: httpUrl.required().messages({
              "string.empty": "Cookie link URL cannot be empty",
              "any.required":
                "Cookie link URL is required when a label is provided",
            }),
          })
        )
        .default([]),
    }).default(),

    /**
     * Authentication
     *
     * Login is disabled by default.
     * When enabled, the complete OIDC configuration
     * and providerType are required.
     */
    showLogin: Joi.boolean().default(false),

    auth: authSchema.when("showLogin", {
      is: true,
      then: requiredAuthSchema,
      otherwise: authSchema.optional(),
    }),

    /**
     * Entry type ordering
     *
     * Entry type identifiers are defined by the backend.
     * No fixed list or maximum is imposed here.
     *
     * If omitted or empty, the UI should preserve
     * the order returned by the backend.
     */
    entryTypesOrder: Joi.array().items(nonEmptyString).unique().default([]),

    /**
     * Common filters
     *
     * Every filterLabels key must correspond to a
     * declared filterCategories value.
     */
    commonFilters: Joi.object({
      filterCategories: Joi.array()
        .items(Joi.string().trim().min(1).max(20))
        .max(3)
        .required(),

      filterLabels: Joi.object()
        .pattern(
          Joi.string(),
          Joi.array()
            .items(
              Joi.object({
                id: nonEmptyString.required(),

                type: Joi.string()
                  .valid(
                    "ontology",
                    "alphanumeric",
                    "ontologyTerm",
                    "customTerm",
                    "custom"
                  )
                  .required(),

                key: Joi.string().trim().min(1).max(100).optional(),

                label: Joi.string().trim().min(1).max(100).optional(),

                scopes: Joi.array().items(nonEmptyString).optional(),
              })
            )
            .max(6)
        )
        .required(),
    })
      .custom((value, helpers) => {
        const unknownCategories = Object.keys(value.filterLabels).filter(
          (category) => !value.filterCategories.includes(category)
        );

        if (unknownCategories.length > 0) {
          return helpers.message(
            `filterLabels contains categories not listed in filterCategories: ${unknownCategories.join(
              ", "
            )}`
          );
        }

        return value;
      }, "Filter category validation")
      .optional(),

    /**
     * Genomic annotations
     *
     * Category names and their order are configurable.
     * A maximum of three configurable categories is supported.
     * Molecular Effect is handled separately by the application
     * and is not configured here.
     * Every annotationLabels key must correspond to a category
     * declared in annotationCategories.
     */
    genomicAnnotations: Joi.object({
      annotationCategories: Joi.array()
        .items(Joi.string().trim().min(1).max(50))
        .min(1)
        .max(4)
        .unique()
        .required()
        .messages({
          "any.required":
            "annotationCategories is required under genomicAnnotations",

          "array.min":
            "At least one genomic annotation category must be provided",

          "array.max":
            "A maximum of 4 genomic annotation categories is supported",

          "array.unique": "Genomic annotation category names must be unique",
        }),

      annotationLabels: Joi.object()
        .pattern(
          Joi.string(),
          Joi.array().items(genomicAnnotationExampleSchema).min(1).max(6)
        )
        .required(),
    })
      .custom((value, helpers) => {
        const annotationLabels = value.annotationLabels || {};

        /**
         * Every annotationLabels key must exist
         * in annotationCategories.
         */
        const unknownCategories = Object.keys(annotationLabels).filter(
          (category) => !value.annotationCategories.includes(category)
        );

        if (unknownCategories.length > 0) {
          return helpers.message(
            `annotationLabels contains categories not listed in annotationCategories: ${unknownCategories.join(
              ", "
            )}`
          );
        }

        /**
         * Every configured category must also have
         * a matching annotationLabels array.
         */
        const missingCategories = value.annotationCategories.filter(
          (category) =>
            category !== CODE_PROVIDED_GENOMIC_ANNOTATION_CATEGORY &&
            !annotationLabels[category]
        );

        if (missingCategories.length > 0) {
          return helpers.message(
            `annotationCategories contains categories with no annotationLabels: ${missingCategories.join(
              ", "
            )}`
          );
        }
        return value;
      }, "Genomic annotation category validation")
      .optional(),

    /**
     * Genomic queries
     * This section is optional at schema-property level.
     * The UI-level relationship validation below makes it mandatory when a genomic variation entry type is present.
     */
    genomicQueries: genomicQueriesSchema.optional(),
  })
    .custom((value, helpers) => {
      const hasGenomicVariants = value.entryTypesOrder?.some((entryType) =>
        GENOMIC_VARIATION_ENTRY_TYPES.includes(entryType)
      );

      /**
       * No genomic variation entry type is configured.
       * genomicQueries may therefore be omitted, or it may be present with all query-type switches set to false.
       */
      if (!hasGenomicVariants) {
        return value;
      }

      /**
       * A genomic variation entry type is configured,
       * therefore genomicQueries is mandatory.
       */
      if (!value.genomicQueries) {
        return helpers.message(
          "genomicQueries is required when g_variants is present in entryTypesOrder"
        );
      }

      const queryTypes = value.genomicQueries.genomicQueryTypes;

      /**
       * If genomicQueryTypes is missing, its own required()
       * validation will report the structural error.
       */
      if (!queryTypes) {
        return value;
      }

      /**
       * When genomic variation is available, at least
       * one genomic query type must explicitly be enabled.
       */
      const hasEnabledQueryType = Object.values(queryTypes).some(
        (enabled) => enabled === true
      );

      if (!hasEnabledQueryType) {
        return helpers.message(
          "At least one genomic query type must be enabled when g_variants is present"
        );
      }

      /**
       * Genomic annotation examples may only use query types
       * that are enabled under genomicQueries.genomicQueryTypes.
       */
      const annotationLabels = value.genomicAnnotations?.annotationLabels || {};

      for (const [category, annotations] of Object.entries(annotationLabels)) {
        for (const annotation of annotations) {
          const configKey =
            GENOMIC_QUERY_TYPE_CONFIG_KEYS[annotation.queryType];

          if (configKey && queryTypes[configKey] !== true) {
            return helpers.message(
              `Genomic annotation category "${category}" uses "${annotation.queryType}", but "${configKey}" is not enabled in genomicQueryTypes`
            );
          }
        }
      }

      return value;
    }, "Genomic query configuration validation")
    .required(),
}).prefs({
  /**
   * Reject values such as "true" instead of silently
   * converting them to booleans.
   */
  convert: false,

  /**
   * Collect all validation errors instead of stopping
   * at the first one.
   */
  abortEarly: false,
});

module.exports = schema;
