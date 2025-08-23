import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  BookOpen,
  Camera, 
  DollarSign,
  Package,
  Shield,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Clock,
  Award
} from "lucide-react";

export default function SellerGuideClean() {
  console.log("SellerGuideClean component is being rendered");
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header />
      
      <main className="flex-1 bg-zinc-950">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-b border-zinc-800">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <BookOpen className="h-12 w-12 text-red-500" />
                <h1 className="text-5xl font-serif font-bold text-white">
                  Seller's <span className="text-red-500">Guide</span>
                </h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                Transform your passion for the macabre into a thriving business. Learn everything you need to know about selling on Curio Market.
              </p>
              <div className="mt-8">
                <Link to="/seller/terms">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-medium">
                    Start Selling Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2 text-white">1,200+</div>
                  <div className="text-zinc-400">Active Sellers</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <DollarSign className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2 text-white">$850</div>
                  <div className="text-zinc-400">Average Monthly Revenue</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2 text-white">94%</div>
                  <div className="text-zinc-400">Seller Satisfaction Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Getting Started Guide */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold mb-4 text-white">
                Getting Started
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Follow these steps to launch your shop and start earning from your unique collection
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4 text-white">Create Your Account</h3>
                  <p className="text-zinc-400 mb-6">
                    Sign up and review our seller terms. We maintain high standards to ensure quality and authenticity for all items.
                  </p>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-red-400">Notice:</span>
                        <span className="text-zinc-300 ml-2">All sellers must subscribe to our $10/month plan plus 2.6% platform fee (5.5% total with Stripe processing)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4 text-white">Set Up Your Shop</h3>
                  <p className="text-zinc-400 mb-6">
                    Create your seller profile, upload a compelling shop banner, and write your story. This helps build trust with potential buyers.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Camera className="h-5 w-5 text-red-500" />
                          <span className="text-zinc-300">Professional Photos</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-red-500" />
                          <span className="text-zinc-300">Authenticity Guarantee</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}