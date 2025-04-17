import { useEffect, useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import config from "../config/config.json";
import SearchIcon from "@mui/icons-material/Search";
import { alpha } from "@mui/material/styles";
import FilteringTermsTable from "./FilteringTermsTable";

export default function AllFilteringTermsTable() {
  const [filteringTerms, setFilteringTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const primaryDarkColor = config.ui.colors.darkPrimary;
  const primaryColor = config.ui.colors.primary;

  const unselectedBorderColor = alpha(primaryColor, 0.15);

  useEffect(() => {
    const fetchFilteringTerms = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/filtering_terms`);
        const data = await res.json();
        setFilteringTerms(data);
      } catch (err) {
        console.error("Failed to fetch filtering terms", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteringTerms();
  }, []);

  return (
    <Box
      sx={{
        mt: "-20px",
        width: "100%",
        height: "auto",
        gap: "16px",
        borderRadius: "10px",
        px: "32px",
        pt: "24px",
        pb: "48px",
        backgroundColor: "white",
        boxShadow: "0px 8px 11px 0px #9BA0AB24",
      }}
    >
      <Typography
        sx={{
          color: "black",
          fontWeight: 700,
          fontSize: "16px",
        }}
      >
        Filtering Terms
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <TextField
          placeholder="Search Filtering Terms"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: primaryDarkColor, mr: 1 }} />
            ),
          }}
          sx={{
            cursor: "text",
            mb: 3,
            mt: 1,
            width: "100%",
            maxWidth: 400,
            borderRadius: "999px",
            "& .MuiOutlinedInput-root": {
              height: "40px",
              borderRadius: "999px",
              backgroundColor: "white",
              border: `1px solid ${unselectedBorderColor}`,
              "&:hover": {
                border: `1px solid ${primaryDarkColor}`,
              },
              "&.Mui-focused": {
                border: `1px solid ${primaryDarkColor}`,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& input::placeholder": {
              fontSize: "14px",
            },
          }}
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          mb: 3,
          mt: 1,
          width: "100%",
        }}
      >
        <FilteringTermsTable filteringTerms={filteringTerms} />
      </Box>
    </Box>
  );
}
