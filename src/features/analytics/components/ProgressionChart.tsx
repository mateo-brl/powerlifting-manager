/**
 * Graphique de progression d'un athlète
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

interface ProgressionChartProps {
  data: ChartDataPoint[];
  metric: 'squat' | 'bench' | 'deadlift' | 'total' | 'ipf_points' | 'wilks' | 'dots';
  title?: string;
  height?: number;
}

const ProgressionChart: React.FC<ProgressionChartProps> = ({
  data,
  metric,
  title,
  height = 400,
}) => {
  const { t } = useTranslation();

  const metricColors: Record<string, string> = {
    squat: '#1890ff',
    bench: '#52c41a',
    deadlift: '#ff4d4f',
    total: '#722ed1',
    ipf_points: '#faad14',
    wilks: '#13c2c2',
    dots: '#eb2f96',
  };

  const metricLabels: Record<string, string> = {
    squat: t('analytics.squat', 'Squat'),
    bench: t('analytics.bench', 'Bench'),
    deadlift: t('analytics.deadlift', 'Deadlift'),
    total: t('analytics.total', 'Total'),
    ipf_points: t('analytics.ipfPoints', 'IPF Points'),
    wilks: 'Wilks',
    dots: 'DOTS',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <Card title={title || t('analytics.progressionChart', 'Graphique de Progression')}>
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
              value: metricLabels[metric],
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(value: number) => [
              `${value.toFixed(2)} ${metric.includes('points') || metric === 'wilks' || metric === 'dots' ? 'pts' : 'kg'}`,
              metricLabels[metric],
            ]}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={metricColors[metric]}
            strokeWidth={3}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
            name={metricLabels[metric]}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ProgressionChart;
