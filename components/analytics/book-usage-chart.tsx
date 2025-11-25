"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BookUsageChartProps {
  limit?: number
}

export function BookUsageChart({ limit = 10 }: BookUsageChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Fetch book usage data from API
    // Mock data for demonstration
    setData([
      { title: "The Great Gatsby", borrows: 45, uniqueBorrowers: 38, popularityScore: 42 },
      { title: "To Kill a Mockingbird", borrows: 42, uniqueBorrowers: 35, popularityScore: 40 },
      { title: "1984", borrows: 38, uniqueBorrowers: 32, popularityScore: 37 },
      { title: "Pride and Prejudice", borrows: 35, uniqueBorrowers: 30, popularityScore: 34 },
      { title: "The Catcher in the Rye", borrows: 32, uniqueBorrowers: 28, popularityScore: 31 },
      { title: "Animal Farm", borrows: 30, uniqueBorrowers: 26, popularityScore: 29 },
      { title: "Brave New World", borrows: 28, uniqueBorrowers: 24, popularityScore: 27 },
      { title: "Lord of the Flies", borrows: 25, uniqueBorrowers: 22, popularityScore: 24 },
      { title: "The Hobbit", borrows: 23, uniqueBorrowers: 20, popularityScore: 22 },
      { title: "Fahrenheit 451", borrows: 20, uniqueBorrowers: 18, popularityScore: 20 },
    ])
  }, [limit])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Usage Statistics</CardTitle>
        <CardDescription>Most popular books by borrow frequency and unique borrowers</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            borrows: {
              label: "Total Borrows",
              color: "hsl(var(--chart-1))",
            },
            uniqueBorrowers: {
              label: "Unique Borrowers",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="borrows" fill="var(--color-borrows)" name="Total Borrows" />
              <Bar dataKey="uniqueBorrowers" fill="var(--color-uniqueBorrowers)" name="Unique Borrowers" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
