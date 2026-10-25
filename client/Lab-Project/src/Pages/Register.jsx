import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'

function Register() {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
    const [loader, setLoader] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg('')
        setSuccessMsg('')

        // Client-side validations
        if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
            setErrorMsg("All fields are required.")
            return
        }

        if (form.password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.")
            return
        }

        setLoader(true)
        try {
            const response = await axiosInstance.post('/customers/register', form)
            setSuccessMsg(response.data.message || "Registration Successful! Redirecting to login...")
            console.log("User Registered:", response.data)
            
            setTimeout(() => {
                navigate('/login')
            }, 1200)
        } catch (error) {
            console.error("Register Error:", error)
            setErrorMsg(error.response?.data?.error || error.response?.data?.message || "Registration failed. Please try again.")
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
                        Create your ShopKart account
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Join ShopKart today to start shopping seamlessly.
                    </p>
                </div>

                {errorMsg && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 text-center animate-shake">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 border border-emerald-100 text-center">
                        {successMsg}
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>

                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="e.g. Alex Morgan"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 text-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="e.g. 9876543210"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 text-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* Email Address */}
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

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-800 text-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loader}
                        className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loader ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="border-t border-slate-100 pt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default Register