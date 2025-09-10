import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Package, Plus, Edit3, Trash2, Search, Filter, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  title: string;
  sku?: string;
  price: string;
  stockQuantity: number;
  lowStockThreshold: number;
  state: 'draft' | 'published' | 'suspended';
  createdAt: string;
  variations?: ListingVariation[];
}

interface ListingVariation {
  id: string;
  name: string;
  sku?: string;
  stockQuantity: number;
  priceAdjustment: string;
  isActive: boolean;
}

export default function InventoryManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [bulkUpdateDialog, setBulkUpdateDialog] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({ field: '', value: '' });
  const { toast } = useToast();

  // Fetch seller listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery<Listing[]>({
    queryKey: ['/api/seller/listings'],
  });

  // Fetch low stock items
  const { data: lowStockItems = [], isLoading: lowStockLoading } = useQuery<Listing[]>({
    queryKey: ['/api/seller/low-stock'],
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ listingId, quantity }: { listingId: string; quantity: number }) => {
      console.log('[INVENTORY] Sending PUT request:', { listingId, quantity });
      const response = await apiRequest('PUT', `/api/listings/${listingId}/stock`, { quantity });
      console.log('[INVENTORY] PUT request successful');
      return response;
    },
    onSuccess: () => {
      console.log('[INVENTORY] Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/seller/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/low-stock'] });
      toast({
        title: "Stock Updated",
        description: "Stock quantity updated successfully.",
      });
    },
    onError: (error) => {
      console.log('[INVENTORY] Mutation failed:', error);
      toast({
        title: "Error",
        description: `Failed to update stock quantity: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: any[]) => {
      return await apiRequest('PUT', '/api/seller/listings/bulk', { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/listings'] });
      setSelectedListings([]);
      setBulkUpdateDialog(false);
      toast({
        title: "Bulk Update Complete",
        description: "Selected listings updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update selected listings.",
        variant: "destructive",
      });
    }
  });

  // Filter listings
  const filteredListings = listings.filter((listing: Listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.state === statusFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && listing.stockQuantity <= listing.lowStockThreshold) ||
                        (stockFilter === 'out' && listing.stockQuantity === 0);
    
    return matchesSearch && matchesStatus && matchesStock;
  });

  const handleStockUpdate = (listingId: string, newQuantity: number) => {
    console.log('[INVENTORY] Updating stock:', { listingId, newQuantity });
    updateStockMutation.mutate({ listingId, quantity: newQuantity });
  };

  const handleBulkUpdate = () => {
    const updates = selectedListings.map(id => ({
      id,
      [bulkUpdateData.field]: bulkUpdateData.value
    }));
    bulkUpdateMutation.mutate(updates);
  };

  const getStockStatus = (listing: Listing) => {
    if (listing.stockQuantity === 0) return { label: 'Out of Stock', color: 'bg-red-600' };
    if (listing.stockQuantity <= listing.lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-600' };
    return { label: 'In Stock', color: 'bg-green-600' };
  };

  const selectAllListings = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map((l: Listing) => l.id));
    }
  };

  if (listingsLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-zinc-400">Manage stock levels and track inventory across all listings</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              data-testid="button-export-inventory"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              data-testid="button-import-inventory"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="bg-red-900/20 border-red-800 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-white font-semibold">Low Stock Alert</h3>
                  <p className="text-red-300">
                    You have {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low on stock
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    data-testid="input-search-inventory"
                    placeholder="Search by title or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700" data-testid="select-stock-filter">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedListings.length > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-zinc-400">
                    {selectedListings.length} selected
                  </span>
                  <Dialog open={bulkUpdateDialog} onOpenChange={setBulkUpdateDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-bulk-update"
                      >
                        Bulk Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Bulk Update</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                          Update multiple listings at once
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <Select 
                          value={bulkUpdateData.field} 
                          onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, field: value }))}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700" data-testid="select-bulk-field">
                            <SelectValue placeholder="Select field to update" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="state">Status</SelectItem>
                            <SelectItem value="lowStockThreshold">Low Stock Threshold</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {bulkUpdateData.field === 'state' ? (
                          <Select 
                            value={bulkUpdateData.value} 
                            onValueChange={(value) => setBulkUpdateData(prev => ({ ...prev, value }))}
                          >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700" data-testid="select-bulk-value">
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            data-testid="input-bulk-value"
                            type="number"
                            placeholder="Enter new value"
                            value={bulkUpdateData.value}
                            onChange={(e) => setBulkUpdateData(prev => ({ ...prev, value: e.target.value }))}
                            className="bg-zinc-800 border-zinc-700 text-white"
                          />
                        )}
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          onClick={handleBulkUpdate}
                          disabled={!bulkUpdateData.field || !bulkUpdateData.value || bulkUpdateMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                          data-testid="button-confirm-bulk-update"
                        >
                          {bulkUpdateMutation.isPending ? 'Updating...' : 'Update Selected'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800">
                  <TableHead className="w-12 text-zinc-300">
                    <input
                      type="checkbox"
                      checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                      onChange={selectAllListings}
                      className="w-4 h-4 text-red-600 rounded"
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead className="text-zinc-300">Product</TableHead>
                  <TableHead className="text-zinc-300">SKU</TableHead>
                  <TableHead className="text-zinc-300">Status</TableHead>
                  <TableHead className="text-zinc-300">Stock Status</TableHead>
                  <TableHead className="text-zinc-300">Current Stock</TableHead>
                  <TableHead className="text-zinc-300">Low Stock Alert</TableHead>
                  <TableHead className="text-zinc-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-400">No inventory items found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredListings.map((listing: Listing) => {
                    const stockStatus = getStockStatus(listing);
                    return (
                      <TableRow 
                        key={listing.id} 
                        className="border-zinc-800 hover:bg-zinc-800"
                        data-testid={`row-listing-${listing.id}`}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedListings.includes(listing.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedListings(prev => [...prev, listing.id]);
                              } else {
                                setSelectedListings(prev => prev.filter(id => id !== listing.id));
                              }
                            }}
                            className="w-4 h-4 text-red-600 rounded"
                            data-testid={`checkbox-select-${listing.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white truncate max-w-xs">
                            {listing.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-zinc-300 font-mono text-sm">
                            {listing.sku || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={listing.state === 'published' ? 'default' : 'secondary'}
                            className={
                              listing.state === 'published' ? 'bg-green-600' :
                              listing.state === 'draft' ? 'bg-yellow-600' : 'bg-red-600'
                            }
                          >
                            {listing.state.charAt(0).toUpperCase() + listing.state.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              value={listing.stockQuantity}
                              onChange={(e) => handleStockUpdate(listing.id, parseInt(e.target.value) || 0)}
                              className="w-20 h-8 bg-zinc-800 border-zinc-700 text-white text-center"
                              data-testid={`input-stock-${listing.id}`}
                            />
                            <span className="text-zinc-400 text-sm">units</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-zinc-300">{listing.lowStockThreshold}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-zinc-700 text-zinc-300 hover:bg-zinc-700 h-8"
                              data-testid={`button-edit-${listing.id}`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-white mb-1" data-testid="text-total-products">
                {listings.length}
              </div>
              <div className="text-sm text-zinc-400">Total Products</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1" data-testid="text-in-stock">
                {listings.filter((l: Listing) => l.stockQuantity > l.lowStockThreshold).length}
              </div>
              <div className="text-sm text-zinc-400">In Stock</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-500 mb-1" data-testid="text-low-stock">
                {listings.filter((l: Listing) => l.stockQuantity <= l.lowStockThreshold && l.stockQuantity > 0).length}
              </div>
              <div className="text-sm text-zinc-400">Low Stock</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-500 mb-1" data-testid="text-out-of-stock">
                {listings.filter((l: Listing) => l.stockQuantity === 0).length}
              </div>
              <div className="text-sm text-zinc-400">Out of Stock</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}