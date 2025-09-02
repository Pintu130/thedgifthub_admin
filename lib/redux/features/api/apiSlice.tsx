// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// // Define your base API URL
// const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// // Static token provided
// const staticToken = "MjAyNS0wMy0xMyAxMTo0NTozMQ==f89c848fa"

// export const apiSlice = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl,
//     prepareHeaders: (headers: Headers) => {
//       // Set the static authorization token
//       headers.set("token", `${staticToken}`)
//       return headers
//     },
//   }),
//   tagTypes: ["Posts", "Users", "Products"],
//   endpoints: () => ({}),
// })



// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// // Define a base URL for your API
// const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// export const apiSlice = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl,
//     prepareHeaders: (headers:any) => {
//       // You can add auth tokens here if needed
//       const token = process.env.NEXT_PUBLIC_API_TOKEN
//       if (token) {
//         headers.set("authorization", `Bearer ${token}`)
//       }
//       return headers
//     },
//   }),
//   tagTypes: ["Posts", "Users", "Products","Services"], // Add your entity types here
//   endpoints: () => ({}),
// })


// src/redux/api/apiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
console.log("🚀 ~ baseUrl:", baseUrl)

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["Posts", "Users", "Products","AuthUsers","Roles","Coupons","WelcomeContent","Dashboard","HomeContent","AttendeeFormContent","AccommodationsContent","Resources","QuestionContent","Agendas","FooterContent","MainHeading","Speakers","Committees","Supportteams","AwardTypes","Awards","AwardTypeDropdown","Sponsors","SponsorsContent","Attendees","AbstractContent","RolePermissions","SponsorPayments","AttendeePayments","AboutUsContent","SEO","Notification","UserDrops","AttendeeDropdown","PhotoBooth"],
  endpoints: () => ({}),
})
