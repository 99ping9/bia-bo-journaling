
import { getAnimalAvatar } from '@/lib/utils'

interface UserStatus {
    id: string
    username: string
    hasSubmittedToday: boolean
    avatar?: string
    bg_color?: string
}

interface CommunityListProps {
    users: UserStatus[]
    onUserClick: (user: UserStatus) => void
    currentUserId?: string
}

const CommunityList = ({ users, onUserClick, currentUserId }: CommunityListProps) => {
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
                            onClick={() => onUserClick(user)}
                            className={`flex items-center p-3 rounded-xl transition-colors cursor-pointer ${isMe ? 'bg-blue-50 hover:bg-blue-100' : 'bg-slate-50/50 hover:bg-slate-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${user.bg_color || 'bg-white'} border border-slate-100 flex items-center justify-center text-xl shadow-sm transition-colors`}>
                                    {user.avatar || getAnimalAvatar(user.username)}
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                    {user.username}
                                </span>
                                {isMe && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">나</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CommunityList
