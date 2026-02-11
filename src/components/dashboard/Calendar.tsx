import { useState } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    isToday,
    isBefore,
    isSaturday,
    isSunday
} from 'date-fns'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarProps {
    submissions: Record<string, boolean> // "YYYY-MM-DD": true
    onDateClick?: (date: Date) => void
    currentDate: Date
}

const Calendar = ({ submissions, onDateClick, currentDate }: CalendarProps) => {
    const [viewDate, setViewDate] = useState(currentDate)

    const nextMonth = () => setViewDate(addMonths(viewDate, 1))
    const prevMonth = () => setViewDate(subMonths(viewDate, 1))

    const monthStart = startOfMonth(viewDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // 2026 Holidays
    const HOLIDAYS_2026: Record<string, string> = {
        '2026-01-01': '신정',
        '2026-02-16': '설날',
        '2026-02-17': '설날',
        '2026-02-18': '설날',
        '2026-03-01': '삼일절',
        '2026-03-02': '대체공휴일',
        '2026-05-05': '어린이날',
        '2026-05-24': '부처님오신날',
        '2026-05-25': '대체공휴일',
        '2026-06-06': '현충일',
        '2026-08-15': '광복절',
        '2026-08-17': '대체공휴일',
        '2026-09-24': '추석',
        '2026-09-25': '추석',
        '2026-09-26': '추석',
        '2026-09-28': '대체공휴일',
        '2026-10-03': '개천절',
        '2026-10-05': '대체공휴일',
        '2026-10-09': '한글날',
        '2026-12-25': '성탄절'
    }

    const getCardStyle = (day: Date, isSubmitted: boolean, isCurrentMonth: boolean, isHoliday: boolean) => {
        if (!isCurrentMonth) return "opacity-30 grayscale"

        // Handle Submitted State with specific overrides for Holidays/Weekends
        if (isSubmitted) {
            if (isHoliday || isSunday(day)) {
                return "bg-blue-50 text-red-500 shadow-md ring-1 ring-blue-500 font-bold hover:text-red-600"
            }
            if (isSaturday(day)) {
                return "bg-blue-50 text-blue-600 shadow-md ring-1 ring-blue-500 font-bold hover:text-blue-700"
            }
            return "bg-blue-500 text-white shadow-md ring-1 ring-blue-500 hover:text-slate-900"
        }

        const isPastOrToday = isBefore(day, new Date()) || isToday(day)

        // Holiday or Sunday => Red
        if (isHoliday || isSunday(day)) {
            return "bg-white text-red-500 border border-gray-100" // Red for holidays/Sundays
        }

        const isWeekend = isSaturday(day)

        if (isWeekend) {
            return "bg-white text-blue-600 border border-gray-100" // Blue for Saturday
        }

        if (isPastOrToday) {
            return "bg-red-50 text-red-900 border border-red-100" // Missing
        }

        return "bg-white text-gray-700 border border-gray-100 hover:border-blue-200"
    }

    // Helper to determine checkmark color
    const getCheckColor = (day: Date, isSubmitted: boolean, isHoliday: boolean) => {
        if (!isSubmitted) return ""
        // If it's a holiday/weekend submitted (bg-blue-50), use blue check
        if (isHoliday || isSunday(day) || isSaturday(day)) {
            return "text-blue-500"
        }
        // Default submitted (bg-blue-500), use white check
        return "text-white"
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">
                    {format(viewDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-7 mb-4">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {calendarDays.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd')
                        const isSubmitted = submissions[dateKey] // logic handled in parent
                        const isCurrentMonth = isSameMonth(day, monthStart)
                        const holidayName = HOLIDAYS_2026[dateKey]
                        const isHoliday = !!holidayName

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => onDateClick?.(day)}
                                className={cn(
                                    "aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative group",
                                    onDateClick ? "cursor-pointer hover:bg-slate-50" : "cursor-default",
                                    getCardStyle(day, !!isSubmitted, isCurrentMonth, isHoliday),
                                    isToday(day) && !isSubmitted && "ring-2 ring-blue-400 ring-offset-2" // Highlight today additionally
                                )}
                            >
                                <span className="text-sm font-semibold relative z-10">
                                    {format(day, 'd')}
                                </span>
                                {holidayName && (
                                    <span className="text-[10px] sm:text-xs mt-0.5 font-medium truncate w-full text-center px-1">
                                        {holidayName}
                                    </span>
                                )}
                                {isSubmitted && (
                                    <Check className={cn("w-4 h-4 mt-1 opacity-80", getCheckColor(day, !!isSubmitted, isHoliday))} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Calendar
