import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Tooltip,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Rating from "@mui/material/Rating";
import config from "../config/config.json";

const FONT = '"Open Sans", sans-serif';
const TEXT_SIZE = "13px";
const TITLE_SIZE = "14px";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle");

  // open after short delay
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // auto close after success
  useEffect(() => {
    if (status === "sent") {
      const t = setTimeout(() => setOpen(false), 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const sendFeedback = async () => {
    if (status === "sending") return;

    setStatus("sending");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) throw new Error();

      setStatus("sent");
      setRating(null);
      setComment("");
    } catch {
      setStatus("error");
    }
  };

  if (!open) {
    return (
      <IconButton
        onClick={() => {
          setOpen(true);
          setStatus("idle");
        }}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          bgcolor: config.ui.colors.primary,
          color: "#fff",
          "&:hover": { bgcolor: config.ui.colors.darkPrimary },
          zIndex: 1300,
        }}
      >
        <ChatBubbleOutlineIcon />
      </IconButton>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 320,
        p: 2,
        zIndex: 1300,
        fontFamily: FONT,
        "& *": { fontFamily: FONT },
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Typography sx={{ fontSize: TITLE_SIZE, fontWeight: 600 }}>
            Feedback
          </Typography>

          <Tooltip
            title={
              <Box
                sx={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontSize: "12px",
                  lineHeight: 1.4,
                }}
              >
                Beacon Template UI is a work in progress.
                <br />
                Share what you liked or what could be improved. <br />
                You can submit anonymously, or include your name and email if
                you'd like to stay in touch.
              </Box>
            }
            placement="top"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "1px solid black",
                  minWidth: "120px",
                },
              },
              arrow: {
                sx: {
                  color: "#fff",
                  "&::before": { border: "1px solid black" },
                },
              },
            }}
          >
            <Box
              component="span"
              sx={{
                cursor: "pointer",
                ml: 1,
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "grey",
                color: "white",
                textAlign: "center",
                fontSize: "12px",
                lineHeight: "18px",
                fontWeight: 600,
              }}
            >
              i
            </Box>
          </Tooltip>
        </Box>

        <IconButton size="small" onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box mt={1}>
        <Typography sx={{ fontSize: TEXT_SIZE }}>
          How was your experience?
        </Typography>

        <Rating
          value={rating}
          onChange={(e, newValue) => setRating(newValue)}
          sx={{ color: config.ui.colors.primary }}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={3}
        size="small"
        placeholder="Tell us your feedback"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{
          mt: 1,
          "& .MuiInputBase-input": {
            fontFamily: FONT,
            fontSize: TEXT_SIZE,
            lineHeight: 1.4,
          },
        }}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={status === "sending" || (!rating && !comment.trim())}
        onClick={sendFeedback}
        sx={{
          mt: 1,
          fontSize: TEXT_SIZE,
          textTransform: "none",
          bgcolor: config.ui.colors.primary,
          "&:hover": { bgcolor: config.ui.colors.darkPrimary },
        }}
      >
        Send
      </Button>

      {status === "sending" && (
        <Typography sx={{ fontSize: "12px", mt: 1 }}>Sending...</Typography>
      )}

      {status === "sent" && (
        <Typography sx={{ fontSize: "12px", mt: 1, color: "success.main" }}>
          Feedback sent ✓
        </Typography>
      )}

      {status === "error" && (
        <Typography sx={{ fontSize: "12px", mt: 1, color: "error.main" }}>
          Could not send feedback
        </Typography>
      )}
    </Paper>
  );
}
