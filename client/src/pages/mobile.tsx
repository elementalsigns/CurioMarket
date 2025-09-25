import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  seller: {
    shopName: string;
  };
}

export default function MobilePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[MOBILE] Starting fetch from /api/listings/featured');
      
      const response = await fetch('/api/listings/featured');
      console.log('[MOBILE] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }
      
      const data = await response.json();
      console.log('[MOBILE] Received data:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
        console.log('[MOBILE] Set products successfully, count:', data.length);
      } else {
        console.warn('[MOBILE] Data is not an array:', data);
        setProducts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[MOBILE] Error fetching products:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('[MOBILE] Fetch completed, loading set to false');
    }
  };

  const formatPrice = (price: number | string | undefined | null) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(String(price || 0));
    if (isNaN(numPrice)) {
      return '$0.00';
    }
    return `$${numPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-zinc-100 text-lg">Loading Curio Market...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-red-600/30 px-4 py-4 z-10">
        <h1 className="text-2xl font-bold text-zinc-100 text-center">
          Curio Market
        </h1>
        <p className="text-red-500 text-sm text-center mt-1">Mobile Preview</p>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-6">
          Featured Products
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No products found</p>
            <p className="text-zinc-500 text-sm mt-2">
              Add some products to your Curio Market to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="bg-zinc-900 border-zinc-800 overflow-hidden hover:bg-zinc-800/50 transition-colors">
                <div className="aspect-square bg-zinc-800 relative">
                  <img
                    src={product.images?.[0] || '/api/placeholder/300/300'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/300/300';
                    }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-zinc-100 font-medium text-sm line-clamp-2 leading-tight mb-2">
                    {product.title}
                  </h3>
                  <p className="text-red-500 text-xs mb-2 truncate">
                    by {product.seller?.shopName || 'Unknown Shop'}
                  </p>
                  <p className="text-zinc-100 font-bold text-lg">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile browsers */}
      <div className="h-20"></div>
    </div>
  );
}