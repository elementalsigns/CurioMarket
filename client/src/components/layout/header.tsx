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
import CartSidebar from "@/components/cart-sidebar";
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Menu,
  Store,
  Settings,
  LogOut,
  Plus,
  ChevronDown
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { data: cartData } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: sellerData } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: isAuthenticated,
  });

  const cartItemCount = (cartData && Array.isArray((cartData as any).items)) ? (cartData as any).items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0;

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
    <nav className="bg-background border-b border-border sticky top-0 z-50" data-testid="nav-header">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Left Side - Categories & Logo */}
          <div className="flex items-center space-x-6">
            {/* Categories Dropdown - Far Left */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-foreground hover:text-red-600 hover:bg-transparent font-medium flex items-center transition-colors border-none focus:border-none focus:ring-0 focus:outline-none" data-testid="categories-dropdown">
                    Categories <ChevronDown size={16} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem asChild>
                    <Link to="/browse?category=taxidermy" className="flex items-center">
                      Taxidermy & Bones
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/browse?category=vintage-medical" className="flex items-center">
                      Vintage Medical
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/browse?category=gothic-decor" className="flex items-center">
                      Gothic Home Decor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/browse?category=oddities" className="flex items-center">
                      Oddities & Curiosities
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/browse?category=specimens" className="flex items-center">
                      Antique Specimens
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/browse?category=victorian" className="flex items-center">
                      Victorian Era
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/browse" className="flex items-center font-medium">
                      View All Categories
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Link to="/" className="flex items-center" data-testid="logo">
              <h1 
                className="text-2xl curio-logo font-bold" 
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.setProperty('color', '#dc2626', 'important');
                  e.currentTarget.style.setProperty('text-shadow', '0 4px 8px rgba(0, 0, 0, 0.6), 0 0 15px rgba(220, 38, 38, 0.8)', 'important');
                  e.currentTarget.style.setProperty('transform', 'scale(1.02)', 'important');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty('color', '#ffffff', 'important');
                  e.currentTarget.style.setProperty('text-shadow', '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.1)', 'important');
                  e.currentTarget.style.setProperty('transform', 'scale(1)', 'important');
                }}
              >
                <span>
                  <span className="script-initial">C</span><span className="slow-letter">u</span>r<span className="slow-letter">i</span>o
                </span> <span>
                  <span className="script-initial">M</span>arket
                </span>
              </h1>
            </Link>
          </div>





          {/* Right Side Icons & User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                className="text-foreground hover:text-red-600 hover:bg-transparent p-2 transition-colors"
                data-testid="button-favorites"
              >
                <Heart size={20} />
              </Button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2 text-foreground hover:text-red-600 hover:bg-transparent transition-colors" data-testid="user-menu-trigger">
                    {(user as any)?.profileImageUrl ? (
                      <img 
                        src={(user as any).profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                        data-testid="user-avatar"
                      />
                    ) : (
                      <User size={24} className="text-foreground" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {sellerData ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/account" className="flex items-center">
                          <Store className="mr-2" size={16} />
                          Shop Manager
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/seller/dashboard" className="flex items-center">
                          <Settings className="mr-2" size={16} />
                          Shop Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/seller/listings/create" className="flex items-center">
                          <Plus className="mr-2" size={16} />
                          Add Listing
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/account" className="flex items-center">
                          <User className="mr-2" size={16} />
                          Your Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/seller/terms" className="flex items-center">
                          <Store className="mr-2" size={16} />
                          Sell on Curio Market
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2" size={16} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/api/login'}
                  className="text-foreground border-border hover:text-red-600 hover:border-red-600 hover:bg-transparent font-medium transition-colors"
                  data-testid="button-sign-up"
                >
                  Sign up
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/api/login'}
                  className="text-foreground border-border hover:text-red-600 hover:border-red-600 hover:bg-transparent font-medium transition-colors"
                  data-testid="button-sign-in"
                >
                  Sign in
                </Button>
              </div>
            )}

            {/* Shopping Cart - Far Right */}
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-red-600 hover:bg-transparent p-2 relative transition-colors"
              onClick={() => setCartOpen(true)}
              data-testid="button-cart"
            >
              <ShoppingCart size={20} />
              {isAuthenticated && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-background text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="cart-count">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu size={24} />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20" data-testid="mobile-menu">
            <div className="space-y-4">
              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-2">
                <Link to="/browse">
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                    Browse
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link to="/seller/dashboard">
                      <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
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
                    className="w-full bg-primary hover:bg-primary/80 text-white rounded-2xl"
                  >
                    Sign In / Join
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </nav>
  );
}
