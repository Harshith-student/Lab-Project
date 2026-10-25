import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'

function ProductDetails() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [addedToast, setAddedToast] = useState(false)

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            setError(null)
            try {
                const response = await axiosInstance.get(`/products/${id}`)
                if (response.data && response.data.product) {
                    setProduct(response.data.product)
                } else {
                    setError("Product details could not be retrieved.")
                }
            } catch (err) {
                console.error("Error fetching single product:", err)
                if (err.response?.status === 404) {
                    setError("Product not found. The item may have been removed.")
                } else if (err.response?.status === 400) {
                    setError("Invalid Product ID parameter.")
                } else {
                    setError(err.response?.data?.message || "Something went wrong while loading product details.")
                }
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchProduct()
        }
    }, [id])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const handleAddToCart = () => {
        setAddedToast(true)
        setTimeout(() => setAddedToast(false), 2500)
    }

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50 px-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="text-sm font-semibold text-slate-500">Loading product details...</p>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50 px-4 py-12">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-4">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
                    <p className="text-sm text-slate-500">{error || "The requested product does not exist."}</p>
                    <div className="pt-2">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                        >
                            ← Back to Products Catalogue
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const isOutOfStock = product.stock <= 0

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Link to="/home" className="hover:text-indigo-600 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* Main Product Details Grid */}
                <div className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Left: Product Image */}
                    <div className="relative aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/60 group">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80';
                            }}
                        />
                        <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-100">
                            {product.category}
                        </span>
                    </div>

                    {/* Right: Product Meta & Controls */}
                    <div className="flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                    {product.category}
                                </span>
                                {isOutOfStock ? (
                                    <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold">
                                        Out of Stock
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                                        {product.stock} units available
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-slate-900">
                                    {formatCurrency(product.price)}
                                </span>
                                <span className="text-xs text-slate-400">Inclusive of all taxes</span>
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Description
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* Quantity & Add to Cart Controls */}
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            
                            {/* Quantity Counter */}
                            {!isOutOfStock && (
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Quantity
                                    </span>
                                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="h-8 w-8 rounded-lg bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-100 flex items-center justify-center transition-all"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center text-sm font-bold text-slate-900">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="h-8 w-8 rounded-lg bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-100 flex items-center justify-center transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Toast Notification */}
                            {addedToast && (
                                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700 text-center animate-bounce">
                                    ✓ Added {quantity} item(s) to Cart (UI Preview)
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="flex-1 rounded-2xl bg-indigo-600 py-3.5 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                                    </svg>
                                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                </button>
                                
                                <button
                                    onClick={() => navigate('/products')}
                                    className="rounded-2xl border border-slate-200 bg-white py-3.5 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails
