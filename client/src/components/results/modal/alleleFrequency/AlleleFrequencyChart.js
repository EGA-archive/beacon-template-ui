import { Box, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { formatAlleleFrequency } from "../../utils/alleleFrequencyUtils";
import config from "../../../../config/config.json";

const primaryDarkColor = config.ui.colors.darkPrimary;

/**
 * Temporary colors used to understand the chart layout.
 *
 * Remove these colors once the chart positioning is clear.
 */
const debugColors = {
  completeComponent: "#e3f2fd",
  title: "#ffcdd2",
  scrollContainer: "#f8bbd0",
  chartWidthContainer: "#c8e6c9",
  responsiveContainer: "#fff9c4",
  chartArea: "#ffccbc",
};

/**
 * Displays the allele frequency for each population as a bar chart.
 *
 * The component receives the same normalized rows used by the table.
 * Missing allele-frequency values are not displayed as bars.
 */
export default function AlleleFrequencyChart({ rows = [] }) {
  const validAlleleFrequencies = rows
    .map((row) => row.alleleFrequency)
    .filter((value) => Number.isFinite(value));

  const highestAlleleFrequency = validAlleleFrequencies.length
    ? Math.max(...validAlleleFrequencies)
    : 0;

  /**
   * Add a little space above the tallest bar.
   *
   * Allele frequency cannot be higher than 1.
   */
  const yAxisMaximum =
    highestAlleleFrequency === 0
      ? 1
      : Math.min(highestAlleleFrequency * 1.1, 1);

  /**
   * Controls how much horizontal space each population receives.
   *
   * Larger number:
   * - more space between populations;
   * - wider chart;
   * - more horizontal scrolling.
   *
   * Smaller number:
   * - populations are closer together;
   * - less scrolling.
   */
  const widthPerPopulation = 35;
  const minimumChartWidth = 420;

  const chartWidth = Math.max(
    rows.length * widthPerPopulation,
    minimumChartWidth
  );

  return (
    /**
     * Blue:
     * The complete AlleleFrequencyChart component.
     */
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      {/*
       * The chart title area.
       */}
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
       * The visible chart area.
       * This container controls horizontal scrolling when the complete
       * chart is wider than the available page space.
       */}
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        {/*
         * Green:
         * The complete chart width.
         *
         * This may be wider than the pink container, which creates
         * horizontal scrolling.
         */}
        <Box
          sx={{
            width: `${chartWidth}px`,
            height: "360px",
          }}
        >
          {/*
           * It gives Recharts the width and height of its parent.
           */}
          <ResponsiveContainer
            height="100%"
            width="100%"
            style={{
              backgroundColor: debugColors.responsiveContainer,
            }}
          >
            {/*
             * The actual Recharts chart area containing the axes,
             * grid and bars.
             * barCategoryGap controls the gap between population groups.
             */}
            <BarChart
              data={rows}
              margin={{
                top: 10,
                right: 20,
                bottom: 10,
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
                <Label
                  value="Populations"
                  position="insideBottom"
                  offset={0}
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
                width={50}
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
                <Label
                  value="Allele Frequency"
                  angle={-90}
                  offset={15}
                  position="left"
                  style={{
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                  }}
                />
              </YAxis>

              {/*
               * barSize controls the width of each individual bar.
               *
               * Smaller value:
               * - thinner bars.
               *
               * Larger value:
               * - wider bars.
               */}
              <Bar
                dataKey="alleleFrequency"
                fill={`${primaryDarkColor}33`}
                stroke={primaryDarkColor}
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
                barSize={18}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}
