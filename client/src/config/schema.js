const Joi = require("joi");

// This defines the hexColor vaild string
const hexColor = Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/);

// This defines which ones are the allowed entry types
// Might need to re-think it because of the free text entryTypes
// TODO
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

  apiUrl: Joi.string()
    .pattern(/^https:\/\/.+/)
    .required()
    .messages({
      "string.pattern.base":
        'API_URL must be a valid HTTPS URL (e.g., "https://example.com/api")',
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

  // Set this value according to the variant type used in your VCF file.
  // variationType is a requiered array with at least one item
  // Each item is an object with jsonName and displayName
  // jsonName is a technical key, must follow your VFC annotations
  // displayName is label shown to the user in the UI associated to the jsonName
  variationType: Joi.array()
    .items(
      Joi.object({
        jsonName: Joi.string()
          .pattern(/^[A-Za-z0-9_]+$/) // allow letters, numbers, underscore
          .required()
          .messages({
            "string.pattern.base":
              "jsonName must contain only letters, numbers, or underscores",
            "any.required":
              "Each variationType entry must include a 'jsonName' key",
          }),
        displayName: Joi.string().min(1).required().messages({
          "any.required":
            "Each variationType entry must include a 'displayName' key",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "variationType is required.",
      "array.min": "At least one variationType must be provided.",
    }),

  ui: Joi.object({
    title: Joi.string().min(3).max(100).required(),

    colors: Joi.object({
      primary: hexColor.required(),
      darkPrimary: hexColor.required(),
      secondary: hexColor.required(),
      tertiary: hexColor.required(),
    }).required(),

    logos: Joi.object({
      main: Joi.string().uri({ relativeOnly: true }).required(),
      founders: Joi.array()
        .items(Joi.string().uri({ relativeOnly: true }))
        .max(3),
    }).required(),

    showExternalNavBarLink: Joi.boolean().optional(),

    externalNavBarLink: Joi.alternatives().conditional(
      "showExternalNavBarLink",
      {
        is: true,
        then: Joi.array()
          .items(
            Joi.object({
              label: Joi.string().min(1).max(30).required(),
              url: Joi.string()
                .pattern(/^https:\/\/.+/)
                .required()
                .messages({
                  "string.pattern.base":
                    "Each externalNavBarLink URL must be a valid HTTPS link (e.g., https://...)",
                }),
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

    showAboutPage: Joi.boolean().default(false),

    about: Joi.alternatives().conditional("showAboutPage", {
      is: true,
      then: Joi.object({
        logos: Joi.array()
          .items(Joi.string().uri({ relativeOnly: true }))
          .min(1),
        descriptions: Joi.array().items(Joi.string().min(1)).min(1),
        fundingOrgs: Joi.array()
          .items(
            Joi.object({
              title: Joi.string().min(1).required(),
              logos: Joi.array()
                .items(Joi.string().uri({ relativeOnly: true }))
                .min(1)
                .required(),
            })
          )
          .min(1),
      })
        // require at least one of the three when showAboutPage = true
        .or("logos", "descriptions", "fundingOrgs")
        .required(),

      // If About page is OFF, the object is optional and unconstrained
      otherwise: Joi.object({
        logos: Joi.array()
          .items(Joi.string().uri({ relativeOnly: true }))
          .min(1),
        descriptions: Joi.array().items(Joi.string().min(1)).min(1),
        fundingOrgs: Joi.array()
          .items(
            Joi.object({
              title: Joi.string().min(1).required(),
              logos: Joi.array()
                .items(Joi.string().uri({ relativeOnly: true }))
                .min(1)
                .required(),
            })
          )
          .min(1),
      }).optional(),
    }),

    showLogin: Joi.boolean().default(true),

    contact: Joi.object({
      showContactPage: Joi.boolean().optional(),
      apiPath: Joi.string().uri().optional(),
      recipientKey: Joi.string().min(1).optional(),
    }).optional(),

    showPrivacyPolicy: Joi.boolean().required(),
    privacyPolicyFile: Joi.string()
      .uri({ relativeOnly: true })
      .required()
      .messages({
        "any.required": "privacyPolicyFile is required under ui",
      }),

    entryTypesOrder: Joi.array()
      .items(
        Joi.string()
          .valid(...allowedEntryTypes)
          .disallow("")
      )
      .max(7)
      .optional()
      .messages({
        "array.max": "You can specify a maximum of 7 entry types for ordering.",
        "any.invalid": "Empty strings are not allowed in entryTypesOrder.",
      }),

    // This is optional, but when the user decides to fill in the field, then there are rules.
    // This field gives a lot of freedom to the beacon user
    commonFilters: Joi.object({
      filterCategories: Joi.array()
        .items(Joi.string().min(1).max(20))
        .max(3)
        .required(),

      filterLabels: Joi.object()
        .pattern(
          Joi.string().valid(...Joi.ref("...filterCategories")),
          Joi.array()
            .items(
              Joi.object({
                id: Joi.string().min(1).required(),
                type: Joi.string()
                  .valid(
                    "ontology",
                    "alphanumeric",
                    "ontologyTerm",
                    "customTerm",
                    "custom"
                  )
                  .required(),
                key: Joi.string().min(1).max(100).optional(),
                label: Joi.string().min(1).max(100).optional(),
                scopes: Joi.array().items(Joi.string()).optional(), // TO DISCUSS BEACON TEAM - scopes as free text
              })
            )
            .max(6)
        )
        .required(),
    }).optional(),

    // This is also optional
    // This field directs the user into choosing at least one of the following strings
    // If the user does not fill anything related to the genomicAnnotations
    // This field might need further development (TODO)
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

    // This is also optional
    // The default value will always be true if not set false explicitly
    genomicQueries: Joi.object({
      genomicQueryBuilder: Joi.object({
        showAlternateBases: Joi.boolean().default(true),
        showAminoacidChange: Joi.boolean().default(true),
        chromosomeLibrary: Joi.array()
          .items(Joi.string().min(1))
          .min(1)
          .required()
          .messages({
            "any.required":
              "chromosomeLibrary is required under genomicQueryBuilder",
          }),
        aminoAcidNotation: Joi.alternatives().conditional(
          "showAminoacidChange",
          {
            is: true,
            then: Joi.array()
              .items(Joi.string().min(1))
              .min(1)
              .required()
              .messages({
                "any.required":
                  "aminoAcidNotation is required when showAminoacidChange is true",
              }),
            otherwise: Joi.forbidden(),
          }
        ),
      }).required(),
    }).optional(),
  }).required(),
});

module.exports = schema;
