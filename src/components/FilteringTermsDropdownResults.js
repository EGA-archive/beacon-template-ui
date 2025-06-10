import React, { useEffect, useRef, useState } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
} from "@mui/material";
import Fuse from "fuse.js";
import config from "../config/config.json";

const FilteringTermsDropdownResults = ({ searchInput, onCloseDropdown }) => {
  const [allTerms, setAllTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onCloseDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const primaryDarkColor = config.ui.colors.darkPrimary;

  console.log("👀 Component Rendered. searchInput:", searchInput);

  useEffect(() => {
    const fetchFilteringTerms = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config.apiUrl}/filtering_terms`);
        const data = await response.json();
        console.log("✅ API Response:", data);
        setAllTerms(data.response?.filteringTerms || []);
      } catch (err) {
        console.error("Error fetching terms:", err);
      } finally {
        setLoading(false);
      }
    };

    if (searchInput.length > 0 && allTerms.length === 0) {
      fetchFilteringTerms();
    }
  }, [searchInput, allTerms.length]);

  useEffect(() => {
    if (searchInput.length > 0 && allTerms.length > 0) {
      const fuse = new Fuse(allTerms, {
        keys: ["label", "id"],
        threshold: 0.3,
      });
      const results = fuse.search(searchInput).map((r) => r.item);
      console.log("🧠 Filtered Results:", results);
      setFilteredTerms(results);
    } else {
      setFilteredTerms([]);
    }
  }, [searchInput, allTerms]);

  if (searchInput.length === 0) return null;

  return (
    <Box
      fullWidth
      ref={containerRef}
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        zIndex: 5,
      }}
    >
      {loading ? (
        <Box sx={{ p: 1 }}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        filteredTerms.length > 0 && (
          <Paper
            sx={{
              maxHeight: 200,
              overflowY: "auto",
              mt: 1,
              borderRadius: "21px",
              backgroundColor: "white",
              boxShadow: "none",
              border: `1px solid ${primaryDarkColor}`,
            }}
          >
            <List disablePadding>
              {filteredTerms.map((term, index) => (
                <ListItem
                  key={term.id}
                  button
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom:
                      index !== filteredTerms.length - 1
                        ? "1px solid #E0E0E0"
                        : "none",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: "12px",
                      fontFamily: '"Open Sans", sans-serif',
                      color: "#000",
                    }}
                  >
                    {term.label}
                  </Box>
                  <Box
                    sx={{
                      fontSize: "12px",
                      fontFamily: '"Open Sans", sans-serif',
                      color: "#666",
                    }}
                  >
                    {term.id}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )
      )}
    </Box>
  );
};

export default FilteringTermsDropdownResults;
