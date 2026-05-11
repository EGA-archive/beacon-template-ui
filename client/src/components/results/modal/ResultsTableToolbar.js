import {
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  InputAdornment,
} from "@mui/material";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useState, useEffect } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import config from "../../../config/config.json";
import { useSelectedEntry } from "../../../components/context/SelectedEntryContext";
import { ReactComponent as SelectColumn } from "../../../assets/logos/SelectColumn.svg";

/**
 * Toolbar for the Results Table, it contains:
 * 1. Export CSV button
 * 2. Column visibility selector
 * 3. Keyword search input
 */
export default function ResultsTableToolbar({
  visibleColumns,
  setVisibleColumns,
  searchTerm,
  setSearchTerm,
  sortedHeaders,
  count,
  handleExport,
}) {
  const { responseMeta } = useSelectedEntry();
  const colors = config.ui.colors;

  const limit = responseMeta?.receivedRequestSummary?.pagination?.limit;

  const DEFAULT_VISIBLE_COLUMNS = {
    lg: 8,
    md: 5,
    sm: 4,
    xs: 3,
  };

  const isLargeScreen = useMediaQuery("(min-width:1200px)");
  const isMediumScreen = useMediaQuery("(min-width:900px)");
  const isSmallScreen = useMediaQuery("(min-width:600px)");

  const defaultColumnLimit = isLargeScreen
    ? DEFAULT_VISIBLE_COLUMNS.lg
    : isMediumScreen
    ? DEFAULT_VISIBLE_COLUMNS.md
    : isSmallScreen
    ? DEFAULT_VISIBLE_COLUMNS.sm
    : DEFAULT_VISIBLE_COLUMNS.xs;

  const getColumnButtonStyle = (isActive) => ({
    borderRadius: "27px",
    height: "30px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "none",
    background: isActive ? "none" : "white",
    border: isActive ? `1px solid grey` : `1px solid ${colors.darkPrimary}`,
    cursor: isActive ? "not-allowed" : "pointer",
    color: isActive ? "grey" : colors.darkPrimary,

    "&:hover": {
      background: isActive ? "none" : "#1976D214",
    },
  });

  const allColumnsSelected = visibleColumns.length === sortedHeaders.length;

  const noColumnsSelected = visibleColumns.length === 0;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad && sortedHeaders.length > 0) {
      const defaultColumns = sortedHeaders
        .slice(0, defaultColumnLimit)
        .map((col) => col.id);

      setVisibleColumns(defaultColumns);
    }
  }, [isInitialLoad, sortedHeaders, defaultColumnLimit, setVisibleColumns]);

  const handleSelectAllColumns = (event) => {
    event.stopPropagation();
    setIsInitialLoad(false);
    setVisibleColumns(sortedHeaders.map((col) => col.id));
  };

  const handleUnselectAllColumns = (event) => {
    event.stopPropagation();
    setIsInitialLoad(false);
    setVisibleColumns([]);
  };

  const handleColumnSelectionChange = (event) => {
    const clickedColumns = event.target.value;
    setIsInitialLoad(false);
    setVisibleColumns((prevVisibleColumns) => {
      const addedColumn = clickedColumns.find(
        (col) => !prevVisibleColumns.includes(col)
      );

      const removedColumns = prevVisibleColumns.filter((col) =>
        clickedColumns.includes(col)
      );

      const newVisibleColumns = addedColumn
        ? [...removedColumns, addedColumn]
        : removedColumns;

      return newVisibleColumns;
    });
  };

  const shouldPulse = visibleColumns.length < sortedHeaders.length;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        my: 2,
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "center" },
        gap: { xs: 2, md: 0 },
      }}
    >
      <Box
        sx={{
          color: colors.darkPrimary,
          fontSize: "14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mt: "auto",
          gap: "2px",
        }}
      >
        <Box>
          <b>Total Results:</b>{" "}
          {count
            ? new Intl.NumberFormat(navigator.language).format(count)
            : "—"}
        </Box>

        {count > limit && (
          <Box>Details returned for the first {limit} records</Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: {
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
          },
        }}
      >
        <FormControl size="small">
          <Select
            multiple
            displayEmpty
            value={visibleColumns}
            onChange={handleColumnSelectionChange}
            renderValue={() => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SelectColumn sx={{ color: colors.darkPrimary }} />
                <span
                  style={{
                    color: colors.darkPrimary,
                    opacity: 1,
                    fontSize: "12px",
                  }}
                >
                  Select column
                </span>
              </Box>
            )}
            sx={{
              borderRadius: "24px",
              height: "40px",
              animation: shouldPulse ? "pulseBorder 2s ease-in-out 3" : "none",

              "@keyframes pulseBorder": {
                "0%": {
                  boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.18)",
                },
                "50%": {
                  boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.08)",
                },
                "100%": {
                  boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)",
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.darkPrimary,
              },

              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.primary,
              },

              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                py: 0.5,
                width: {
                  xs: "120px",
                  sm: "150px",
                  md: "150px",
                  lg: "200px",
                },
                height: "40px",
              },
            }}
            IconComponent={KeyboardArrowDownRoundedIcon}
          >
            {/* <MenuItem
              sx={{
                backgroundColor: "lightgrey",
                "&:hover": {
                  backgroundColor: "lightgrey",
                },
              }}
            >
              Here we need to add the buttons: Select All and Unselect All
            </MenuItem> */}

            <MenuItem
              disableRipple
              sx={{
                backgroundColor: "#ECECEC",
                "&:hover": {
                  backgroundColor: "#ECECEC",
                },
                cursor: "default",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  width: "100%",
                  justifyContent: "center",
                  py: 0.5,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleSelectAllColumns}
                  sx={getColumnButtonStyle(
                    isInitialLoad ? false : allColumnsSelected
                  )}
                >
                  Select All
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleUnselectAllColumns}
                  sx={getColumnButtonStyle(
                    isInitialLoad ? false : noColumnsSelected
                  )}
                >
                  Unselect All
                </Button>
              </Box>
            </MenuItem>

            {sortedHeaders.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                <Checkbox
                  size="small"
                  checked={visibleColumns.indexOf(col.id) > -1}
                  sx={{
                    color: colors.darkPrimary,
                    "&.Mui-checked": { color: colors.primary },
                  }}
                />
                <ListItemText
                  primary={col.name}
                  primaryTypographyProps={{
                    sx: { fontSize: "13px", color: colors.darkPrimary },
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="Search keywords"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: {
              xs: "160px",
              sm: "170px",
              md: "170px",
              lg: "237px",
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "24px",
              height: "40px",
              "& fieldset": { borderColor: colors.darkPrimary },
              "&:hover fieldset": { borderColor: colors.primary },
              "& input::placeholder": {
                color: colors.darkPrimary,
                opacity: 1,
                fontSize: "12px",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" size="small">
                <SearchRoundedIcon sx={{ color: colors.darkPrimary }} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="outlined"
          size="large"
          sx={{
            px: 2,
            borderColor: colors.darkPrimary,
            borderRadius: "24px",
            "& .MuiButton-startIcon": {
              marginLeft: 0,
              marginRight: 0,
            },
          }}
          // onClick={() => console.log("Download clicked")}
          onClick={handleExport}
          startIcon={<DownloadRoundedIcon sx={{ color: colors.darkPrimary }} />}
        />
      </Box>
    </Box>
  );
}
