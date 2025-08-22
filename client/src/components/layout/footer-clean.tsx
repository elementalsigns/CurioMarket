import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function FooterClean() {
  return (
    <footer className="bg-background border-t border-primary/20 py-16 px-4 sm:px-6 lg:px-8 flex-shrink-0" data-testid="footer">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold mb-4 text-foreground">
              <span className="font-serif text-red-600 hover:text-red-500 transition-colors">
                Curio Market
              </span>
            </h3>
            <p className="text-foreground/70 mb-4 max-w-md">
              Your premier destination for oddities, curios, and unique specimens. Discover the extraordinary in our carefully curated marketplace.
            </p>
            <p className="text-foreground/60 text-sm">
              Email: Info@curiosities.market
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-lg font-serif font-bold mb-4 text-foreground">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/browse">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    All Categories
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/browse?category=taxidermy">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    Taxidermy
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/browse?category=specimens">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    Specimens
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/browse?category=bones">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    Bones & Skulls
                  </Button>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-serif font-bold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/sell">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    Start Selling
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    Order History
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    Messages
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/70 hover:text-red-600 hover:bg-transparent transition-colors">
                    Contact Us
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center" data-testid="footer-bottom">
          <p className="text-foreground/60 text-sm mb-4 md:mb-0">
            © 2024 Curio Market. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-foreground/60">
            <Link to="/privacy">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/60 hover:text-red-600 hover:bg-transparent transition-colors">
                <span className="text-foreground/60">Privacy Policy</span>
              </Button>
            </Link>
            <Link to="/terms">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/60 hover:text-red-600 hover:bg-transparent transition-colors">
                Terms of Service
              </Button>
            </Link>
            <Link to="/prohibited">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-foreground/60 hover:text-red-600 hover:bg-transparent transition-colors">
                Prohibited Items
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}