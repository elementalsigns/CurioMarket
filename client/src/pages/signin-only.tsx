import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function SignInOnlyPage() {
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
                Welcome Back
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Sign in to your Curiosities Market account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sign In Button */}
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
                data-testid="button-signin-only"
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign In to Your Account
              </Button>
              <p className="text-xs text-zinc-500 text-center">
                Sign in with your existing Curiosities Market account
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-zinc-400">
                  <p className="font-medium text-zinc-300 mb-1">Secure Authentication</p>
                  <p>Your account is secured through Replit's authentication system. We'll only access your basic profile information to personalize your experience.</p>
                </div>
              </div>
            </div>

            {/* Link to Sign Up */}
            <div className="text-center pt-4 border-t border-zinc-700">
              <p className="text-sm text-zinc-400">
                Don't have an account?{" "}
                <a 
                  href="/signup" 
                  className="transition-colors duration-200"
                  style={{ color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(351, 67%, 36%)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                  Create one here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}