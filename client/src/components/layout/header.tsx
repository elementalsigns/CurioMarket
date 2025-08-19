import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Menu,
  Store,
  Settings,
  LogOut,
  Plus
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: cartData } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartData?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-gothic-gray/80 backdrop-blur-lg border-b border-gothic-purple/20 sticky top-0 z-50" data-testid="nav-header">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" data-testid="logo">
            <div className="text-2xl">🌙</div>
            <h1 className="text-2xl font-serif font-bold text-gothic-white">Curio Market</h1>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                <Input
                  type="text"
                  placeholder="Search oddities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border rounded-2xl"
                  data-testid="input-search"
                />
              </div>
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/browse">
              <Button variant="ghost" className="text-gothic-white hover:text-gothic-purple" data-testid="link-browse">
                Browse
              </Button>
            </Link>

            {isAuthenticated && (
              <>
                <Button 
                  variant="ghost" 
                  className="text-gothic-white hover:text-gothic-purple relative"
                  data-testid="button-favorites"
                >
                  <Heart size={20} />
                </Button>
                
                <Link to="/cart">
                  <Button 
                    variant="ghost" 
                    className="text-gothic-white hover:text-gothic-purple relative"
                    data-testid="button-cart"
                  >
                    <ShoppingCart size={20} />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-gothic-red text-xs rounded-full h-5 w-5 flex items-center justify-center p-0" data-testid="cart-count">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu-trigger">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                        data-testid="user-avatar"
                      />
                    ) : (
                      <User size={20} className="text-gothic-white" />
                    )}
                    <span className="text-gothic-white">{user?.firstName || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/seller/dashboard" className="flex items-center">
                      <Store className="mr-2" size={16} />
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/seller/listings/create" className="flex items-center">
                      <Plus className="mr-2" size={16} />
                      Create Listing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center">
                      <Settings className="mr-2" size={16} />
                      Orders & Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2" size={16} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/api/login'}
                  className="text-gothic-white hover:text-gothic-purple"
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-gothic-purple hover:bg-gothic-purple/80 text-white px-6 py-2 rounded-2xl"
                  data-testid="button-join"
                >
                  Join
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden text-gothic-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu size={24} />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gothic-purple/20" data-testid="mobile-menu">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                  <Input
                    type="text"
                    placeholder="Search oddities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-input border-border rounded-2xl"
                    data-testid="input-search-mobile"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-2">
                <Link to="/browse">
                  <Button variant="ghost" className="w-full justify-start text-gothic-white hover:text-gothic-purple">
                    Browse
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link to="/seller/dashboard">
                      <Button variant="ghost" className="w-full justify-start text-gothic-white hover:text-gothic-purple">
                        <Store className="mr-2" size={16} />
                        Seller Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full justify-start text-destructive hover:text-destructive/80"
                    >
                      <LogOut className="mr-2" size={16} />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => window.location.href = '/api/login'}
                    className="w-full bg-gothic-purple hover:bg-gothic-purple/80 text-white rounded-2xl"
                  >
                    Sign In / Join
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
