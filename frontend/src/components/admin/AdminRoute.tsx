"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import axios from "axios"

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASIC_API_URL}/auth/me`, {
          withCredentials: true,
        })
        setIsAdmin(res.data.role === "admin")
      } catch (err) {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />
}

export default AdminRoute

