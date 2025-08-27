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
            {/* Gothic C&M Monogram */}
            <div className="flex justify-center">
              <svg 
                width="90" 
                height="90" 
                viewBox="0 0 120 120" 
                className="drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 0 8px hsl(351, 67%, 36%))' }}
              >
                {/* Top ornamental flourish */}
                <path
                  d="M40 15 Q50 10 60 15 Q70 10 80 15 M45 12 Q50 8 55 12 Q60 8 65 12"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                
                {/* Sharp Gothic C */}
                <path
                  d="M48 35 Q30 35 30 50 Q30 65 48 65 L50 65 M50 40 L45 40 Q35 40 35 50 Q35 60 45 60 L50 60"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="4"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
                
                {/* Sharp Gothic M */}
                <path
                  d="M60 35 L60 65 M60 35 L70 50 L80 35 L80 65 M70 45 L70 58"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="4"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
                
                {/* Letter serifs and sharp details */}
                <path
                  d="M27 35 L33 35 M27 65 L33 65 M57 35 L63 35 M57 65 L63 65 M77 35 L83 35 M77 65 L83 65"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="3"
                  strokeLinecap="square"
                />
                
                {/* Bottom ornamental flourish */}
                <path
                  d="M40 85 Q50 90 60 85 Q70 90 80 85 M45 88 Q50 92 55 88 Q60 92 65 88"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
                
                {/* Corner flourishes */}
                <path
                  d="M20 25 Q25 20 30 25 M90 25 Q95 20 100 25 M20 75 Q25 80 30 75 M90 75 Q95 80 100 75"
                  fill="none"
                  stroke="hsl(351, 67%, 36%)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white">
                Welcome to <span 
                  className="transition-colors duration-200 cursor-default"
                  style={{ color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(351, 67%, 36%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                  Curio
                </span>sities <span 
                  className="transition-colors duration-200 cursor-default"
                  style={{ color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(351, 67%, 36%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                  Market
                </span>
              </CardTitle>
              <CardDescription className="text-zinc-400 text-base">
                Access your account to explore our marketplace
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