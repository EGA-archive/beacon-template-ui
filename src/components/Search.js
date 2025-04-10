import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Button,
  CircularProgress,
} from "@mui/material";
import config from "../config/config.json";
import { darken, lighten } from "@mui/system";
import { InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function Search() {
  const [entryTypes, setEntryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [activeInput, setActiveInput] = useState("filter");

  useEffect(() => {
    const fetchEntryTypes = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/map`);
        const data = await res.json();

        const endpointSets = data.response.endpointSets || {};
        const entries = Object.entries(endpointSets).map(([key, value]) => {
          const rootUrl = value.rootUrl || "";
          const pathSegment = rootUrl.split("/").pop();

          return {
            id: key,
            pathSegment: pathSegment,
          };
        });

        setEntryTypes(entries);
        if (entries.length > 0) {
          setSelectedType(entries[0].id);
        }
      } catch (err) {
        console.error("Error fetching entry types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntryTypes();
  }, []);

  const formatEntryLabel = (segment) => {
    if (!segment) return "Unknown";

    if (segment === "g_variants") return "Genomic Variants";

    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const primaryColor = config.ui.colors.primary;
  const primaryDarkColor = config.ui.colors.darkPrimary;
  const selectedBgColor = lighten(primaryDarkColor, 0.9);

  const entryTypeDescriptions = {
    analyses: "Text for analysis",
    biosamples: "query biosample data (e.g. histological samples).",
    cohorts: "Text for cohort",
    datasets: "Text for dataset",
    g_variants: "query genomic variants across individuals.",
    individuals: "query individual-level data (e.g. phenotypes, ancestry).",
    runs: "Text for run",
  };

  return (
    <Box
      sx={{
        mazWidth: "1056px",
        borderRadius: "10px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 8px 11px 0px #9BA0AB24",
        pt: "24px",
        pr: "32px",
        pb: "24px",
        pl: "32px",
      }}
    >
      <Typography
        sx={{
          mb: 2,
          display: "inline-block",
          fontWeight: 700,
        }}
      >
        Search
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="body1">
          1. Choose the <b>result type</b> for your search.
        </Typography>
        <Tooltip
          title={
            <Box
              component="ul"
              sx={{
                m: 0,
                p: 0,
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
          }
          placement="top-start"
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "#FFFFFF",
                color: "#000000",
                border: "1px solid black",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                fontFamily: '"Open Sans", sans-serif',
                minWidth: "400px",
              },
            },
            arrow: {
              sx: {
                color: "#FFFFFF",
                "&::before": {
                  border: "1px solid black",
                },
              },
            },
          }}
        >
          <Box
            component="span"
            sx={{
              cursor: "pointer",
              display: "inline-block",
              width: "20px",
              height: "20px",
              ml: 3,
              mb: "4px",
              borderRadius: "30px",
              backgroundColor: config.ui.colors.primary,
              color: "white",
              textAlign: "center",
              fontSize: "14px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            i
          </Box>
        </Tooltip>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {entryTypes.map((entry) => (
            <Button
              key={entry.id}
              onClick={() => setSelectedType(entry.id)}
              variant="outlined"
              sx={{
                borderRadius: "999px",
                fontWeight: 600,
                textTransform: "none",
                fontFamily: '"Open Sans", sans-serif',
                backgroundColor:
                  selectedType === entry.id ? selectedBgColor : "#FFFFFF",
                color: selectedType === entry.id ? "black" : primaryColor,
                border: `1px solid ${
                  selectedType === entry.id ? "black" : primaryColor
                }`,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor:
                    selectedType === entry.id
                      ? selectedBgColor
                      : darken("#FFFFFF", 0.05),
                  boxShadow: "none",
                },
              }}
            >
              {formatEntryLabel(entry.pathSegment)}
            </Button>
          ))}
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 4 }}>
        <Typography variant="body1">
          2. Use the search bar on the left to add <b>Filtering terms</b> or the
          search bar on the right to add a <b>Genomic query:</b>
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        {/* Filtering Terms Input */}
        <Box
          onClick={() => setActiveInput("filter")}
          sx={{
            flex: activeInput === "filter" ? 1 : 0.3,
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${config.ui.colors.darkPrimary}`,
            borderRadius: "999px",
            px: 2,
            py: 1,
            cursor: "text",
            backgroundColor: "#fff",
            transition: "flex 0.3s ease",
          }}
        >
          <SearchIcon sx={{ color: config.ui.colors.darkPrimary, mr: 1 }} />
          <InputBase
            placeholder="Search by Filtering Terms"
            fullWidth
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
            }}
          />
        </Box>

        {/* Genomic Query Input */}
        <Box
          onClick={() => setActiveInput("genomic")}
          sx={{
            flex: activeInput === "genomic" ? 1 : 0.3,
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${config.ui.colors.darkPrimary}`,
            borderRadius: "999px",
            px: 2,
            py: 1,
            cursor: "text",
            backgroundColor: "#fff",
            transition: "flex 0.3s ease",
          }}
        >
          <SearchIcon sx={{ color: config.ui.colors.darkPrimary, mr: 1 }} />
          <InputBase
            placeholder="Genomic Query"
            fullWidth
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
