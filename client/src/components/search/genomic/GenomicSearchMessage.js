import { Box } from "@mui/material";
import CommonMessage, { COMMON_MESSAGES } from "../../common/CommonMessage";

export default function GenomicSearchMessage({
  message,
  hasGenomicBuilderQueries,
  genomicBuilderWarningList,
  onOpenBuilder,
}) {
  if (!message) return null;

  if (message !== COMMON_MESSAGES.invalidGenomicQuery) {
    return (
      <Box sx={{ mt: 2 }}>
        <CommonMessage text={message} type="error" />
      </Box>
    );
  }
  return (
    <Box sx={{ mt: 2 }}>
      <CommonMessage
        type="warning"
        text={
          <>
            The entered value is not a valid <b>Sequence Query</b>.
            {hasGenomicBuilderQueries && (
              <>
                <br />
                You can also use the{" "}
                <span
                  onClick={onOpenBuilder}
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Genomic Query Builder
                </span>{" "}
                for {genomicBuilderWarningList} queries.
              </>
            )}
          </>
        }
      />
    </Box>
  );
}
