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
import config from "../../../../config/runtimeConfig";

const primaryDarkColor = config.ui.colors.darkPrimary;

const WIDTH_PER_POPULATION = 38;
const MINIMUM_CHART_WIDTH = 420;
const HOVER_PADDING_RATIO = 0.4;

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

  /**
   * Creates a full-height hover area for each population.
   *
   * The area remains visually transparent until the population is highlighted.
   * This makes hovering work even when the allele frequency is 0.
   */
  const renderHighlightedBackground = ({ x, y, width, height, index }) => {
    const row = rows[index];

    if (!row) return null;

    const horizontalPadding = width * HOVER_PADDING_RATIO;
    const isHighlighted = row.id === highlightedRowId;

    return (
      <rect
        x={x - horizontalPadding}
        y={y}
        width={width + horizontalPadding * 2}
        height={height}
        fill={isHighlighted ? hoverBackgroundColor : "rgba(0, 0, 0, 0.001)"}
        pointerEvents="all"
        onMouseEnter={() => onHighlightRow?.(row.id)}
      />
    );
  };

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

  /**
   * Add a small amount of space above the tallest bar.
   * Allele frequency cannot be greater than 1.
   */
  const yAxisMaximum =
    highestAlleleFrequency === 0
      ? 1
      : Math.min(highestAlleleFrequency * 1.1, 1);

  /**
   * Renders each population label on the X-axis and connects
   * its hover state to the same chart/table highlight.
   */
  const renderPopulationTick = ({ x, y, payload }) => {
    const row = rows.find((item) => item.population === payload.value);

    return (
      <g
        transform={`translate(${x}, ${y})`}
        onMouseEnter={() => {
          if (row) {
            onHighlightRow?.(row.id);
          }
        }}
        style={{
          cursor: "pointer",
        }}
      >
        <text
          x={0}
          y={0}
          dy={8}
          textAnchor="end"
          transform="rotate(-45)"
          fontSize={10}
          fill="#000"
        >
          {payload.value}
        </text>
      </g>
    );
  };

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
              onMouseLeave={() => onHighlightRow?.(null)}
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
                height={100}
                tick={renderPopulationTick}
                axisLine={{
                  stroke: "#000",
                }}
                tickLine={{
                  stroke: "#000",
                }}
              >
                {/* Check with Sara */}
                <Label
                  value="Populations"
                  position="insideBottom"
                  offset={0}
                  dx={-30}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fill: "#000",
                  }}
                />
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
                minPointSize={1}
                isAnimationActive={false}
                background={renderHighlightedBackground}
              >
                {rows.map((row) => (
                  <Cell
                    key={row.id}
                    fill={`${primaryDarkColor}33`}
                    stroke={primaryDarkColor}
                    strokeWidth={2}
                    style={{
                      pointerEvents: "none",
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
