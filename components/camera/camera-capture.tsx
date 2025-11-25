"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, RotateCcw, Check, X, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void
  onCancel?: () => void
  title?: string
  description?: string
}

export function CameraCapture({
  onPhotoCapture,
  onCancel,
  title = "Take Photo",
  description = "Position the camera to take a clear photo",
}: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const startCamera = useCallback(async () => {
    try {
      setError("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user", // Front camera for selfies
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions and try again.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to data URL
    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedPhoto(photoDataUrl)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto)
      toast({
        title: "Photo Captured",
        description: "Photo has been successfully captured and saved.",
      })
    }
  }, [capturedPhoto, onPhotoCapture, toast])

  const downloadPhoto = useCallback(() => {
    if (capturedPhoto) {
      const link = document.createElement("a")
      link.download = `library-card-photo-${Date.now()}.jpg`
      link.href = capturedPhoto
      link.click()
    }
  }, [capturedPhoto])

  const handleCancel = useCallback(() => {
    stopCamera()
    setCapturedPhoto(null)
    onCancel?.()
  }, [stopCamera, onCancel])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative bg-muted rounded-lg overflow-hidden">
          {!isStreaming && !capturedPhoto && (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Click "Start Camera" to begin</p>
                <Button onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            </div>
          )}

          {isStreaming && (
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-primary/50 m-4 rounded-lg pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button onClick={capturePhoto} size="lg" className="rounded-full">
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {capturedPhoto && (
            <div className="relative">
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Captured photo"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {!isStreaming && !capturedPhoto && (
            <Button onClick={startCamera} disabled={!!error}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          )}

          {isStreaming && (
            <>
              <Button onClick={capturePhoto} variant="default">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button onClick={stopCamera} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            </>
          )}

          {capturedPhoto && (
            <>
              <Button onClick={confirmPhoto} variant="default">
                <Check className="h-4 w-4 mr-2" />
                Use This Photo
              </Button>
              <Button onClick={retakePhoto} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Photo
              </Button>
              <Button onClick={downloadPhoto} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}

          {onCancel && (
            <Button onClick={handleCancel} variant="ghost">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Make sure you have good lighting</p>
          <p>• Look directly at the camera</p>
          <p>• Keep your face centered in the frame</p>
        </div>
      </CardContent>
    </Card>
  )
}
