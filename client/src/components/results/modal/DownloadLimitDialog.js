import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function DownloadLimitDialog({
  open,
  totalResults,
  downloadLimit,
  onClose,
}) {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
      }}
    >
      <DialogContent
        sx={{
          borderRadius: "10px",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
          }}
        >
          This query contains <b>{totalResults?.toLocaleString()}</b> records.
        </Typography>

        <Typography sx={{ fontSize: "14px" }}>
          Only the first <b>{downloadLimit?.toLocaleString()}</b> records will
          be downloaded.
        </Typography>

        <Typography sx={{ fontStyle: "italic", fontSize: "14px" }}>
          The download is already in progress.
        </Typography>
        <DialogActions sx={{ mt: 2 }}>
          <Button onClick={onClose} variant="contained">
            OK
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
