import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { ANIMALS, BG_COLORS } from '@/lib/constants'
import { getAnimalAvatar } from '@/lib/utils'
import Calendar from '@/components/dashboard/Calendar'
import SubmissionModal from '@/components/dashboard/SubmissionModal'
import CommunityList from '@/components/dashboard/CommunityList'
import { Loader2, Plus, Pencil, Check } from 'lucide-react'

const Dashboard = () => {
    const { user } = useAuth()
    const [viewedUser, setViewedUser] = useState<{ id: string, username: string, avatar: string, bg_color: string } | null>(null)

    const [submissions, setSubmissions] = useState<Record<string, boolean>>({})
    const [communityStatus, setCommunityStatus] = useState<{ id: string, username: string, hasSubmittedToday: boolean, avatar?: string, bg_color?: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Name Editing State
    const [isEditingName, setIsEditingName] = useState(false)
    const [tempName, setTempName] = useState('')
    const [tempAvatar, setTempAvatar] = useState('')
    const [tempBgColor, setTempBgColor] = useState('')
    const { updateProfile } = useAuth()

    const handleUpdateName = async () => {
        if (!tempName.trim()) return

        setIsEditingName(false) // Optimistic close
        const { success, error } = await updateProfile(tempName, tempAvatar, tempBgColor)

        if (!success) {
            console.error('Update failed:', error)
            alert(typeof error === 'string' ? error : 'Failed to update profile. Check console for details.')
            setIsEditingName(true) // Re-open on error
        } else {
            await fetchData() // Refresh to show updates
        }
    }

    useEffect(() => {
        if (user) {
            // Set initial viewed user to self
            setViewedUser({
                id: user.id,
                username: user.username,
                avatar: user.avatar || '',
                bg_color: user.bg_color || ''
            })
            fetchData()
        }
    }, [user])

    // Update submissions when viewedUser changes
    useEffect(() => {
        if (viewedUser) {
            fetchUserSubmissions(viewedUser.id)
        }
    }, [viewedUser])

    const fetchUserSubmissions = async (userId: string) => {
        if (!userId) return

        // MOCK MODE
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            const mockSubMap: Record<string, boolean> = {}
            // Generate DETERMINISTIC mock data based on userId to show different data for different users
            const seed = userId.charCodeAt(0) || 0
            const today = new Date()
            for (let i = 1; i <= today.getDate(); i++) {
                // Simple pseudo-random based on day and user seed
                if ((i + seed) % 3 === 0) {
                    const d = new Date(today.getFullYear(), today.getMonth(), i)
                    mockSubMap[format(d, 'yyyy-MM-dd')] = true
                }
            }
            setSubmissions(mockSubMap)
            return
        }

        // REAL MODE
        const { data: journals, error } = await supabase
            .from('journals')
            .select('date')
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching submissions:', error)
            return
        }

        const subMap: Record<string, boolean> = {}
        journals?.forEach(j => {
            subMap[j.date] = true
        })
        setSubmissions(subMap)
    }

    const fetchData = async () => {
        try {
            setLoading(true)

            // MOCK MODE DATA
            if (import.meta.env.VITE_USE_MOCK === 'true') {
                console.log('Mock Dashboard Data Active')

                // Mock Community Status
                setCommunityStatus([
                    { id: '1', username: 'Alice', hasSubmittedToday: true, bg_color: 'bg-red-100', avatar: '🐶' },
                    { id: '2', username: 'Bob', hasSubmittedToday: false, bg_color: 'bg-blue-100', avatar: '🐱' },
                    { id: '3', username: 'Charlie', hasSubmittedToday: true, avatar: '🐯', bg_color: 'bg-yellow-100' },
                    { id: '4', username: 'David', hasSubmittedToday: false, avatar: '🦁', bg_color: 'bg-green-100' },
                    {
                        id: user?.id || 'me',
                        username: user?.username || 'You',
                        hasSubmittedToday: false, // Will be updated by logic below if we had mock submission logic consistent
                        avatar: user?.avatar,
                        bg_color: user?.bg_color
                    }
                ].sort((a, b) => {
                    if (a.hasSubmittedToday === b.hasSubmittedToday) {
                        return a.username.localeCompare(b.username)
                    }
                    return a.hasSubmittedToday ? -1 : 1
                }))

                setLoading(false)
                return
            }

            // 1. Fetch User's Submissions (This logic is moved to fetchUserSubmissions, but we keep community status fetch here)

            // 2. Fetch Community Status (Who submitted today)
            const todayStr = format(new Date(), 'yyyy-MM-dd')

            // Get all users
            const { data: allUsers, error: usersError } = await supabase
                .from('users')
                .select('id, username, avatar, bg_color') // Fetch new fields
                .order('username')

            if (usersError) throw usersError

            // Get all submissions for today
            const { data: todayJournals, error: todayError } = await supabase
                .from('journals')
                .select('user_id')
                .eq('date', todayStr)

            if (todayError) throw todayError

            const submittedUserIds = new Set(todayJournals?.map(j => j.user_id))

            const commStatus = allUsers?.map(u => ({
                id: u.id,
                username: u.username,
                hasSubmittedToday: submittedUserIds.has(u.id),
                avatar: u.avatar,
                bg_color: u.bg_color
            })).sort((a, b) => {
                if (a.hasSubmittedToday === b.hasSubmittedToday) {
                    return a.username.localeCompare(b.username)
                }
                return a.hasSubmittedToday ? -1 : 1
            }) || []

            setCommunityStatus(commStatus)

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setIsModalOpen(true)
    }

    const handleSubmit = async (link: string) => {
        if (!user) return

        const dateStr = format(selectedDate, 'yyyy-MM-dd')

        try {
            const { error } = await supabase
                .from('journals')
                .insert([
                    {
                        user_id: user.id,
                        date: dateStr,
                        link: link
                    }
                ])

            // MOCK MODE SUBMISSION
            if (import.meta.env.VITE_USE_MOCK === 'true') {
                console.log('Mock Submission Active')
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500))

                // Update local state simply by refetching (which hits mock data logic)
                // For better UX in mock, we might want to manually update state, 
                // but re-calling fetchData() which we just patched to return random data might be inconsistent.
                // Let's just alert success and generic refresh.
                alert('Mock Submission Successful!')
                await fetchData()
                return
            }

            if (error) {
                if (error.code === '23505') { // Unique violation
                    alert('You have already submitted a journal for this date.')
                } else {
                    console.error('Submission error:', error)
                    alert('Failed to submit journal. Please try again.')
                }
                return
            }

            // Refresh data
            await fetchData()

        } catch (err) {
            console.error('Unexpected error:', err)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    const today = new Date()
    const currentMonthKey = format(today, 'yyyy-MM')
    const monthlyCount = Object.keys(submissions).filter(k => k.startsWith(currentMonthKey)).length
    const isViewingSelf = viewedUser?.id === user?.id

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    {!isEditingName ? (
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full ${viewedUser?.bg_color || 'bg-white'} border border-slate-100 flex items-center justify-center text-xl shadow-sm mr-2 hidden md:flex`}>
                                {viewedUser?.avatar || getAnimalAvatar(viewedUser?.username || '')}
                            </div>
                            {isViewingSelf ? (
                                <>
                                    안녕하세요, <span className="text-blue-600">{user?.username}</span>님!
                                    <button
                                        onClick={() => {
                                            setTempName(user?.username || '')
                                            setTempAvatar(user?.avatar || getAnimalAvatar(user?.username || ''))
                                            setTempBgColor(user?.bg_color || 'bg-slate-100')
                                            setIsEditingName(true)
                                        }}
                                        className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                                        title="Edit Profile"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-blue-600">{viewedUser?.username}</span>님의 저널링 기록
                                    <button
                                        onClick={() => user && setViewedUser({
                                            id: user.id,
                                            username: user.username,
                                            avatar: user.avatar || '',
                                            bg_color: user.bg_color || ''
                                        })}
                                        className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                                    >
                                        내 기록으로 돌아가기
                                    </button>
                                </>
                            )}
                        </h1>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 absolute z-20 shadow-xl mt-[-20px] ml-[-20px] animate-in fade-in zoom-in-95 duration-200 w-[320px]">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Edit Profile</h3>

                            {/* Name Input */}
                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="text-lg font-bold border-b-2 border-blue-500 focus:outline-none px-1 py-0.5 text-slate-800 w-full"
                                    autoFocus
                                    placeholder="Your Name"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateName()
                                        if (e.key === 'Escape') setIsEditingName(false)
                                    }}
                                />
                            </div>

                            {/* Avatar Control */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-14 h-14 rounded-full ${tempBgColor} border border-slate-200 flex items-center justify-center text-3xl shadow-sm transition-colors shrink-0`}>
                                    {tempAvatar}
                                </div>
                                <button
                                    onClick={() => setTempAvatar(ANIMALS[Math.floor(Math.random() * ANIMALS.length)])}
                                    className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium transition-colors flex-1"
                                >
                                    🎲 Random Animal
                                </button>
                            </div>

                            {/* Color Control */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-slate-400 mb-2 block">Background Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {BG_COLORS.map(color => (
                                        <button
                                            key={color}
                                            className={`w-6 h-6 rounded-full ${color} border-2 ${tempBgColor === color ? 'border-slate-600 scale-110' : 'border-transparent hover:border-slate-300'} transition-all`}
                                            onClick={() => setTempBgColor(color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsEditingName(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-medium text-sm">
                                    Cancel
                                </button>
                                <button onClick={handleUpdateName} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Save
                                </button>
                            </div>
                        </div>
                    )}
                    <p className="text-slate-500 mt-1">
                        이번달 저널링 횟수 : <span className="font-bold text-slate-800">{monthlyCount}</span>회
                    </p>
                </div>

                {isViewingSelf && (
                    <button
                        onClick={() => handleDateClick(new Date())}
                        className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Log Today
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Calendar */}
                <div className="lg:col-span-2 space-y-6">
                    <Calendar
                        submissions={submissions}
                        onDateClick={isViewingSelf ? handleDateClick : undefined}
                        currentDate={today}
                    />
                </div>

                {/* Sidebar: Community */}
                <div className="space-y-6">
                    <CommunityList
                        users={communityStatus}
                        onUserClick={(u) => setViewedUser({
                            id: u.id,
                            username: u.username,
                            avatar: u.avatar || '',
                            bg_color: u.bg_color || ''
                        })}
                    />

                </div>
            </div>

            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                date={selectedDate}
                onSubmit={handleSubmit}
                onDelete={async () => {
                    if (!user) return
                    const dateStr = format(selectedDate, 'yyyy-MM-dd')

                    // MOCK DELETE
                    if (import.meta.env.VITE_USE_MOCK === 'true') {
                        alert('Mock Delete Successful!')
                        await fetchData()
                        return
                    }

                    try {
                        const { error } = await supabase
                            .from('journals')
                            .delete()
                            .eq('user_id', user.id)
                            .eq('date', dateStr)

                        if (error) {
                            console.error('Delete error:', error)
                            alert('Failed to delete journal.')
                            return
                        }
                        await fetchData()
                    } catch (err) {
                        console.error('Unexpected error:', err)
                        alert('An unexpected error occurred.')
                    }
                }}
                hasSubmitted={!!submissions[format(selectedDate, 'yyyy-MM-dd')]}
            />
        </div>
    )
}

export default Dashboard
