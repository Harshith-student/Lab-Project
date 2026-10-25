import { useState, useEffect } from 'react'
import { axiosInstance } from '../axiosCalls/axios'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home']

function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [sort, setSort] = useState('newest')

    const fetchProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (search.trim()) params.append('search', search.trim())
            if (category && category !== 'All') params.append('category', category)
            if (sort) params.append('sort', sort)

            const queryString = params.toString() ? `?${params.toString()}` : ''
            const response = await axiosInstance.get(`/products${queryString}`)

            if (response.data && response.data.products) {
                setProducts(response.data.products)
            } else {
                setProducts([])
            }
        } catch (err) {
            console.error("Error fetching products:", err)
            setError(err.response?.data?.message || "Something went wrong while loading products. Please check your network or server.")
        } finally {
            setLoading(false)
        }
    }

    // Debounce search input and trigger API request on filter change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts()
        }, 300)

        return () => clearTimeout(timer)
    }, [search, category, sort])

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Discover Products
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Explore our latest catalogue of electronics, fashion, books, and home essentials.
                        </p>
                    </div>

                    {!loading && !error && (
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 border border-indigo-100">
                            <span>Showing {products.length} {products.length === 1 ? 'product' : 'products'}</span>
                        </div>
                    )}
                </div>

                {/* Search & Filter Component */}
                <SearchBar
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    sort={sort}
                    setSort={setSort}
                    categories={CATEGORIES}
                />

                {/* --- STATE 1: LOADING STATE --- */}
                {loading && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-3 py-4 text-slate-500">
                            <div className="h-6 w-6 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                            <span className="text-sm font-semibold">Loading products...</span>
                        </div>

                        {/* Skeleton Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <div key={n} className="rounded-3xl bg-white p-4 border border-slate-200/60 shadow-sm space-y-4 animate-pulse">
                                    <div className="aspect-square w-full rounded-2xl bg-slate-200" />
                                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                                    <div className="h-8 w-full rounded-xl bg-slate-200 pt-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- STATE 2: ERROR STATE --- */}
                {!loading && error && (
                    <div className="rounded-3xl bg-red-50/80 p-8 border border-red-200 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-red-900">Something went wrong while loading products.</h3>
                        <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={fetchProducts}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-all active:scale-95 shadow-md shadow-red-200"
                        >
                            Retry Loading Products
                        </button>
                    </div>
                )}

                {/* --- STATE 3: EMPTY STATE --- */}
                {!loading && !error && products.length === 0 && (
                    <div className="rounded-3xl bg-white p-12 border border-slate-200/80 text-center max-w-md mx-auto space-y-4 shadow-sm">
                        <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No products found.</h3>
                        <p className="text-sm text-slate-500">
                            We couldn't find any products matching your search or category filters.
                        </p>
                        <button
                            onClick={() => { setSearch(''); setCategory('All'); setSort('newest'); }}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-200"
                        >
                            Clear Filters & Show All
                        </button>
                    </div>
                )}

                {/* --- DYNAMIC PRODUCT GRID --- */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Products
