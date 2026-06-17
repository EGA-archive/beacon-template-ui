import { Box, Radio, FormControlLabel, RadioGroup } from "@mui/material";
import { formatEntryLabel } from "../common/textFormatting";
import config from "../../config/config.json";

export default function EntryTypeSelector({
  entryTypes,
  selectedPathSegment,
  setSelectedPathSegment,
}) {
  return (
    <Box
      data-testid="entrytype-selector"
      sx={{
        border: "1px solid black",
        borderRadius: "28px",
        px: "13px",
        py: "18px",
        maxWidth: "262px",
      }}
    >
      <RadioGroup
        value={selectedPathSegment}
        onChange={(event) => setSelectedPathSegment(event.target.value)}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: entryTypes.length > 4 ? "1fr 1fr" : "1fr",
            md: "1fr 1fr",
          },
          columnGap: 1,
          rowGap: 0,
        }}
      >
        {entryTypes.map((entry) => (
          <FormControlLabel
            key={entry.id}
            value={entry.pathSegment}
            data-testid={`entrytype-radio-${entry.pathSegment}`}
            control={
              <Radio
                sx={{
                  color: config.ui.colors.primary,
                  "&.Mui-checked": {
                    color: config.ui.colors.primary,
                  },
                }}
              />
            }
            label={
              <Box
                sx={{
                  fontWeight:
                    selectedPathSegment === entry.pathSegment ? 700 : 400,
                  fontSize: "14px",
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                }}
              >
                {formatEntryLabel(entry.pathSegment)}
              </Box>
            }
          />
        ))}
      </RadioGroup>
    </Box>
  );
}
