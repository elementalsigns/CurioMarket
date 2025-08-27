import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Skull, Eye, Users, Star } from "lucide-react";

export default function SignInPage() {
  useEffect(() => {
    document.title = "Sign In or Create Account - Curiosities Market";
  }, []);

  const handleSignIn = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900/90 border-zinc-800 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Simple C.M Logo */}
            <div className="flex justify-center">
              <div 
                className="text-6xl drop-shadow-lg"
                style={{ 
                  fontFamily: 'Amaranth, cursive',
                  color: 'hsl(351, 67%, 36%)',
                  filter: 'drop-shadow(0 0 8px hsl(351, 67%, 36%))'
                }}
              >
                CM
              </div>
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
                Sign in to your account or create a new one to explore our marketplace
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sign In Button - For Existing Users */}
            <div className="space-y-3">
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
                Sign In to Your Account
              </Button>
              
              <p className="text-xs text-zinc-500 text-center">
                Already have an account? Use the button above
              </p>
            </div>

            <Separator className="bg-zinc-700" />

            {/* Sign Up Button - For New Users */}
            <div className="space-y-3">
              <Button 
                onClick={handleSignIn}
                variant="outline"
                className="w-full h-12 font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl border-2"
                style={{ 
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'hsl(351, 67%, 36%)';
                  e.currentTarget.style.borderColor = 'hsl(351, 67%, 36%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'white';
                }}
                data-testid="button-signup-main"
              >
                <Users className="w-5 h-5 mr-2" />
                Create New Account
              </Button>
              
              <p className="text-xs text-zinc-500 text-center">
                New to Curiosities Market? Start here to join our community
              </p>
            </div>

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