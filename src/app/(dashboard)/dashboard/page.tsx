'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/app-layout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart3, 
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Check,
  Plus,
  Bot
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Mock data - in real app, this would come from API
const stats = [
  {
    title: 'Number of calls',
    value: '0',
  },
  {
    title: 'Average duration',
    value: '0:00',
  },
  {
    title: 'Total cost',
    value: '0',
    unit: 'credits',
  },
  {
    title: 'Average cost',
    value: '0',
    unit: 'credits/call',
  },
  {
    title: 'Total LLM cost',
    value: '$0',
  },
  {
    title: 'Average LLM cost',
    value: '$0',
    unit: '/min',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [selectedRange, setSelectedRange] = useState('Last month')
  const [selectedCard, setSelectedCard] = useState<number | null>(null) // No card selected by default
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showAddChart, setShowAddChart] = useState(false)
  const [chartType, setChartType] = useState<'evaluation' | 'datacollection' | ''>('')
  const [criteriaId, setCriteriaId] = useState('')
  const [chartName, setChartName] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date)
      setEndDate(null)
    } else {
      if (date >= startDate) {
        setEndDate(date)
      } else {
        setEndDate(startDate)
        setStartDate(date)
      }
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', { 
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateInRange = (date: Date) => {
    if (!startDate) return false
    if (!endDate) return date.toDateString() === startDate.toDateString()
    return date >= startDate && date <= endDate
  }

  const renderCalendar = (monthDate: Date) => {
    const daysInMonth = getDaysInMonth(monthDate)
    const firstDay = getFirstDayOfMonth(monthDate)
    const days = []
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
      const isSelected = isDateInRange(date)
      const isStart = startDate && date.toDateString() === startDate.toDateString()
      const isEnd = endDate && date.toDateString() === endDate.toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          className={`h-8 flex items-center justify-center text-sm transition-colors rounded
            ${isSelected ? 'bg-primary text-white' : 'hover:bg-primary/10 text-gray-900 dark:text-gray-300'}
            ${isStart || isEnd ? 'font-semibold' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    return (
      <div className="flex-1">
        <div className="font-semibold text-center mb-3 text-gray-900 dark:text-white">{monthName}</div>
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2 text-center font-medium">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)

  const handleRangeSelect = (range: string) => {
    if (range === 'Custom range...') {
      setShowDatePicker(true)
    } else {
      setSelectedRange(range)
    }
  }

  const applyDateRange = () => {
    if (startDate && endDate) {
      setSelectedRange('Custom range')
      setShowDatePicker(false)
    }
  }

  const clearDateRange = () => {
    setStartDate(null)
    setEndDate(null)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Status Bar */}
        <div className="flex items-center justify-start flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-full bg-white dark:bg-black whitespace-nowrap">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Active calls: <strong className="text-gray-900 dark:text-white">0</strong></span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">My Workspace</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Good evening, Sai</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button 
              variant="default"
              size="sm" 
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
              onClick={() => router.push('/agents')}
            >
              <Bot className="h-4 w-4" />
              Create Agent
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  All agents
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search agents..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                <DropdownMenuItem className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900">
                  <span className="text-gray-900 dark:text-white">All agents</span>
                  <Check className="h-4 w-4 text-primary" />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                <div className="px-2 py-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-500">No agents found</p>
                  </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  {selectedRange}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-900">
                <DropdownMenuItem onClick={() => setSelectedRange('Last day')} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white">
                  Last day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRange('Last week')} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white">
                  Last week
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSelectedRange('Last month')}
                  className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <span>Last month</span>
                  {selectedRange === 'Last month' && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRange('Last 3 months')} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white">
                  Last 3 months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRange('Last 6 months')} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white">
                  Last 6 months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRange('Last year')} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white">
                  Last year
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-900" />
                <DropdownMenuItem onClick={() => handleRangeSelect('Custom range...')} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white">
                  Custom range...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
                  </div>
        </div>

        {/* Add Chart Dialog */}
        <Dialog open={showAddChart} onOpenChange={setShowAddChart}>
          <DialogContent className="max-w-lg bg-white dark:bg-black border-gray-200 dark:border-gray-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                <Plus className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                Add new chart
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {chartType === 'evaluation' ? (
                <>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">Evaluation criteria chart</span>
                      <span className="text-gray-600 dark:text-gray-400"> shows the result (successful, failed, or unknown) of the given criteria over time.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="criteria-id" className="text-sm font-medium text-gray-900 dark:text-white">
                      Criteria ID
                    </Label>
                    <Select value={criteriaId} onValueChange={setCriteriaId}>
                      <SelectTrigger id="criteria-id" className="w-full">
                        <SelectValue placeholder="Select criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="criteria-1">Criteria 1</SelectItem>
                        <SelectItem value="criteria-2">Criteria 2</SelectItem>
                        <SelectItem value="criteria-3">Criteria 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chart-name" className="text-sm font-medium text-gray-900 dark:text-white">
                      Chart name
                    </Label>
                    <Input
                      id="chart-name"
                      value={chartName}
                      onChange={(e) => setChartName(e.target.value)}
                      placeholder="Enter chart name"
                      className="w-full"
                    />
                  </div>
                </>
              ) : chartType === 'datacollection' ? (
                <>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">Data collection chart</span>
                      <span className="text-gray-600 dark:text-gray-400"> shows the summary of data collected in the given period.</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="datacollection-id" className="text-sm font-medium text-gray-900 dark:text-white">
                      Data collection ID
                    </Label>
                    <Select value={criteriaId} onValueChange={setCriteriaId}>
                      <SelectTrigger id="datacollection-id" className="w-full">
                        <SelectValue placeholder="Select data collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collection-1">Collection 1</SelectItem>
                        <SelectItem value="collection-2">Collection 2</SelectItem>
                        <SelectItem value="collection-3">Collection 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chart-name-dc" className="text-sm font-medium text-gray-900 dark:text-white">
                      Chart name
                    </Label>
                    <Input
                      id="chart-name-dc"
                      value={chartName}
                      onChange={(e) => setChartName(e.target.value)}
                      placeholder="Enter chart name"
                      className="w-full"
                    />
                  </div>
                </>
              ) : null}
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddChart(false)
                  setChartType('')
                  setCriteriaId('')
                  setChartName('')
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  console.log('Adding chart:', { chartType, criteriaId, chartName })
                  setShowAddChart(false)
                  setChartType('')
                  setCriteriaId('')
                  setChartName('')
                }}
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Custom Date Range Dialog */}
        <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
          <DialogContent className="max-w-3xl bg-white dark:bg-black border-gray-200 dark:border-gray-900">
            <div className="space-y-4">
              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2 text-gray-900 dark:text-white">Start</label>
                  <Input
                    value={formatDate(startDate)}
                    placeholder="MM/DD/YYYY HH:MM AM/PM"
                    readOnly
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2 text-gray-900 dark:text-white">End</label>
                  <Input
                    value={formatDate(endDate)}
                    placeholder="MM/DD/YYYY HH:MM AM/PM"
                    readOnly
                    className="w-full"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full text-gray-900 dark:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full text-gray-900 dark:text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Calendars */}
              <div className="flex gap-8">
                {renderCalendar(currentMonth)}
                {renderCalendar(nextMonth)}
              </div>

              {/* Quick Select */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-900">
                <button
                  onClick={() => {
                    const today = new Date()
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                    setStartDate(lastMonth)
                    setEndDate(today)
                  }}
                  className="text-sm text-primary hover:bg-primary/10 hover:text-primary/90 px-3 py-2 rounded font-medium transition-colors"
                >
                  Last month
                </button>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={clearDateRange}
              >
                Clear
              </Button>
              <Button
                onClick={applyDateRange}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className={`cursor-pointer transition-all ${
                selectedCard === index 
                  ? 'border-2 border-primary shadow-lg shadow-primary/20' 
                  : 'border border-gray-200 dark:border-gray-900 hover:shadow-md hover:border-primary/40'
              }`}
              onClick={() => setSelectedCard(index)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-400 leading-tight">
                  {stat.title}
                </CardTitle>
                {selectedCard === index && (
                  <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary flex-shrink-0">
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-2 sm:p-3 pt-0">
                <div className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                  {stat.unit && <span className="text-xs font-normal text-gray-600 dark:text-gray-400 ml-1 block sm:inline">{stat.unit}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Metrics Section */}
        <Card className="border-gray-200 dark:border-gray-900">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No metrics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
              There are no metrics for the specified period.
            </p>
          </CardContent>
        </Card>

        {/* Overall Success Rate */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary/10"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall success rate</h2>
          </div>
          <Card className="border-gray-200 dark:border-gray-900">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No metrics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                There are no metrics for the specified period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
