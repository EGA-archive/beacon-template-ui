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
 * At least one genomic query type must be enabled.
 *
 * Individual switches default to true.
 */
const genomicQueryTypesSchema = Joi.object({
  sequenceQuery: Joi.boolean().default(true),
  geneId: Joi.boolean().default(true),
  rangeQuery: Joi.boolean().default(true),
  bracketQuery: Joi.boolean().default(true),
  hgvsQuery: Joi.boolean().default(true),
}).custom((value, helpers) => {
  const hasEnabledQueryType = Object.values(value).some(
    (enabled) => enabled === true
  );

  if (!hasEnabledQueryType) {
    return helpers.message(
      "At least one genomic query type must be enabled (set as true)"
    );
  }

  return value;
}, "Genomic query type validation");

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

    /**
     * Download functionality
     */
    download: Joi.object({
      enabled: Joi.boolean().default(true),
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
     * Genomic annotation categories
     */
    genomicAnnotations: Joi.object({
      visibleGenomicCategories: Joi.array()
        .items(
          Joi.string().valid(
            "SNP Examples",
            "Genomic Variant Examples",
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

    /**
     * Genomic queries
     *
     * When backend entry-type IDs are supplied through
     * Joi context, this section is required if the backend
     * supports a recognized genomic variation entry type.
     *
     * If the section is present, at least one query type
     * must be enabled.
     */
    genomicQueries: genomicQueriesSchema.optional().when("$entryTypeIds", {
      is: Joi.array().has(Joi.string().valid(...GENOMIC_VARIATION_ENTRY_TYPES)),

      then: Joi.required(),
    }),
  }).required(),
}).prefs({
  // Reject values such as "true" instead of silently
  // converting them to booleans.
  convert: false,

  // Collect all validation errors instead of stopping
  // at the first one.
  abortEarly: false,
});

module.exports = schema;
