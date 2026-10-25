import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axiosInstance.get('/orders')
            if (response.data && response.data.orders) {
                setOrders(response.data.orders)
            } else {
                setOrders([])
            }
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError(err.response?.data?.message || 'Failed to fetch order history.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'SHIPPED':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'CONFIRMED':
                return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'PLACED':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200'
            case 'PENDING_PAYMENT':
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200'
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                            My Orders 📦
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            View and track your previous purchase history and real-time status.
                        </p>
                    </div>
                    {orders.length > 0 && (
                        <span className="text-xs font-semibold text-slate-500 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
                            Total Orders: {orders.length}
                        </span>
                    )}
                </div>

                {/* --- STATE 1: LOADING STATE --- */}
                {loading && (
                    <div className="py-20 text-center space-y-4">
                        <div className="inline-flex items-center gap-3 text-slate-600 font-semibold text-sm bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            Loading your orders...
                        </div>
                    </div>
                )}

                {/* --- STATE 2: ERROR STATE --- */}
                {!loading && error && (
                    <div className="rounded-3xl bg-red-50/80 p-8 border border-red-200 text-center max-w-md mx-auto space-y-4 shadow-sm my-12">
                        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-bold text-red-900">Failed to load orders</h3>
                        <p className="text-xs text-red-600">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-all active:scale-95 shadow-md shadow-red-200"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* --- STATE 3: EMPTY STATE --- */}
                {!loading && !error && orders.length === 0 && (
                    <div className="rounded-3xl bg-white p-12 border border-slate-200/80 text-center max-w-md mx-auto space-y-5 shadow-sm my-12">
                        <div className="mx-auto h-20 w-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl shadow-inner">
                            📦
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-800">You have not placed any orders yet.</h3>
                            <p className="text-sm text-slate-500">
                                Once you complete a purchase, your order history will appear here.
                            </p>
                        </div>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-200"
                        >
                            Start Shopping
                        </Link>
                    </div>
                )}

                {/* --- ORDER CARDS LIST --- */}
                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:border-indigo-200 transition-all"
                            >
                                {/* Card Header */}
                                <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                                                Order Placed
                                            </span>
                                            <span className="font-bold text-slate-800">
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </div>

                                        <div className="border-l border-slate-200 pl-4">
                                            <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                                                Order Number
                                            </span>
                                            <span className="font-mono font-bold text-slate-800">
                                                #{order._id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Items Snapshot List */}
                                <div className="p-6 divide-y divide-slate-100">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={item.image || 'https://placehold.co/60'}
                                                    alt={item.name}
                                                    className="w-12 h-12 object-cover rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
                                                    }}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Quantity: <span className="font-semibold text-slate-700">{item.quantity}</span> × {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Card Footer */}
                                <div className="bg-slate-50/40 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-slate-500">Total: </span>
                                        <span className="text-lg font-black text-indigo-600">
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                    </div>

                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all active:scale-95"
                                    >
                                        <span>View Details</span>
                                        <span>→</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Orders
