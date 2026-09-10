import React from "react";
import { Box, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import InfoIcon from "@mui/icons-material/Info";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

import config from "../../../config/runtimeConfig";
import ResultsTableRow from "../ResultsTableRow";
import ResultsContactButton from "./ResultsContactButton";
import { getBeaconAggregationInfo } from "../utils/beaconType";
import {
  DATA_VISIBILITY_LABELS,
  findBeaconEmail,
  findBeaconName,
  getBeaconError,
  getBeaconStatusLabel,
} from "../utils/resultsTableUtils";

/**
 * Renders the top-level rows returned by a Network Beacon.
 *
 * Each Beacon row shows its metadata and aggregated result information.
 * Dataset rows are rendered underneath when the Beacon is expanded.
 */
export default function NetworkBeaconResultsRows({
  resultData,
  beaconsInfo,
  envMap,
  expandedRows,
  onToggleRow,
  onOpenDetails,
  getResponsiveColumnWidthById,
  getColumnWidth,
  hiddenOnTabletStyle,
}) {
  const numberFormatter = new Intl.NumberFormat(navigator.language);

  return (
    <>
      {resultData.map((item, index) => {
        const beaconId = item.beaconId || item.id;
        const hasDatasets = item.items?.length > 0;

        const itemEmail = findBeaconEmail(
          beaconsInfo,
          item.beaconId,
          config.beaconType
        );

        const beaconName = findBeaconName(beaconsInfo, item.beaconId);

        const { type: beaconType, datasetCount } =
          getBeaconAggregationInfo(item);

        const dataVisibility = DATA_VISIBILITY_LABELS[beaconType] || "-";

        const datasetCountValue =
          beaconType === "record" &&
          datasetCount !== undefined &&
          datasetCount !== null
            ? datasetCount
            : "-";

        const searchResultValue =
          beaconType === "count"
            ? numberFormatter.format(item.totalResultsCount)
            : beaconType === "record"
            ? item.totalResultsCount > 0
              ? numberFormatter.format(item.totalResultsCount)
              : "-"
            : null;

        return (
          <React.Fragment key={`network-${beaconId || index}`}>
            <TableRow
              onClick={() => {
                if (hasDatasets) {
                  onToggleRow(item);
                }
              }}
              sx={{
                fontWeight: "bold",
                cursor: hasDatasets ? "pointer" : "default",

                "&:hover": {
                  backgroundColor: alpha(config.ui.colors.secondary, 0.4),
                },

                "&.MuiTableRow-root": {
                  transition: "background-color 0.2s ease",
                },

                "& td": {
                  borderBottom: "1px solid rgba(224, 224, 224, 1)",
                  py: 1.5,
                },
              }}
            >
              {/* Beacon name, falling back to Beacon ID */}
              <TableCell
                data-cy="results-table-cell-id"
                sx={{
                  fontWeight: "bold",
                  width: getResponsiveColumnWidthById("beacon_dataset"),
                }}
              >
                <Box
                  display="flex"
                  justifyContent="flex-start"
                  alignItems="center"
                  gap={1}
                >
                  <Box
                    sx={{
                      width: "24px",
                      minWidth: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      "@media (max-width: 764px)": {
                        width: "18px",
                        minWidth: "18px",

                        "& .MuiSvgIcon-root": {
                          fontSize: "18px",
                        },
                      },
                    }}
                  >
                    {hasDatasets &&
                      beaconId &&
                      (expandedRows[beaconId] ? (
                        <KeyboardArrowDownIcon data-cy="results-row-collapse-icon" />
                      ) : (
                        <KeyboardArrowRightRoundedIcon data-cy="results-row-expand-icon" />
                      ))}
                  </Box>

                  <span data-cy="results-table-id-value">
                    {beaconName || beaconId || "Unavailable"}
                  </span>
                </Box>
              </TableCell>

              {/* Beacon Maturity */}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  ...hiddenOnTabletStyle,
                }}
                style={{
                  width: getColumnWidth("maturity"),
                }}
              >
                {getBeaconStatusLabel(envMap[item.beaconId] || item.maturity)}
              </TableCell>

              {/* Data Visibility */}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  ...hiddenOnTabletStyle,
                }}
                style={{
                  width: getColumnWidth("data_visibility"),
                }}
              >
                <Box component="strong">{dataVisibility}</Box>
              </TableCell>

              {/* Number of Datasets */}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  width: getResponsiveColumnWidthById("datasets_count"),
                }}
              >
                {datasetCountValue}
              </TableCell>

              {/* Search Results */}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  width: getResponsiveColumnWidthById("response"),
                }}
              >
                {beaconType === "boolean" &&
                  (item.exists ? (
                    "Yes"
                  ) : (
                    <Tooltip
                      title={
                        getBeaconError(item.info) ||
                        "Beacon returned a negative response under HIT mode"
                      }
                    >
                      <ReportProblemIcon sx={{ color: "#FF8A8A" }} />
                    </Tooltip>
                  ))}

                {searchResultValue}

                {item.description && (
                  <Tooltip title={item.description || item.name}>
                    <IconButton>
                      <InfoIcon
                        sx={{
                          color: config.ui.colors.primary,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>

              {/* Contact */}
              <TableCell
                sx={{
                  width: getResponsiveColumnWidthById("contact"),
                }}
              >
                <ResultsContactButton email={itemEmail} compact />
              </TableCell>
            </TableRow>

            {/* Dataset rows belonging to this Beacon */}
            {expandedRows[beaconId] && (
              <ResultsTableRow
                beaconName={beaconName}
                item={item}
                handleOpenModal={onOpenDetails}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
