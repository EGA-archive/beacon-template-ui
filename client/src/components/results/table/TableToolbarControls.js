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
import { useEffect, useState } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import config from "../../../config/runtimeConfig";
import { ReactComponent as SelectColumn } from "../../../assets/logos/SelectColumn.svg";
import DownloadTablePopover from "../modal/DownloadTablePopover";

/**
 * Shared controls used by tables.
 *
 * It provides:
 * - column selection;
 * - keyword search;
 * - CSV download.
 *
 * The table using this component remains responsible for:
 * - providing its columns;
 * - providing its rows/export logic;
 * - deciding how the selected columns affect the table.
 */
export default function TableToolbarControls({
  columns,
  visibleColumns,
  setVisibleColumns,
  searchTerm,
  setSearchTerm,
  handleExport,
}) {
  const colors = config.ui.colors;

  /**
   * Number of columns shown automatically when the table first opens.
   * Larger screens can display more columns.
   */
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

  const isDownloadEnabled = config.ui?.download?.enabled ?? true;

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /**
   * Automatically select a reasonable number of columns
   * when the table first opens.
   */
  useEffect(() => {
    if (isInitialLoad && columns.length > 0) {
      const defaultColumns = columns
        .slice(0, defaultColumnLimit)
        .map((column) => column.id);

      setVisibleColumns(defaultColumns);
    }
  }, [isInitialLoad, columns, defaultColumnLimit, setVisibleColumns]);

  const allColumnsSelected = visibleColumns.length === columns.length;

  const noColumnsSelected = visibleColumns.length === 0;

  const shouldPulse = visibleColumns.length < columns.length;

  const getColumnButtonStyle = (isDisabled) => ({
    borderRadius: "27px",
    height: "30px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "none",
    background: isDisabled ? "none" : "white",
    border: isDisabled ? "1px solid grey" : `1px solid ${colors.darkPrimary}`,
    cursor: isDisabled ? "not-allowed" : "pointer",
    color: isDisabled ? "grey" : colors.darkPrimary,

    "&:hover": {
      background: isDisabled ? "none" : "#1976D214",
    },
  });

  const handleSelectAllColumns = (event) => {
    event.stopPropagation();

    setIsInitialLoad(false);
    setVisibleColumns(columns.map((column) => column.id));
  };

  const handleUnselectAllColumns = (event) => {
    event.stopPropagation();

    setIsInitialLoad(false);
    setVisibleColumns([]);
  };

  const handleColumnSelectionChange = (event) => {
    const clickedColumns = event.target.value;

    setIsInitialLoad(false);

    setVisibleColumns((previousVisibleColumns) => {
      const addedColumn = clickedColumns.find(
        (column) => !previousVisibleColumns.includes(column)
      );

      const remainingColumns = previousVisibleColumns.filter((column) =>
        clickedColumns.includes(column)
      );

      return addedColumn
        ? [...remainingColumns, addedColumn]
        : remainingColumns;
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: {
          xs: "center",
          sm: "flex-end",
        },
        width: {
          xs: "100%",
          sm: "auto",
        },
        alignItems: "center",
        gap: {
          xs: 1,
          sm: 1,
          md: 2,
          lg: 3,
        },

        flexWrap: "wrap",
      }}
    >
      {/* Column selector */}
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
              <SelectColumn
                sx={{
                  color: colors.darkPrimary,
                }}
              />

              <Box
                component="span"
                sx={{
                  color: colors.darkPrimary,
                  fontSize: {
                    lg: "12px",
                    sm: "11px",
                    xs: "11px",
                  },
                }}
              >
                Select columns
              </Box>
            </Box>
          )}
          sx={{
            borderRadius: "24px",
            height: "40px",
            animation: shouldPulse ? "pulseBorder 3s ease-in-out 8" : "none",
            "@keyframes pulseBorder": {
              "0%": {
                boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.28)",
              },
              "50%": {
                boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.18)",
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
              gap: 1,
              py: 0.5,
              width: {
                xs: "120px",
                sm: "130px",
                md: "140px",
                lg: "200px",
              },

              height: "40px",
            },
          }}
          IconComponent={KeyboardArrowDownRoundedIcon}
        >
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

          {columns.map((column) => (
            <MenuItem key={column.id} value={column.id}>
              <Checkbox
                size="small"
                checked={visibleColumns.includes(column.id)}
                sx={{
                  color: colors.darkPrimary,

                  "&.Mui-checked": {
                    color: colors.primary,
                  },
                }}
              />

              <ListItemText
                primary={column.name}
                primaryTypographyProps={{
                  sx: {
                    fontSize: "13px",
                    color: colors.darkPrimary,
                  },
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Keyword search */}
      <TextField
        size="small"
        placeholder="Search keywords"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        sx={{
          width: {
            xs: "160px",
            sm: "160px",
            md: "160px",
            lg: "237px",
          },

          "& .MuiOutlinedInput-root": {
            borderRadius: "24px",
            height: "40px",

            "& fieldset": {
              borderColor: colors.darkPrimary,
            },

            "&:hover fieldset": {
              borderColor: colors.primary,
            },

            "& input::placeholder": {
              color: colors.darkPrimary,
              opacity: 1,
              fontSize: "12px",
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon
                sx={{
                  color: colors.darkPrimary,
                }}
              />
            </InputAdornment>
          ),
        }}
      />

      {/* CSV download */}
      {isDownloadEnabled && (
        <DownloadTablePopover handleExport={handleExport} />
      )}
    </Box>
  );
}
