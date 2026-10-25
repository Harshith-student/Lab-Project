import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { axiosInstance } from '../axiosCalls/axios'

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

function Checkout() {
    const { cart, cartCount, subtotal, clearCartState } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    // Form state
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        addressLine1: '',
        city: '',
        state: '',
        pincode: ''
    })

    // Validation errors
    const [errors, setErrors] = useState({})
    // Overall submit loading and error states
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSimulating, setIsSimulating] = useState(false)
    const [apiError, setApiError] = useState(null)
    const [showSimulatedModal, setShowSimulatedModal] = useState(false)
    const [pendingOrderData, setPendingOrderData] = useState(null)

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear field error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    // Client-side validation rules
    const validateForm = () => {
        const newErrors = {}

        if (!formData.fullName || !formData.fullName.trim()) {
            newErrors.fullName = 'Full Name is required'
        }

        const phoneTrimmed = formData.phone.toString().trim().replace(/[\s-+]/g, '')
        if (!phoneTrimmed) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^\d{10}$/.test(phoneTrimmed)) {
            newErrors.phone = 'Phone number must contain exactly 10 digits'
        }

        if (!formData.addressLine1 || !formData.addressLine1.trim()) {
            newErrors.addressLine1 = 'Address line is required'
        }

        if (!formData.city || !formData.city.trim()) {
            newErrors.city = 'City is required'
        }

        if (!formData.state || !formData.state.trim()) {
            newErrors.state = 'State is required'
        }

        const pincodeTrimmed = formData.pincode.toString().trim()
        if (!pincodeTrimmed) {
            newErrors.pincode = 'Pincode is required'
        } else if (!/^\d{6}$/.test(pincodeTrimmed)) {
            newErrors.pincode = 'Pincode must contain 6 digits.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle Payment Verification on Backend
    const handleVerifyPayment = async (verificationPayload) => {
        try {
            setIsSubmitting(true)
            setApiError(null)

            const response = await axiosInstance.post('/orders/verify-payment', verificationPayload)

            if (response.data?.success) {
                // Clear frontend global cart state immediately
                clearCartState()
                // Navigate to Order Confirmation screen
                navigate(`/order-success/${response.data.order._id}`)
            } else {
                setApiError(response.data?.message || 'Payment verification failed.')
            }
        } catch (err) {
            console.error('Payment verification error:', err)
            const msg = err.response?.data?.message || 'Payment verification failed on the server.'
            setApiError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle Simulated Test Mode Payment (for local offline or fallback testing)
    const handleSimulatedPayment = async (status) => {
        if (!pendingOrderData) return

        if (status === 'fail') {
            setShowSimulatedModal(false)
            setApiError('Simulated payment was cancelled or failed. Your cart has been preserved.')
            return
        }

        setIsSimulating(true)

        try {
            const fakePaymentId = `pay_sim_${Date.now()}`
            // Request valid signature calculation from backend
            const sigRes = await axiosInstance.post('/orders/dev/simulate-signature', {
                shopKartOrderId: pendingOrderData.shopKartOrderId,
                razorpay_payment_id: fakePaymentId
            })

            if (sigRes.data?.success) {
                await handleVerifyPayment({
                    shopKartOrderId: pendingOrderData.shopKartOrderId,
                    razorpay_order_id: sigRes.data.razorpay_order_id,
                    razorpay_payment_id: fakePaymentId,
                    razorpay_signature: sigRes.data.signature
                })
                setShowSimulatedModal(false)
            } else {
                setApiError(sigRes.data?.message || 'Failed to simulate payment signature.')
                setShowSimulatedModal(false)
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Simulation error during verification.')
            setShowSimulatedModal(false)
        } finally {
            setIsSimulating(false)
        }
    }

    // Main checkout trigger
    const handlePlaceOrder = async (e) => {
        e.preventDefault()
        setApiError(null)

        // 1. Client-side validation
        if (!validateForm()) {
            return
        }

        // 2. Reject if cart is empty
        if (!cart || cart.length === 0) {
            setApiError('Your cart is empty. Please add items to proceed.')
            return
        }

        setIsSubmitting(true)

        try {
            // 3. Request backend to validate stock, calculate total & create pending order + Razorpay order
            const orderRes = await axiosInstance.post('/orders/create-payment-order', {
                shippingAddress: {
                    fullName: formData.fullName.trim(),
                    phone: formData.phone.toString().trim(),
                    addressLine1: formData.addressLine1.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.toString().trim()
                }
            })

            const checkoutData = orderRes.data

            if (!checkoutData.success) {
                setApiError(checkoutData.message || 'Failed to initiate order.')
                setIsSubmitting(false)
                return
            }

            setPendingOrderData(checkoutData)

            // Determine if mock/simulation mode should be used
            // This prevents opening Razorpay SDK with dummy/placeholder keys which inevitably triggers "Oops! Something went wrong"
            const isMockOrder = Boolean(
                checkoutData.isMock ||
                !checkoutData.key ||
                checkoutData.key.includes('Mock') ||
                !checkoutData.key.startsWith('rzp_') ||
                checkoutData.razorpayOrderId?.startsWith('order_fake')
            )

            if (isMockOrder) {
                setShowSimulatedModal(true)
                setIsSubmitting(false)
                return
            }

            // 4. Try loading Razorpay Standard Checkout SDK for real keys
            const isScriptLoaded = await loadRazorpayScript()

            // If Razorpay SDK loaded and is available
            if (isScriptLoaded && window.Razorpay) {
                try {
                    const options = {
                        key: checkoutData.key,
                        amount: checkoutData.amount,
                        currency: checkoutData.currency,
                        name: 'ShopKart',
                        description: 'ShopKart Order Payment',
                        order_id: checkoutData.razorpayOrderId,
                        handler: async function (response) {
                            // Razorpay returned checkout response -> Send to backend for mandatory HMAC SHA256 verification
                            await handleVerifyPayment({
                                shopKartOrderId: checkoutData.shopKartOrderId,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        },
                        prefill: {
                            name: formData.fullName,
                            contact: formData.phone,
                            email: user?.email || ''
                        },
                        theme: {
                            color: '#4f46e5'
                        },
                        modal: {
                            ondismiss: function () {
                                setIsSubmitting(false)
                                setApiError('Payment was dismissed. You can retry or complete using the Test Mode Simulator.')
                            }
                        }
                    }

                    const paymentObject = new window.Razorpay(options)

                    paymentObject.on('payment.failed', function (resp) {
                        console.error('Payment Failed:', resp.error)
                        setIsSubmitting(false)
                        setApiError(`Payment failed: ${resp.error?.description || 'Transaction unsuccessful'}. Your cart has not been cleared. You can use the Test Mode Simulator to proceed.`)
                        setShowSimulatedModal(true)
                    })

                    paymentObject.open()
                    return
                } catch (sdkError) {
                    console.warn('Razorpay SDK modal error, showing test mode simulator:', sdkError)
                    setShowSimulatedModal(true)
                    setIsSubmitting(false)
                }
            } else {
                // Razorpay checkout script could not be loaded -> open Test Mode Simulator
                setShowSimulatedModal(true)
                setIsSubmitting(false)
            }
        } catch (err) {
            console.error('Order creation error:', err)
            const errorMsg = err.response?.data?.message || 'Failed to process checkout. Please try again.'
            setApiError(errorMsg)
            setIsSubmitting(false)
        }
    }

    // EMPTY CART STATE
    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-12 px-4 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center space-y-5 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
                        🛒
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
                        <p className="text-sm text-slate-500">
                            You cannot proceed to checkout with an empty cart.
                        </p>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Page Breadcrumb & Header */}
                <div className="border-b border-slate-200/80 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                            <Link to="/cart" className="hover:text-indigo-600">Cart</Link>
                            <span>/</span>
                            <span className="text-indigo-600">Checkout</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                            Checkout 💳
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Razorpay Test Mode Enabled
                    </div>
                </div>

                {/* API / Business Rule Error Banner */}
                {apiError && (
                    <div className="rounded-2xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 shadow-sm">
                        <div className="text-red-600 text-lg">⚠️</div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-red-900">Checkout Notice</h4>
                            <p className="text-xs text-red-700 mt-0.5">{apiError}</p>
                            {pendingOrderData && (
                                <button
                                    onClick={() => setShowSimulatedModal(true)}
                                    className="mt-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 underline block"
                                >
                                    Open Test Mode Simulator to complete payment →
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setApiError(null)}
                            className="text-red-400 hover:text-red-700 text-sm font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Shipping Details Form */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <span>📍</span> Shipping Details
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Enter the destination address where your order will be delivered.
                            </p>
                        </div>

                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. Aarav Sharma"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                                        errors.fullName
                                            ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                            : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Phone Number (10 digits) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength="10"
                                    placeholder="e.g. 9876543210"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                                        errors.phone
                                            ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                            : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Address Line <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    placeholder="Flat / House No., Apartment, Street, Landmark"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                                        errors.addressLine1
                                            ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                            : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                                    }`}
                                />
                                {errors.addressLine1 && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{errors.addressLine1}</p>
                                )}
                            </div>

                            {/* City and State */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Bengaluru"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                                            errors.city
                                                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                                : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                                        }`}
                                    />
                                    {errors.city && (
                                        <p className="text-xs text-red-600 font-medium mt-1">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="e.g. Karnataka"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                                            errors.state
                                                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                                : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                                        }`}
                                    />
                                    {errors.state && (
                                        <p className="text-xs text-red-600 font-medium mt-1">{errors.state}</p>
                                    )}
                                </div>
                            </div>

                            {/* Pincode */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Pincode (6 digits) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    maxLength="6"
                                    placeholder="e.g. 560001"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                                        errors.pincode
                                            ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                            : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                                    }`}
                                />
                                {errors.pincode && (
                                    <p className="text-xs text-red-600 font-medium mt-1">{errors.pincode}</p>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                                <span>Order Summary</span>
                                <span className="text-xs font-semibold text-slate-500">{cartCount} items</span>
                            </h2>
                        </div>

                        {/* Cart Item Snapshot Review */}
                        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 space-y-3">
                            {cart.map((item) => (
                                <div key={item.product?._id} className="pt-3 first:pt-0 flex items-center gap-3">
                                    <img
                                        src={item.product?.image || 'https://placehold.co/80'}
                                        alt={item.product?.name}
                                        className="w-14 h-14 object-cover rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">
                                            {item.product?.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatCurrency(item.product?.price || 0)} × {item.quantity}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Calculation Breakdown */}
                        <div className="space-y-2.5 pt-4 border-t border-slate-100 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping & Delivery</span>
                                <span className="font-semibold text-emerald-600">FREE</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Estimated Tax</span>
                                <span className="font-semibold text-slate-800">₹0</span>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                <div>
                                    <span className="text-base font-bold text-slate-900 block">Total</span>
                                    <span className="text-[11px] text-slate-400">Includes all applicable taxes</span>
                                </div>
                                <span className="text-2xl font-black text-indigo-600">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={isSubmitting}
                            className={`w-full py-4 px-6 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                isSubmitting
                                    ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processing Payment...</span>
                                </>
                            ) : (
                                <>
                                    <span>Pay with Razorpay</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                            <span>🔒</span>
                            <span>Secure 256-bit encrypted Test Payment</span>
                        </div>

                        {/* Domestic Test Mode Credentials Helper */}
                        <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100/80 text-xs space-y-2.5">
                            <div className="flex items-center gap-2 text-indigo-900 font-bold">
                                <span>💡</span>
                                <span>Razorpay Test Payment Details</span>
                            </div>
                            <div className="space-y-1.5 text-slate-600">
                                <div className="flex items-start justify-between gap-1">
                                    <span className="font-medium text-slate-500">Mastercard:</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-slate-800 font-semibold select-all">5267 3181 8797 5449</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span>Expiry: 02/29</span>
                                    <span>CVV: 123</span>
                                    <span>OTP: 1234</span>
                                </div>
                                <div className="pt-1.5 border-t border-indigo-100 flex items-center justify-between">
                                    <span className="font-medium text-slate-500">Netbanking:</span>
                                    <span className="text-slate-700 font-semibold">Select any bank → Click Success</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-500">UPI VPA:</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-slate-800 font-semibold select-all">success@razorpay</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Simulated Test Mode Payment Modal Fallback (Active if Razorpay script or mock key fallback is triggered) */}
            {showSimulatedModal && pendingOrderData && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">💳</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Razorpay Test Simulator</h3>
                                    <p className="text-[11px] text-slate-500">Test Mode Payment Verification</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
                                    TEST MODE
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSimulatedModal(false)
                                        setIsSubmitting(false)
                                    }}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-sm"
                                    title="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-200/60">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Order ID:</span>
                                <span className="font-mono font-semibold text-slate-800">{pendingOrderData.razorpayOrderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Amount:</span>
                                <span className="font-bold text-indigo-600">{formatCurrency(pendingOrderData.amount / 100)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Customer:</span>
                                <span className="font-medium text-slate-800">{formData.fullName}</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600">
                            Simulate customer payment status. Clicking "Simulate Success" will verify the HMAC signature on the backend and clear your cart.
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                disabled={isSimulating}
                                onClick={() => handleSimulatedPayment('fail')}
                                className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Simulate Failure ✕
                            </button>
                            <button
                                disabled={isSimulating}
                                onClick={() => handleSimulatedPayment('success')}
                                className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-70"
                            >
                                {isSimulating ? (
                                    <>
                                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <span>Simulate Success ✓</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Checkout
