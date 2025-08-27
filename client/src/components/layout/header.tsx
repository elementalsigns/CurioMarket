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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 sm:py-3">
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center space-x-6 flex-1">
            {/* Categories Dropdown - Far Left */}
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
                    Gothic Decor
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
                <DropdownMenuItem asChild>
                  <Link to="/browse?category=jewelry" className="flex items-center">
                    Jewelry
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/browse?category=occult" className="flex items-center">
                    Occult
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/browse?category=murderabilia" className="flex items-center">
                    Murderabilia
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

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between w-full min-h-[48px]">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="text-foreground p-1.5 min-w-[40px] min-h-[40px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu size={20} />
            </Button>

            {/* Mobile Logo */}
            <Link to="/" className="flex items-center flex-1 justify-center px-1" data-testid="mobile-logo">
              <h1 className="text-sm xs:text-base sm:text-lg curio-logo font-bold text-white whitespace-nowrap max-w-[200px] text-center">
                <span>
                  <span className="script-initial">C</span>urio
                </span> <span>
                  <span className="script-initial">M</span>arket
                </span>
              </h1>
            </Link>

            {/* Mobile Cart */}
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-red-600 hover:bg-transparent p-1.5 relative transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              onClick={() => setCartOpen(true)}
              data-testid="button-cart-mobile"
            >
              <ShoppingCart size={20} />
              {isAuthenticated && cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-medium" data-testid="cart-count-mobile">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Button>
          </div>

          {/* Desktop Right Side Icons & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
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
                      <User size={24} />
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
                  asChild
                  className="text-foreground border-border hover:text-red-600 hover:border-red-600 hover:bg-transparent font-medium transition-colors"
                  data-testid="button-sign-up"
                >
                  <Link to="/signin">Sign up</Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="text-foreground border-border hover:text-red-600 hover:border-red-600 hover:bg-transparent font-medium transition-colors"
                  data-testid="button-sign-in"
                >
                  <Link to="/signin">Sign in</Link>
                </Button>
              </div>
            )}

            {/* Events Link */}
            <Link to="/events">
              <Button 
                variant="ghost" 
                className="text-foreground hover:text-red-600 hover:bg-transparent transition-colors font-medium"
                data-testid="button-events"
              >
                Events
              </Button>
            </Link>

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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background" data-testid="mobile-menu">
            <div className="space-y-3 px-2">
              {/* Auth Buttons for Mobile */}
              {!isAuthenticated && (
                <div className="flex space-x-3 mb-4">
                  <Button 
                    variant="outline" 
                    asChild
                    className="flex-1 text-foreground border-border hover:text-red-600 hover:border-red-600 hover:bg-transparent font-medium transition-colors text-sm min-h-[44px]"
                    data-testid="button-sign-up-mobile"
                  >
                    <Link to="/signin">Sign up</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    asChild
                    className="flex-1 text-foreground border-border hover:text-red-600 hover:border-red-600 hover:bg-transparent font-medium transition-colors text-sm min-h-[44px]"
                    data-testid="button-sign-in-mobile"
                  >
                    <Link to="/signin">Sign in</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-1">
                <Link to="/browse" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                    Browse All Categories
                  </Button>
                </Link>
                
                <Link to="/events" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                    Events
                  </Button>
                </Link>

                {isAuthenticated && (
                  <>
                    <Link to="/wishlists" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                        <Heart className="mr-3" size={18} />
                        Favorites
                      </Button>
                    </Link>
                    
                    {sellerData ? (
                      <>
                        <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                            <Store className="mr-3" size={18} />
                            Shop Manager
                          </Button>
                        </Link>
                        <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                            <Settings className="mr-3" size={18} />
                            Shop Settings
                          </Button>
                        </Link>
                        <Link to="/seller/listings/create" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                            <Plus className="mr-3" size={18} />
                            Add Listing
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                            <User className="mr-3" size={18} />
                            Your Account
                          </Button>
                        </Link>
                        <Link to="/seller/terms" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-foreground hover:text-red-600 hover:bg-transparent transition-colors min-h-[44px] text-base">
                            <Store className="mr-3" size={18} />
                            Sell on Curio Market
                          </Button>
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-border my-2"></div>
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-transparent transition-colors min-h-[44px] text-base"
                    >
                      <LogOut className="mr-3" size={18} />
                      Sign Out
                    </Button>
                  </>
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