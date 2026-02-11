import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import Admin from '@/pages/Admin'
import { AuthProvider, useAuth } from '@/context/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth()

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!user) return <Navigate to="/" replace />

    return children
}

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const { isAdmin, loading } = useAuth()

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!isAdmin) return <Navigate to="/" replace />

    return children
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route element={<Layout />}>
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <Admin />
                                </AdminRoute>
                            }
                        />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
