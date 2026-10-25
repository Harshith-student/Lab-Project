function SearchBar({ search, setSearch, category, setCategory, sort, setSort, categories }) {
    const handleClear = () => {
        setSearch('')
        setCategory('All')
        setSort('newest')
    }

    const hasFilters = search !== '' || category !== 'All' || sort !== 'newest'

    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Search Input (6 cols on md) */}
                <div className="relative md:col-span-6">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products by name..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-3 text-slate-800 text-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Category Dropdown (3 cols on md) */}
                <div className="md:col-span-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'All' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort Dropdown (3 cols on md) */}
                <div className="md:col-span-3 flex items-center gap-2">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium cursor-pointer"
                    >
                        <option value="newest">Sort: Newest First</option>
                        <option value="price_asc">Sort: Price: Low to High</option>
                        <option value="price_desc">Sort: Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Active Filters Bar */}
            {hasFilters && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-400">Active Filters:</span>
                        {search && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 font-medium border border-indigo-100">
                                Search: "{search}"
                            </span>
                        )}
                        {category !== 'All' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 font-medium border border-indigo-100">
                                Category: {category}
                            </span>
                        )}
                        {sort !== 'newest' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 font-medium border border-indigo-100">
                                Sort: {sort === 'price_asc' ? 'Price Low-High' : 'Price High-Low'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleClear}
                        className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline transition-colors"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
        </div>
    )
}

export default SearchBar
