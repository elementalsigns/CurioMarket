import { useLocation } from "wouter";
import MessagingSystem from "@/components/messaging-system";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Messages() {
  const [, setLocation] = useLocation();
  
  // Get URL search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sellerId = urlParams.get('sellerId');
  const sellerName = urlParams.get('sellerName');
  const listingId = urlParams.get('listingId');
  const listingTitle = urlParams.get('listingTitle');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/')}
              className="text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold">Messages</h1>
              {sellerName && (
                <p className="text-foreground/70">
                  {listingTitle ? `About "${listingTitle}" from ${sellerName}` : `Conversation with ${sellerName}`}
                </p>
              )}
            </div>
          </div>
          
          <Card className="glass-effect">
            <CardContent className="p-0">
              <MessagingSystem 
                listingId={listingId || undefined}
                sellerId={sellerId || undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}