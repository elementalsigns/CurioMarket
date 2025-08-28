import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionPaymentProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ onSuccess, onCancel }: SubscriptionPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create subscription on mount
    const createSubscription = async () => {
      try {
        const response = await apiRequest('/api/seller/subscribe', {
          method: 'POST'
        }) as any;
        
        if (response?.status === 'active') {
          // Already subscribed
          onSuccess();
          return;
        }
        
        if (response?.clientSecret) {
          setClientSecret(response.clientSecret);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create subscription');
      }
    };

    createSubscription();
  }, [onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Confirm the subscription payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        // Payment succeeded
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#27272a',
        '::placeholder': {
          color: '#71717a',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-700">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Seller Subscription
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Join Curio Market as a seller for $10/month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-2">What's Included:</h3>
          <ul className="text-sm text-zinc-300 space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-red-400" />
              Create unlimited listings
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-red-400" />
              Professional seller dashboard
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-red-400" />
              Order management & analytics
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-red-400" />
              Direct customer messaging
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-red-400" />
              Only 3% platform fee per sale
            </li>
          </ul>
        </div>

        {clientSecret && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 border border-zinc-600 rounded-lg bg-zinc-800">
              <CardElement options={cardElementOptions} />
            </div>

            {error && (
              <Alert className="border-red-800 bg-red-900/20">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || loading}
                className="flex-1 bg-red-800 hover:bg-red-700 text-white"
                data-testid="button-subscribe"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Subscribe ($10/month)'
                )}
              </Button>
            </div>
          </form>
        )}

        <p className="text-xs text-zinc-500 text-center">
          You can cancel your subscription at any time. Billing is automatic and recurring.
        </p>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionPayment({ onSuccess, onCancel }: SubscriptionPaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}