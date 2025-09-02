"use client"

import type React from "react"
import RootLayout from "../RootLayout"
import UsersData from "@/components/users/userdata"


export default function UsersPage() {
  return (
    <RootLayout>
        <UsersData />
    </RootLayout>
  )
}
