const Joi = require("joi");

// Validation rules for the config.json

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
  "This website uses cookies and limited processing of personal data in order to function.";

const DEFAULT_COOKIE_BUTTON_TEXT = "I understand";

/**
 * About page content.
 * All three sections are individually optional.
 */
const aboutLogoSource = Joi.alternatives().try(relativePath, httpUrl);

const aboutContentSchema = Joi.object({
  logos: Joi.array().items(aboutLogoSource).min(1).optional(),

  descriptions: Joi.array().items(nonEmptyString).min(1).optional(),

  fundingOrgs: Joi.array()
    .items(
      Joi.object({
        title: nonEmptyString.required(),

        logos: Joi.array().items(aboutLogoSource).min(1).required(),
      })
    )
    .min(1)
    .optional(),
});

const DEFAULT_OIDC_SCOPE =
  "openid profile email ga4gh_passport_v1 offline_access";

/**
 * OIDC configuration.
 *
 * References:
 * oidc-react AuthProvider:
 * https://github.com/bjerkio/oidc-react/blob/main/src/auth-context-interface.ts
 *
 * oidc-client-ts UserManager settings:
 * https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html
 *
 * OpenID Connect Discovery:
 * https://openid.net/specs/openid-connect-discovery-1_0.html
 *
 * When login is enabled, authority, clientId and redirectUri are required.
 *
 * Other supported settings are optional and can be configured by deployers when needed.
 */
const oidcSchema = Joi.object({
  /**
   * Client identifier registered with the OIDC provider.
   */
  clientId: nonEmptyString.optional(),

  /**
   * OIDC provider / issuer URL.
   * OpenID Connect requires the issuer to use HTTPS.
   */
  authority: httpsUrl.optional(),

  /**
   * Application callback URL after authentication.
   * HTTP is allowed for local development.
   * HTTPS should be used in production.
   */
  redirectUri: httpUrl.optional(),

  /**
   * Automatically redirect unauthenticated users to login.
   * oidc-react defaults this to true when omitted.
   */
  autoSignIn: Joi.boolean().optional().messages({
    "boolean.base": "auth.oidc.autoSignIn must be either true or false",
  }),

  /**
   * Requested OIDC scopes.
   * Deployers may override this when using another provider.
   */
  scope: nonEmptyString.default(DEFAULT_OIDC_SCOPE),

  /**
   * Automatically attempt to renew the access token.
   * oidc-client-ts defaults this to true.
   */
  automaticSilentRenew: Joi.boolean().optional().messages({
    "boolean.base":
      "auth.oidc.automaticSilentRenew must be either true or false",
  }),

  /**
   * Optional callback URL used for silent renewal.
   */
  silentRedirectUri: httpUrl.optional(),

  /**
   * Optional URL to return to after logout.
   */
  postLogoutRedirectUri: httpUrl.optional(),

  /**
   * Load additional identity information from UserInfo.
   */
  loadUserInfo: Joi.boolean().optional().messages({
    "boolean.base": "auth.oidc.loadUserInfo must be either true or false",
  }),

  /**
   * Automatically redirect to the provider when silent renewal fails.
   *
   * oidc-react defaults this to true.
   */
  autoSignOut: Joi.boolean().optional().messages({
    "boolean.base": "auth.oidc.autoSignOut must be either true or false",
  }),

  /**
   * Optional redirect URL used for popup authentication.
   */
  popupRedirectUri: httpUrl.optional(),

  /**
   * Window target used for popup authentication.
   */
  popupWindowTarget: nonEmptyString.optional(),

  /**
   * Additional query parameters sent to the authorization endpoint.
   */
  extraQueryParams: Joi.object()
    .pattern(nonEmptyString, Joi.string())
    .optional(),

  /**
   * Optional manually supplied OIDC provider metadata.
   */
  metadata: Joi.object().unknown(true).optional(),
});

const authSchema = Joi.object({
  oidc: oidcSchema,
});

const requiredAuthSchema = authSchema
  .fork(
    ["oidc", "oidc.clientId", "oidc.authority", "oidc.redirectUri"],
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
      .try(
        Joi.number().integer().positive(),
        Joi.string().pattern(/^[1-9]\d*$/)
      )
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
    referenceName: referenceName.required(),
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
    referenceName: referenceName.required(),
    start: Joi.array()
      .items(Joi.number().integer().min(0))
      .length(1)
      .required(),
    end: Joi.array().items(Joi.number().integer().min(1)).length(1).required(),
  })
    .custom((value, helpers) => {
      if (value.start[0] > value.end[0]) {
        return helpers.message(
          "Range Query start position cannot be greater than end position"
        );
      }
      return value;
    }, "Range Query coordinate validation")
    .required(),
});

const bracketAnnotationSchema = Joi.object({
  label: nonEmptyString.optional(),
  queryType: Joi.string().valid("Bracket Query").required(),
  queryParams: Joi.object({
    assemblyId: nonEmptyString.required(),
    referenceName: referenceName.required(),
    start: Joi.array()
      .items(Joi.number().integer().min(0))
      .length(2)
      .required(),
    end: Joi.array().items(Joi.number().integer().min(1)).length(2).required(),
  })
    .custom((value, helpers) => {
      if (value.start[0] > value.start[1]) {
        return helpers.message(
          "Bracket Query start minimum cannot be greater than start maximum"
        );
      }
      if (value.end[0] > value.end[1]) {
        return helpers.message(
          "Bracket Query end minimum cannot be greater than end maximum"
        );
      }
      return value;
    }, "Bracket Query coordinate validation")
    .required(),
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
  beaconType: Joi.string().valid("singleBeacon", "networkBeacon").required(),

  apiUrl: httpUrl.required(),

  assemblyId: Joi.array()
    .items(nonEmptyString)
    .min(1)
    .default(["GRCh38", "GRCh37"])
    .messages({
      "array.min": "At least one assemblyId must be provided",
    }),

  /**
   * Variant types available in the UI.
   * Optional because it is only relevant when genomic variations are available.
   * When provided, each variation type may define jsonName, displayName, or both, but at least one of the two fields must be provided.
   */
  variationType: Joi.array()
    .items(
      Joi.object({
        jsonName: Joi.string()
          .pattern(/^[A-Za-z0-9_]+$/)
          .optional()
          .messages({
            "string.pattern.base":
              "jsonName must contain only letters, numbers, or underscores",
          }),

        displayName: nonEmptyString.optional(),
      }).or("jsonName", "displayName")
    )
    .min(1)
    .optional()
    .messages({
      "array.min":
        "At least one variationType must be provided when variationType is configured",
    }),

  /**
   * Defines whether genomic query coordinates are 0-based.
   * Optional. Defaults to true.
   * When provided, the value must be either true or false.
   */
  queryCoordinatesAre0Based: Joi.boolean().default(true).messages({
    "boolean.base": "queryCoordinatesAre0Based must be either true or false",
  }),

  // UI configuration
  ui: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    favicon: Joi.alternatives().try(relativePath, httpUrl).optional(),

    /**
     * UI colors.
     * Defaults are used when a color is not provided.
     * If provided, colors cannot be empty and must be valid 6-digit hex values.
     */
    colors: Joi.object({
      primary: hexColor.default("#3176B1"),
      darkPrimary: hexColor.default("#173D5D"),
      secondary: hexColor.default("#FFE4D4"),
    }).default(),

    /**
     * Main and founder logos.
     * The main logo is optional and can use a relative path or URL.
     * Founder logos require a src, while the external url is optional.
     */
    logos: Joi.object({
      main: Joi.alternatives().try(relativePath, httpUrl).optional(),
      founders: Joi.array()
        .items(
          Joi.object({
            src: Joi.alternatives().try(relativePath, httpUrl).required(),
            url: httpUrl.optional(),
          })
        )
        .max(3)
        .optional(),
    }).required(),

    /**
     * External navigation links.
     * The feature is disabled by default.
     * When enabled, between 1 and 2 external links must be provided.
     * When disabled, the links may remain configured but are not displayed.
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
          .max(2)
          .required()
          .messages({
            "array.min":
              "At least one external navigation link must be provided when showExternalNavBarLink is true",
            "array.max":
              "A maximum of 2 external navigation links is supported",
          }),

        otherwise: Joi.array()
          .items(
            Joi.object({
              label: Joi.string().trim().min(1).max(30).required(),
              url: httpUrl.required(),
            })
          )
          .max(2)
          .optional()
          .messages({
            "array.max":
              "A maximum of 2 external navigation links is supported",
          }),
      }
    ),

    /**
     * About page.
     * The page is disabled by default.
     * When enabled, at least one content section must be provided.
     * When disabled, About content may remain configured.
     */
    showAboutPage: Joi.boolean().default(false),

    about: aboutContentSchema.when("showAboutPage", {
      is: true,

      then: aboutContentSchema
        .or("logos", "descriptions", "fundingOrgs")
        .required(),

      otherwise: aboutContentSchema.optional(),
    }),

    // Download functionality
    download: Joi.object({
      enabled: Joi.boolean().default(true).messages({
        "boolean.base": "download.enabled must be either true or false",
      }),

      maxRecordsDownloadableLimit: Joi.number().integer().min(1).default(10000),
    }).default(),

    /**
     * Cookie consent
     * Text receives defaults when omitted.
     * Links are optional and may be replaced, removed,or extended by deployers.
     *
     * Every link object must contain both label and URL.
     */
    cookies: Joi.object({
      enabled: Joi.boolean().default(true).messages({
        "boolean.base": "cookies.enabled must be either true or false",
      }),

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
     * Authentication.
     * Login is disabled by default.
     * When enabled, auth.oidc, clientId, authority and redirectUri are required.
     */
    showLogin: Joi.boolean().default(false).messages({
      "boolean.base": "showLogin must be either true or false",
    }),

    auth: authSchema.when("showLogin", {
      is: true,
      then: requiredAuthSchema,
      otherwise: authSchema.optional(),
    }),

    /**
     * Entry type ordering
     * Entry type identifiers are defined by the backend.
     * No fixed list or maximum is imposed here.
     * If omitted, the UI uses the default preferred order.
     * If provided, the deployer may override that order.
     */
    entryTypesOrder: Joi.array()
      .items(nonEmptyString)
      .unique()
      .default([
        "g_variants",
        "individuals",
        "biosamples",
        "analyses",
        "cohorts",
        "datasets",
        "runs",
      ]),

    /**
     * Common filters.
     * Every filterLabels key must correspond to a category declared in filterCategories.
     * A declared category may exist without configured labels.
     */
    commonFilters: Joi.object({
      filterCategories: Joi.array()
        .items(Joi.string().trim().min(1).max(20))
        .min(1)
        .max(3)
        .unique()
        .required(),

      filterLabels: Joi.object()
        .pattern(
          Joi.string().trim().min(1).max(20),
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
     * A maximum of three configurable categories is supported,
     * plus the optional code-provided "Molecular Effects" category.
     *
     * Molecular Effects can be enabled through annotationCategories,
     * but its labels are provided by the application/backend and
     * must not be configured inside annotationLabels.
     *
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
          Joi.string().trim().min(1).max(50),
          Joi.array().items(genomicAnnotationExampleSchema).min(1).max(6)
        )
        .optional(),
    })
      .custom((value, helpers) => {
        const annotationLabels = value.annotationLabels || {};

        const configurableCategories = value.annotationCategories.filter(
          (category) => category !== CODE_PROVIDED_GENOMIC_ANNOTATION_CATEGORY
        );

        /**
         * Molecular Effects is populated by application/backend logic
         * and therefore cannot be manually configured in annotationLabels.
         */
        if (
          Object.prototype.hasOwnProperty.call(
            annotationLabels,
            CODE_PROVIDED_GENOMIC_ANNOTATION_CATEGORY
          )
        ) {
          return helpers.message(
            `"${CODE_PROVIDED_GENOMIC_ANNOTATION_CATEGORY}" must not be configured in annotationLabels`
          );
        }

        /**
         * A maximum of three user-configurable categories is supported.
         * Molecular Effects does not count toward this limit.
         */
        if (configurableCategories.length > 3) {
          return helpers.message(
            "A maximum of 3 configurable genomic annotation categories is supported"
          );
        }

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
         * Every configurable category must have
         * a matching annotationLabels array.
         *
         * Molecular Effects is excluded because its values
         * come from the application/backend.
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

        /**
         * Prevent duplicate annotation examples within the same category.
         */
        for (const [category, annotations] of Object.entries(
          annotationLabels
        )) {
          const seenAnnotations = new Set();

          for (const annotation of annotations) {
            const annotationKey = `${annotation.queryType}:${JSON.stringify(
              annotation.queryParams
            )}`;

            if (seenAnnotations.has(annotationKey)) {
              return helpers.message(
                `Genomic annotation category "${category}" contains a duplicate annotation example`
              );
            }

            seenAnnotations.add(annotationKey);
          }
        }

        return value;
      }, "Genomic annotation category validation")
      .optional(),

    /**
     * Genomic queries
     *
     * This section is optional at schema-property level.
     * The UI-level relationship validation below makes it mandatory
     * when a genomic variation entry type is present.
     */
    genomicQueries: genomicQueriesSchema.optional(),
  })
    .custom((value, helpers) => {
      const hasGenomicVariants = value.entryTypesOrder?.some((entryType) =>
        GENOMIC_VARIATION_ENTRY_TYPES.includes(entryType)
      );

      if (hasGenomicVariants && !value.genomicQueries) {
        return helpers.message(
          "genomicQueries is required when g_variants is present in entryTypesOrder"
        );
      }

      const hasConfiguredAnnotationExamples = Object.values(
        value.genomicAnnotations?.annotationLabels || {}
      ).some((annotations) => annotations.length > 0);

      if (hasConfiguredAnnotationExamples && !value.genomicQueries) {
        return helpers.message(
          "genomicQueries is required when genomic annotation examples are configured"
        );
      }

      /**
       * No genomic queries or configured genomic annotation examples
       * require further query-type validation.
       */
      if (!value.genomicQueries) {
        return value;
      }

      const queryTypes = value.genomicQueries.genomicQueryTypes;

      if (!queryTypes) {
        return value;
      }

      /**
       * When genomic variation is explicitly configured,
       * at least one genomic query type must be enabled.
       */
      if (hasGenomicVariants) {
        const hasEnabledQueryType = Object.values(queryTypes).some(
          (enabled) => enabled === true
        );

        if (!hasEnabledQueryType) {
          return helpers.message(
            "At least one genomic query type must be enabled when g_variants is present"
          );
        }
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

    .custom((value, helpers) => {
      if (!value.genomicQueries) {
        return value;
      }

      const aminoAcidNotation =
        value.genomicQueries?.genomicQueryBuilder?.aminoAcidNotation || [];

      const showAminoacidChange =
        value.genomicQueries?.genomicQueryBuilder?.showAminoacidChange;

      const annotationLabels = value.genomicAnnotations?.annotationLabels || {};

      for (const [category, annotations] of Object.entries(annotationLabels)) {
        for (const annotation of annotations) {
          const { refAa, altAa } = annotation.queryParams || {};

          if ((refAa || altAa) && showAminoacidChange !== true) {
            return helpers.message(
              `Genomic annotation category "${category}" uses an amino-acid change, but showAminoacidChange is not enabled in genomicQueryBuilder`
            );
          }

          if (refAa && !aminoAcidNotation.includes(refAa)) {
            return helpers.message(
              `Genomic annotation category "${category}" uses refAa "${refAa}", but it is not listed in genomicQueryBuilder.aminoAcidNotation`
            );
          }

          if (altAa && !aminoAcidNotation.includes(altAa)) {
            return helpers.message(
              `Genomic annotation category "${category}" uses altAa "${altAa}", but it is not listed in genomicQueryBuilder.aminoAcidNotation`
            );
          }
        }
      }

      return value;
    }, "Genomic annotation amino-acid validation")

    .required(),
})
  .custom((value, helpers) => {
    const configuredAssemblyIds = value.assemblyId || [];

    const annotationLabels =
      value.ui?.genomicAnnotations?.annotationLabels || {};

    for (const [category, annotations] of Object.entries(annotationLabels)) {
      for (const annotation of annotations) {
        const annotationAssemblyId = annotation.queryParams?.assemblyId;

        if (
          annotationAssemblyId &&
          !configuredAssemblyIds.includes(annotationAssemblyId)
        ) {
          return helpers.message(
            `Genomic annotation category "${category}" uses assemblyId "${annotationAssemblyId}", but it is not listed in the top-level assemblyId configuration`
          );
        }
      }
    }

    return value;
  }, "Genomic annotation assembly validation")
  .prefs({
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
