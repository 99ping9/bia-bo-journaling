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

interface CalendarProps {
    submissions: Record<string, SubmissionType[]> // "YYYY-MM-DD": ['journal', 'mate', ...]
    onDateClick?: (date: Date) => void
    currentDate: Date
    isColumnParticipant?: boolean
}

const Calendar = ({ submissions, onDateClick, currentDate, isColumnParticipant = false }: {
    submissions: Record<string, SubmissionType[]>
    onDateClick?: (date: Date) => void
    currentDate: Date
    isColumnParticipant?: boolean
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

    const getCardStyle = (day: Date, daySubmissions: SubmissionType[], isCurrentMonth: boolean, isHoliday: boolean) => {
        if (!isCurrentMonth) return "opacity-30 grayscale"

        const requiredCount = isColumnParticipant ? 5 : 4
        const subCount = daySubmissions.length

        // Logic:
        // All Complete -> Blue Background
        // Partial (1 or more but not all) -> Red Background
        // None -> Default / Red border if past

        if (subCount >= requiredCount) {
            return "bg-blue-500 text-white shadow-md ring-1 ring-blue-500 hover:bg-blue-600"
        }

        if (subCount > 0) {
            // Partial
            return "bg-red-500 text-white shadow-md ring-1 ring-red-500 hover:bg-red-600"
        }

        const isPastOrToday = isBefore(day, new Date()) || isToday(day)

        // Holiday or Sunday => Red Text
        if (isHoliday || isSunday(day)) {
            return "bg-white text-red-500 border border-gray-100"
        }

        const isWeekend = isSaturday(day)

        if (isWeekend) {
            return "bg-white text-blue-600 border border-gray-100" // Blue for Saturday
        }

        if (isPastOrToday) {
            // If today/past and 0 submissions, essentially 'Missing' but usually we just show white/default 
            // unless we want to highlight missing days aggressively. 
            // User said "1개라도 빵꾸났으면 빨간바탕" -> implies if count < required but count > 0 is RED.
            // If count == 0, it's also "빵꾸" technically? 
            // Let's keep 0 as white/border to distinguish "started but failed" vs "didn't touch" or just adhere to "All done = Blue, Else = Red?"
            // Reviewing Request: "모든것 작성하면 ... 파란색바탕, 1개라도 빵꾸났으면 빨간바탕"
            // This implies STRICT binary: All Done vs Not All Done.
            // But usually empty future days shouldn't be red.
            // Let's make "Past days with < required" = RED Background?
            // Or "Has ANY submission but < required" = RED Background?
            // User said "제출한 갯수만큼 체크표시 숫자가 늘어나도록".

            // Let's go with:
            // If 0 submissions: distinct style (White/Gray)
            // If > 0 but < Required: Red Background
        }

        return "bg-white text-gray-700 border border-gray-100 hover:border-blue-200"
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
                        const isPartial = subCount > 0 && !isAllDone

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => onDateClick?.(day)}
                                className={cn(
                                    "aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative group",
                                    onDateClick ? "cursor-pointer hover:bg-slate-50" : "cursor-default",
                                    getCardStyle(day, daySubmissions, isCurrentMonth, isHoliday),
                                    isToday(day) && subCount === 0 && "ring-2 ring-blue-400 ring-offset-2" // Highlight today additionally
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-semibold relative z-10",
                                    // Make text white if background is colored
                                    (isAllDone || isPartial) ? "text-white" : ""
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {holidayName && (
                                    <span className={cn(
                                        "text-[10px] sm:text-xs mt-0.5 font-medium truncate w-full text-center px-1",
                                        (isAllDone || isPartial) ? "text-blue-100" : ""
                                    )}>
                                        {holidayName}
                                    </span>
                                )}

                                {subCount > 0 && (
                                    <div className="flex items-center gap-0.5 mt-1">
                                        <Check className={cn("w-3 h-3", (isAllDone || isPartial) ? "text-white" : "text-blue-500")} />
                                        <span className={cn("text-xs font-bold", (isAllDone || isPartial) ? "text-white" : "text-blue-600")}>
                                            {subCount}
                                        </span>
                                    </div>
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
