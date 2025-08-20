import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SimpleDemo() {
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'hsl(212, 5%, 5%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        <h1 style={{fontSize: '2rem', marginBottom: '2rem', textAlign: 'center'}}>
          Account Manager Demo
        </h1>
        
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem'}}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(39, 39, 42, 1)',
            borderRadius: '0.5rem'
          }}>
            <Button
              onClick={() => setMode("buyer")}
              style={{
                backgroundColor: mode === "buyer" ? 'hsl(0, 77%, 26%)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Buyer View
            </Button>
            <Button
              onClick={() => setMode("seller")}
              style={{
                backgroundColor: mode === "seller" ? 'hsl(0, 77%, 26%)' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Seller View
            </Button>
          </div>
        </div>

        <div style={{display: 'flex', gap: '2rem'}}>
          {/* Sidebar */}
          <div style={{width: '300px'}}>
            <div style={{
              backgroundColor: 'rgba(39, 39, 42, 1)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(82, 82, 91, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  JC
                </div>
                <div>
                  <h3 style={{margin: 0, fontSize: '1.2rem'}}>Jane Collector</h3>
                  <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>jane@example.com</p>
                  {mode === "seller" && (
                    <span style={{
                      backgroundColor: 'hsl(0, 77%, 26%)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      display: 'inline-block'
                    }}>
                      Seller
                    </span>
                  )}
                </div>
              </div>
            </div>

            <nav style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'hsl(0, 77%, 26%)',
                color: 'white',
                borderRadius: '0.25rem'
              }}>
                📊 {mode === "seller" ? "Shop Overview" : "Account Overview"}
              </div>
              
              {mode === "seller" && (
                <>
                  <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                    📦 Your Listings
                  </div>
                  <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                    🛍️ Shop Orders
                  </div>
                  <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                    📈 Shop Stats
                  </div>
                  <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                    💬 Messages
                  </div>
                </>
              )}
              
              <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                🛒 Your Purchases
              </div>
              <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                ❤️ Favorites
              </div>
              <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                👤 Profile Settings
              </div>
              <div style={{padding: '0.75rem 1rem', color: 'rgba(161, 161, 170, 1)'}}>
                💳 {mode === "seller" ? "Billing & Payouts" : "Payment Methods"}
              </div>
              
              {mode === "buyer" && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid rgba(82, 82, 91, 1)',
                  borderRadius: '0.5rem'
                }}>
                  <Button style={{
                    width: '100%',
                    backgroundColor: 'hsl(0, 77%, 26%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}>
                    🏪 Become a Seller
                  </Button>
                </div>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <div style={{flex: 1}}>
            <div style={{
              backgroundColor: 'rgba(39, 39, 42, 1)',
              padding: '2rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{marginBottom: '2rem'}}>
                <h2 style={{fontSize: '2rem', margin: 0, marginBottom: '0.5rem'}}>
                  {mode === "seller" ? "Shop Manager" : "Your Account"}
                </h2>
                <p style={{color: 'rgba(161, 161, 170, 1)', margin: 0}}>
                  {mode === "seller" 
                    ? "Manage your shop, listings, and sales"
                    : "Manage your account settings and purchases"
                  }
                </p>
              </div>

              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: mode === "seller" ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {mode === "seller" ? (
                  <>
                    <div style={{
                      backgroundColor: 'rgba(24, 24, 27, 1)',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(82, 82, 91, 1)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span>📦</span>
                        <div>
                          <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>Total Listings</p>
                          <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold'}}>12</p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(24, 24, 27, 1)',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(82, 82, 91, 1)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span>🛍️</span>
                        <div>
                          <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>Total Sales</p>
                          <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold'}}>47</p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(24, 24, 27, 1)',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(82, 82, 91, 1)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span>💰</span>
                        <div>
                          <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>Revenue</p>
                          <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold'}}>$1,234</p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(24, 24, 27, 1)',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(82, 82, 91, 1)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span>⭐</span>
                        <div>
                          <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>Avg Rating</p>
                          <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold'}}>4.8</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      backgroundColor: 'rgba(24, 24, 27, 1)',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(82, 82, 91, 1)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span>🛒</span>
                        <div>
                          <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>Orders</p>
                          <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold'}}>8</p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(24, 24, 27, 1)',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(82, 82, 91, 1)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span>❤️</span>
                        <div>
                          <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>Favorites</p>
                          <p style={{margin: 0, fontSize: '2rem', fontWeight: 'bold'}}>23</p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(24, 24, 27, 1)',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(82, 82, 91, 1)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span>📅</span>
                        <div>
                          <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>Member Since</p>
                          <p style={{margin: 0, fontSize: '1.2rem', fontWeight: 'bold'}}>2024</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{
                backgroundColor: 'rgba(24, 24, 27, 1)',
                padding: '2rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(82, 82, 91, 1)'
              }}>
                <h3 style={{margin: '0 0 1rem 0'}}>
                  {mode === "seller" ? "📈 Recent Activity" : "🏪 Interested in Selling?"}
                </h3>
                {mode === "seller" ? (
                  <div style={{color: 'rgba(161, 161, 170, 1)'}}>
                    <p>• New order received - 2 hours ago</p>
                    <p>• Listing viewed 15 times - 1 day ago</p>
                    <p>• New follower - 3 days ago</p>
                  </div>
                ) : (
                  <div>
                    <p style={{color: 'rgba(161, 161, 170, 1)', marginBottom: '1rem'}}>
                      Turn your passion for oddities into income. Join our community of collectors and sellers.
                    </p>
                    <Button style={{
                      backgroundColor: 'hsl(0, 77%, 26%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer'
                    }}>
                      Learn About Selling
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}