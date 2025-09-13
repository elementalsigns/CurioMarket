import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Camera, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadGridProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploadGrid({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  disabled = false 
}: ImageUploadGridProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentImageCount = images.length;
    const remainingSlots = maxImages - currentImageCount;
    
    if (files.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can only upload ${remainingSlots} more image(s). Maximum is ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB. Please choose a smaller image.`,
            variant: "destructive",
          });
          continue;
        }

        try {
          // Get upload URL from server
          const uploadResponse = await fetch('/api/objects/upload', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to get upload URL');
          }
          
          const { uploadURL } = await uploadResponse.json();
          
          // Upload file to cloud storage
          const response = await fetch(uploadURL, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
          }

          // Extract the clean URL without query parameters for persistent access
          const cleanUrl = uploadURL ? uploadURL.split('?')[0] : null;
          if (!cleanUrl) {
            throw new Error('Upload URL is missing or invalid');
          }
          
          // Store the actual cloud storage URL for persistence
          newImages.push(cleanUrl);
        } catch (uploadError) {
          console.error('Failed to upload file:', file.name, uploadError);
          // Fallback to blob URL for immediate preview (but warn user)
          const previewUrl = URL.createObjectURL(file);
          newImages.push(previewUrl);
          toast({
            title: "Upload warning",
            description: `${file.name} uploaded as preview only. Save again to persist.`,
            variant: "destructive",
          });
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast({
          title: "Images uploaded",
          description: `Successfully uploaded ${newImages.length} image(s) to cloud storage.`,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [images, maxImages, onImagesChange, toast]);

  const removeImage = useCallback((index: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4" data-testid="image-upload-grid">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-bold">Product Images</h3>
        <div className="text-sm text-foreground/60">
          {images.length} / {maxImages} images
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Existing Images */}
        {images.map((image, index) => (
          <Card key={index} className="relative group aspect-square overflow-hidden" data-testid={`image-preview-${index}`}>
            <img
              src={image}
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            
            {/* Main Image Badge */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-gothic-red text-white text-xs px-2 py-1 rounded font-medium">
                Main
              </div>
            )}
            
            {/* Remove Button */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => removeImage(index, e)}
              disabled={disabled}
              data-testid={`button-remove-image-${index}`}
            >
              <X size={16} />
            </Button>

            {/* Reorder Handles */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {index > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => reorderImages(index, index - 1)}
                  disabled={disabled}
                  data-testid={`button-move-left-${index}`}
                >
                  ←
                </Button>
              )}
              {index < images.length - 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => reorderImages(index, index + 1)}
                  disabled={disabled}
                  data-testid={`button-move-right-${index}`}
                >
                  →
                </Button>
              )}
            </div>
          </Card>
        ))}

        {/* Upload Card */}
        {images.length < maxImages && (
          <Card 
            className="border-dashed border-2 border-border hover:border-gothic-red/50 transition-colors cursor-pointer aspect-square"
            onClick={openFileDialog}
            data-testid="image-upload-card"
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gothic-red mb-2"></div>
                  <p className="text-sm text-foreground/60">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="text-foreground/40 mb-2" size={32} />
                  <p className="text-sm font-medium">Add Images</p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Click to upload
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-sm text-foreground/60 space-y-1">
        <p>• First image will be your main product image</p>
        <p>• Supported formats: JPG, PNG, WebP</p>
        <p>• Maximum file size: 5MB per image</p>
        <p>• Drag images to reorder or use arrow buttons</p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || isUploading}
        data-testid="file-input-images"
      />
    </div>
  );
}