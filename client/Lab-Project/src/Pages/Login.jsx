import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loader, setLoader] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg('')
        setLoader(true)
        try {
            await login(form)
            console.log("Customer Logged in successfully")
            navigate('/home')
        } catch (error) {
            console.error("Login Error:", error)
            const status = error.response?.status
            if (status === 401) {
                setErrorMsg("Invalid Credentials")
            } else {
                setErrorMsg(error.response?.data?.error || error.response?.data?.message || "Login failed. Please check your credentials.")
            }
        } finally {
            setLoader(false)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">

                {/* Branding & Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-200">
                        SK
                    </div>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                        Welcome back to ShopKart
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Log in to manage your account and orders.
                    </p>
                </div>

                {errorMsg && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>

                    {/* Email Field */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="alex@example.com"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 text-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 text-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loader}
                        className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loader ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            "Log in"
                        )}
                    </button>
                </form>

                {/* Footer / Register Link */}
                <div className="border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm text-slate-500">
                        New to ShopKart?{' '}
                        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default Login