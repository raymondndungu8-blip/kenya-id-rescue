import { useState, useRef } from "react";
import { Upload, Camera, Loader2, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validateImageFile, getImageExtension } from "@/lib/imageValidator";

interface IDPhotoUploadProps {
  side: "front" | "back";
  photoPreview: string | null;
  isScanning: boolean;
  scanComplete: boolean;
  onPhotoSelected: (file: File, preview: string) => void;
  onPhotoRemoved: () => void;
}

const IDPhotoUpload = ({
  side,
  photoPreview,
  isScanning,
  scanComplete,
  onPhotoSelected,
  onPhotoRemoved,
}: IDPhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be less than 5MB");
      return;
    }

    const isValidImage = await validateImageFile(file);
    if (!isValidImage) {
      toast.error("Invalid image file. Please upload a valid JPEG, PNG, GIF, or WebP image.");
      return;
    }

    const preview = URL.createObjectURL(file);
    onPhotoSelected(file, preview);
  };

  const label = side === "front" ? "Front of ID" : "Back of ID";
  const description = side === "front" 
    ? "Scan the front side showing the photo and name" 
    : "Scan the back side with additional details";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Camera className="w-4 h-4 text-primary" />
        {label}
        {scanComplete && (
          <span className="flex items-center gap-1 text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            AI Scanned
          </span>
        )}
      </div>
      
      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center relative transition-all hover:border-primary/50">
        {isScanning && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium text-primary">AI Scanning {label}...</p>
            <p className="text-xs text-muted-foreground">Extracting information</p>
          </div>
        )}

        {photoPreview ? (
          <div className="space-y-3">
            <img
              src={photoPreview}
              alt={`${label} preview`}
              className="max-h-40 mx-auto rounded-lg shadow-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onPhotoRemoved();
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="gap-1"
            >
              <X className="w-3 h-3" />
              Remove
            </Button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="space-y-2 py-2">
              <Camera className="w-7 h-7 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{description}</p>
              <p className="text-xs text-muted-foreground/70">Tap to open camera • Max 5MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default IDPhotoUpload;
