import { Check, X } from 'lucide-react'

interface UserStatus {
    id: string
    username: string
    hasSubmittedToday: boolean
    avatar?: string
    bg_color?: string
}

interface CommunityListProps {
    users: UserStatus[]
    onUserClick: (user: UserStatus) => void // New prop
}

import { getAnimalAvatar } from '@/lib/utils'

const CommunityList = ({ users, onUserClick }: CommunityListProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                Community
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Today
                </span>
            </h3>

            <div className="space-y-3 min-h-[500px] max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {users.map((user, idx) => (
                    <div
                        key={idx}
                        onClick={() => onUserClick(user)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${user.bg_color || 'bg-white'} border border-slate-100 flex items-center justify-center text-xl shadow-sm transition-colors`}>
                                {user.avatar || getAnimalAvatar(user.username)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                {user.username}
                            </span>
                        </div>

                        <div>
                            {user.hasSubmittedToday ? (
                                <div className="w-4 h-4 rounded-full bg-green-400 shadow-sm border-2 border-green-200" title="오늘 완료!" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-red-300 shadow-sm border-2 border-red-100" title="아직..." />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CommunityList
