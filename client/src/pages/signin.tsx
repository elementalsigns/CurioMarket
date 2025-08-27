import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Skull, Eye, Users, Star } from "lucide-react";
import curioIcon from "@assets/generated_images/Gothic_skull_marketplace_icon_cb8f7497.png";

export default function SignInPage() {
  useEffect(() => {
    document.title = "Sign In - Curio Market";
  }, []);

  const handleSignIn = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/90 border-zinc-800 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Custom Gothic Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center shadow-xl">
                <img 
                  src={curioIcon} 
                  alt="Curio Market" 
                  className="w-12 h-12 opacity-90 filter brightness-110"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-zinc-100">
                Welcome to <span className="text-red-600">Curio Market</span>
              </CardTitle>
              <CardDescription className="text-zinc-400 text-base">
                Access your account to explore our gothic marketplace
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sign In Button */}
            <Button 
              onClick={handleSignIn}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              data-testid="button-signin-main"
            >
              <Shield className="w-5 h-5 mr-2" />
              Continue with Replit
            </Button>

            <Separator className="bg-zinc-700" />

            {/* Benefits Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300 text-center">
                Benefits of signing in:
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Eye className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Browse exclusive curiosities and specimens</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Users className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Connect with gothic collectors worldwide</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Star className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Save favorites and track your collection</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Skull className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Sell your own oddities and curios</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500 text-center leading-relaxed">
                Your account is secured through Replit's authentication system. 
                We'll only access your basic profile information to personalize your experience.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-x-4 text-sm">
          <a 
            href="/privacy" 
            className="text-zinc-500 hover:text-red-600 transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-zinc-700">•</span>
          <a 
            href="/terms" 
            className="text-zinc-500 hover:text-red-600 transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}