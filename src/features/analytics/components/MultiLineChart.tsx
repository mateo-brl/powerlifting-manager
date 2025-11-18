/**
 * Graphique multi-lignes pour comparer plusieurs métriques ou athlètes
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { ChartDataPoint } from '../types';

interface MultiLineChartProps {
  data: ChartDataPoint[];
  metrics: Array<'squat' | 'bench' | 'deadlift' | 'total'>;
  title?: string;
  height?: number;
}

const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  metrics,
  title,
  height = 400,
}) => {
  const { t } = useTranslation();

  const metricColors: Record<string, string> = {
    squat: '#1890ff',
    bench: '#52c41a',
    deadlift: '#ff4d4f',
    total: '#722ed1',
  };

  const metricLabels: Record<string, string> = {
    squat: t('analytics.squat', 'Squat'),
    bench: t('analytics.bench', 'Bench'),
    deadlift: t('analytics.deadlift', 'Deadlift'),
    total: t('analytics.total', 'Total'),
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <Card title={title || t('analytics.comparisonChart', 'Graphique de Comparaison')}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            label={{
              value: 'kg',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          />
          <Legend />
          {metrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={metricColors[metric]}
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
              name={metricLabels[metric]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default MultiLineChart;
