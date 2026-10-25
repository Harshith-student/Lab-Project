import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'

function OrderDetails() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [statusSuccess, setStatusSuccess] = useState(null)

    const fetchOrder = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axiosInstance.get(`/orders/${id}`)
            if (response.data && response.data.order) {
                setOrder(response.data.order)
            }
        } catch (err) {
            console.error('Error fetching order:', err)
            setError(err.response?.data?.message || 'Failed to retrieve order details.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchOrder()
        }
    }, [id])

    // Bonus Challenge: Status Progression Updater
    const handleUpdateStatus = async (newStatus) => {
        try {
            setUpdatingStatus(true)
            setStatusSuccess(null)
            const response = await axiosInstance.patch(`/orders/${id}/status`, {
                status: newStatus
            })
            if (response.data && response.data.order) {
                setOrder(response.data.order)
                setStatusSuccess(`Status successfully progressed to ${newStatus}!`)
                setTimeout(() => setStatusSuccess(null), 3500)
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update order status.')
        } finally {
            setUpdatingStatus(false)
        }
    }

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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const stages = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']
    const currentStageIndex = stages.indexOf(order?.status)

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/50 py-16">
                <div className="inline-flex items-center gap-3 text-slate-600 font-semibold text-sm bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    Loading order details...
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Order Access Error</h2>
                    <p className="text-xs text-slate-500">{error || 'Could not access the requested order.'}</p>
                    <Link
                        to="/orders"
                        className="inline-block w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                        Back to My Orders
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
                
                {/* Header & Back Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
                    <div>
                        <Link
                            to="/orders"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-all mb-2"
                        >
                            <span>←</span> Back to All Orders
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            Order Details
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Placed on {formatDate(order.createdAt)} • ID: <span className="font-mono font-bold text-slate-700">{order._id}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Status: {order.status}
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Payment: {order.paymentStatus}
                        </span>
                    </div>
                </div>

                {/* Status Update Feedback Alert */}
                {statusSuccess && (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-sm flex items-center gap-2">
                        <span>✓</span> {statusSuccess}
                    </div>
                )}

                {/* Visual Status Progression Tracker */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            Order Progress
                        </h2>
                        <span className="text-[11px] font-semibold text-slate-400">
                            {order.status === 'PENDING_PAYMENT' ? 'Awaiting Payment' : 'Live Tracking'}
                        </span>
                    </div>

                    <div className="relative">
                        {/* Progress Line */}
                        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                            {stages.map((stage, idx) => {
                                const isPassed = currentStageIndex >= idx
                                const isCurrent = currentStageIndex === idx

                                return (
                                    <div
                                        key={stage}
                                        className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                                            isCurrent
                                                ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                                                : isPassed
                                                ? 'bg-emerald-50/50 border-emerald-200'
                                                : 'bg-slate-50 border-slate-200/60 opacity-60'
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-1.5 shadow-sm ${
                                                isCurrent
                                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                                    : isPassed
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-200 text-slate-500'
                                            }`}
                                        >
                                            {isPassed ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-900' : isPassed ? 'text-emerald-900' : 'text-slate-500'}`}>
                                            {stage}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bonus Challenge Control: Simulate Status Progression */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-4 rounded-2xl border">
                        <div>
                            <span className="text-xs font-bold text-slate-700 block">
                                🌟 Bonus Challenge: Status Progression Simulator
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Advance or test order status transitions directly on the server.
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {stages.map((stg) => (
                                <button
                                    key={stg}
                                    disabled={updatingStatus || order.status === stg}
                                    onClick={() => handleUpdateStatus(stg)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        order.status === stg
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 active:scale-95'
                                    }`}
                                >
                                    {stg}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Items List Snapshot */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                            Purchased Items ({order.items?.length || 0})
                        </h2>

                        <div className="divide-y divide-slate-100">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={item.image || 'https://placehold.co/70'}
                                            alt={item.name}
                                            className="w-14 h-14 object-cover rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatCurrency(item.price)} × {item.quantity} units
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                Product ID: {item.product}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-extrabold text-slate-900">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping & Payment Meta */}
                    <div className="space-y-6">
                        
                        {/* Shipping Details */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Delivery Address
                            </h3>
                            <div className="text-xs space-y-1 text-slate-600">
                                <p className="font-bold text-slate-900 text-sm">{order.shippingAddress?.fullName}</p>
                                <p>{order.shippingAddress?.addressLine1}</p>
                                <p>
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                </p>
                                <p className="pt-1 font-semibold text-slate-800">
                                    📞 {order.shippingAddress?.phone}
                                </p>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Payment Details
                            </h3>
                            <div className="text-xs space-y-2 text-slate-600">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Method:</span>
                                    <span className="font-semibold text-slate-800">Razorpay Test Checkout</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment Status:</span>
                                    <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
                                </div>
                                {order.razorpayOrderId && (
                                    <div className="flex flex-col pt-1 border-t border-slate-100">
                                        <span className="text-slate-400 text-[10px]">Razorpay Order ID:</span>
                                        <span className="font-mono text-[11px] text-slate-700 break-all">{order.razorpayOrderId}</span>
                                    </div>
                                )}
                                {order.razorpayPaymentId && (
                                    <div className="flex flex-col pt-1 border-t border-slate-100">
                                        <span className="text-slate-400 text-[10px]">Razorpay Payment ID:</span>
                                        <span className="font-mono text-[11px] text-slate-700 break-all">{order.razorpayPaymentId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total Summary */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                            <div className="flex justify-between text-xs text-slate-600">
                                <span>Total Paid:</span>
                                <span className="text-xl font-black text-indigo-600">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Prices snapshot at time of purchase.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}

export default OrderDetails
