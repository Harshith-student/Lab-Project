import { createContext, useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const { user } = useAuth()
    const [cart, setCart] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch user's cart from API
    const fetchCart = async () => {
        if (!user) {
            setCart([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        try {
            const response = await axiosInstance.get('/cart')
            if (response.data && response.data.cart) {
                // Filter out any null products (e.g. if product was deleted from DB)
                const validItems = response.data.cart.filter(item => item.product !== null)
                setCart(validItems)
            } else {
                setCart([])
            }
        } catch (err) {
            console.error("Error fetching cart:", err)
            setError(err.response?.data?.message || "Failed to load cart.")
        } finally {
            setLoading(false)
        }
    }

    // Auto-fetch cart whenever user logs in or changes
    useEffect(() => {
        fetchCart()
    }, [user])

    // Add Product to Cart
    const addToCart = async (productId) => {
        try {
            const response = await axiosInstance.post(`/cart/${productId}`)
            if (response.data?.success && response.data.cart) {
                const validItems = response.data.cart.filter(item => item.product !== null)
                setCart(validItems)
                return { success: true, message: response.data.message }
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to add item to cart."
            return { success: false, message: msg }
        }
    }

    // Update Quantity
    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await axiosInstance.patch(`/cart/${productId}`, { quantity })
            if (response.data?.success && response.data.cart) {
                const validItems = response.data.cart.filter(item => item.product !== null)
                setCart(validItems)
                return { success: true }
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update quantity."
            return { success: false, message: msg }
        }
    }

    // Remove Item from Cart
    const removeFromCart = async (productId) => {
        try {
            const response = await axiosInstance.delete(`/cart/${productId}`)
            if (response.data?.success && response.data.cart) {
                const validItems = response.data.cart.filter(item => item.product !== null)
                setCart(validItems)
                return { success: true }
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to remove item."
            return { success: false, message: msg }
        }
    }

    // Clear cart immediately upon successful payment & order completion
    const clearCartState = () => {
        setCart([])
    }

    // Derived values (calculated dynamically from cart state)
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
    const subtotal = cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0)

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            subtotal,
            loading,
            error,
            fetchCart,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCartState
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}

export default CartContext
