'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface CostChartProps {
  data: Array<{ date: string; cost: number }>
  title?: string
  description?: string
}

export function CostChart({
  data,
  title = 'Cost Trends',
  description = 'Daily spending on voice calls',
}: CostChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Cost ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

