import { Box,Typography } from "@mui/material";

export default function ResultsEmpty() {
  return (
    <Box
      sx={{
        height: '100%',
        minBlockSize: '400px',
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Typography sx={{
        color: "black",
        fontWeight: 700,
        fontSize: "16px",
      }}>
        We have don't have results
      </Typography>
    </Box>
  )
}