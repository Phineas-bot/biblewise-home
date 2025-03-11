
import React from "react";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

interface ChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
    }[];
  };
  height?: number;
}

export const BarChart = ({ data, height = 300 }: ChartProps) => {
  // Transform data to recharts format
  const transformedData = data.labels.map((label, index) => {
    const dataPoint: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={transformedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Bar
            key={index}
            dataKey={dataset.label}
            fill={typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : '#8884d8'}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export const PieChart = ({ data, height = 300 }: ChartProps) => {
  // Transform data to recharts format
  const transformedData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
  }));

  const COLORS = typeof data.datasets[0].backgroundColor === 'string' 
    ? Array(data.labels.length).fill(data.datasets[0].backgroundColor) 
    : data.datasets[0].backgroundColor;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={transformedData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
