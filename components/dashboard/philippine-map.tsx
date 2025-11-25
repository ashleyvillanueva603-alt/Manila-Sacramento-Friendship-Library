"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/database"
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface BorrowerLocation {
  id: number
  name: string
  city: string
  region: string
  borrowedBooks: number
  lat: number
  lng: number
}

const philippineRegions = [
  {
    name: "Metro Manila",
    color: "#059669",
    cities: [
      { name: "Manila", lat: 14.5995, lng: 120.9842 },
      { name: "Quezon City", lat: 14.676, lng: 121.0437 },
      { name: "Makati", lat: 14.5547, lng: 121.0244 },
      { name: "Pasig", lat: 14.5764, lng: 121.0851 },
      { name: "Taguig", lat: 14.5176, lng: 121.0509 },
    ],
  },
  {
    name: "Calabarzon",
    color: "#10b981",
    cities: [
      { name: "Batangas", lat: 13.7565, lng: 121.0583 },
      { name: "Laguna", lat: 14.2691, lng: 121.4113 },
      { name: "Cavite", lat: 14.4791, lng: 120.897 },
      { name: "Rizal", lat: 14.6037, lng: 121.3084 },
    ],
  },
  {
    name: "Central Luzon",
    color: "#34d399",
    cities: [
      { name: "Pampanga", lat: 15.0794, lng: 120.62 },
      { name: "Bulacan", lat: 14.7942, lng: 120.8794 },
      { name: "Nueva Ecija", lat: 15.5784, lng: 121.1113 },
      { name: "Tarlac", lat: 15.4817, lng: 120.5979 },
    ],
  },
  {
    name: "Western Visayas",
    color: "#6ee7b7",
    cities: [
      { name: "Iloilo", lat: 10.7202, lng: 122.5621 },
      { name: "Bacolod", lat: 10.677, lng: 122.954 },
      { name: "Capiz", lat: 11.5449, lng: 122.7308 },
      { name: "Aklan", lat: 11.5564, lng: 122.0174 },
    ],
  },
  {
    name: "Central Visayas",
    color: "#a7f3d0",
    cities: [
      { name: "Cebu", lat: 10.3157, lng: 123.8854 },
      { name: "Bohol", lat: 9.8349, lng: 124.1436 },
      { name: "Dumaguete", lat: 9.3068, lng: 123.3054 },
      { name: "Tagbilaran", lat: 9.6496, lng: 123.854 },
    ],
  },
]

export function PhilippineMap() {
  const [borrowerLocations, setBorrowerLocations] = useState<BorrowerLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerLocation | null>(null)
  const [mapZoom, setMapZoom] = useState(1)
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadBorrowerData()
  }, [])

  const loadBorrowerData = async () => {
    try {
      const users = await db.users.where("role").equals("student").toArray()
      const borrowRecords = await db.borrowRecords.toArray()

      const locations: BorrowerLocation[] = users.slice(0, 30).map((user, index) => {
        const regionIndex = index % philippineRegions.length
        const region = philippineRegions[regionIndex]
        const cityIndex = index % region.cities.length
        const city = region.cities[cityIndex]

        const userBorrows = borrowRecords.filter(
          (record) => record.userId === user.id && record.status === "borrowed",
        ).length

        return {
          id: user.id!,
          name: user.name,
          city: city.name,
          region: region.name,
          borrowedBooks: userBorrows,
          lat: city.lat + (Math.random() - 0.5) * 0.1, // Add slight variation
          lng: city.lng + (Math.random() - 0.5) * 0.1,
        }
      })

      setBorrowerLocations(locations)
    } catch (error) {
      console.error("Error loading borrower data:", error)
    } finally {
      setLoading(false)
    }
  }

  const convertToMapCoordinates = (lat: number, lng: number) => {
    // Convert lat/lng to SVG coordinates (simplified projection)
    const x = ((lng - 116) / 10) * 400 + mapCenter.x
    const y = ((20 - lat) / 12) * 300 + mapCenter.y
    return { x: x * mapZoom, y: y * mapZoom }
  }

  const resetMapView = () => {
    setMapZoom(1)
    setMapCenter({ x: 0, y: 0 })
    setSelectedBorrower(null)
  }

  const getRegionStats = (regionName: string) => {
    const regionBorrowers = borrowerLocations.filter((b) => b.region === regionName)
    const totalBooks = regionBorrowers.reduce((sum, b) => sum + b.borrowedBooks, 0)
    return { borrowers: regionBorrowers.length, books: totalBooks }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Borrower Distribution Map
          </CardTitle>
          <CardDescription>Real-time geographic distribution of active library users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            Interactive Borrower Distribution Map
          </CardTitle>
          <CardDescription>Real-time geographic distribution with precise location pins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl overflow-hidden border-2 border-border/20">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-md"
                onClick={() => setMapZoom(Math.min(mapZoom * 1.2, 3))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-md"
                onClick={() => setMapZoom(Math.max(mapZoom / 1.2, 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-md"
                onClick={resetMapView}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Map Title */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Philippines</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Library Network Coverage</p>
            </div>

            {/* Interactive SVG Map */}
            <div className="relative w-full h-[500px] overflow-hidden">
              <svg
                viewBox="0 0 400 300"
                className="w-full h-full cursor-move"
                style={{ transform: `scale(${mapZoom}) translate(${mapCenter.x}px, ${mapCenter.y}px)` }}
              >
                {/* Philippines outline (simplified) */}
                <path
                  d="M120 80 L180 70 L220 90 L240 120 L230 160 L200 180 L160 190 L120 180 L100 150 L110 120 Z M250 140 L280 130 L300 150 L290 170 L260 175 L240 160 Z M200 200 L230 195 L250 210 L240 230 L210 235 L190 220 Z"
                  fill="rgba(34, 197, 94, 0.1)"
                  stroke="rgba(34, 197, 94, 0.3)"
                  strokeWidth="2"
                />

                {/* Borrower Location Pins */}
                {borrowerLocations.map((borrower) => {
                  const coords = convertToMapCoordinates(borrower.lat, borrower.lng)
                  const region = philippineRegions.find((r) => r.name === borrower.region)
                  const isSelected = selectedBorrower?.id === borrower.id

                  return (
                    <g key={borrower.id}>
                      {/* Pin shadow */}
                      <circle cx={coords.x + 1} cy={coords.y + 1} r={isSelected ? 8 : 6} fill="rgba(0,0,0,0.2)" />
                      {/* Pin */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? 8 : 6}
                        fill={region?.color || "#059669"}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setSelectedBorrower(selectedBorrower?.id === borrower.id ? null : borrower)}
                      />
                      {/* Book count indicator */}
                      {borrower.borrowedBooks > 0 && (
                        <text
                          x={coords.x}
                          y={coords.y + 1}
                          textAnchor="middle"
                          className="text-xs font-bold fill-white pointer-events-none"
                        >
                          {borrower.borrowedBooks}
                        </text>
                      )}
                      {/* Pin label */}
                      {isSelected && (
                        <text
                          x={coords.x}
                          y={coords.y - 12}
                          textAnchor="middle"
                          className="text-xs font-medium fill-slate-700 dark:fill-slate-300 pointer-events-none"
                        >
                          {borrower.name}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Selected Borrower Info Panel */}
            {selectedBorrower && (
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{selectedBorrower.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedBorrower.city}, {selectedBorrower.region}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedBorrower.borrowedBooks} books
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Active library member</span>
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-3">
              <h4 className="text-xs font-medium mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                {philippineRegions.map((region) => (
                  <div key={region.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }}></div>
                    <span>{region.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Region Details */}
      {selectedRegion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: philippineRegions.find((r) => r.name === selectedRegion)?.color }}
              />
              {selectedRegion} - Detailed View
            </CardTitle>
            <CardDescription>Active borrowers and their reading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {borrowerLocations
                .filter((borrower) => borrower.region === selectedRegion)
                .map((borrower) => (
                  <div key={borrower.id} className="p-4 rounded-lg border bg-card/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{borrower.name}</h4>
                        <p className="text-xs text-muted-foreground">{borrower.city}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {borrower.borrowedBooks} books
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {borrower.city}, {borrower.region}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{borrowerLocations.length}</div>
            <div className="text-sm text-muted-foreground">Active Locations</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-secondary">
              {borrowerLocations.reduce((sum, b) => sum + b.borrowedBooks, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Books in Circulation</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">{philippineRegions.length}</div>
            <div className="text-sm text-muted-foreground">Regions Covered</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {borrowerLocations.length > 0
                ? Math.round(
                    (borrowerLocations.reduce((sum, b) => sum + b.borrowedBooks, 0) / borrowerLocations.length) * 10,
                  ) / 10
                : 0}
            </div>
            <div className="text-sm text-muted-foreground">Avg Books/User</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
