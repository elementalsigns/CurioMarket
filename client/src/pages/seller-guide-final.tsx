import { useEffect, useState } from 'react';

export default function SellerGuideFinal() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Ensure component is fully mounted before rendering content
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: 'white', 
      fontFamily: 'Georgia, serif' 
    }}>
      {/* Header */}
      <nav style={{ 
        backgroundColor: '#0a0a0a', 
        borderBottom: '1px solid #27272a', 
        padding: '1rem 0' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
            <span style={{ color: 'white' }}>Curio</span>{' '}
            <em style={{ color: 'white' }}>Market</em>
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Sign up
            </button>
            <button style={{
              backgroundColor: 'transparent',
              color: 'white',
              padding: '0.5rem 1rem',
              border: '1px solid #52525b',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 'bold', 
              margin: '0 0 1.5rem 0',
              color: 'white'
            }}>
              Seller's <span style={{ color: '#dc2626' }}>Guide</span>
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#a1a1aa', 
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              Transform your passion for the macabre into a thriving business. Learn everything you need to know about selling on Curio Market.
            </p>
            <button style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.75rem 2rem',
              fontSize: '1.125rem',
              fontWeight: '500',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Start Selling Today
            </button>
          </div>

          {/* Stats Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem', 
            marginBottom: '4rem' 
          }}>
            <div style={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #27272a',
              borderRadius: '8px', 
              padding: '2rem', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                1,200+
              </div>
              <div style={{ color: '#a1a1aa' }}>Active Sellers</div>
            </div>
            <div style={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #27272a',
              borderRadius: '8px', 
              padding: '2rem', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                $850
              </div>
              <div style={{ color: '#a1a1aa' }}>Average Monthly Revenue</div>
            </div>
            <div style={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #27272a',
              borderRadius: '8px', 
              padding: '2rem', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                94%
              </div>
              <div style={{ color: '#a1a1aa' }}>Seller Satisfaction Rate</div>
            </div>
          </div>

          {/* Getting Started Section */}
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              marginBottom: '1rem',
              color: 'white'
            }}>
              Getting Started
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              color: '#a1a1aa', 
              textAlign: 'center', 
              marginBottom: '3rem',
              maxWidth: '700px',
              margin: '0 auto 3rem auto'
            }}>
              Follow these steps to launch your shop and start earning from your unique collection
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dc2626',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  flexShrink: '0'
                }}>
                  1
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '600', 
                    marginBottom: '1rem', 
                    color: 'white' 
                  }}>
                    Create Your Account
                  </h3>
                  <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Sign up and review our seller terms. We maintain high standards to ensure quality and authenticity for all items.
                  </p>
                  <div style={{
                    backgroundColor: '#18181b',
                    border: '2px solid #dc2626',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ color: '#dc2626', fontWeight: '500' }}>Notice:</span>
                      <span style={{ color: '#d4d4d8' }}>All sellers must subscribe to our $10/month plan plus 3% transaction fees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dc2626',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  flexShrink: '0'
                }}>
                  2
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '600', 
                    marginBottom: '1rem', 
                    color: 'white' 
                  }}>
                    Set Up Your Shop
                  </h3>
                  <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                    Create your seller profile, upload a compelling shop banner, and write your story. This helps build trust with potential buyers.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dc2626',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  flexShrink: '0'
                }}>
                  3
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '600', 
                    marginBottom: '1rem', 
                    color: 'white' 
                  }}>
                    List Your Items
                  </h3>
                  <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                    Add detailed descriptions, high-quality photos, and proper categories. Include provenance and condition details for authenticity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '2.5rem',
            marginBottom: '4rem'
          }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              marginBottom: '2rem',
              color: 'white'
            }}>
              Transparent Pricing
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '2rem' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
                  $10
                </div>
                <div style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>
                  Monthly Subscription
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  Access to seller tools, analytics, and support
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
                  3%
                </div>
                <div style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>
                  Transaction Fee
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  Applied only to completed sales
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              Ready to Start Your Gothic Empire?
            </h2>
            <p style={{ 
              color: '#a1a1aa', 
              marginBottom: '2rem',
              fontSize: '1.125rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              Join our community of passionate sellers and turn your unique collection into a profitable business.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.75rem 2rem',
                fontSize: '1.125rem',
                fontWeight: '500',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Begin Seller Application
              </button>
              <button style={{
                backgroundColor: 'transparent',
                color: 'white',
                padding: '0.75rem 2rem',
                fontSize: '1.125rem',
                fontWeight: '500',
                border: '1px solid #52525b',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Read Seller Terms
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}