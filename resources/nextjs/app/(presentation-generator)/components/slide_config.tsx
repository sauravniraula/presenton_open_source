import { Slide } from "../types/slide";
import Type1Mini from "./mini-slides/Type1Mini";
import Type4Mini from "./mini-slides/Type4Mini";
import Type2Mini from "./mini-slides/Type2Mini";
import Type1Layout from "./slide_layouts/Type1Layout";
import Type2Layout from "./slide_layouts/Type2Layout";
import Type4Layout from "./slide_layouts/Type4Layout";
import Type5Layout from "./slide_layouts/Type5Layout";
import Type6Layout from "./slide_layouts/Type6Layout";
import Type7Layout from "./slide_layouts/Type7Layout";
import Type8Layout from "./slide_layouts/Type8Layout";
import Type9Layout from "./slide_layouts/Type9Layout";
import Type7Mini from "./mini-slides/Type7Mini";
import Type6Mini from "./mini-slides/Type6Mini";
import Type5Mini from "./mini-slides/Type5Mini";
import Type9Mini from "./mini-slides/Type9Mini";
import Type8Mini from "./mini-slides/Type8Mini";

import { Chart, ChartSettings } from "@/store/slices/presentationGeneration";

import { Pie, PieChart, Cell, CartesianGrid, Label } from "recharts";
import {
  LineChart,
  Bar,
  Legend,
  BarChart,
  Tooltip,
  YAxis,
  Line,
  XAxis,
} from "recharts";
import { ResponsiveContainer } from "recharts";
import { formatLargeNumber, randomChartGenerator } from "@/lib/utils";
import Type10Layout from "./slide_layouts/Type10Layout";
import BabyIcon from "@/components/icons/Baby";
import PersonIcon from "@/components/icons/Person";
import HandIcon from "@/components/icons/Hand";
import TreeIcon from "@/components/icons/Tree";
import StarIcon from "@/components/icons/Star";
import CornIcon from "@/components/icons/Corn";
import MealIcon from "@/components/icons/Meal";
import DrinkBottleIcon from "@/components/icons/DrinkBottle";
import CupIcon from "@/components/icons/Cup";
import DropletIcon from "@/components/icons/Droplet";
import HouseIcon from "@/components/icons/House";
import BuildingIcon from "@/components/icons/Building";
import TentIcon from "@/components/icons/Tent";
import CarIcon from "@/components/icons/Car";
import BicycleIcon from "@/components/icons/Bicycle";
import ClockIcon from "@/components/icons/Clock";
import BanknoteIcon from "@/components/icons/Banknote";
import BriefcaseIcon from "@/components/icons/Briefcase";
import TruckIcon from "@/components/icons/Truck";
import AirplaneIcon from "@/components/icons/Airplane";
import LaptopIcon from "@/components/icons/Laptop";
import MobilePhoneIcon from "@/components/icons/MobilePhone";
import LightBulbIcon from "@/components/icons/LightBulb";
import SpannerIcon from "@/components/icons/Spanner";
import FireIcon from "@/components/icons/Fire";
import MortarboardIcon from "@/components/icons/Mortarboard";
import BookIcon from "@/components/icons/Book";
import SyringeIcon from "@/components/icons/Syringe";
import FirstAidIcon from "@/components/icons/FirstAid";
import GlobeIcon from "@/components/icons/Globe";
import Type10Mini from "./mini-slides/Type10Mini";
import { ThemeColors } from "../store/themeSlice";
import { isDarkColor } from "../utils/others";
import Type12Layout from "./slide_layouts/Type12Layout";
import Type12Mini from "./mini-slides/Type12Mini";

const randomGraph = (presentation_id: string) => {
  const randomData = randomChartGenerator();

  return {
    id: crypto.randomUUID(),
    name: "Sales Performance",
    type: "bar",
    presentation: presentation_id,
    postfix: "",
    data: randomData,
  };
};

export const getEmptySlideContent = (
  type: number,
  index: number,
  presentation_id: string
): Slide => {
  const baseSlide: Slide = {
    id: crypto.randomUUID(),
    type,
    index,
    design_index: 1,
    properties: null,
    images: [],
    icons: [],
    graph_id: null,
    presentation: presentation_id,
    content: {
      title: "",
      body: "",
      infographics: [],
    },
  };
  const graph = randomGraph(presentation_id);

  switch (type) {
    case 1:
      return {
        ...baseSlide,
        images: [""],
        content: {
          title: "New Title",
          body: "Add your description here",
          image_prompts: [""],
        },
      };
    case 2:
      return {
        ...baseSlide,
        content: {
          title: "New Title",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
        },
      };
    case 4:
      return {
        ...baseSlide,
        images: ["", "", ""],
        content: {
          title: "New Title",
          body: [
            { heading: "First Item", description: "Add description" },
            { heading: "Second Item", description: "Add description" },
            { heading: "Third Item", description: "Add description" },
          ],
          image_prompts: ["", "", ""],
        },
      };
    case 5:
      return {
        ...baseSlide,
        graph_id: graph.id,
        content: {
          graph: graph,
          title: "New Title",
          body: "Add your description here",
        },
      };
    case 6:
      return {
        ...baseSlide,
        content: {
          title: "New Title",
          description: "Add your description here",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
        },
      };
    case 7:
      return {
        ...baseSlide,
        icons: ["", "", ""],
        content: {
          title: "New Title",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
          icon_queries: [
            {
              queries: [""],
            },
          ],
        },
      };
    case 8:
      return {
        ...baseSlide,
        icons: ["", "", ""],
        content: {
          title: "New Title",
          description: "Add your description here",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
          icon_queries: [
            {
              queries: [""],
            },
          ],
        },
      };
    case 9:
      return {
        ...baseSlide,
        graph_id: graph.id,
        content: {
          graph: graph,
          title: "New Subheading",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
        },
      };
    case 10:
      return {
        ...baseSlide,
        type: 10,
        // @ts-ignore
        content: {
          title: "New Title",
          infographics: [
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-ring",
                value: {
                  number_type: "fraction",
                  numerator: 4,
                  denominator: 5,
                },
              },
              description: "Enter Description",
            },
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-ring",
                value: {
                  number_type: "percentage",
                  percentage: 40,
                },
              },
              description: "Enter Description",
            },
          ],
        },
      };
    case 11:
      return {
        ...baseSlide,
        type: 10,
        // @ts-ignore
        content: {
          title: "New Title",
          infographics: [
            {
              title: "Enter Heading",
              chart: {
                chart_type: "text",
                value: {
                  number_type: "numerical",
                  numerical: "50",
                  suffix: "quids",
                },
              },
              description: "Enter Description",
            },
            {
              title: "Enter Heading",
              chart: {
                chart_type: "text",
                value: {
                  number_type: "numerical",
                  numerical: "23.4",
                  suffix: "pence",
                },
              },
              description: "Enter Description",
            },
          ],
        },
      };
    case 12:
      return {
        ...baseSlide,
        type: 10,
        // @ts-ignore
        content: {
          title: "New Title",
          description: "Enter Description",
          infographics: [
            {
              title: "Enter Heading",
              chart: {
                chart_type: "icon-infographic",
                icon: "hand",
                value: {
                  number_type: "percentage",
                  percentage: 75,
                },
              },
              description: "Enter Description",
            },
          ],
        },
      };
    case 13:
      return {
        ...baseSlide,
        type: 10,
        // @ts-ignore
        content: {
          title: "New Title",
          description: "Enter Description",
          infographics: [
            {
              title: "Enter Heading",
              chart: {
                chart_type: "icon-infographic",
                icon: "hand",
                value: {
                  number_type: "percentage",
                  percentage: 75,
                },
              },
              description: "Enter Description",
            },
            {
              title: "Enter Heading",
              chart: {
                chart_type: "icon-infographic",
                icon: "baby",
                value: {
                  number_type: "percentage",
                  percentage: 75,
                },
              },
              description: "Enter Description",
            },
          ],
        },
      };
    case 14:
      return {
        ...baseSlide,
        type: 10,
        // @ts-ignore
        content: {
          title: "New Title",
          description: "Enter Description",
          infographics: [
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-ring",
                value: {
                  number_type: "percentage",
                  percentage: 40,
                },
              },
              description: "Enter Description",
            },
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-ring",
                value: {
                  number_type: "fraction",
                  numerator: 4,
                  denominator: 5,
                },
              },
              description: "Enter Description",
            },
          ],
        },
      };
    case 15:
      return {
        ...baseSlide,
        type: 10,
        // @ts-ignore
        content: {
          title: "New Title",
          description: "Enter Description",
          infographics: [
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-dial",
                value: {
                  number_type: "fraction",
                  numerator: 2,
                  denominator: 3,
                },
              },
              description: "Enter Description",
            },
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-dial",
                value: {
                  number_type: "percentage",
                  percentage: 40,
                },
              },
              description: "Enter Description",
            },
          ],
        },
      };

    case 16:
      return {
        ...baseSlide,
        type: 10,
        // @ts-ignore
        content: {
          title: "New Title",
          description: "Enter Description",
          infographics: [
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-bar",
                value: {
                  number_type: "percentage",
                  percentage: 40,
                },
              },
              description: "Enter Description",
            },
            {
              title: "Enter Heading",
              chart: {
                chart_type: "progress-bar",
                value: {
                  number_type: "fraction",
                  numerator: 4,
                  denominator: 5,
                },
              },
              description: "Enter Description",
            },
          ],
        },
      };
    default:
      return baseSlide;
  }
};

export const renderSlideContent = (slide: Slide, language: string) => {
  switch (slide.type) {
    case 1:
      return (
        <Type1Layout
          slideIndex={slide.index}
          title={slide.content.title}
          slideId={slide.id}
          description={
            typeof slide.content.body === "string"
              ? slide.content.body
              : slide.content.body[0]?.description || ""
          }
          images={slide.images || []}
          image_prompts={slide.content.image_prompts || []}
          properties={slide.properties}
        />
      );
    case 2:
      return (
        <Type2Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          language={language || "English"}
          design_index={slide.design_index || 2}
        />
      );

    case 4:
      return (
        <Type4Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          images={slide.images || []}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          image_prompts={slide.content.image_prompts || []}
          properties={slide.properties}
        />
      );

    case 5:
      const isFullSizeGraph =
        slide.content.graph?.data.categories.length > 4 &&
        slide.content.graph.type !== "pie";
      return (
        <Type5Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          description={(slide.content.body as string) || ""}
          isFullSizeGraph={isFullSizeGraph}
          graphData={slide.content.graph}
        />
      );

    case 6:
      return (
        <Type6Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          description={slide.content.description || ""}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          language={language || "English"}
        />
      );

    case 7:
      return (
        <Type7Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          icons={slide.icons || []}
          icon_queries={slide.content.icon_queries || []}
        />
      );

    case 8:
      return (
        <Type8Layout
          title={slide.content.title}
          slideId={slide.id}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          slideIndex={slide.index}
          description={slide.content.description || ""}
          icons={slide.icons || []}
          icon_queries={slide.content.icon_queries || []}
        />
      );

    case 9:
      return (
        <Type9Layout
          slideIndex={slide.index}
          slideId={slide.id}
          title={slide.content.title}
          // @ts-ignore
          body={slide.content.body}
          language={language || "English"}
          graphData={slide.content.graph}
        />
      );
    case 10:
    case 11:
      return (
        <Type10Layout
          design_index={slide.design_index || 1}
          description={slide.content.description || ""}
          slideIndex={slide.index}
          slideId={slide.id || ""}
          title={slide.content.title}
          infographics={slide.content.infographics}
        />
      );
    case 12:
      return (
        <Type12Layout
          slideIndex={slide.index}
          slideId={slide.id || ""}
          title={slide.content.title}
          mermaidCode={slide.content.diagram}
          description={slide.content.description || ""}
          isFullSizeGraph={false}
        />
      );

    default:
      return null;
  }
};

export const renderMiniSlideContent = (slide: Slide) => {
  const { type, content } = slide;

  switch (type) {
    case 1:
      return (
        <Type1Mini
          title={content.title}
          description={
            typeof slide.content.body === "string"
              ? slide.content.body
              : slide.content.body[0]?.description || ""
          }
          image={slide.images?.[0] || ""}
        />
      );
    case 2:
      return (
        <Type2Mini
          title={slide.content.title}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          design_index={slide.design_index || 2}
        />
      );
    case 4:
      return (
        <Type4Mini
          title={slide.content.title}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          images={slide.images || []}
        />
      );
    case 5:
      const isFullSizeGraph =
        slide.content.graph?.data.categories.length > 4 &&
        slide.content.graph.type !== "pie";
      return (
        <Type5Mini
          title={slide.content.title}
          isFullSizeGraph={isFullSizeGraph}
          description={(slide.content.body as string) || ""}
          chartData={slide.content.graph!}
          slideIndex={slide.index}
        />
      );
    case 6:
      return (
        <Type6Mini
          title={slide.content.title}
          description={slide.content.description || ""}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
        />
      );
    case 7:
      return (
        <Type7Mini
          title={slide.content.title}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          icons={slide.icons || []}
        />
      );
    case 8:
      return (
        <Type8Mini
          title={slide.content.title}
          description={slide.content.description || ""}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          icons={slide.icons || []}
        />
      );
    case 9:
      return (
        <Type9Mini
          title={slide.content.title}
          // @ts-ignore
          body={slide.content.body}
          chartData={slide.content.graph!}
          slideIndex={slide.index}
        />
      );
    case 10:
    case 11:
      return (
        <Type10Mini
          design_index={slide.design_index || 1}
          slideIndex={slide.index}
          description={slide.content.description || ""}
          title={slide.content.title}
          infographics={slide.content.infographics}
        />
      );
    case 12:
      return (
        <Type12Mini
          title={slide.content.title}
          description={slide.content.description || ""}
          isFullSizeGraph={false}
          mermaidCode={slide.content.diagram || ""}
          slideIndex={slide.index}
        />
      );
    default:
      return null;
  }
};
// CHART RENDERING
export const formatTooltipValue = (localChartData: Chart, value: number) => {
  const formattedValue = formatLargeNumber(value);
  if (localChartData.postfix) {
    return `${formattedValue}${localChartData.postfix}`;
  }
  return formattedValue;
};
export const transformedData = (localChartData: Chart) => {
  if (!localChartData) return [];
  if (!localChartData.data || localChartData.data.categories.length === 0)
    return [];
  if (localChartData && localChartData.type === "pie") {
    return localChartData.data.categories.map((category, index) => ({
      name: category,
      value: localChartData.data.series[0].data[index],
      actualValue: localChartData.data.series[0].data[index],
      seriesName: localChartData.data.series[0].name || "Series 1",
    }));
  } else {
    return localChartData.data.categories.map((category, index) => {
      const dataPoint: any = { name: category };
      localChartData.data.series.forEach((serie) => {
        const seriesName = serie.name || "Series";
        dataPoint[seriesName] = serie.data[index];
        dataPoint[`${seriesName}Value`] = serie.data[index];
      });
      return dataPoint;
    });
  }
};

export const renderChart = (
  localChartData: Chart,
  isMini: boolean = false,
  theme: ThemeColors,
  chartSettings?: ChartSettings
) => {
  const chartColors = theme.chartColors || [];

  const formatYAxisTick = (value: number) => {
    if (value >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(0)}T`;
    } else if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(0)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}k`;
    }
    return value.toString();
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const isDark = isDarkColor(theme.chartColors[index % chartColors.length]);

    return (
      <text
        x={x}
        y={y}
        fill={isDark ? "#ffffff" : "#000000"}
        style={{ cursor: "pointer" }}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // New function for outside labels
  const renderOutsideLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    // Position the label further outside the pie
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={theme.slideTitle}
        style={{ cursor: "pointer" }}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!localChartData) return null;
  switch (localChartData.type) {
    case "line":
      return (
        <ResponsiveContainer
          id="line-chart-container"
          width="100%"
          height={isMini ? 100 : 300}
        >
          <LineChart
            className="w-full"
            data={transformedData(localChartData)}
            style={{ cursor: "pointer" }}
            margin={{ bottom: !isMini ? 30 : 0, right: 30, left: 10, top: 20 }}
          >
            {chartSettings?.showGrid && (
              <CartesianGrid
                vertical={false}
                stroke={theme.slideDescription}
                opacity={0.2}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <XAxis
                dataKey="name"
                tickSize={10}
                angle={-10}
                height={!isMini ? 30 : 0}
                interval={0}
                dy={!isMini ? 10 : 0}
                dx={!isMini ? -15 : 0}
                tick={{
                  fill: theme.slideTitle,
                  fontSize: 14,
                  alignmentBaseline: "middle",
                }}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <YAxis
                tick={{ fill: theme.slideTitle }}
                tickFormatter={formatYAxisTick}
                padding={{ top: 15 }}
              >
                <Label
                  value={localChartData.unit || ""}
                  position="top"
                  style={{
                    textTransform: "capitalize",
                    textAnchor: "start",
                    fontSize: "16px",
                    fill: theme.slideTitle,
                    fontWeight: "bold",
                  }}
                />
              </YAxis>
            )}
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: theme.slideBox,
                color: theme.slideTitle,
                border: "none",
              }}
              itemStyle={{
                color: theme.slideTitle,
              }}
            />
            {!isMini && chartSettings?.showLegend && (
              <Legend verticalAlign="top" align="center" />
            )}
            {localChartData.data.series.map((serie, index) => (
              <Line
                isAnimationActive={false}
                key={serie.name || `Series ${index + 1}`}
                type="monotone"
                strokeWidth={2}
                dataKey={serie.name || `Series ${index + 1}`}
                stroke={chartColors[index % chartColors.length]}
                style={{ cursor: "pointer" }}
                // label={(chartSettings?.showDataLabel && localChartData.data.series.length === 1) ? {
                //     position: chartSettings?.dataLabel.dataLabelPosition === "Outside" ? "top" : "center",
                //     formatter: (value: number) => formatYAxisTick(value),
                //     fill: chartSettings?.dataLabel.dataLabelPosition === "Outside" ? theme.slideTitle : '#ffffff',
                //     fontWeight: 'bold',
                //     fontSize: '12px',
                //     fontFamily: theme.fontFamily
                // } : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer
          id="pie-chart-container"
          width="100%"
          height={isMini ? 100 : 300}
        >
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={transformedData(localChartData)}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              style={{ cursor: "pointer" }}
              label={
                chartSettings?.showDataLabel
                  ? chartSettings?.dataLabel.dataLabelPosition === "Inside"
                    ? renderCustomizedLabel
                    : renderOutsideLabel
                  : false
              }
              fill={theme.slideTitle}
              paddingAngle={2}
              labelLine={false}
              outerRadius={
                chartSettings?.dataLabel.dataLabelPosition === "Outside"
                  ? "80%"
                  : "90%"
              }
            >
              {transformedData(localChartData).map((entry: any, index: any) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  focusable={false}
                  stroke="none"
                  style={{
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                formatTooltipValue(localChartData, value as number)
              }
              contentStyle={{
                backgroundColor: theme.slideBox,
                color: theme.slideTitle,
                border: "none",
                borderRadius: "6px",
              }}
              itemStyle={{
                color: theme.slideTitle,
              }}
            />
            {!isMini && chartSettings?.showLegend && (
              <Legend verticalAlign="top" align="center" />
            )}
          </PieChart>
        </ResponsiveContainer>
      );

    case "bar":
    default:
      return (
        <ResponsiveContainer
          id="bar-chart-container"
          width="100%"
          height={isMini ? 100 : 330}
        >
          <BarChart
            data={transformedData(localChartData)}
            margin={{ bottom: !isMini ? 30 : 0, top: 20 }}
          >
            {chartSettings?.showGrid && (
              <CartesianGrid
                vertical={false}
                stroke={theme.slideDescription}
                opacity={0.2}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <XAxis
                stroke={theme.slideTitle}
                className=""
                dataKey="name"
                tickSize={10}
                angle={-10}
                height={!isMini ? 40 : 0}
                interval={0}
                dy={!isMini ? 20 : 0}
                dx={!isMini ? -10 : 0}
                tick={{
                  fill: theme.slideTitle,
                  fontSize: 14,
                  alignmentBaseline: "middle",
                }}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <YAxis
                stroke={theme.slideTitle}
                tick={{ fill: theme.slideTitle }}
                tickFormatter={formatYAxisTick}
                padding={{ top: 20 }}
              >
                <Label
                  value={localChartData.unit || ""}
                  position="top"
                  style={{
                    textTransform: "capitalize",
                    textAnchor: "start",
                    fontSize: "16px",
                    fill: theme.slideTitle,
                    fontWeight: "bold",
                    width: "fit",
                    margin: "0 auto",
                  }}
                />
              </YAxis>
            )}
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: theme.slideBox,
                color: theme.slideTitle,
                border: "none",
              }}
              itemStyle={{
                color: theme.slideTitle,
              }}
            />
            {!isMini && chartSettings?.showLegend && (
              <Legend verticalAlign="top" align="center" />
            )}
            {localChartData &&
              localChartData.data &&
              localChartData.data.series &&
              localChartData.data.series.map((serie, index) => (
                <Bar
                  isAnimationActive={false}
                  key={serie.name || `Series ${index + 1}`}
                  dataKey={serie.name || `Series ${index + 1}`}
                  fill={chartColors[index % chartColors.length]}
                  barSize={50}
                  style={{ cursor: "pointer" }}
                  radius={[5, 8, 0, 0]}
                  label={
                    chartSettings?.showDataLabel
                      ? {
                          position:
                            chartSettings?.dataLabel.dataLabelPosition ===
                            "Outside"
                              ? "top"
                              : chartSettings?.dataLabel.dataLabelAlignment ===
                                "Base"
                              ? "insideBottom"
                              : chartSettings?.dataLabel.dataLabelAlignment ===
                                "Center"
                              ? "center"
                              : "insideTop",
                          formatter: (value: number) => formatYAxisTick(value),
                          fill:
                            chartSettings?.dataLabel.dataLabelPosition ===
                            "Outside"
                              ? theme.slideTitle
                              : "#ffffff",
                          fontWeight: "bold",
                          fontSize: "14px",
                          fontFamily: theme.fontFamily,
                        }
                      : undefined
                  }
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      );
  }
};

// First, let's create a constant object with all the icon mappings
export const ICON_LIST = {
  person: PersonIcon,
  female_person: PersonIcon,
  male_person: PersonIcon,
  baby: BabyIcon,
  hand: HandIcon,
  tree: TreeIcon,
  star: StarIcon,
  corn: CornIcon,
  meal: MealIcon,
  drink_bottle: DrinkBottleIcon,
  cup: CupIcon,
  droplet: DropletIcon,
  house: HouseIcon,
  building: BuildingIcon,
  tent: TentIcon,
  car: CarIcon,
  bicycle: BicycleIcon,
  clock: ClockIcon,
  banknote: BanknoteIcon,
  briefcase: BriefcaseIcon,
  truck: TruckIcon,
  airplane: AirplaneIcon,
  laptop_computer: LaptopIcon,
  mobile_phone: MobilePhoneIcon,
  light_bulb: LightBulbIcon,
  spanner: SpannerIcon,
  fire: FireIcon,
  mortarboard: MortarboardIcon,
  book: BookIcon,
  syringe: SyringeIcon,
  first_aid: FirstAidIcon,
  globe: GlobeIcon,
} as const;

// Then modify IconMapper to use this list
export const IconMapper = (isMini = false, icon: string) => {
  const IconComponent = ICON_LIST[icon as keyof typeof ICON_LIST];
  if (!IconComponent) return null;
  return <IconComponent className={isMini ? "w-4 h-4" : "w-12 h-12"} />;
};

export const getPercentage = (numerator: number, denominator: number) => {
  if (denominator === 0) return 0;

  return Math.round((numerator / denominator) * 100);
};
