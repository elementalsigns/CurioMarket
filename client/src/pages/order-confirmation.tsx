import { CheckCircle, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function OrderConfirmation() {
  const handleContinueShopping = () => {
    window.location.href = "/browse";
  };

  const handleViewOrders = () => {
    window.location.href = "/account-manager?tab=orders";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8" data-testid="success-icon">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-4xl font-serif font-bold mb-2">Order Confirmed!</h1>
            <p className="text-foreground/70 text-lg">Thank you for your purchase from Curio Market</p>
          </div>

          {/* Order Details Card */}
          <Card className="glass-effect mb-8" data-testid="order-details">
            <CardHeader>
              <CardTitle className="font-serif">What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <Package className="text-gothic-red mt-1" size={24} />
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Order Processing</h3>
                  <p className="text-foreground/70 text-sm">
                    Your order has been sent to the seller(s) and will be processed within 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="text-gothic-red mt-1" size={24} />
                <div className="text-left">
                  <h3 className="font-semibold mb-1">Email Confirmation</h3>
                  <p className="text-foreground/70 text-sm">
                    You'll receive order confirmations and tracking information via email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleViewOrders}
              className="bg-gothic-red hover:bg-gothic-red/80 text-white px-8"
              data-testid="button-view-orders"
            >
              View My Orders
            </Button>
            <Button
              onClick={handleContinueShopping}
              variant="outline"
              className="px-8"
              data-testid="button-continue-shopping"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-foreground/5 rounded-lg">
            <h3 className="font-serif font-semibold mb-2">Need Help?</h3>
            <p className="text-foreground/70 text-sm mb-4">
              If you have questions about your order, please contact our support team.
            </p>
            <Button variant="ghost" className="text-gothic-red hover:text-gothic-red/80" asChild>
              <a href="/contact-us" data-testid="link-contact-support">Contact Support</a>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}