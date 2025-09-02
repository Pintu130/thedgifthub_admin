// app/login/page.tsx
import { LoginForm } from "@/components/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NISBRE2026 - Admin Panel",
  description: "Login to your admin panel",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FDE8EC] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
