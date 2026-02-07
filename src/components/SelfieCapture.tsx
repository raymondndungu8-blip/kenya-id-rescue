import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelfieCaptureProps {
  onSelfieCaptured: (base64: string) => void;
  isProcessing: boolean;
}

const SelfieCapture = ({ onSelfieCaptured, isProcessing }: SelfieCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Could not access camera. Please allow camera permissions and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the image for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmSelfie = useCallback(() => {
    if (capturedImage) {
      onSelfieCaptured(capturedImage);
    }
  }, [capturedImage, onSelfieCaptured]);

  // Handle file upload as alternative
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setCameraError("Photo must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {capturedImage ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={capturedImage}
              alt="Your selfie"
              className="w-full max-h-64 object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm font-medium text-primary">AI Matching Face...</p>
                <p className="text-xs text-muted-foreground">Comparing with ID photo</p>
              </div>
            )}
          </div>
          {!isProcessing && (
            <div className="flex gap-2 justify-center">
              <Button type="button" variant="outline" size="sm" onClick={retake}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Retake
              </Button>
              <Button type="button" variant="hero" size="sm" onClick={confirmSelfie}>
                <Check className="w-4 h-4 mr-1" />
                Use This Photo
              </Button>
            </div>
          )}
        </div>
      ) : isCameraActive ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-border">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-64 object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button type="button" variant="outline" size="sm" onClick={stopCamera}>
              Cancel
            </Button>
            <Button type="button" variant="hero" size="sm" onClick={capturePhoto}>
              <Camera className="w-4 h-4 mr-1" />
              Take Photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {cameraError && (
            <p className="text-sm text-destructive text-center">{cameraError}</p>
          )}
          <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-xl">
            <Camera className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Take a selfie for AI face matching
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="hero" size="sm" onClick={startCamera}>
                <Camera className="w-4 h-4 mr-1" />
                Open Camera
              </Button>
              <label>
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>Upload Photo</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfieCapture;
