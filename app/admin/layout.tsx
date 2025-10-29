"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { LayoutDashboard, Users, Package, ShoppingCart, Settings, LogOut } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user || user.userType !== "admin") {
      router.push("/auth/login")
      return
    }
  }, [router])

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${isOpen ? "w-64" : "w-20"} border-r border-border bg-card transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/admin/dashboard" className="text-xl font-bold text-primary">
            {isOpen ? "📚 Admin" : "📚"}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start" size={isOpen ? "default" : "icon"}>
                <item.icon className="w-5 h-5" />
                {isOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            size={isOpen ? "default" : "icon"}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="border-b border-border bg-card p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.firstName}</span>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
