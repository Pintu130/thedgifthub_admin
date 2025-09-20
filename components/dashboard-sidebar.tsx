"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  Users,
  Smile,
  ChevronDown,
  ChevronUp,
  Folder,
  Settings,
  UserPlus,
  Handshake,
  UserCheck,
  LayoutDashboard,
  CreditCard,
  Search,
  Package,
  BadgePercent,
  ShoppingCart,
  Truck,
} from "lucide-react"
import { MdCategory } from "react-icons/md"
import Image from "next/image"
import { useState, useEffect } from "react"

interface DashboardSidebarProps {
  onNavClick?: () => void
}

interface RouteConfig {
  label: string
  icon: any
  href: string
  active: boolean
}

export function DashboardSidebar({ onNavClick }: DashboardSidebarProps) {
  const pathname = usePathname()

  // State for dropdown menus
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false)
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false)
  const [registrationDropdownOpen, setRegistrationDropdownOpen] = useState(false)
  const [paymentsDropdownOpen, setPaymentsDropdownOpen] = useState(false)

  // Main navigation routes (top level)
  const mainRoutes: RouteConfig[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
  ]

  // Home dropdown pages
  // const homeDropdownPages: RouteConfig[] = [
  //   {
  //     label: "Home",
  //     icon: Home,
  //     href: "/home",
  //     active: pathname === "/home",
  //   },
  // ]

  // Pages dropdown
  // const pagesDropdownPages: RouteConfig[] = [
  //   {
  //     label: "Welcome",
  //     icon: Smile,
  //     href: "/welcome",
  //     active: pathname === "/welcome",
  //   },
  //   {
  //     label: "Footer",
  //     icon: Settings,
  //     href: "/footer",
  //     active: pathname === "/footer",
  //   },
  //   {
  //     label: "Hero Section",
  //     icon: Home,
  //     href: "/hero-section",
  //     active: pathname === "/hero-section",
  //   },
  // ]

  // Payments dropdown
  // const paymentsDropdownPages: RouteConfig[] = [
  //   {
  //     label: "Sponsors Payments",
  //     icon: Handshake,
  //     href: "/payments/sponsors",
  //     active: pathname === "/payments/sponsors",
  //   },
  //   {
  //     label: "Attendee Payments",
  //     icon: UserCheck,
  //     href: "/payments/attendee",
  //     active: pathname === "/payments/attendee",
  //   },
  // ]

  // Registration dropdown
  // const registrationDropdownPages: RouteConfig[] = [
  //   {
  //     label: "Attendee",
  //     icon: UserCheck,
  //     href: "/attendee",
  //     active: pathname === "/attendee",
  //   },
  // ]

  // Bottom section routes
  const bottomRoutes: RouteConfig[] = [
    // {
    //   label: "SEO Management",
    //   icon: Search,
    //   href: "/seo-management",
    //   active: pathname === "/seo-management",
    // },
    {
      label: "Categories",
      icon: MdCategory,
      href: "/categories",
      active: pathname === "/categories",
    },
    {
      label: "Products",
      icon: Package,
      href: "/products",
      active: pathname === "/products",
    },
    {
      label: "Offers",
      icon: BadgePercent,
      href: "/offers",
      active: pathname === "/offers",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/customers",
      active: pathname === "/customers",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/orders",
      active: pathname === "/orders",
    },
    {
      label: "Order Shipping", // Page title
      icon: Truck,             // Icon representing shipping
      href: "/order-shipping", // Page path
      active: pathname === "/order-shipping", // Active state
    },
  ]

  // Admin section routes
  const adminRoutes: RouteConfig[] = [

  ]

  // Admin section routes
  // const adminRoutes: RouteConfig[] = [

  //   {
  //     label: "Setting",
  //     icon: Settings,
  //     href: "/settings",
  //     active: pathname === "/settings",
  //   },
  // ]

  // Check if any dropdown pages are active
  // const isAnyHomePageActive = homeDropdownPages.some((page) => page.active)
  // const isAnyPagesPageActive = pagesDropdownPages.some((page) => page.active)
  // const isAnyPaymentsPageActive = paymentsDropdownPages.some((page) => page.active)
  // const isAnyRegistrationPageActive = registrationDropdownPages.some((page) => page.active)

  // Auto-open dropdowns when nested pages are active
  // useEffect(() => {
  //   // if (isAnyHomePageActive) setHomeDropdownOpen(true)
  //   // if (isAnyPagesPageActive) setPagesDropdownOpen(true)
  //   // if (isAnyPaymentsPageActive) setPaymentsDropdownOpen(true)
  //   // if (isAnyRegistrationPageActive) setRegistrationDropdownOpen(true)
  // }, [])

  const renderDropdownButton = (
    label: string,
    IconComponent: any,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    isAnyChildActive: boolean,
    hasVisibleChildren: boolean,
  ) => {
    if (!hasVisibleChildren) return null

    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 h-10 px-3 rounded-md text-base font-medium transition-all ml-1",
          "hover:bg-[#FFEDED] text-black hover:text-[#C70000]",
          isAnyChildActive && "bg-[#FFDEDE] hover:bg-[#FFDEDE] text-[#A30000] hover:text-[#A30000] shadow-md",
        )}
      >
        <IconComponent className="h-4 w-4" />
        <span>{label}</span>
        {isOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
      </button>
    )
  }

  const renderDropdownChildren = (pages: RouteConfig[]) => {
    if (pages.length === 0) return null

    return (
      <div className="pl-8 flex flex-col gap-1 pt-1">
        {pages.map((page) => (
          <Button
            key={page.href}
            variant="ghost"
            className={cn(
              "justify-start gap-2.5 h-10 text-base font-normal transition-all",
              page.active
                ? "bg-[#FFDEDE] hover:bg-[#FFDEDE] text-[#A30000] hover:text-[#A30000] shadow-md"
                : "hover:bg-[#FFEDED] text-black hover:text-[#C70000]",
            )}
            asChild
            onClick={onNavClick}
          >
            <Link href={page.href}>
              <page.icon className="h-6 w-6" />
              <span>{page.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    )
  }

  const renderRoutes = (routes: RouteConfig[]) =>
    routes.map((route) => (
      <Button
        key={route.href}
        variant="ghost"
        className={cn(
          "justify-start gap-2.5 h-10 text-base font-medium transition-all",
          route.active
            ? "bg-[#FFDEDE] hover:bg-[#FFDEDE] text-[#A30000] hover:text-[#A30000] shadow-md"
            : "hover:bg-[#FFEDED] text-black hover:text-[#C70000]",
        )}
        asChild
        onClick={onNavClick}
      >
        <Link href={route.href}>
          <route.icon className="h-6 w-6" />
          <span>{route.label}</span>
        </Link>
      </Button>
    ))

  return (
    <div className="flex h-full w-full flex-col border-r shadow-lg border-[#f5bac0] bg-[#faeaea]">
      {/* Logo */}
      <Image src="/logo2.png" alt="Logo" className="px-6 py-4 md:hidden flex" width={110} height={110} />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="flex flex-col gap-1.5">
          {/* 1. Dashboard */}
          {renderRoutes(mainRoutes)}

          {/* 2. Home Dropdown */}
          {/* {renderDropdownButton("Home", Home, homeDropdownOpen, setHomeDropdownOpen, isAnyHomePageActive, homeDropdownPages.length > 0)} */}
          {/* {homeDropdownOpen && renderDropdownChildren(homeDropdownPages)} */}

          {/* 3. Pages Dropdown */}
          {/* {renderDropdownButton("Pages", Folder, pagesDropdownOpen, setPagesDropdownOpen, isAnyPagesPageActive, pagesDropdownPages.length > 0)} */}
          {/* {pagesDropdownOpen && renderDropdownChildren(pagesDropdownPages)} */}

          {/* 4. Payments Dropdown */}
          {/* {renderDropdownButton("Payments", CreditCard, paymentsDropdownOpen, setPaymentsDropdownOpen, isAnyPaymentsPageActive, paymentsDropdownPages.length > 0)} */}
          {/* {paymentsDropdownOpen && renderDropdownChildren(paymentsDropdownPages)} */}

          {/* 5. Registration Dropdown */}
          {/* {renderDropdownButton("Registration", UserPlus, registrationDropdownOpen, setRegistrationDropdownOpen, isAnyRegistrationPageActive, registrationDropdownPages.length > 0)} */}
          {/* {registrationDropdownOpen && renderDropdownChildren(registrationDropdownPages)} */}

          {/* 6. Bottom Routes */}
          {renderRoutes(bottomRoutes)}

          {/* Separator */}
          {/* {adminRoutes.length > 0 && <Separator className="my-4 bg-[#FFCCCC]" />} */}

          {/* 7. Admin Routes */}
          {/* {renderRoutes(adminRoutes)} */}

          <div className="mb-14"></div>
        </div>
      </ScrollArea>
    </div>
  )
}
