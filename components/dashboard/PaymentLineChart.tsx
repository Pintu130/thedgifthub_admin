"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dummy data
const data = [
  { month: "Jan", value: 40 },
  { month: "Feb", value: 55 },
  { month: "Mar", value: 35 },
  { month: "Apr", value: 30 },
  { month: "May", value: 28 },
  { month: "Jun", value: 32 },
  { month: "Jul", value: 36 },
  { month: "Aug", value: 42 },
  { month: "Sep", value: 50 },
  { month: "Oct", value: 60 },
  { month: "Nov", value: 70 },
  { month: "Dec", value: 85 },
]

export default function PaymentLineChart() {
  const [angle, setAngle] = useState(0)
  const [textAnchor, setTextAnchor] = useState("middle")

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth

      if (width >= 1024) {
        setAngle(0)
        setTextAnchor("middle")
      } else if (width >= 768) {
        setAngle(-90)
        setTextAnchor("end")
      } else {
        setAngle(-90)
        setTextAnchor("end")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card className="w-full border-0 bg-[#fdeef0] shadow-md">
      <CardHeader>
        <CardTitle className="text-xl -tracking-wide font-bold text-[#a82c55]">
          Payment Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 0 }} // increased bottom margin
          >
            <CartesianGrid stroke="#f5c2c7" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              padding={{ left: 20, right: 20 }}
              interval={0}
              angle={angle}
              textAnchor={textAnchor}
              height={60} // ensure space for rotated labels
            />
            <YAxis domain={[0, 100]} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                color: "#6b7280",
                fontWeight: 500,
              }}
              cursor={{
                stroke: "#d6336c",
                strokeWidth: 2,
                strokeDasharray: "3 3",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#d6336c"
              strokeWidth={3}
              dot={{
                r: 5,
                stroke: "#a82c55",
                strokeWidth: 2,
                fill: "#f9d7db",
              }}
              activeDot={{
                r: 7,
                stroke: "#a82c55",
                strokeWidth: 3,
                fill: "#ffc8cd",
              }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
