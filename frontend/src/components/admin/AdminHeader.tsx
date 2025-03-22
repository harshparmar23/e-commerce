"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Search } from "lucide-react"
import axios from "axios"

interface AdminHeaderProps {
  title: string
}

const AdminHeader = ({ title }: AdminHeaderProps) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BASIC_API_URL}/auth/me`, { withCredentials: true })
        setUser(data)
      } catch (error) {
        console.error("Error fetching user data:", error)
        navigate("/login")
      }
    }

    fetchUserData()
  }, [navigate])

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
        </div>

        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <span className="hidden md:inline text-sm font-medium">{user?.name || "Admin User"}</span>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader

