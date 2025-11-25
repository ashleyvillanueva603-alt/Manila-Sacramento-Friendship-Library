"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gray-skunk-937601.hostingersite.com/api"

const API_ENDPOINTS = [
  {
    name: "Login",
    method: "POST",
    path: "/auth/login.php",
    body: { email: "admin@library.com", password: "admin123" },
  },
  {
    name: "Register",
    method: "POST",
    path: "/auth/register.php",
    body: { name: "Test User", email: "test@example.com", password: "test123", role: "borrower" },
  },
  { name: "Get Books", method: "GET", path: "/books/read.php?limit=10" },
  { name: "Get Book by ID", method: "GET", path: "/books/read.php?id=1" },
  {
    name: "Create Book",
    method: "POST",
    path: "/books/create.php",
    body: { title: "Test Book", author: "Test Author", isbn: "1234567890", genre: "Fiction", total_copies: 5 },
  },
  { name: "Get Users", method: "GET", path: "/users/read.php?limit=10" },
  { name: "Get Borrow History", method: "GET", path: "/borrow/history.php?limit=10" },
  { name: "Borrow Book", method: "POST", path: "/borrow/create.php", body: { user_id: 1, book_id: 1 } },
  { name: "Get Book Requests", method: "GET", path: "/requests/read.php?limit=10" },
]

export default function ApiTestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0])
  const [customPath, setCustomPath] = useState("")
  const [customBody, setCustomBody] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testEndpoint = async (
    endpoint: (typeof API_ENDPOINTS)[0],
    customPathOverride?: string,
    customBodyOverride?: string,
  ) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    const path = customPathOverride || endpoint.path
    const url = `${API_BASE_URL}${path}`

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (endpoint.method !== "GET" && (customBodyOverride || endpoint.body)) {
        options.body = customBodyOverride || JSON.stringify(endpoint.body)
      }

      console.log("[v0] Testing API:", url, options)

      const res = await fetch(url, options)

      const responseText = await res.text()
      console.log("[v0] Response status:", res.status, res.statusText)
      console.log("[v0] Response text:", responseText)

      let data: any
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        // If JSON parsing fails, return the raw text
        data = {
          raw_response: responseText,
          parse_error: "Response is not valid JSON",
          content_type: res.headers.get("content-type"),
        }
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
      })
    } catch (err: any) {
      let errorMessage = err.message || "Failed to connect to API"

      if (err.message === "Failed to fetch") {
        errorMessage =
          "Failed to fetch - This is likely a CORS issue. The PHP API needs to send proper CORS headers:\n\n" +
          "header('Access-Control-Allow-Origin: *');\n" +
          "header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');\n" +
          "header('Access-Control-Allow-Headers: Content-Type');\n\n" +
          "Add these headers at the top of your PHP files."
      }

      setError(errorMessage)
      console.error("[v0] API test error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Test your library system API endpoints. Current API URL:{" "}
          <code className="bg-muted px-2 py-1 rounded">{API_BASE_URL}</code>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Endpoint</CardTitle>
            <CardDescription>Select a predefined endpoint or create a custom request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Predefined Endpoints</Label>
              <Select
                value={selectedEndpoint.name}
                onValueChange={(value) => {
                  const endpoint = API_ENDPOINTS.find((e) => e.name === value)
                  if (endpoint) {
                    setSelectedEndpoint(endpoint)
                    setCustomPath(endpoint.path)
                    setCustomBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : "")
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {API_ENDPOINTS.map((endpoint) => (
                    <SelectItem key={endpoint.name} value={endpoint.name}>
                      <Badge variant="outline" className="mr-2">
                        {endpoint.method}
                      </Badge>
                      {endpoint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Method</Label>
              <Input value={selectedEndpoint.method} disabled />
            </div>

            <div className="space-y-2">
              <Label>Path</Label>
              <Input
                value={customPath || selectedEndpoint.path}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="/books/read.php"
              />
            </div>

            {selectedEndpoint.method !== "GET" && (
              <div className="space-y-2">
                <Label>Request Body (JSON)</Label>
                <Textarea
                  value={customBody || (selectedEndpoint.body ? JSON.stringify(selectedEndpoint.body, null, 2) : "")}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            )}

            <Button
              onClick={() => testEndpoint(selectedEndpoint, customPath, customBody)}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Test Endpoint"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>API response will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-2">
                  Make sure your API server is running and NEXT_PUBLIC_API_URL is set correctly.
                </p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={response.ok ? "default" : "destructive"}>
                    {response.status} {response.statusText}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Response Data</Label>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!response && !error && (
              <div className="text-center text-muted-foreground py-8">
                <p>No response yet. Test an endpoint to see results.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Set up your API backend</h3>
            <p className="text-sm text-muted-foreground">
              This app expects a PHP backend. Make sure your PHP server is running and the API endpoints are accessible.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Configure API URL</h3>
            <p className="text-sm text-muted-foreground">
              Set the <code className="bg-muted px-1">NEXT_PUBLIC_API_URL</code> environment variable to your API base
              URL (e.g., http://localhost:8000/api)
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Test with curl (alternative)</h3>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {`# Test GET endpoint
curl ${API_BASE_URL}/books/read.php?limit=10

# Test POST endpoint
curl -X POST ${API_BASE_URL}/auth/login.php \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@library.com","password":"admin123"}'`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Check browser console</h3>
            <p className="text-sm text-muted-foreground">
              Open browser DevTools (F12) and check the Console and Network tabs for detailed request/response
              information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
