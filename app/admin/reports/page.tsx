"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, TrendingUp, BarChart3, Lightbulb, FileJson } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { useAuth } from "@/hooks/use-auth"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("combined")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const { user } = useAuth()

  const handleGenerateReport = async () => {
    if (!dateFrom || !dateTo) {
      alert("Please select date range")
      return
    }

    setLoading(true)
    try {
      const response = await apiService.request("/reports/generate.php", {
        method: "POST",
        body: JSON.stringify({
          report_type: reportType,
          date_from: dateFrom,
          date_to: dateTo,
          generated_by: user?.id,
        }),
      })
      setReportData(response.data)
    } catch (error) {
      console.error("Failed to generate report:", error)
      alert("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!reportData) return

    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      let yPosition = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const maxWidth = pageWidth - 2 * margin

      // Helper function to add text with wrapping
      const addWrappedText = (text: string, fontSize: number, isBold = false) => {
        doc.setFontSize(fontSize)
        if (isBold) {
          doc.setFont(undefined, "bold")
        } else {
          doc.setFont(undefined, "normal")
        }

        const lines = doc.splitTextToSize(text, maxWidth)
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += 7
        })
      }

      // Header
      doc.setFillColor(5, 150, 105)
      doc.rect(0, 0, pageWidth, 30, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont(undefined, "bold")
      doc.text("Library Report", margin, 15)
      doc.setFontSize(10)
      doc.setFont(undefined, "normal")
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 22)

      yPosition = 40
      doc.setTextColor(0, 0, 0)

      // Report Info
      addWrappedText(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 12, true)
      addWrappedText(`Period: ${dateFrom} to ${dateTo}`, 11)
      yPosition += 5

      // Borrowing Statistics
      if (reportData.borrow_statistics) {
        addWrappedText("BORROWING STATISTICS", 14, true)
        yPosition += 3

        const stats = reportData.borrow_statistics
        const statsData = [
          [`Total Borrows: ${stats.total_borrows || 0}`],
          [`Active Borrows: ${stats.active_borrows || 0}`],
          [`Returned Books: ${stats.returned_books || 0}`],
          [`Overdue Books: ${stats.overdue_books || 0}`],
        ]

        statsData.forEach((stat) => {
          addWrappedText(stat[0], 10)
        })
        yPosition += 5
      }

      // Popular Books
      if (reportData.popular_books && reportData.popular_books.length > 0) {
        const booksWithBorrows = reportData.popular_books.filter((book: any) => (book.borrow_count || 0) > 0)

        if (booksWithBorrows.length > 0) {
          addWrappedText("POPULAR BOOKS", 14, true)
          yPosition += 3

          booksWithBorrows.slice(0, 10).forEach((book: any) => {
            const bookText = `${book.title || "N/A"} by ${book.author || "N/A"} (${book.borrow_count || 0} borrows)`
            addWrappedText(bookText, 10)
          })
          yPosition += 5
        }
      }

      // Category Performance
      if (reportData.category_performance && reportData.category_performance.length > 0) {
        const categoriesWithBorrows = reportData.category_performance.filter((cat: any) => (cat.total_borrows || 0) > 0)

        if (categoriesWithBorrows.length > 0) {
          addWrappedText("CATEGORY PERFORMANCE", 14, true)
          yPosition += 3

          categoriesWithBorrows.forEach((cat: any) => {
            const catText = `${cat.category || "N/A"}: ${cat.total_books || 0} books, ${cat.total_borrows || 0} borrows`
            addWrappedText(catText, 10)
          })
          yPosition += 5
        }
      }

      // Genre Insights
      if (reportData.genre_insights && reportData.genre_insights.length > 0) {
        const genresWithBorrows = reportData.genre_insights.filter((insight: any) => (insight.total_borrows || 0) > 0)

        if (genresWithBorrows.length > 0) {
          addWrappedText("GENRE PERFORMANCE INSIGHTS", 14, true)
          yPosition += 3

          genresWithBorrows.forEach((insight: any) => {
            const insightText = `${insight.genre || "N/A"}: ${insight.total_borrows || 0} borrows, ${insight.unique_borrowers || 0} unique borrowers, Avg duration: ${Math.round(insight.avg_borrow_duration || 0)} days`
            addWrappedText(insightText, 10)
          })
          yPosition += 5
        }
      }

      // Recommendations
      if (reportData.recommendations && reportData.recommendations.length > 0) {
        addWrappedText("ACTIONABLE RECOMMENDATIONS", 14, true)
        yPosition += 3

        reportData.recommendations.forEach((rec: any) => {
          const recText = `[${rec.priority?.toUpperCase() || "INFO"}] ${rec.type || "N/A"}: ${rec.message || "N/A"}`
          addWrappedText(recText, 10)
        })
      }

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, pageHeight - 10, { align: "center" })

      // Save PDF
      doc.save(`library-report-${reportType}-${dateFrom}-to-${dateTo}.pdf`)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      alert("Failed to export PDF. Please try again.")
    }
  }

  const handleExportCSV = () => {
    if (!reportData) return

    let csvContent = "Library Report\n"
    csvContent += `Generated: ${new Date().toLocaleDateString()}\n`
    csvContent += `Period: ${dateFrom} to ${dateTo}\n`
    csvContent += `Report Type: ${reportType}\n\n`

    // Borrow Statistics
    if (reportData.borrow_statistics) {
      csvContent += "BORROWING STATISTICS\n"
      csvContent += "Metric,Value\n"
      csvContent += `Total Borrows,${reportData.borrow_statistics.total_borrows || 0}\n`
      csvContent += `Active Borrows,${reportData.borrow_statistics.active_borrows || 0}\n`
      csvContent += `Returned Books,${reportData.borrow_statistics.returned_books || 0}\n`
      csvContent += `Overdue Books,${reportData.borrow_statistics.overdue_books || 0}\n\n`
    }

    // Popular Books
    if (reportData.popular_books && reportData.popular_books.length > 0) {
      const booksWithBorrows = reportData.popular_books.filter((book: any) => (book.borrow_count || 0) > 0)

      if (booksWithBorrows.length > 0) {
        csvContent += "POPULAR BOOKS\n"
        csvContent += "Title,Author,Borrow Count\n"
        booksWithBorrows.forEach((book: any) => {
          csvContent += `"${book.title || ""}","${book.author || ""}",${book.borrow_count || 0}\n`
        })
        csvContent += "\n"
      }
    }

    // Category Performance
    if (reportData.category_performance && reportData.category_performance.length > 0) {
      const categoriesWithBorrows = reportData.category_performance.filter((cat: any) => (cat.total_borrows || 0) > 0)

      if (categoriesWithBorrows.length > 0) {
        csvContent += "CATEGORY PERFORMANCE\n"
        csvContent += "Category,Total Books,Total Borrows\n"
        categoriesWithBorrows.forEach((cat: any) => {
          csvContent += `${cat.category || ""},${cat.total_books || 0},${cat.total_borrows || 0}\n`
        })
        csvContent += "\n"
      }
    }

    // Genre Insights (Prescriptive)
    if (reportData.genre_insights && reportData.genre_insights.length > 0) {
      const genresWithBorrows = reportData.genre_insights.filter((insight: any) => (insight.total_borrows || 0) > 0)

      if (genresWithBorrows.length > 0) {
        csvContent += "GENRE PERFORMANCE INSIGHTS\n"
        csvContent += "Genre,Total Borrows,Unique Borrowers,Avg Duration (days)\n"
        genresWithBorrows.forEach((insight: any) => {
          csvContent += `${insight.genre || ""},${insight.total_borrows || 0},${insight.unique_borrowers || 0},${Math.round(insight.avg_borrow_duration || 0)}\n`
        })
        csvContent += "\n"
      }
    }

    // Recommendations (Prescriptive)
    if (reportData.recommendations && reportData.recommendations.length > 0) {
      csvContent += "ACTIONABLE RECOMMENDATIONS\n"
      csvContent += "Priority,Type,Message\n"
      reportData.recommendations.forEach((rec: any) => {
        const message = (rec.message || "").replace(/"/g, '""') // Escape quotes
        csvContent += `${rec.priority || ""},${rec.type || ""},"${message}"\n`
      })
      csvContent += "\n"
    }

    // If no data was exported, add a message
    if (
      !reportData.borrow_statistics &&
      (!reportData.popular_books || reportData.popular_books.length === 0) &&
      (!reportData.category_performance || reportData.category_performance.length === 0) &&
      (!reportData.genre_insights || reportData.genre_insights.length === 0) &&
      (!reportData.recommendations || reportData.recommendations.length === 0)
    ) {
      csvContent += "No data available for the selected date range and report type.\n"
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `library-report-${reportType}-${dateFrom}-to-${dateTo}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Library Reports</h1>
        <p className="text-muted-foreground">Generate comprehensive reports with insights and recommendations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="descriptive">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Library Activity Report
                    </div>
                  </SelectItem>
                  <SelectItem value="prescriptive">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Reading Trends & Recommendation Report
                    </div>
                  </SelectItem>
                  <SelectItem value="combined">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Complete Library Report
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateReport} disabled={loading} className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            {reportData && (
              <>
                <Button onClick={handleExportPDF} variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="flex-1 bg-transparent">
                  <FileJson className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <div className="space-y-6">
          {reportData.borrow_statistics && (
            <Card>
              <CardHeader>
                <CardTitle>Borrowing Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{reportData.borrow_statistics.total_borrows}</div>
                    <div className="text-sm text-muted-foreground">Total Borrows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{reportData.borrow_statistics.active_borrows}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{reportData.borrow_statistics.returned_books}</div>
                    <div className="text-sm text-muted-foreground">Returned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{reportData.borrow_statistics.overdue_books}</div>
                    <div className="text-sm text-muted-foreground">Overdue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(reportData.recommendations && reportData.recommendations.length > 0) ||
          (reportData.genre_insights && reportData.genre_insights.length > 0) ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Prescriptive Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Genre Insights */}
                {reportData.genre_insights && reportData.genre_insights.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Genre Performance Insights</h3>
                    <div className="space-y-2">
                      {reportData.genre_insights.map((insight: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{insight.genre}</span>
                              <div className="text-sm text-muted-foreground mt-1">
                                {insight.total_borrows} borrows • {insight.unique_borrowers} unique borrowers
                                {insight.avg_borrow_duration && (
                                  <> • Avg duration: {Math.round(insight.avg_borrow_duration)} days</>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {reportData.recommendations && reportData.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Actionable Recommendations</h3>
                    <div className="space-y-3">
                      {reportData.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <div
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                rec.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : rec.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {rec.priority}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium capitalize">{rec.type}</div>
                              <div className="text-sm text-muted-foreground">{rec.message}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}
