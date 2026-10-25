import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { axiosInstance } from '../axiosCalls/axios'

function Home() {
    const { user, setUser, logout } = useAuth()
    const navigate = useNavigate()
    const [fetching, setFetching] = useState(false)
    const [freshUser, setFreshUser] = useState(user)

    useEffect(() => {
        let isMounted = true
        const fetchMe = async () => {
            setFetching(true)
            try {
                const response = await axiosInstance.get('/customers/me')
                if (isMounted && response.data && response.data.customerData) {
                    setFreshUser(response.data.customerData)
                    setUser(response.data.customerData)
                }
            } catch (err) {
                console.error("Error fetching /customers/me:", err)
            } finally {
                if (isMounted) setFetching(false)
            }
        }
        fetchMe()
        return () => { isMounted = false }
    }, [setUser])

    const currentUser = freshUser || user

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-8 sm:p-10 text-white shadow-xl shadow-indigo-200/50">
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Customer Account Active
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Welcome to ShopKart, {currentUser?.fullName || "Valued Customer"}! 👋
                        </h1>
                        <p className="text-indigo-100 text-sm sm:text-base max-w-xl">
                            Explore our product catalogue, filter by categories, search items, and discover great deals.
                        </p>
                        
                        <div className="pt-2 flex flex-wrap gap-3">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-md hover:bg-indigo-50 transition-all active:scale-95"
                            >
                                Browse Product Catalogue 🛒
                            </Link>
                        </div>
                    </div>
                    {/* Decorative Background Glows */}
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
                </div>

                {/* Quick Catalogue Shortcut */}
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Explore Product Categories</h2>
                            <p className="text-sm text-slate-500">Jump directly into category browsing</p>
                        </div>
                        <Link to="/products" className="text-xs font-bold text-indigo-600 hover:underline">
                            View All Products →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { name: 'Electronics', icon: '⚡', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                            { name: 'Fashion', icon: '👔', color: 'bg-purple-50 text-purple-700 border-purple-100' },
                            { name: 'Books', icon: '📚', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                            { name: 'Home', icon: '🏠', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
                        ].map((cat) => (
                            <Link
                                key={cat.name}
                                to={`/products?category=${cat.name}`}
                                className={`rounded-2xl p-5 border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-md ${cat.color}`}
                            >
                                <span className="text-3xl">{cat.icon}</span>
                                <span className="text-sm font-bold">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Profile Details Card */}
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/80 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Customer Profile</h2>
                            <p className="text-sm text-slate-500">Authenticated customer information from <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono">GET /customers/me</code></p>
                        </div>
                        {fetching && (
                            <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                                Syncing data...
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl bg-slate-50/70 p-5 border border-slate-100 space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Full Name
                            </span>
                            <p className="text-lg font-bold text-slate-800">
                                {currentUser?.fullName || "N/A"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50/70 p-5 border border-slate-100 space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Email Address
                            </span>
                            <p className="text-lg font-bold text-slate-800 break-all">
                                {currentUser?.email || "N/A"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50/70 p-5 border border-slate-100 space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Phone Number
                            </span>
                            <p className="text-lg font-bold text-slate-800">
                                {currentUser?.phone || "N/A"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50/70 p-5 border border-slate-100 space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Customer ID
                            </span>
                            <p className="text-sm font-mono font-semibold text-slate-600 break-all">
                                {currentUser?._id || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Authenticated via HttpOnly Cookie
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all active:scale-95 shadow-sm"
                        >
                            Log out of ShopKart
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Home