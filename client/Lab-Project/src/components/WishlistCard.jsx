import { useState } from 'react'
import { Link } from 'react-router-dom'

function WishlistCard({ product, onRemove }) {
    const [removing, setRemoving] = useState(false)

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const isOutOfStock = product.stock <= 0
    const isLowStock = product.stock > 0 && product.stock <= 5

    const handleRemove = async () => {
        setRemoving(true)
        await onRemove(product._id)
        setRemoving(false)
    }

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1">
            
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
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Price</span>
                        <p className="text-lg font-extrabold text-slate-900">
                            {formatCurrency(product.price)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Details */}
                        <Link
                            to={`/products/${product._id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                        >
                            View
                        </Link>

                        {/* Remove from Wishlist */}
                        <button
                            onClick={handleRemove}
                            disabled={removing}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {removing ? '⏳ Removing...' : 'Remove ♥'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WishlistCard
