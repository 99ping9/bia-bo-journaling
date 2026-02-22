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

import { SubmissionType } from '@/types'

// Programme start date — no logging or coloring before this
const PROGRAM_START_DATE = new Date(2026, 1, 22) // Feb 22, 2026



const Calendar = ({ submissions, onDateClick, currentDate, isColumnParticipant = false, isAdminMode = false }: {
    submissions: Record<string, SubmissionType[]>
    onDateClick?: (date: Date) => void
    currentDate: Date
    isColumnParticipant?: boolean
    isAdminMode?: boolean
}) => {
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

    const getCardStyle = (day: Date, isCurrentMonth: boolean, isHoliday: boolean) => {
        if (!isCurrentMonth) return "opacity-30 grayscale"
        // Before program start: show as locked/disabled
        if (isBefore(day, PROGRAM_START_DATE)) return "bg-slate-100 text-slate-300 opacity-50"

        let baseStyle = "bg-white border "

        if (isToday(day)) {
            baseStyle += "border-blue-400 ring-2 ring-blue-100 shadow-sm "
        } else {
            baseStyle += "border-gray-100 hover:border-blue-200 "
        }

        if (isHoliday || isSunday(day)) return baseStyle + "text-red-500"
        if (isSaturday(day)) return baseStyle + "text-blue-500"

        return baseStyle + "text-gray-700"
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
                        const daySubmissions = submissions[dateKey] || []
                        const subCount = daySubmissions.length
                        const isCurrentMonth = isSameMonth(day, monthStart)
                        const holidayName = HOLIDAYS_2026[dateKey]
                        const isHoliday = !!holidayName
                        const requiredCount = isColumnParticipant ? 5 : 4
                        const isAllDone = subCount >= requiredCount
                        const isBeforeStart = isBefore(day, PROGRAM_START_DATE)
                        const today = new Date()
                        const isYesterday = isBefore(today, new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) &&
                            !isToday(day) && !isBeforeStart &&
                            isBefore(new Date(day.getFullYear(), day.getMonth(), day.getDate()), today)
                        const isClickable = !isBeforeStart && (
                            isAdminMode ||
                            isToday(day) ||
                            isYesterday
                        )

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => isClickable && onDateClick?.(day)}
                                className={cn(
                                    "aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative group",
                                    isBeforeStart ? "cursor-not-allowed" :
                                        isClickable && onDateClick ? "cursor-pointer hover:ring-2 hover:ring-blue-300" : "cursor-default",
                                    getCardStyle(day, isCurrentMonth, isHoliday)
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

                                {isAllDone ? (
                                    <div className="mt-1">
                                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md shadow-sm">
                                            100%완료!
                                        </span>
                                    </div>
                                ) : subCount > 0 ? (
                                    <div className="flex items-center gap-0.5 mt-1">
                                        <Check className="w-3 h-3 text-blue-500" />
                                        <span className="text-xs font-bold text-blue-600">
                                            {subCount}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Calendar

