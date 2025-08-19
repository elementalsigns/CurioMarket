import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gothic-black border-t border-gothic-purple/20 py-16 px-4 sm:px-6 lg:px-8" data-testid="footer">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4" data-testid="footer-logo">
              <div className="text-2xl">🌙</div>
              <h3 className="text-2xl font-serif font-bold text-gothic-white">Curio Market</h3>
            </div>
            <p className="text-gothic-white/70 mb-6 max-w-md" data-testid="footer-description">
              The independent marketplace for oddities, curios, and specimens. Built by collectors, for collectors.
            </p>
            <div className="flex space-x-4" data-testid="social-links">
              <Button variant="ghost" size="sm" className="text-gothic-white/70 hover:text-gothic-purple">
                <i className="fab fa-instagram text-xl"></i>
              </Button>
              <Button variant="ghost" size="sm" className="text-gothic-white/70 hover:text-gothic-purple">
                <i className="fab fa-twitter text-xl"></i>
              </Button>
              <Button variant="ghost" size="sm" className="text-gothic-white/70 hover:text-gothic-purple">
                <i className="fab fa-facebook text-xl"></i>
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div data-testid="footer-shop">
            <h4 className="text-lg font-serif font-bold mb-4 text-gothic-white">Shop</h4>
            <ul className="space-y-2 text-gothic-white/70">
              <li>
                <Link to="/browse">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                    All Categories
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/browse?category=wet-specimens">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                    Wet Specimens
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/browse?category=taxidermy">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                    Taxidermy
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/browse?category=bones-skulls">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                    Bones & Skulls
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/browse?category=occult-art">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                    Occult Art
                  </Button>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div data-testid="footer-support">
            <h4 className="text-lg font-serif font-bold mb-4 text-gothic-white">Support</h4>
            <ul className="space-y-2 text-gothic-white/70">
              <li>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                  Help Center
                </Button>
              </li>
              <li>
                <Link to="/seller/guide">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                    Seller Guide
                  </Button>
                </Link>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                  Safety Guidelines
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/70 hover:text-gothic-purple">
                  Contact Us
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gothic-purple/20 pt-8 flex flex-col md:flex-row justify-between items-center" data-testid="footer-bottom">
          <p className="text-gothic-white/60 text-sm mb-4 md:mb-0">
            © 2024 Curio Market. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gothic-white/60">
            <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/60 hover:text-gothic-purple">
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/60 hover:text-gothic-purple">
              Terms of Service
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto text-gothic-white/60 hover:text-gothic-purple">
              Prohibited Items
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
