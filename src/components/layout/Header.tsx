import { Link, useLocation } from 'react-router-dom'
import { LogOut, Gamepad2, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const Header = () => {
    const location = useLocation()
    const { user, logout } = useAuth()

    if (location.pathname === '/') return null

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                            Morning Journal
                        </Link>
                    </div>

                    <nav className="flex space-x-6 sm:space-x-8">
                        <a
                            href="https://43-token-game.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-sky-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
                        >
                            <Gamepad2 className="w-4 h-4 text-sky-500" />
                            가치토큰GAME
                        </a>
                        <a
                            href="https://www.notion.so/CRACK-TIME-2c9cab30adb78059b07ef731e9ec0a37"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-sky-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
                        >
                            <Clock className="w-4 h-4 text-sky-500" />
                            <span className="hidden sm:inline">크랙타임(~요일 오후9시)</span>
                            <span className="sm:hidden">크랙타임</span>
                        </a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">
                            {user?.username}
                        </span>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
