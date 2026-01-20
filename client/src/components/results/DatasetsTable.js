import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Tooltip,
} from "@mui/material";
import { lighten } from "@mui/system";
import config from "../../config/config.json";
import { DATASETS_TABLE } from "../../lib/constants";
import { useSelectedEntry } from "../context/SelectedEntryContext";

export default function DatasetsTable() {
  const { rawItems } = useSelectedEntry();
  const [expandedRows, setExpandedRows] = useState({});

  const headerCellStyle = {
    backgroundColor: config.ui.colors.darkPrimary,
    fontWeight: 700,
    color: "white",
    transition: "background-color 0.3s ease",
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
        <Table stickyHeader aria-label="Datasets results table">
          <TableHead>
            <TableRow>
              {DATASETS_TABLE.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ ...headerCellStyle, width: column.width }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rawItems?.map((dataset, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:hover": {
                    backgroundColor: lighten(config.ui.colors.darkPrimary, 0.9),
                  },
                  "& td": {
                    borderBottom: "1px solid rgba(224,224,224,1)",
                    py: 1.5,
                    verticalAlign: "top",
                  },
                }}
              >
                <TableCell
                  sx={{
                    minWidth: "110px",
                    whiteSpace: "wrap",
                    wordBreak: "break-all",
                    overflowWrap: "break-word",
                  }}
                >
                  <strong>{dataset.id || "-"}</strong>
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: "150px",
                    whiteSpace: "wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {dataset.name || "-"}
                </TableCell>
                <TableCell
                  sx={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {dataset.description ? (
                    <>
                      {expandedRows[index] ? (
                        dataset.description
                      ) : (
                        <>
                          {dataset.description.slice(0, 200)}
                          {dataset.description.length > 200 && "..."}
                        </>
                      )}

                      {dataset.description.length > 200 && (
                        <Box
                          component="button"
                          onClick={() =>
                            setExpandedRows((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                          sx={{
                            display: "inline",
                            ml: 0.5,
                            background: "none",
                            color: config.ui.colors.primary,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontStyle: "italic",
                          }}
                        >
                          {expandedRows[index] ? "Read less" : "Read more"}
                        </Box>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell
                  sx={{
                    minWidth: "100px",
                    whiteSpace: "wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {dataset.externalUrl ? (
                    <Link
                      href={dataset.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: config.ui.colors.darkPrimary,
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {dataset.externalUrl}
                    </Link>
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    verticalAlign: "top",
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
