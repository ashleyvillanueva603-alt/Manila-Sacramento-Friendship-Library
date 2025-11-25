"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TimeSeriesChartProps {
  extended?: boolean
}

export function TimeSeriesChart({ extended = false }: TimeSeriesChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Fetch time series data from API
    // Mock data for demonstration
    const mockData = []
    const days = extended ? 90 : 30
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      mockData.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        borrows: Math.floor(Math.random() * 20) + 10,
        returns: Math.floor(Math.random() * 18) + 8,
        activeUsers: Math.floor(Math.random() * 15) + 5,
      })
    }

    setData(mockData)
  }, [extended])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Library Activity Trends</CardTitle>
        <CardDescription>Daily borrowing and return patterns over {extended ? "90" : "30"} days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            borrows: {
              label: "Borrows",
              color: "hsl(var(--chart-1))",
            },
            returns: {
              label: "Returns",
              color: "hsl(var(--chart-2))",
            },
            activeUsers: {
              label: "Active Users",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="borrows" stroke="var(--color-borrows)" name="Borrows" />
              <Line type="monotone" dataKey="returns" stroke="var(--color-returns)" name="Returns" />
              <Line type="monotone" dataKey="activeUsers" stroke="var(--color-activeUsers)" name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
