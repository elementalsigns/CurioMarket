import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, Heart, Share2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductImage {
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  viewCount?: number;
}

export default function ProductGallery({ 
  images, 
  title, 
  isFavorited = false, 
  onToggleFavorite, 
  onShare,
  viewCount 
}: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!images || images.length === 0) {
    return (
      <Card className="glass-effect">
        <CardContent className="aspect-square flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <div className="w-24 h-24 mx-auto mb-4 bg-zinc-800 rounded-lg flex items-center justify-center">
              <Eye size={32} />
            </div>
            <p>No image available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <Card className="glass-effect overflow-hidden">
        <CardContent className="p-0 relative">
          <div 
            className="aspect-square relative overflow-hidden cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZoomed(false)}
            onClick={toggleZoom}
          >
            <img
              src={images[currentImageIndex]?.url}
              alt={images[currentImageIndex]?.alt || title}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed 
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
              loading="lazy"
            />
            
            {/* Zoom Indicator */}
            {!isZoomed && (
              <div className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                <ZoomIn size={20} />
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white hover:bg-black/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  data-testid="prev-image"
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white hover:bg-black/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  data-testid="next-image"
                >
                  <ChevronRight size={24} />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {viewCount && (
                <Badge variant="secondary" className="bg-black/70 text-white border-none">
                  <Eye size={14} className="mr-1" />
                  {viewCount}
                </Badge>
              )}
              
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/70 text-white hover:bg-black/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  data-testid="toggle-favorite"
                >
                  <Heart 
                    size={20} 
                    className={isFavorited ? "fill-red-500 text-red-500" : "text-white"} 
                  />
                </Button>
              )}
              
              {onShare && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/70 text-white hover:bg-black/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  data-testid="share-product"
                >
                  <Share2 size={20} />
                </Button>
              )}
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" className="bg-black/70 text-white border-none">
                  {currentImageIndex + 1} / {images.length}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentImageIndex
                  ? "border-red-600"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
              data-testid={`thumbnail-${index}`}
            >
              <img
                src={image.url}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Instructions */}
      {images.length > 0 && (
        <p className="text-xs text-zinc-400 text-center">
          Click image to zoom • Hover to pan when zoomed
        </p>
      )}
    </div>
  );
}