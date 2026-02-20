import React, { useState, useEffect } from 'react'
import { X, Link as LinkIcon, Send, Calendar as CalendarIcon, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { SubmissionType, SUBMISSION_TYPES } from '@/types'

interface SubmissionModalProps {
    isOpen: boolean
    onClose: () => void
    date: Date
    onSubmit: (data: { link: string, type: SubmissionType, amount?: number }) => Promise<void>
    onDelete?: () => Promise<void> // Kept for interface compatibility but unused for now in multi-mode
    submittedTypes: SubmissionType[]
    isColumnParticipant: boolean
}

const SubmissionModal = ({ isOpen, onClose, date, onSubmit, submittedTypes, isColumnParticipant }: SubmissionModalProps) => {
    const [selectedType, setSelectedType] = useState<SubmissionType>('journal')
    const [link, setLink] = useState('')
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setLink('')
            setAmount('')
            setSelectedType('journal')
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (selectedType === 'account' && !amount) return
        if (['journal', 'thread', 'column'].includes(selectedType) && !link.trim()) return

        setIsSubmitting(true)

        // For 'mate', there's no URL - send a default value so DB doesn't reject it
        const contentToSubmit = selectedType === 'mate' ? 'completed' : link

        await onSubmit({
            type: selectedType,
            link: contentToSubmit,
            amount: selectedType === 'account' ? parseInt(amount.replace(/,/g, ''), 10) : undefined
        })

        setIsSubmitting(false)
        onClose()
    }

    const isSubmitted = submittedTypes.includes(selectedType)
    const isDisabled = selectedType === 'column' && !isColumnParticipant

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        기록하기 <span className="text-slate-400 text-sm font-normal">| {format(date, 'MM.dd')}</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 bg-white border-b border-slate-100 overflow-x-auto shrink-0">
                    <div className="flex gap-2 min-w-max">
                        {SUBMISSION_TYPES.map(type => {
                            const isDone = submittedTypes.includes(type.id)
                            const isSelected = selectedType === type.id
                            const isActive = isColumnParticipant || type.id !== 'column'

                            if (!isActive) return null

                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-1.5 ${isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                                        : isDone
                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                                    {type.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {isDisabled ? (
                        <div className="text-center py-10 text-slate-400">
                            칼럼 챌린지에 참여하고 있지 않습니다.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {(selectedType === 'journal' || selectedType === 'thread' || selectedType === 'column') && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Link URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder={selectedType === 'column' ? "Notion or Blog URL" : "URL을 입력해주세요"}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    {selectedType === 'column' && (
                                        <p className="text-xs text-slate-400">
                                            * 사진 업로드는 준비중입니다. URL로 인증해주세요.
                                        </p>
                                    )}
                                </div>
                            )}

                            {selectedType === 'account' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">오늘 사용한 금액</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₩</div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="금액 입력"
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-lg"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedType === 'mate' && (
                                <div className="py-4">
                                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-sm">메이트 콜 인증</h4>
                                            <p className="text-blue-700 text-xs mt-1">오늘 메이트와 통화를 완료하셨나요?</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? '저장 중... ✈' : isSubmitted ? '수정하기 ✏️' : '인증하기'} <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SubmissionModal
