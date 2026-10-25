import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import WishlistCard from '../components/WishlistCard'

function Wishlist() {
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch user's wishlist from API
    const fetchWishlist = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axiosInstance.get('/wishlist')
            if (response.data && response.data.wishlist) {
                // Filter out any null entries if a product was deleted from DB
                const validItems = response.data.wishlist.filter(item => item !== null)
                setWishlist(validItems)
            } else {
                setWishlist([])
            }
        } catch (err) {
            console.error("Error fetching wishlist:", err)
            setError(err.response?.data?.message || "We couldn't load your wishlist. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [])

    // Handle removing item without full page refresh
    const handleRemoveFromWishlist = async (productId) => {
        try {
            const response = await axiosInstance.delete(`/wishlist/${productId}`)
            if (response.data?.success) {
                setWishlist(prev => prev.filter(item => item._id !== productId))
            }
        } catch (err) {
            console.error("Failed to remove item:", err)
            alert(err.response?.data?.message || "Failed to remove item from wishlist.")
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                            My Wishlist <span className="text-rose-500">❤️</span>
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved for later
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 self-start sm:self-auto"
                    >
                        Explore More Products
                    </Link>
                </div>

                {/* --- STATE 1: LOADING STATE --- */}
                {loading && (
                    <div className="space-y-6 py-12 text-center">
                        <div className="inline-flex items-center gap-3 text-slate-600 font-semibold text-sm bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            Loading your wishlist...
                        </div>
                    </div>
                )}

                {/* --- STATE 2: ERROR STATE --- */}
                {!loading && error && (
                    <div className="rounded-3xl bg-red-50/80 p-8 border border-red-200 text-center max-w-lg mx-auto space-y-4 shadow-sm my-12">
                        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-red-900">Something went wrong.</h3>
                        <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={fetchWishlist}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-all active:scale-95 shadow-md shadow-red-200"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* --- STATE 3: EMPTY STATE --- */}
                {!loading && !error && wishlist.length === 0 && (
                    <div className="rounded-3xl bg-white p-12 border border-slate-200/80 text-center max-w-md mx-auto space-y-5 shadow-sm my-12">
                        <div className="mx-auto h-20 w-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-4xl shadow-inner">
                            ❤️
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-800">Your wishlist is empty</h3>
                            <p className="text-sm text-slate-500">
                                Save products you love and find them here later.
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-200"
                        >
                            Browse Products
                        </Link>
                    </div>
                )}

                {/* --- DYNAMIC WISHLIST GRID --- */}
                {!loading && !error && wishlist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemoveFromWishlist}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Wishlist
