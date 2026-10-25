import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart()
    const [updating, setUpdating] = useState(false)
    const [removing, setRemoving] = useState(false)
    const [itemError, setItemError] = useState('')

    const product = item.product || {}
    const quantity = item.quantity || 1

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const itemSubtotal = (product.price || 0) * quantity
    const isMaxStock = quantity >= product.stock

    const handleIncrease = async () => {
        if (quantity >= product.stock || updating) return
        setUpdating(true)
        setItemError('')
        const res = await updateQuantity(product._id, quantity + 1)
        if (!res.success) {
            setItemError(res.message)
        }
        setUpdating(false)
    }

    const handleDecrease = async () => {
        if (quantity <= 1 || updating) return
        setUpdating(true)
        setItemError('')
        const res = await updateQuantity(product._id, quantity - 1)
        if (!res.success) {
            setItemError(res.message)
        }
        setUpdating(false)
    }

    const handleRemove = async () => {
        setRemoving(true)
        await removeFromCart(product._id)
        setRemoving(false)
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs transition-all hover:border-indigo-100 hover:shadow-md">
            
            {/* Product Image & Details */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 rounded-2xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';
                    }}
                />
                <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {product.category}
                    </span>
                    <Link
                        to={`/products/${product._id}`}
                        className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors line-clamp-1 block"
                    >
                        {product.name}
                    </Link>
                    <p className="text-xs text-slate-500 font-medium">
                        Unit Price: <span className="font-semibold text-slate-700">{formatCurrency(product.price)}</span>
                    </p>
                    {isMaxStock && (
                        <p className="text-[11px] text-amber-600 font-medium">
                            Max available stock reached ({product.stock} units)
                        </p>
                    )}
                    {itemError && (
                        <p className="text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                            {itemError}
                        </p>
                    )}
                </div>
            </div>

            {/* Quantity Controls & Item Subtotal */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                
                {/* Quantity Controls [-] qty [+] */}
                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
                    <button
                        onClick={handleDecrease}
                        disabled={quantity <= 1 || updating}
                        title="Decrease quantity"
                        className="h-8 w-8 rounded-xl bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-50 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        -
                    </button>

                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {updating ? '⏳' : quantity}
                    </span>

                    <button
                        onClick={handleIncrease}
                        disabled={quantity >= product.stock || updating}
                        title="Increase quantity"
                        className="h-8 w-8 rounded-xl bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-50 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        +
                    </button>
                </div>

                {/* Subtotal & Remove Action */}
                <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Total</span>
                    <span className="text-base font-extrabold text-slate-900">
                        {formatCurrency(itemSubtotal)}
                    </span>
                    <button
                        onClick={handleRemove}
                        disabled={removing}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline mt-0.5 disabled:opacity-50"
                    >
                        {removing ? 'Removing...' : 'Remove'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default CartItem
