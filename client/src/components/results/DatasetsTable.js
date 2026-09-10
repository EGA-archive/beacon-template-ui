import React, { useState } from "react";
import {
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { lighten } from "@mui/system";

import config from "../../config/runtimeConfig";
import { DATASETS_TABLE } from "../../lib/tableConstants";
import { useSelectedEntry } from "../context/SelectedEntryContext";

/**
 * On compact screens we only show:
 * ID | Description | External URL
 *
 * Name and DUO return from lg upward.
 */
const hiddenOnCompactScreens = {
  display: {
    xs: "none",
    sm: "none",
    md: "none",
    lg: "table-cell",
  },
};

/**
 * Compact column widths.
 *
 * On sm and xs, more space is reserved for External URL
 * so its header is not squeezed.
 */
const COMPACT_COLUMN_WIDTHS = {
  dataset_id: {
    xs: "25%",
    sm: "25%",
    md: "25%",
  },
  dataset_description: {
    xs: "55%",
    sm: "55%",
    md: "65%",
  },
  dataset_external_url: {
    xs: "20%",
    sm: "20%",
    md: "10%",
  },
};

const DESKTOP_COLUMN_WIDTHS = Object.fromEntries(
  DATASETS_TABLE.map((column) => [column.id, column.width])
);

const getResponsiveColumnWidth = (columnId) => ({
  ...COMPACT_COLUMN_WIDTHS[columnId],
  lg: DESKTOP_COLUMN_WIDTHS[columnId],
});

export default function DatasetsTable() {
  const { rawItems } = useSelectedEntry();
  const [expandedRows, setExpandedRows] = useState({});

  /**
   * xs + sm use a shorter description preview.
   * md and larger keep the existing 200-character preview.
   */
  const isSmallScreen = useMediaQuery("(max-width:899px)");
  const descriptionLimit = isSmallScreen ? 120 : 200;

  const headerCellStyle = {
    backgroundColor: config.ui.colors.darkPrimary,
    fontWeight: 700,
    color: "white",
    transition: "background-color 0.3s ease",
  };

  const toggleDescription = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        boxShadow: "none",
        borderRadius: 0,
      }}
    >
      <TableContainer>
        <Table
          sx={{
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow>
              {DATASETS_TABLE.map((column) => {
                const isHiddenOnCompact =
                  column.id === "dataset_name" || column.id === "dataset_duo";

                const isExternalUrl = column.id === "dataset_external_url";

                return (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{
                      ...headerCellStyle,
                      width: getResponsiveColumnWidth(column.id),

                      ...(isHiddenOnCompact ? hiddenOnCompactScreens : {}),

                      ...(isExternalUrl
                        ? {
                            textAlign: {
                              xs: "center",
                              lg: column.align,
                            },
                          }
                        : {}),
                    }}
                  >
                    {column.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {rawItems?.map((dataset, index) => {
              const description = dataset.description || "";
              const isExpanded = expandedRows[index];

              const hasLongDescription = description.length > descriptionLimit;

              return (
                <TableRow
                  key={dataset.id || index}
                  sx={{
                    "&:hover": {
                      backgroundColor: lighten(
                        config.ui.colors.darkPrimary,
                        0.9
                      ),
                    },

                    "& td": {
                      borderBottom: "1px solid rgba(224,224,224,1)",
                      py: 1.5,
                      verticalAlign: "top",
                    },
                  }}
                >
                  {/* Dataset ID */}
                  <TableCell
                    sx={{
                      width: getResponsiveColumnWidth("dataset_id"),
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                      fontSize: {
                        md: "0.875rem",
                        sm: "12px",
                        xs: "11px",
                      },
                    }}
                  >
                    <strong>{dataset.id || "-"}</strong>
                  </TableCell>

                  {/* Name hidden below lg */}
                  <TableCell
                    sx={{
                      ...hiddenOnCompactScreens,
                      width: DESKTOP_COLUMN_WIDTHS.dataset_name,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {dataset.name || "-"}
                  </TableCell>

                  {/* Description */}
                  <TableCell
                    sx={{
                      width: getResponsiveColumnWidth("dataset_description"),
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      fontSize: {
                        md: "0.875rem",
                        sm: "12px",
                        xs: "11px",
                      },
                    }}
                  >
                    {description ? (
                      <>
                        {isExpanded || !hasLongDescription
                          ? description
                          : `${description.slice(0, descriptionLimit)}...`}

                        {hasLongDescription && (
                          <Box
                            component="button"
                            type="button"
                            onClick={() => toggleDescription(index)}
                            sx={{
                              display: "inline",
                              ml: 0.5,
                              p: 0,
                              border: 0,
                              background: "none",
                              color: config.ui.colors.primary,
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontStyle: "italic",
                            }}
                          >
                            {isExpanded ? "Read less" : "Read more"}
                          </Box>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  {/* External URL:
                      icon on compact screens,
                      full URL on desktop */}
                  <TableCell
                    sx={{
                      width: getResponsiveColumnWidth("dataset_external_url"),
                      textAlign: {
                        xs: "center",
                        lg: "left",
                      },
                    }}
                  >
                    {dataset.externalUrl ? (
                      <Link
                        href={dataset.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open external dataset URL"
                        sx={{
                          color: config.ui.colors.darkPrimary,
                          textDecoration: "none",

                          display: {
                            xs: "inline-flex",
                            lg: "inline",
                          },

                          alignItems: "center",
                          justifyContent: "center",

                          "&:hover": {
                            textDecoration: {
                              xs: "none",
                              lg: "underline",
                            },
                          },
                        }}
                      >
                        {/* Full URL from lg upward */}
                        <Box
                          component="span"
                          sx={{
                            display: {
                              xs: "none",
                              lg: "inline",
                            },
                            overflowWrap: "anywhere",
                          }}
                        >
                          {dataset.externalUrl}
                        </Box>

                        {/* Compact external-link icon */}
                        <LaunchIcon
                          sx={{
                            display: {
                              xs: "block",
                              lg: "none",
                            },
                            color: config.ui.colors.darkPrimary,
                            fontSize: {
                              md: "20px",
                              sm: "17px",
                              xs: "16px",
                            },
                          }}
                        />
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  {/* DUO hidden below lg */}
                  <TableCell
                    sx={{
                      ...hiddenOnCompactScreens,
                      width: DESKTOP_COLUMN_WIDTHS.dataset_duo,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {dataset?.dataUseConditions?.duoDataUse?.length > 0 ? (
                      <Box>
                        {dataset.dataUseConditions.duoDataUse.map((duo) => (
                          <Box key={duo.id}>
                            <strong>{duo.id}</strong> ({duo.label})
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
