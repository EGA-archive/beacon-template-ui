import { Box, Typography } from "@mui/material";
import InfoTooltip from "./InfoTooltip";
import EntryTypeSelector from "../../search/EntryTypeSelector";
import {
  formatEntryLabel,
  singleEntryCustomLabels,
  entryTypeDescriptions,
} from "../../../components/common/textFormatting";

export default function ResultTypeSection({
  entryTypes,
  selectedPathSegment,
  setSelectedPathSegment,
  isSingleEntryType,
  onlyEntryPath,
  hasTwoColumns,
}) {
  return (
    <>
      <Box
        sx={{
          width: "240px",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          {/* Accounts for a title change when there is only one entry type */}
          <Typography
            sx={{
              fontWeight: 700,
              fontFamily: '"Open Sans", sans-serif',
              fontSize: entryTypes.length === 1 ? "16px" : "14px",
            }}
          >
            {isSingleEntryType
              ? `Result Type: ${
                  singleEntryCustomLabels[onlyEntryPath] ||
                  formatEntryLabel(onlyEntryPath)
                }`
              : "Result Type"}
          </Typography>
          <InfoTooltip testId="entrytypes-tooltip-trigger">
            <Box
              component="ul"
              data-testid="entrytypes-tooltip-content"
              sx={{
                listStyleType: "disc",
                pl: "20px",
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              {entryTypes.map((entry) => (
                <li key={entry.pathSegment}>
                  <b>{formatEntryLabel(entry.pathSegment)}</b>:{" "}
                  {entryTypeDescriptions[entry.pathSegment] ||
                    `No description for ${entry.pathSegment}`}
                </li>
              ))}
            </Box>
          </InfoTooltip>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "12px",
            }}
          >
            Which information do you want to get?
          </Typography>
        </Box>

        <Box
          sx={{
            width: "240px",
            flexShrink: 0,
          }}
        >
          <EntryTypeSelector
            entryTypes={entryTypes}
            selectedPathSegment={selectedPathSegment}
            setSelectedPathSegment={setSelectedPathSegment}
            hasTwoColumns={hasTwoColumns}
          />
        </Box>
      </Box>
    </>
  );
}
