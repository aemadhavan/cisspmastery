"use client";

import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImagePreviewProps {
  image: {
    id?: string;
    url?: string;
    fileName: string;
    fileSize: number;
    order: number;
    altText?: string;
    uploading?: boolean;
    uploadProgress?: number;
  };
  onDelete: () => void;
  onAltTextChange: (altText: string) => void;
  isDragging?: boolean;
}

export function ImagePreview({
  image,
  onDelete,
  onAltTextChange,
  isDragging = false,
}: ImagePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`relative group border rounded-lg overflow-hidden transition-all ${
        isDragging
          ? "border-purple-500 bg-purple-500/10"
          : "border-slate-700 bg-slate-900"
      } ${image.uploading ? "opacity-50" : ""}`}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <div className="bg-slate-800/90 rounded p-1">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        disabled={image.uploading}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete image"
      >
        <div className="bg-red-500/90 hover:bg-red-600 rounded p-1">
          <X className="w-4 h-4 text-white" />
        </div>
      </button>

      {/* Order Badge */}
      <div className="absolute bottom-2 left-2 z-10">
        <div className="bg-purple-500/90 text-white text-xs px-2 py-1 rounded">
          #{image.order + 1}
        </div>
      </div>

      {/* Image */}
      {image.url ? (
        <img
          src={image.url}
          alt={image.altText || image.fileName}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-slate-800 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}

      {/* Upload Progress */}
      {image.uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="text-center">
            <div className="w-32 h-1 bg-slate-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${image.uploadProgress || 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-300">
              Uploading... {image.uploadProgress || 0}%
            </span>
          </div>
        </div>
      )}

      {/* Image Info & Alt Text */}
      <div className="p-2 space-y-2">
        <div className="text-xs text-gray-400 truncate" title={image.fileName}>
          {image.fileName}
        </div>
        <div className="text-xs text-gray-500">{formatFileSize(image.fileSize)}</div>

        <div>
          <Label htmlFor={`alt-${image.order}`} className="text-xs text-gray-400">
            Alt Text (Optional)
          </Label>
          <Input
            id={`alt-${image.order}`}
            type="text"
            placeholder="Describe the image..."
            value={image.altText || ""}
            onChange={(e) => onAltTextChange(e.target.value)}
            disabled={image.uploading}
            className="mt-1 h-8 text-xs bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>
    </div>
  );
}
