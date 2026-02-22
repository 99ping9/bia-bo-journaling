
import { getAnimalAvatar } from '@/lib/utils'
import { X } from 'lucide-react'

interface UserStatus {
    id: string
    username: string
    hasSubmittedToday: boolean
    avatar?: string
    bg_color?: string
    lastWeekFine?: number
}

interface CommunityListProps {
    users: UserStatus[]
    onUserClick: (user: UserStatus) => void
    currentUserId?: string
    isAdminMode?: boolean
    onDeleteUser?: (userId: string, username: string) => void
}

const CommunityList = ({ users, onUserClick, currentUserId, isAdminMode, onDeleteUser }: CommunityListProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                Community
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Today
                </span>
            </h3>

            <div className="space-y-3 min-h-[500px] max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {users.map((user, idx) => {
                    const isMe = user.id === currentUserId
                    return (
                        <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${isMe ? 'bg-blue-50 hover:bg-blue-100' : 'bg-slate-50/50 hover:bg-slate-100'}`}
                        >
                            <div className="flex items-center gap-3 flex-1" onClick={() => onUserClick(user)}>
                                <div className={`w-10 h-10 rounded-full ${user.bg_color || 'bg-white'} border border-slate-100 flex items-center justify-center text-xl shadow-sm transition-colors`}>
                                    {user.avatar || getAnimalAvatar(user.username)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-700">
                                        {user.username}
                                    </span>
                                    {(user.lastWeekFine ?? 0) > 0 && (
                                        <span className="text-[10px] text-red-500 font-semibold">
                                            벌금 {user.lastWeekFine?.toLocaleString()}원
                                        </span>
                                    )}
                                </div>
                                {isMe && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold ml-1">나</span>
                                )}
                            </div>

                            {isAdminMode && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteUser?.(user.id, user.username)
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2"
                                    title="사용자 삭제"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CommunityList
