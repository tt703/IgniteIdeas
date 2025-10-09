import React, {createContext, use, useContext, useEffect, useState} from 'react'
import API from '../api/client'


const AuthContext = createContext()

export function AuthProvider({children}) {
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(false)

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token)
            API.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setLoading(true)
            API.get('/api/auth/me').then((response) => {
                setUser(response.data)
            }).catch(() => {
                setToken(null)
            }).finally(() => setLoading(false))
        } else {
            delete API.defaults.headers.common.Authorization
            localStorage.removeItem('token')
            setUser(null)
        }
    }, [token])

    const login = async (email, password) => {
        const res = await API.post('/api/auth/login', {email, password})
        setToken(res.data.access_token)
        return res
    }
    const register = async (name, email, password) => {
        const res = await API.post('/api/auth/register', {name, email, password})
        return res
    }
    const logout = () => {
        setToken(null)
        setUser(null)
    }
    return (
        <AuthContext.Provider value={{token,user,login,register,logout,loading}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth  = () => useContext(AuthContext)