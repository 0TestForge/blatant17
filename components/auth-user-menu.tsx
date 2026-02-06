"use client"

import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"

interface AuthUserMenuProps {
  variant?: "mobile" | "desktop"
}

export function AuthUserMenu({ variant = "desktop" }: AuthUserMenuProps) {
  const { user, userProfile, logout } = useAuth()

  if (!user) return null

  const displayName = userProfile?.displayName || user.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 group transition-all duration-300 hover:scale-105 cursor-pointer">
          <Avatar className="h-10 w-10 cursor-pointer hover:shadow-lg transition-all duration-300">
            <AvatarImage src={userProfile?.photoURL || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-accent to-blue-600 text-white font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-64 mt-4">
        <DropdownMenuLabel className="flex flex-col gap-2 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userProfile?.photoURL || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-accent to-blue-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile" className="flex items-center gap-3 cursor-pointer py-2">
            <User className="w-4 h-4" />
            <span className="text-sm">My Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings" className="flex items-center gap-3 cursor-pointer py-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 cursor-pointer py-2 hover:bg-red-100 hover:text-red-800 transition-all duration-200 font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
