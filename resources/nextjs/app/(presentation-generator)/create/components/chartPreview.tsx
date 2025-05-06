import React from 'react';
import { Chart } from '@/store/slices/presentationGeneration';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { Button } from '@/components/ui/button';
import { PencilIcon, Trash2 } from 'lucide-react';
import { formatLargeNumber } from '@/lib/utils';
import ToolTip from '@/components/ToolTip';

interface ChartPreviewProps {
    chart: Chart;
    isTableOpen: boolean;
    onEdit: () => void;
    handleChartDelete: (chartId: string) => void;
}

const COLORS = ['#6595FE', '#FF62A8', '#4AEC54', '#9C62FF', "#F1C335", "#FF7173"];

export function ChartPreview({ chart, isTableOpen, onEdit, handleChartDelete }: ChartPreviewProps) {
    // Transform chart data for Recharts based on chart type
    const transformedData = React.useMemo(() => {
        if (chart.type === 'pie') {
            // For pie charts, only use the first series
            return chart.data.categories.map((category, index) => ({
                name: category,
                value: chart.data.series[0].data[index],
                // Include values if they exist
                ...(chart.data.series[0].data && {
                    actualValue: chart.data.series[0].data[index]
                }),
                // Include series name
                seriesName: chart.data.series[0].name || 'Series 1'
            }));
        } else {
            // For bar and line charts, use all series
            return chart.data.categories.map((category, index) => {
                const dataPoint: any = { name: category };
                chart.data.series.forEach((serie) => {
                    // Use the series name as the key
                    const seriesName = serie.name || 'Series';
                    dataPoint[seriesName] = serie.data[index];
                    // Include values if they exist
                    if (serie.data) {
                        dataPoint[`${seriesName}Value`] = serie.data[index];
                    }
                });
                return dataPoint;
            });
        }
    }, [chart]);

    const formatTooltipValue = (value: number) => {
        const formattedValue = formatLargeNumber(value);
        if (chart.postfix) {
            return `${formattedValue}${chart.postfix}`;
        }
        return formattedValue;
    };

    const renderChart = () => {
        switch (chart.type) {
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={transformedData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                            // label={(entry) => `${entry.name} (${formatTooltipValue(entry.value)})`}
                            >
                                {transformedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatTooltipValue(value as number)}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={formatLargeNumber} />
                            <Tooltip formatter={(value) => formatTooltipValue(value as number)} />
                            <Legend />
                            {chart.data.series.map((serie, index) => (
                                <Line
                                    key={serie.name || `Series ${index + 1}`}
                                    type="monotone"
                                    dataKey={serie.name || `Series ${index + 1}`}
                                    stroke={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'bar':
            default:
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={formatLargeNumber} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                formatter={(value) => formatTooltipValue(value as number)}
                            />
                            <Legend />
                            {chart.data.series.map((serie, index) => (
                                <Bar
                                    barSize={60}
                                    key={serie.name || `Series ${index + 1}`}
                                    dataKey={serie.name || `Series ${index + 1}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="bg-white p-4 ">
            <div className='flex justify-end gap-2 mb-2 items-center'>
                <Button onClick={onEdit} variant='outline' className='gap-2'>
                    <PencilIcon className='w-4 h-4' />
                    <span> {isTableOpen ? 'Close ' : 'Edit Chart'}</span>
                </Button>
                <ToolTip content="Delete Chart">

                    <Button
                        variant='outline'
                        onClick={() => handleChartDelete(chart.id)}
                        className=" border border-red-500 rounded-lg transition-colors"
                    >

                        <Trash2 className="w-3 h-3 text-black/80" />
                    </Button>
                </ToolTip>
            </div>
            {renderChart()}
        </div>
    );
} 