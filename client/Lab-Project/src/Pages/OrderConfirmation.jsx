import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'

function OrderConfirmation() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get(`/orders/${id}`)
                if (response.data && response.data.order) {
                    setOrder(response.data.order)
                }
            } catch (err) {
                console.error("Error fetching confirmed order:", err)
                setError(err.response?.data?.message || "Could not retrieve order details.")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/50 py-16">
                <div className="inline-flex items-center gap-3 text-slate-600 font-semibold text-sm bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    Loading order confirmation...
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
                    <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
                    <p className="text-xs text-slate-500">{error || "Could not find the requested order."}</p>
                    <Link
                        to="/orders"
                        className="inline-block w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">

                {/* Hero Confirmation Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner border border-emerald-100">
                        ✅
                    </div>
                    
                    <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            Payment Verified & Confirmed
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
                            Order Placed Successfully!
                        </h1>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Thank you for your purchase. Your order has been placed and saved in ShopKart.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/60 text-xs">
                        <span className="text-slate-500">Order ID:</span>
                        <span className="font-mono font-bold text-slate-900">{order._id}</span>
                    </div>
                </div>

                {/* Order Summary Details */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {order.status}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        <div className="sm:text-right">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
                            <p className="text-2xl font-black text-indigo-600">
                                {formatCurrency(order.totalAmount)}
                            </p>
                        </div>
                    </div>

                    {/* Purchased Items Snapshot */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Purchased Items ({order.items?.length || 0})
                        </h3>
                        <div className="divide-y divide-slate-100">
                            {order.items?.map((item, index) => (
                                <div key={index} className="py-3 first:pt-0 flex items-center justify-between gap-4">
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
                                                {formatCurrency(item.price)} × {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.shippingAddress && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-xs space-y-1">
                            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                                Delivery Address
                            </span>
                            <p className="font-bold text-slate-800 text-sm">{order.shippingAddress.fullName}</p>
                            <p className="text-slate-600">{order.shippingAddress.addressLine1}</p>
                            <p className="text-slate-600">
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                            <p className="text-slate-600 font-medium">📞 {order.shippingAddress.phone}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/orders"
                            className="flex-1 text-center py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                        >
                            View My Orders
                        </Link>
                        <Link
                            to="/products"
                            className="flex-1 text-center py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Continue Shopping
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default OrderConfirmation
