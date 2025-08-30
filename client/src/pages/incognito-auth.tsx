import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function IncognitoAuth() {
  const [token, setToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if token is already set
    const existingToken = localStorage.getItem('replit_access_token');
    if (existingToken) {
      setToken(existingToken);
      setIsTokenSet(true);
    }

    // Check for token in URL params (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('access_token');
    if (tokenFromUrl) {
      localStorage.setItem('replit_access_token', tokenFromUrl);
      setToken(tokenFromUrl);
      setIsTokenSet(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      toast({
        title: "Authentication Success",
        description: "Your access token has been saved. You can now use the subscription page.",
      });
    }
  }, [toast]);

  const handleLogin = () => {
    // Redirect to login endpoint
    window.location.href = '/api/login';
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem('replit_access_token', token.trim());
      setIsTokenSet(true);
      toast({
        title: "Token Saved",
        description: "Your access token has been saved. You can now use the subscription page.",
      });
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('replit_access_token');
    setToken('');
    setIsTokenSet(false);
    toast({
      title: "Token Cleared",
      description: "Your access token has been removed.",
    });
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Copied",
      description: "Token copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gothic-black text-gothic-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect border border-gothic-purple/30">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-center">
                Incognito Mode Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  Since you're in incognito mode, cookies won't work. Use this page to authenticate with Replit and get an access token that works in incognito mode.
                </AlertDescription>
              </Alert>

              {!isTokenSet ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Option 1: Auto Login</h3>
                    <Button 
                      onClick={handleLogin}
                      className="bg-gothic-red hover:bg-gothic-red/80 text-white"
                      data-testid="button-auto-login"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Login with Replit
                    </Button>
                    <p className="text-sm text-gothic-white/70 mt-2">
                      This will redirect you to Replit for authentication
                    </p>
                  </div>

                  <div className="border-t border-gothic-purple/30 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Option 2: Manual Token</h3>
                    <form onSubmit={handleTokenSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="token">Access Token</Label>
                        <Input
                          id="token"
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Enter your Replit access token here"
                          className="bg-gothic-gray border-gothic-purple/30"
                          data-testid="input-token"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gothic-purple hover:bg-gothic-purple/80"
                        data-testid="button-save-token"
                      >
                        Save Token
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>Authentication token is set!</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Current Token</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={`${token.substring(0, 20)}...`}
                        readOnly
                        className="bg-gothic-gray border-gothic-purple/30"
                      />
                      <Button
                        onClick={copyToken}
                        variant="outline"
                        size="sm"
                        data-testid="button-copy-token"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.location.href = '/subscribe'}
                      className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white"
                      data-testid="button-go-subscribe"
                    >
                      Go to Subscription Page
                    </Button>
                    
                    <Button 
                      onClick={handleClearToken}
                      variant="outline"
                      className="w-full"
                      data-testid="button-clear-token"
                    >
                      Clear Token
                    </Button>
                  </div>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Click "Login with Replit" to authenticate</li>
                    <li>After login, you'll be redirected back with a token</li>
                    <li>The token will be automatically saved and you can use the subscription page</li>
                    <li>This token works in incognito mode since it's stored locally</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}