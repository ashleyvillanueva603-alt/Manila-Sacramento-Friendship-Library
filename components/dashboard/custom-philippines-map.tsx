"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, BookOpen, TrendingUp } from "lucide-react"
import { db } from "@/lib/database"

interface BorrowerLocation {
  id: number
  name: string
  city: string
  region: string
  borrowedBooks: number
  x: number // SVG coordinate
  y: number // SVG coordinate
}

// Philippine cities with SVG coordinates (scaled to fit 800x600 viewBox)
const philippineCities = [
  // Metro Manila (center-west)
  { name: "Manila", region: "Metro Manila", x: 320, y: 280 },
  { name: "Quezon City", region: "Metro Manila", x: 330, y: 275 },
  { name: "Makati", region: "Metro Manila", x: 325, y: 285 },
  { name: "Pasig", region: "Metro Manila", x: 335, y: 280 },
  { name: "Taguig", region: "Metro Manila", x: 328, y: 290 },

  // Calabarzon (south of Manila)
  { name: "Batangas City", region: "Calabarzon", x: 315, y: 320 },
  { name: "Santa Rosa", region: "Calabarzon", x: 322, y: 295 },
  { name: "Bacoor", region: "Calabarzon", x: 318, y: 288 },
  { name: "Antipolo", region: "Calabarzon", x: 340, y: 275 },

  // Central Luzon (north of Manila)
  { name: "San Fernando", region: "Central Luzon", x: 310, y: 250 },
  { name: "Malolos", region: "Central Luzon", x: 315, y: 265 },
  { name: "Cabanatuan", region: "Central Luzon", x: 345, y: 240 },
  { name: "Tarlac City", region: "Central Luzon", x: 300, y: 235 },

  // Western Visayas (central islands)
  { name: "Iloilo City", region: "Western Visayas", x: 280, y: 380 },
  { name: "Bacolod", region: "Western Visayas", x: 290, y: 375 },
  { name: "Roxas City", region: "Western Visayas", x: 275, y: 365 },

  // Central Visayas (central-east islands)
  { name: "Cebu City", region: "Central Visayas", x: 350, y: 390 },
  { name: "Lapu-Lapu", region: "Central Visayas", x: 355, y: 395 },
  { name: "Tagbilaran", region: "Central Visayas", x: 365, y: 405 },

  // Northern Mindanao (south-central)
  { name: "Cagayan de Oro", region: "Northern Mindanao", x: 360, y: 450 },
  { name: "Iligan", region: "Northern Mindanao", x: 350, y: 445 },

  // Davao Region (southeast)
  { name: "Davao City", region: "Davao Region", x: 380, y: 480 },
  { name: "Tagum", region: "Davao Region", x: 385, y: 475 },
]

const regionColors = {
  "Metro Manila": "#ef4444",
  Calabarzon: "#f97316",
  "Central Luzon": "#eab308",
  "Western Visayas": "#22c55e",
  "Central Visayas": "#06b6d4",
  "Northern Mindanao": "#8b5cf6",
  "Davao Region": "#ec4899",
}

export function CustomPhilippinesMap() {
  const [borrowerLocations, setBorrowerLocations] = useState<BorrowerLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerLocation | null>(null)
  const [hoveredBorrower, setHoveredBorrower] = useState<BorrowerLocation | null>(null)

  const loadBorrowerData = useCallback(async () => {
    try {
      console.log("[v0] Loading borrower data for custom map...")

      const users = await db.users.where("role").equals("student").toArray()
      const borrowRecords = await db.borrowRecords.toArray()

      const locations: BorrowerLocation[] = users.slice(0, 50).map((user, index: number) => {
        const city = philippineCities[index % philippineCities.length]
        const userBorrows = borrowRecords.filter(
          (record) => record.userId === user.id && record.status === "borrowed",
        ).length

        return {
          id: user.id!,
          name: user.name,
          city: city.name,
          region: city.region,
          borrowedBooks: userBorrows,
          x: city.x + (Math.random() - 0.5) * 20, // Small variation for realistic spread
          y: city.y + (Math.random() - 0.5) * 20,
        }
      })

      console.log("[v0] Loaded", locations.length, "borrower locations for custom map")
      setBorrowerLocations(locations)
    } catch (error) {
      console.error("[v0] Error loading borrower data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBorrowerData()
  }, [loadBorrowerData])

  const regionStats = useMemo(() => {
    const getRegionStats = (regionName: string) => {
      const regionBorrowers = borrowerLocations.filter((b) => b.region === regionName)
      const totalBooks = regionBorrowers.reduce((sum, b) => sum + b.borrowedBooks, 0)
      return { borrowers: regionBorrowers.length, books: totalBooks }
    }

    return Object.keys(regionColors)
      .map((region) => ({
        name: region,
        color: regionColors[region as keyof typeof regionColors],
        ...getRegionStats(region),
      }))
      .filter((stat) => stat.borrowers > 0)
  }, [borrowerLocations])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Philippines Library Network Map
          </CardTitle>
          <CardDescription>Geographic distribution of active borrowers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Philippines Library Network Map
          </CardTitle>
          <CardDescription>
            Geographic distribution showing {borrowerLocations.length} active borrowers across {regionStats.length}{" "}
            regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-border/20 overflow-hidden">
              <svg
                viewBox="0 0 800 600"
                className="w-full h-96"
                style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)" }}
              >
                {/* Philippine Islands Outline */}
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Luzon */}
                <path
                  d="M280 180 L380 180 L390 220 L400 260 L380 300 L360 320 L340 330 L320 340 L300 330 L280 320 L270 300 L260 280 L270 240 L280 200 Z"
                  fill="#10b981"
                  fillOpacity="0.3"
                  stroke="#059669"
                  strokeWidth="2"
                  filter="url(#shadow)"
                />

                {/* Visayas */}
                <ellipse
                  cx="320"
                  cy="380"
                  rx="80"
                  ry="30"
                  fill="#06b6d4"
                  fillOpacity="0.3"
                  stroke="#0891b2"
                  strokeWidth="2"
                  filter="url(#shadow)"
                />
                <ellipse
                  cx="280"
                  cy="370"
                  rx="40"
                  ry="20"
                  fill="#06b6d4"
                  fillOpacity="0.3"
                  stroke="#0891b2"
                  strokeWidth="2"
                  filter="url(#shadow)"
                />

                {/* Mindanao */}
                <ellipse
                  cx="370"
                  cy="470"
                  rx="60"
                  ry="50"
                  fill="#8b5cf6"
                  fillOpacity="0.3"
                  stroke="#7c3aed"
                  strokeWidth="2"
                  filter="url(#shadow)"
                />

                {/* Borrower Location Markers */}
                {borrowerLocations.map((borrower) => (
                  <g key={borrower.id}>
                    <circle
                      cx={borrower.x}
                      cy={borrower.y}
                      r={Math.max(4, Math.min(12, borrower.borrowedBooks + 3))}
                      fill={regionColors[borrower.region as keyof typeof regionColors]}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200 hover:scale-125"
                      style={{
                        filter:
                          hoveredBorrower?.id === borrower.id
                            ? "drop-shadow(0 0 8px rgba(0,0,0,0.5))"
                            : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                      }}
                      onMouseEnter={() => setHoveredBorrower(borrower)}
                      onMouseLeave={() => setHoveredBorrower(null)}
                      onClick={() => setSelectedBorrower(borrower)}
                    />
                    {/* Book count indicator */}
                    {borrower.borrowedBooks > 0 && (
                      <text
                        x={borrower.x}
                        y={borrower.y + 1}
                        textAnchor="middle"
                        className="text-xs font-bold fill-white pointer-events-none"
                        style={{ fontSize: "10px" }}
                      >
                        {borrower.borrowedBooks}
                      </text>
                    )}
                  </g>
                ))}

                {/* Region Labels */}
                <text
                  x="330"
                  y="250"
                  textAnchor="middle"
                  className="text-sm font-semibold fill-gray-700"
                  style={{ fontSize: "14px" }}
                >
                  LUZON
                </text>
                <text
                  x="320"
                  y="380"
                  textAnchor="middle"
                  className="text-sm font-semibold fill-gray-700"
                  style={{ fontSize: "14px" }}
                >
                  VISAYAS
                </text>
                <text
                  x="370"
                  y="470"
                  textAnchor="middle"
                  className="text-sm font-semibold fill-gray-700"
                  style={{ fontSize: "14px" }}
                >
                  MINDANAO
                </text>
              </svg>
            </div>

            {/* Hover Tooltip */}
            {hoveredBorrower && (
              <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs z-10 pointer-events-none">
                <h4 className="font-semibold text-sm">{hoveredBorrower.name}</h4>
                <p className="text-xs text-muted-foreground">
                  📍 {hoveredBorrower.city}, {hoveredBorrower.region}
                </p>
                <p className="text-xs text-green-600 font-medium">📚 {hoveredBorrower.borrowedBooks} books borrowed</p>
              </div>
            )}

            {/* Map Legend */}
            <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs z-10">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Regional Distribution
              </h4>
              <div className="space-y-2">
                {regionStats.map((region) => (
                  <div key={region.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: region.color }}
                      />
                      <span className="font-medium">{region.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {region.borrowers}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Borrower Panel */}
            {selectedBorrower && (
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm z-10">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{selectedBorrower.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedBorrower.city}, {selectedBorrower.region}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: `${regionColors[selectedBorrower.region as keyof typeof regionColors]}20`,
                      color: regionColors[selectedBorrower.region as keyof typeof regionColors],
                    }}
                  >
                    {selectedBorrower.borrowedBooks} books
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>Active library member</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 text-xs h-6 px-2"
                  onClick={() => setSelectedBorrower(null)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{borrowerLocations.length}</div>
                <div className="text-sm text-muted-foreground">Active Locations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {borrowerLocations.reduce((sum, b) => sum + b.borrowedBooks, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Books in Circulation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{regionStats.length}</div>
                <div className="text-sm text-muted-foreground">Regions Covered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {borrowerLocations.length > 0
                    ? Math.round(
                        (borrowerLocations.reduce((sum, b) => sum + b.borrowedBooks, 0) / borrowerLocations.length) *
                          10,
                      ) / 10
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Books/User</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
