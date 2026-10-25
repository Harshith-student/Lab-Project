import { createContext, useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../axiosCalls/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const checkAuth = async () => {
        try {
            const response = await axiosInstance.get('/customers/me')
            if (response.data && response.data.customerData) {
                setUser(response.data.customerData)
            } else {
                setUser(null)
            }
        } catch (err) {
            console.log("Auth check error:", err.response?.data?.message || err.message)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const login = async (credentials) => {
        const response = await axiosInstance.post('/customers/login', credentials)
        if (response.data && response.data.customer) {
            setUser(response.data.customer)
        } else {
            await checkAuth()
        }
        return response.data
    }

    const logout = async () => {
        try {
            await axiosInstance.post('/customers/logout')
        } catch (err) {
            console.error("Logout error:", err)
        } finally {
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, checkAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export default AuthContext