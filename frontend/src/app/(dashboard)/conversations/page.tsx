'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ConversationsPage() {
  const [dateAfter, setDateAfter] = useState(false)
  const [dateBefore, setDateBefore] = useState(false)
  const [evaluation, setEvaluation] = useState(false)
  const [agent, setAgent] = useState(false)
  const [user, setUser] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false)
  const [agentDialogOpen, setAgentDialogOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('')
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [agentSearchQuery, setAgentSearchQuery] = useState('')
  const [userId, setUserId] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)
    const days = []
    const prevMonthDays = new Date(year, month, 0).getDate()
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${i}`}
          className="h-10 w-10 text-center text-sm text-gray-400 hover:bg-gray-100 rounded"
          onClick={() => {
            const prevMonth = new Date(year, month - 1, prevMonthDays - i)
            setSelectedDate(prevMonth)
          }}
        >
          {prevMonthDays - i}
        </button>
      )
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const isToday = new Date().toDateString() === date.toDateString()
      
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-10 w-10 text-center text-sm rounded ${
            isSelected
              ? 'bg-primary text-white hover:bg-primary/90'
              : isToday
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'text-gray-900 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      )
    }
    
    // Next month days
    const totalCells = days.length
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <button
          key={`next-${i}`}
          className="h-10 w-10 text-center text-sm text-gray-400 hover:bg-gray-100 rounded"
          onClick={() => {
            const nextMonth = new Date(year, month + 1, i)
            setSelectedDate(nextMonth)
          }}
        >
          {i}
        </button>
      )
    }
    
    return days
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Call history</h1>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={dateAfter ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDateAfter(!dateAfter)
                setDatePickerOpen(true)
              }}
              className="gap-1"
            >
              + Date After
            </Button>
            <Button
              variant={dateBefore ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setDateBefore(!dateBefore)
                setDatePickerOpen(true)
              }}
              className="gap-1"
            >
              + Date Before
            </Button>
            <Button
              variant={evaluation ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setEvaluation(!evaluation)
                setEvaluationDialogOpen(true)
              }}
              className="gap-1"
            >
              + Evaluation
            </Button>
            <Button
              variant={agent ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setAgent(!agent)
                setAgentDialogOpen(true)
              }}
              className="gap-1"
            >
              + Agent
            </Button>
            <Button
              variant={user ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setUser(!user)
                setUserDialogOpen(true)
              }}
              className="gap-1"
            >
              + User
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No results
            </h3>
            <p className="text-sm text-gray-600">
              No conversations were found.
            </p>
          </div>
        </div>

        {/* User Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="max-w-sm">
            <div className="space-y-4">
              <Input
                placeholder="Enter user ID..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Agent Dialog */}
        <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
          <DialogContent className="max-w-sm">
            <div className="space-y-4">
              <Input
                placeholder="Search agents..."
                value={agentSearchQuery}
                onChange={(e) => setAgentSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="py-8 text-center text-sm text-gray-600">
                No agents found.
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Evaluation Dialog */}
        <Dialog open={evaluationDialogOpen} onOpenChange={setEvaluationDialogOpen}>
          <DialogContent className="max-w-xs">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedEvaluation('Success')
                  setEvaluationDialogOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm rounded-lg transition-colors ${
                  selectedEvaluation === 'Success'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => {
                  setSelectedEvaluation('Failure')
                  setEvaluationDialogOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm rounded-lg transition-colors ${
                  selectedEvaluation === 'Failure'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Failure
              </button>
              <button
                onClick={() => {
                  setSelectedEvaluation('Unknown')
                  setEvaluationDialogOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm rounded-lg transition-colors ${
                  selectedEvaluation === 'Unknown'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Unknown
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Date Picker Dialog */}
        <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="sr-only">Select Date</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newMonth = new Date(currentMonth)
                    newMonth.setMonth(newMonth.getMonth() - 1)
                    setCurrentMonth(newMonth)
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newMonth = new Date(currentMonth)
                    newMonth.setMonth(newMonth.getMonth() + 1)
                    setCurrentMonth(newMonth)
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                <div className="text-xs font-medium text-gray-600">Su</div>
                <div className="text-xs font-medium text-gray-600">Mo</div>
                <div className="text-xs font-medium text-gray-600">Tu</div>
                <div className="text-xs font-medium text-gray-600">We</div>
                <div className="text-xs font-medium text-gray-600">Th</div>
                <div className="text-xs font-medium text-gray-600">Fr</div>
                <div className="text-xs font-medium text-gray-600">Sa</div>
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              {/* Time Input */}
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm font-medium text-gray-900">Time</Label>
                <Input
                  type="text"
                  placeholder="--:-- --"
                  className="text-center"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

