import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext' // <-- Import useCart

function Navbar() {
    const { user, logout } = useAuth()
    const { cartCount } = useCart() // <-- Get cartCount from context
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                {/* Logo & Brand */}
                <Link to={user ? "/home" : "/login"} className="flex items-center gap-2.5 group">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                        SK
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                            ShopKart
                        </span>
                    </div>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {user ? (
                        <>
                            <nav className="flex items-center gap-1 sm:gap-2">
                                <Link 
                                    to="/home" 
                                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                                        isActive('/home') 
                                            ? 'bg-indigo-50 text-indigo-700' 
                                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'
                                    }`}
                                >
                                    Home
                                </Link>

                                <Link 
                                    to="/products" 
                                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                                        isActive('/products') || location.pathname.startsWith('/products/')
                                            ? 'bg-indigo-50 text-indigo-700' 
                                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'
                                    }`}
                                >
                                    Products
                                </Link>

                                <Link 
                                    to="/wishlist" 
                                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                        isActive('/wishlist') 
                                            ? 'bg-rose-50 text-rose-600 font-bold' 
                                            : 'text-slate-600 hover:text-rose-600 hover:bg-slate-100/70'
                                    }`}
                                >
                                    <span>♡</span> Wishlist
                                </Link>

                                {/* NEW: Cart Link with Dynamic Count */}
                                <Link 
                                    to="/cart" 
                                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                        isActive('/cart') 
                                            ? 'bg-indigo-50 text-indigo-700 font-bold' 
                                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'
                                    }`}
                                >
                                    <span>🛒</span> Cart ({cartCount})
                                </Link>

                                {/* My Orders Link */}
                                <Link 
                                    to="/orders" 
                                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                        isActive('/orders') || location.pathname.startsWith('/orders/')
                                            ? 'bg-indigo-50 text-indigo-700 font-bold' 
                                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'
                                    }`}
                                >
                                    <span>📦</span> Orders
                                </Link>
                            </nav>

                            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                                <div className="hidden md:flex flex-col text-right">
                                    <span className="text-xs font-semibold text-slate-900 truncate max-w-30">
                                        {user.fullName || "User"}
                                    </span>
                                    <span className="text-[10px] text-slate-500 truncate max-w-30">
                                        {user.email}
                                    </span>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                                    {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all active:scale-95 shadow-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-xl transition-all"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-95"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
