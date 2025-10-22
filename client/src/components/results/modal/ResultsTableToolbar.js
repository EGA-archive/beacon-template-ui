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
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadForOfflineRoundedIcon from "@mui/icons-material/DownloadForOfflineRounded";
import ViewWeekRoundedIcon from "@mui/icons-material/ViewWeekRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import config from "../../../config/config.json";

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
  handleExport,
  sortedHeaders,
}) {
  const colors = config.ui.colors;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mb: 2,
        gap: 3,
      }}
    >
      {/* Export CSV Button */}
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
        startIcon={
          <DownloadForOfflineRoundedIcon
            sx={{
              color: colors.darkPrimary,
            }}
          />
        }
        onClick={handleExport}
      />

      {/* Column Selector */}
      <FormControl size="small">
        <Select
          multiple
          displayEmpty
          value={visibleColumns}
          onChange={(e) => setVisibleColumns(e.target.value)}
          renderValue={() => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ViewWeekRoundedIcon sx={{ color: colors.darkPrimary }} />
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
              width: "200px",
              height: "32px",
            },
          }}
          IconComponent={KeyboardArrowDownRoundedIcon}
        >
          {sortedHeaders.map((col) => (
            <MenuItem key={col.id} value={col.id}>
              <Checkbox
                size="small"
                checked={visibleColumns.indexOf(col.id) > -1}
                sx={{
                  color: colors.darkPrimary,
                  "&.Mui-checked": {
                    color: colors.primary,
                  },
                }}
              />
              <ListItemText
                primary={col.name}
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

      {/* Search Bar */}
      <TextField
        size="small"
        placeholder="Search keywords"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          width: "237px",
          height: "39px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "24px",
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
    </Box>
  );
}
