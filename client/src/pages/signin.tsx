import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Skull, Eye, Users, Star } from "lucide-react";

export default function SignInPage() {
  useEffect(() => {
    document.title = "Sign In - Curiosities Market";
  }, []);

  const handleSignIn = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/90 border-zinc-800 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Custom Gothic Sigil */}
            <div className="flex justify-center">
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 100 100" 
                className="drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 0 8px hsl(351, 67%, 36%))' }}
              >
                {/* Gothic C */}
                <path
                  d="M35 20 Q20 20 20 35 L20 65 Q20 80 35 80 L45 80 Q50 80 50 75 Q50 70 45 70 L35 70 Q30 70 30 65 L30 35 Q30 30 35 30 L45 30 Q50 30 50 25 Q50 20 45 20 Z"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="3"
                  className="gothic-letter"
                />
                {/* Gothic M overlapping */}
                <path
                  d="M45 25 L45 75 M45 25 Q50 30 55 25 Q60 30 65 25 L65 75 M55 45 L55 60"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="gothic-letter"
                />
                {/* Decorative gothic flourishes */}
                <path
                  d="M15 15 Q25 10 35 15 M65 15 Q75 10 85 15 M15 85 Q25 90 35 85 M65 85 Q75 90 85 85"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-zinc-100">
                Welcome to <span style={{ color: 'hsl(351, 67%, 36%)' }}>Curiosities Market</span>
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
              className="w-full h-12 text-white font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: 'hsl(351, 67%, 36%)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(351, 67%, 32%)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(351, 67%, 36%)'}
              data-testid="button-signin-main"
            >
              <Shield className="w-5 h-5 mr-2" />
              Sign In
            </Button>

            <Separator className="bg-zinc-700" />

            {/* Benefits Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300 text-center">
                Benefits of signing in:
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Eye className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(351, 67%, 36%)' }} />
                  <span>Browse exclusive curiosities and specimens</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Users className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(351, 67%, 36%)' }} />
                  <span>Connect with gothic collectors worldwide</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Star className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(351, 67%, 36%)' }} />
                  <span>Save favorites and track your collection</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-zinc-400">
                  <Skull className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(351, 67%, 36%)' }} />
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
            className="text-zinc-500 transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(351, 67%, 36%)'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            Privacy Policy
          </a>
          <span className="text-zinc-700">•</span>
          <a 
            href="/terms" 
            className="text-zinc-500 transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(351, 67%, 36%)'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}