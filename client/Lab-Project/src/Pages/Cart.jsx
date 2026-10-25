import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'

function Cart() {
    const { cart, cartCount, subtotal, loading, error, fetchCart } = useCart()

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="border-b border-slate-200/80 pb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        Shopping Cart 🛒
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Review your selected items and quantities before checking out.
                    </p>
                </div>

                {/* --- STATE 1: LOADING STATE --- */}
                {loading && (
                    <div className="py-16 text-center space-y-4">
                        <div className="inline-flex items-center gap-3 text-slate-600 font-semibold text-sm bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            Loading your cart...
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
                        <h3 className="text-lg font-bold text-red-900">Unable to load your cart.</h3>
                        <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={fetchCart}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-all active:scale-95 shadow-md shadow-red-200"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* --- STATE 3: EMPTY STATE --- */}
                {!loading && !error && cart.length === 0 && (
                    <div className="rounded-3xl bg-white p-12 border border-slate-200/80 text-center max-w-md mx-auto space-y-5 shadow-sm my-12">
                        <div className="mx-auto h-20 w-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl shadow-inner">
                            🛒
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-800">Your cart is empty</h3>
                            <p className="text-sm text-slate-500">
                                Looks like you haven't added anything to your cart yet.
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

                {/* --- CART CONTENT & ORDER SUMMARY --- */}
                {!loading && !error && cart.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Product Details
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Quantity & Total
                                </span>
                            </div>

                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <CartItem key={item.product?._id} item={item} />
                                ))}
                            </div>
                        </div>

                        {/* Order Summary Panel */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Total Items</span>
                                    <span className="font-semibold text-slate-900">{cart.length} products</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Total Units</span>
                                    <span className="font-semibold text-slate-900">{cartCount} units</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-emerald-600">FREE</span>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-base font-bold text-slate-900">Subtotal</span>
                                    <span className="text-2xl font-black text-indigo-600">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                Proceed to Checkout →
                            </Link>

                            <p className="text-[11px] text-center text-slate-400">
                                Tax included. Free shipping on all orders.
                            </p>
                        </div>

                    </div>
                )}

            </div>
        </div>
    )
}

export default Cart
