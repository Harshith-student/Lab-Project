import { useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useCart } from '../context/CartContext' // <-- Import useCart

function ProductCard({ product }) {
    const { addToCart, cart } = useCart() // <-- Get addToCart & cart state
    const [wishlistStatus, setWishlistStatus] = useState('idle')
    const [cartStatus, setCartStatus] = useState('idle') // 'idle' | 'adding' | 'error'
    const [errorMessage, setErrorMessage] = useState('')

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const isOutOfStock = product.stock <= 0
    const isLowStock = product.stock > 0 && product.stock <= 5

    // Check if item is already in cart to display quantity if needed
    const cartItem = cart.find(item => item.product?._id === product._id)

    const handleAddToWishlist = async () => {
        if (wishlistStatus === 'saving' || wishlistStatus === 'added') return

        setWishlistStatus('saving')
        setErrorMessage('')

        try {
            const response = await axiosInstance.post(`/wishlist/${product._id}`)
            if (response.data?.success) {
                setWishlistStatus('added')
            }
        } catch (err) {
            setWishlistStatus('error')
            if (err.response?.status === 409) {
                setWishlistStatus('added')
            } else {
                setErrorMessage(err.response?.data?.message || "Unable to save product. Please try again.")
            }
        }
    }

    // Add to Cart handler
    const handleAddToCart = async () => {
        if (isOutOfStock || cartStatus === 'adding') return

        setCartStatus('adding')
        setErrorMessage('')

        const result = await addToCart(product._id)
        if (result.success) {
            setCartStatus('idle')
        } else {
            setCartStatus('error')
            setErrorMessage(result.message)
        }
    }

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1">
            
            {/* Category & Stock Badges */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-100">
                    {product.category}
                </span>

                {isOutOfStock ? (
                    <span className="rounded-full bg-rose-500/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        Out of Stock
                    </span>
                ) : isLowStock ? (
                    <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        Only {product.stock} left
                    </span>
                ) : (
                    <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        {product.stock} in stock
                    </span>
                )}
            </div>

            {/* Product Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';
                    }}
                />
            </div>

            {/* Details Section */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <p className="mt-2 text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                        {errorMessage}
                    </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Price</span>
                            <p className="text-lg font-extrabold text-slate-900">
                                {formatCurrency(product.price)}
                            </p>
                        </div>

                        {/* Wishlist Button */}
                        <button
                            onClick={handleAddToWishlist}
                            disabled={wishlistStatus === 'saving'}
                            title="Add to Wishlist"
                            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all border ${
                                wishlistStatus === 'added'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200 border-slate-200'
                            }`}
                        >
                            {wishlistStatus === 'added' ? '♥ Added' : '♡ Wishlist'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* View Details */}
                        <Link
                            to={`/products/${product._id}`}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all active:scale-95 text-center"
                        >
                            View Details
                        </Link>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || cartStatus === 'adding'}
                            className={`inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-95 ${
                                isOutOfStock
                                    ? 'bg-slate-300 shadow-none cursor-not-allowed'
                                    : cartStatus === 'adding'
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                        >
                            {cartStatus === 'adding' ? (
                                '⏳ Adding...'
                            ) : cartItem ? (
                                `🛒 Add (${cartItem.quantity})`
                            ) : (
                                '🛒 Add to Cart'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
