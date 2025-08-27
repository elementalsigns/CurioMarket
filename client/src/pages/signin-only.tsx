import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div 
            className="text-8xl font-bold drop-shadow-lg"
            style={{ 
              fontFamily: 'Amaranth, cursive',
              color: 'hsl(351, 67%, 36%)',
              filter: 'drop-shadow(0 0 12px hsl(351, 67%, 36%))'
            }}
          >
            CM
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Welcome to Curiosities Market
          </h1>
          <p className="text-zinc-400 text-base">
            Sign in to your account to explore our marketplace
          </p>
        </div>

        {/* Sign In Button */}
        <div className="space-y-3">
          <Button 
            onClick={handleSignIn}
            variant="outline"
            className="w-full h-14 font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl border-2"
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
            <Shield className="w-5 h-5 mr-2" />
            Sign In to Your Account
          </Button>
          <p className="text-sm text-zinc-500 text-center">
            Already have an account? Use the button above
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-700 my-8"></div>

        {/* Security Notice */}
        <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
          <div className="text-sm text-zinc-400 text-center">
            <p className="font-medium text-zinc-300 mb-2">Secure Authentication</p>
            <p>Your account is secured through Replit's authentication system. We'll only access your basic profile information to personalize your experience.</p>
          </div>
        </div>

        {/* Link to Sign Up */}
        <div className="text-center">
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
      </div>
    </div>
  );
}