import React, { useState } from 'react'
import { X, Link as LinkIcon, Send, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface SubmissionModalProps {
    isOpen: boolean
    onClose: () => void
    date: Date
    onSubmit: (link: string) => Promise<void>
    onDelete?: () => Promise<void>
    hasSubmitted?: boolean
}

const SubmissionModal = ({ isOpen, onClose, date, onSubmit, onDelete, hasSubmitted }: SubmissionModalProps) => {
    const [link, setLink] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (link.trim()) {
            setIsSubmitting(true)
            await onSubmit(link)
            setLink('')
            setIsSubmitting(false)
            onClose()
        }
    }

    const handleDelete = async () => {
        if (!onDelete) return
        if (confirm('Are you sure you want to delete this journal entry?')) {
            setIsDeleting(true)
            await onDelete()
            setIsDeleting(false)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        {hasSubmitted ? 'Manage Journal' : 'Submit Journal'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                            Selected Date
                        </label>
                        <div className="text-2xl font-bold text-slate-900">
                            {format(date, 'MMMM d, yyyy')}
                        </div>
                    </div>

                    {!hasSubmitted && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Journal Link
                            </label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://blog.naver.com/..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    required
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-slate-500 pl-1">
                                Paste the URL of your written journal (Notion, Blog, etc.)
                            </p>
                        </div>
                    )}

                    {hasSubmitted && (
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm mb-4">
                            You have already submitted a journal for this date.
                        </div>
                    )}

                    <div className="pt-2 flex justify-end gap-3">
                        {hasSubmitted && onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="mr-auto px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            disabled={isSubmitting || isDeleting}
                        >
                            Cancel
                        </button>

                        {!hasSubmitted && (
                            <button
                                type="submit"
                                disabled={isSubmitting || !link.trim()}
                                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Journal'} <Send className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SubmissionModal
