'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface PerformanceChartProps {
  data: Array<{ name: string; calls: number; successRate: number }>
  title?: string
  description?: string
}

export function PerformanceChart({
  data,
  title = 'Agent Performance',
  description = 'Compare agent call volumes and success rates',
}: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="calls" fill="#3b82f6" name="Total Calls" />
            <Bar yAxisId="right" dataKey="successRate" fill="#10b981" name="Success Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

