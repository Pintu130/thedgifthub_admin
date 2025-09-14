"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChevronDown, Menu } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import Image from "next/image"
import Modal from "./common/Modal"
import Loader from "./loading-screen"

export function DashboardHeader() {
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ displayName: string } | null>(null)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)



  useEffect(() => {
    const storedUser = localStorage.getItem("authUser")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error("Invalid user data in localStorage")
      }
    }
  }, [])

  const closeLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(false)
  }, [])

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true)
  }

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch {
      setIsLoggingOut(false)
      setIsLogoutModalOpen(false)
    }
  }

  return (
    <div>
      {isLoggingOut && <Loader />}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#f5bac0] px-4 md:px-6 shadow-sm bg-[#faeaea]">
        {/* Sidebar trigger for mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden bg-white text-[#C70000] border border-[#FFCCCC] shadow"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[80%] sm:w-[350px]">
            <DashboardSidebar onNavClick={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Logo (only visible on larger screens) */}
        {/* <div className="flex items-center gap-2">
          <Link href="/dashboard" className="md:flex hidden items-center">
            <Image src="/logo2.png" alt="Logo" width={55} height={55} />
            <p></p>
          </Link>
        </div> */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="md:flex hidden items-center">
            <span className="text-xl font-bold tracking-wide">The Gift Hub</span>
          </Link>
        </div>


        <div className="flex-1" />

        {/* User dropdown */}
        <div className="flex items-center gap-4">
          <span className="text-base font-medium hidden sm:inline text-black">
            {user?.displayName}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-1 cursor-pointer">
                <Image
                  src="/user.png"
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-[#FFB3B3]"
                />
                <ChevronDown className="h-5 w-5 text-[#B30000]" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-[#FFF5F5] border border-bordercolor rounded-md shadow-md text-[#800000] w-48"
            >
              <DropdownMenuLabel className="text-sm text-black px-3 py-1">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#FFDADA]" />
              {/* <DropdownMenuItem asChild className="cursor-pointer custom-dropdown-hover text-black">
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem> */}


              <DropdownMenuItem
                onClick={openLogoutModal}
                className="cursor-pointer custom-dropdown-hover text-black"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </header>
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        closeLabel="Cancel"
        confirmLabel="Logout"
        isLoading={isLoggingOut}
      />
    </div>
  )
}
