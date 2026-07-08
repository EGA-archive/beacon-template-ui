import {
  Box,
  Radio,
  FormControlLabel,
  RadioGroup,
  CircularProgress,
} from "@mui/material";
import { formatEntryLabel } from "../common/textFormatting";
import config from "../../config/config.json";

// This component shows the available entry types (previously fetched from the API) as radio buttons.
// The user can select only one entry type at a time and the first one will be always pre-selected.
export default function EntryTypeSelector({
  entryTypes,
  selectedPathSegment,
  setSelectedPathSegment,
  hasTwoColumns,
  loading,
}) {
  return (
    // Outer container that holds all the radio button options.
    <Box
      data-testid="entrytype-selector"
      sx={{
        border: "1px solid black",
        borderRadius: "28px",
        // Internal space between the border and the radio options.
        p: "10px",
        // Use a wider container when the options are displayed in two columns.
        maxWidth: hasTwoColumns ? "260px" : "207px",
        // Fixed height keeps the selector aligned with the search input section.
        height: "197px",
        // Includes padding and border inside the declared width and height.
        boxSizing: "border-box",
      }}
    >
      {loading ? (
        // Show the spinner only inside the entry-type selector.
        <Box
          data-testid="entrytypes-loader"
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            size={32}
            sx={{
              color: config.ui.colors.primary,
            }}
          />
        </Box>
      ) : (
        <RadioGroup
          // The currently selected entry type.
          value={selectedPathSegment}
          // Update the selected entry type when the user clicks a radio button.
          onChange={(event) => setSelectedPathSegment(event.target.value)}
          sx={{
            // CSS Grid allows us to control rows and columns.
            display: "grid",

            // Use all the available space inside the outer container.
            width: "100%",
            height: "100%",

            // With two columns, fill the first column before moving to the second.
            // With one column, place the options from top to bottom.
            gridAutoFlow: hasTwoColumns ? "column" : "row",

            // In two-column mode, each column can contain up to four options.
            // In one-column mode, create one equal row for every entry type.
            gridTemplateRows: hasTwoColumns
              ? "repeat(4, 1fr)"
              : `repeat(${entryTypes.length}, 1fr)`,

            // Create either two equal columns or one full-width column.
            gridTemplateColumns: hasTwoColumns
              ? "repeat(2, minmax(0, 1fr))"
              : "1fr",

            // Space between the two columns.
            columnGap: 2,

            // Vertically center each option inside its grid row.
            alignItems: "center",

            // Make each option use all the available width of its grid cell.
            justifyItems: "stretch",
          }}
        >
          {/* Create one radio option for every available entry type. */}
          {entryTypes.map((entry) => (
            <FormControlLabel
              // React uses this unique value to track each option.
              key={entry.id}
              // This is the value saved when the radio option is selected.
              value={entry.pathSegment}
              data-testid={`entrytype-radio-${entry.pathSegment}`}
              sx={{
                // Make each radio option fill its grid cell.
                width: "100%",

                // Prevent long labels from forcing the column to become wider.
                minWidth: 0,

                // Remove the default Material UI margins.
                m: 0,

                // Allow the text label to use the remaining horizontal space.
                "& .MuiFormControlLabel-label": {
                  flex: 1,
                  minWidth: 0,
                },
              }}
              control={
                <Radio
                  sx={{
                    // Use the configured primary color for the radio button.
                    color: config.ui.colors.primary,

                    // Control the clickable space around the radio icon.
                    p: "7px",

                    // Keep the same primary color when the radio is selected.
                    "&.Mui-checked": {
                      color: config.ui.colors.primary,
                    },

                    // Make the radio icon slightly smaller.
                    "& .MuiSvgIcon-root": {
                      fontSize: "19px",
                    },
                  }}
                />
              }
              label={
                <Box
                  sx={{
                    // Let the label use the full width available.
                    width: "100%",

                    // Make the selected entry type bold.
                    fontWeight:
                      selectedPathSegment === entry.pathSegment ? 700 : 400,

                    fontSize: "14px",

                    // Allow long labels to move onto a second line.
                    whiteSpace: "normal",

                    // Keep multi-line labels compact and readable.
                    lineHeight: 1.2,
                  }}
                >
                  {/* Convert technical entry type names into readable labels. */}
                  {formatEntryLabel(entry.pathSegment)}
                </Box>
              }
            />
          ))}
        </RadioGroup>
      )}
    </Box>
  );
}
