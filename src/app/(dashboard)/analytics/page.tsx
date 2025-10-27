'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Phone, Clock, DollarSign, CheckCircle } from 'lucide-react'
import { useState } from 'react'

// Mock data
const callsOverTimeData = [
  { date: 'Jan 1', calls: 45 },
  { date: 'Jan 2', calls: 52 },
  { date: 'Jan 3', calls: 48 },
  { date: 'Jan 4', calls: 61 },
  { date: 'Jan 5', calls: 55 },
  { date: 'Jan 6', calls: 67 },
  { date: 'Jan 7', calls: 72 },
]

const callsByStatusData = [
  { name: 'Completed', value: 580, color: '#10b981' },
  { name: 'Failed', value: 120, color: '#ef4444' },
  { name: 'No Answer', value: 180, color: '#f59e0b' },
  { name: 'Voicemail', value: 90, color: '#8b5cf6' },
]

const costOverTimeData = [
  { date: 'Jan 1', cost: 145 },
  { date: 'Jan 2', cost: 168 },
  { date: 'Jan 3', cost: 152 },
  { date: 'Jan 4', cost: 198 },
  { date: 'Jan 5', cost: 175 },
  { date: 'Jan 6', cost: 210 },
  { date: 'Jan 7', cost: 225 },
]

const agentPerformanceData = [
  { name: 'Sales Agent', calls: 250, successRate: 78 },
  { name: 'Support Agent', calls: 320, successRate: 92 },
  { name: 'Survey Agent', calls: 180, successRate: 85 },
]

const stats = [
  {
    title: 'Total Calls',
    value: '2,345',
    change: '+12.5%',
    trend: 'up',
    icon: Phone,
  },
  {
    title: 'Avg Duration',
    value: '3:45',
    change: '+5.2%',
    trend: 'up',
    icon: Clock,
  },
  {
    title: 'Total Cost',
    value: '$1,234',
    change: '-3.1%',
    trend: 'down',
    icon: DollarSign,
  },
  {
    title: 'Success Rate',
    value: '78.5%',
    change: '+2.3%',
    trend: 'up',
    icon: CheckCircle,
  },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Insights and reports on your voice agent performance
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px] focus:ring-2 focus:ring-primary focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <p className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-600 dark:text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-600 dark:text-red-500" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                      {stat.change}
                    </span>
                    {' '}from last period
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="calls" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
            <TabsTrigger value="calls" className="text-xs sm:text-sm">Calls</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
            <TabsTrigger value="costs" className="text-xs sm:text-sm">Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Calls Over Time */}
              <Card className="hover:border-primary/40 hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">Calls Over Time</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Daily call volume trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={callsOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                      <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                      <Area
                        type="monotone"
                        dataKey="calls"
                        stroke="hsl(217, 100%, 60%)"
                        fill="hsl(217, 100%, 60%)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Calls by Status */}
              <Card className="hover:border-primary/40 hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">Calls by Status</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Distribution of call outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={callsByStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {callsByStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 sm:space-y-6">
            {/* Agent Performance */}
            <Card className="hover:border-primary/40 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">Agent Performance</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Compare agent call volumes and success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="calls" fill="hsl(217, 100%, 60%)" name="Total Calls" />
                    <Bar yAxisId="right" dataKey="successRate" fill="#10b981" name="Success Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4 sm:space-y-6">
            {/* Cost Over Time */}
            <Card className="hover:border-primary/40 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white">Cost Trends</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Daily spending on voice calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                    <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-600 dark:text-gray-400" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
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
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

