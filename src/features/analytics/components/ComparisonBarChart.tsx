/**
 * Graphique en barres pour comparer les performances entre compétitions
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';

interface ComparisonBarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number | undefined;
  }>;
  dataKeys: string[];
  title?: string;
  height?: number;
}

const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  dataKeys,
  title,
  height = 400,
}) => {
  const { t } = useTranslation();

  const colors = ['#1890ff', '#52c41a', '#ff4d4f', '#722ed1', '#faad14', '#13c2c2'];

  return (
    <Card title={title || t('analytics.comparisonBarChart', 'Comparaison')}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              name={key}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ComparisonBarChart;
