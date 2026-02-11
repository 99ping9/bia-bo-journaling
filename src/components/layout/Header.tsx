import { Link, useLocation } from 'react-router-dom'
import { Calendar, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const Header = () => {
    const location = useLocation()
    const { user, logout } = useAuth()

    const isActive = (path: string) => location.pathname === path

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

                    <nav className="flex space-x-8">
                        <Link
                            to="/dashboard"
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-sky-600",
                                isActive('/dashboard') ? "text-sky-600" : "text-gray-500"
                            )}
                        >
                            <Calendar className="w-4 h-4" />
                            내 저널링기록
                        </Link>
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
