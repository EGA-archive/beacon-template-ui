import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatAlleleFrequency } from "../../utils/alleleFrequencyUtils";
import config from "../../../../config/config.json";

const primaryDarkColor = config.ui.colors.darkPrimary;

const WIDTH_PER_POPULATION = 38;
const MINIMUM_CHART_WIDTH = 420;

/**
 * Calculates how much horizontal space the chart needs.
 *
 * Small charts keep a minimum width.
 * Larger charts grow based on the number of populations.
 */
export const getAlleleFrequencyChartWidth = (populationCount) =>
  Math.max(populationCount * WIDTH_PER_POPULATION, MINIMUM_CHART_WIDTH);

/**
 * Displays the allele frequency for each population as a bar chart.
 *
 * The component receives the same normalized rows used by the table.
 *
 * When the user hovers over a bar, the matching table row is highlighted.
 * When the user hovers over a table row, the matching chart area is highlighted.
 */
export default function AlleleFrequencyChart({
  rows = [],
  highlightedRowId = null,
  onHighlightRow,
  hasManyPopulations = false,
}) {
  const theme = useTheme();

  const hoverBackgroundColor = theme.palette.action.hover;

  console.log("rows", rows);

  /**
   * Draws the normal MUI hover color behind the selected population.
   * The bar itself keeps its normal color and border.
   */
  const renderHighlightedBackground = ({ x, y, width, height, index }) => {
    const row = rows[index];
    console.log("row", row);
    // console.log("rows[index]", rows[index]);
    if (row?.id !== highlightedRowId) {
      return null;
    }
    console.log("highlightedRowId", highlightedRowId);

    const horizontalPadding = 18;

    return (
      <rect
        x={x - horizontalPadding}
        y={y}
        width={width + horizontalPadding * 2}
        height={height}
        // fill={hoverBackgroundColor}
        fill="red"
        pointerEvents="none"
      />
    );
  };

  console.log("renderHighlightedBackground", renderHighlightedBackground);

  /**
   * Find the highest valid allele-frequency value.
   * Missing values are ignored.
   * Zero remains a valid value.
   */
  const validAlleleFrequencies = rows
    .map((row) => row.alleleFrequency)
    .filter((value) => Number.isFinite(value));

  const highestAlleleFrequency = validAlleleFrequencies.length
    ? Math.max(...validAlleleFrequencies)
    : 0;

  console.log("validAlleleFrequencies", validAlleleFrequencies);
  /**
   * Add a small amount of space above the tallest bar.
   * Allele frequency cannot be greater than 1.
   */
  const yAxisMaximum =
    highestAlleleFrequency === 0
      ? 1
      : Math.min(highestAlleleFrequency * 1.1, 1);

  const chartWidth = getAlleleFrequencyChartWidth(rows.length);

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        // Remove Recharts focus/click outlines from chart elements.
        "& .recharts-wrapper *:focus": {
          outline: "none !important",
        },

        "& .recharts-wrapper svg *:focus": {
          outline: "none !important",
        },

        "& .recharts-wrapper *": {
          WebkitTapHighlightColor: "transparent",
        },
      }}
    >
      {/* Chart title */}
      <Typography
        sx={{
          mb: 2,
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        Allele Frequency by population
      </Typography>

      {/*
       * This container becomes horizontally scrollable when the chart is wider than the available page space/when the chart has more than 14 populations.
       */}
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          display: "flex",
          justifyContent: {
            xs: "center",
            lg: hasManyPopulations ? "center" : "flex-start",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "360px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{
                top: 10,
                right: 20,
                // Check with Sara
                bottom: 10,
                // bottom: -30,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="2 2" vertical={false} />

              <XAxis
                dataKey="population"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{
                  fontSize: 10,
                  fill: "#000",
                }}
                axisLine={{
                  stroke: "#000",
                }}
                tickLine={{
                  stroke: "#000",
                }}
              >
                {/* Check with Sara */}
                {/* <Label
                  value="Populations"
                  position="insideBottom"
                  offset={0}
                  dx={-30}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fill: "#000",
                  }}
                /> */}
              </XAxis>

              <YAxis
                domain={[0, yAxisMaximum]}
                tickFormatter={formatAlleleFrequency}
                width={60}
                tick={{
                  fontSize: 12,
                  fill: "#000",
                }}
                axisLine={{
                  stroke: "#000",
                }}
                tickLine={{
                  stroke: "#000",
                }}
              >
                <Label
                  value="Allele Frequency"
                  angle={-90}
                  offset={12}
                  position="left"
                  style={{
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 12,
                  }}
                />
              </YAxis>

              <Bar
                dataKey="alleleFrequency"
                radius={[4, 4, 0, 0]}
                barSize={20}
                isAnimationActive={false}
                background={renderHighlightedBackground}
              >
                {rows.map((row) => (
                  <Cell
                    key={row.id}
                    fill={`${primaryDarkColor}33`}
                    stroke={primaryDarkColor}
                    strokeWidth={2}
                    onMouseEnter={() => onHighlightRow?.(row.id)}
                    onMouseLeave={() => onHighlightRow?.(null)}
                    style={{
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}
