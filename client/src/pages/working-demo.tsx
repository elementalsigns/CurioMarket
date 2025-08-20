function WorkingDemo() {
  const mode = "buyer";
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'hsl(212, 5%, 5%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(82, 82, 91, 1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0,
            color: 'white'
          }}>
            Curio Market
          </h1>
          <div style={{display: 'flex', gap: '1rem'}}>
            <button style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid rgba(82, 82, 91, 1)',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}>
              Sign up
            </button>
            <button style={{
              backgroundColor: 'hsl(0, 77%, 26%)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Account Manager Demo
        </h1>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(39, 39, 42, 1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(82, 82, 91, 1)'
          }}>
            <button 
              style={{
                backgroundColor: 'hsl(0, 77%, 26%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onclick="toggleMode('buyer')"
            >
              Buyer View
            </button>
            <button 
              style={{
                backgroundColor: 'transparent',
                color: 'rgba(161, 161, 170, 1)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
              onclick="toggleMode('seller')"
            >
              Seller View
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start'
        }}>
          {/* Sidebar */}
          <div style={{
            width: '320px',
            flexShrink: 0
          }}>
            {/* User Profile */}
            <div style={{
              backgroundColor: 'rgba(39, 39, 42, 1)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(82, 82, 91, 1)',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(82, 82, 91, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  JC
                </div>
                <div>
                  <h3 style={{margin: 0, fontSize: '1.2rem'}}>Jane Collector</h3>
                  <p style={{margin: 0, color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>jane@example.com</p>
                  <span style={{
                    backgroundColor: 'hsl(0, 77%, 26%)',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    display: 'inline-block'
                  }}>
                    Buyer
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'hsl(0, 77%, 26%)',
                color: 'white',
                borderRadius: '0.25rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>📊</span> Account Overview
              </div>
              
              <div style={{
                padding: '0.75rem 1rem',
                color: 'rgba(161, 161, 170, 1)',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <span>🛒</span> Your Purchases
              </div>
              
              <div style={{
                padding: '0.75rem 1rem',
                color: 'rgba(161, 161, 170, 1)',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <span>❤️</span> Favorites
              </div>
              
              <div style={{
                padding: '0.75rem 1rem',
                color: 'rgba(161, 161, 170, 1)',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <span>👤</span> Profile Settings
              </div>
              
              <div style={{
                padding: '0.75rem 1rem',
                color: 'rgba(161, 161, 170, 1)',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <span>💳</span> Payment Methods
              </div>
              
              <div style={{
                padding: '0.75rem 1rem',
                color: 'rgba(161, 161, 170, 1)',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <span>🔔</span> Notifications
              </div>
              
              <div style={{
                padding: '0.75rem 1rem',
                color: 'rgba(161, 161, 170, 1)',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <span>🛡️</span> Privacy Settings
              </div>
              
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                border: '1px solid rgba(82, 82, 91, 1)',
                borderRadius: '0.5rem'
              }}>
                <button style={{
                  width: '100%',
                  backgroundColor: 'hsl(0, 77%, 26%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🏪</span> Become a Seller
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div style={{flex: 1}}>
            <div style={{
              backgroundColor: 'rgba(39, 39, 42, 1)',
              padding: '2rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(82, 82, 91, 1)'
            }}>
              <div style={{marginBottom: '2rem'}}>
                <h2 style={{
                  fontSize: '2rem',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  Your Account
                </h2>
                <p style={{
                  color: 'rgba(161, 161, 170, 1)',
                  margin: 0,
                  fontSize: '1.1rem'
                }}>
                  Manage your account settings and purchases
                </p>
              </div>

              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  backgroundColor: 'rgba(24, 24, 27, 1)',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(82, 82, 91, 1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{fontSize: '1.5rem'}}>🛒</span>
                    <div>
                      <p style={{
                        margin: 0,
                        color: 'rgba(161, 161, 170, 1)',
                        fontSize: '0.9rem'
                      }}>
                        Orders
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}>
                        8
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(24, 24, 27, 1)',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(82, 82, 91, 1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{fontSize: '1.5rem'}}>❤️</span>
                    <div>
                      <p style={{
                        margin: 0,
                        color: 'rgba(161, 161, 170, 1)',
                        fontSize: '0.9rem'
                      }}>
                        Favorites
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}>
                        23
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(24, 24, 27, 1)',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(82, 82, 91, 1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{fontSize: '1.5rem'}}>📅</span>
                    <div>
                      <p style={{
                        margin: 0,
                        color: 'rgba(161, 161, 170, 1)',
                        fontSize: '0.9rem'
                      }}>
                        Member Since
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        2024
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div style={{
                backgroundColor: 'rgba(24, 24, 27, 1)',
                padding: '2rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(82, 82, 91, 1)'
              }}>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🏪</span> Interested in Selling?
                </h3>
                <p style={{
                  color: 'rgba(161, 161, 170, 1)',
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}>
                  Turn your passion for oddities into income. Join our community of collectors and sellers.
                </p>
                <button style={{
                  backgroundColor: 'hsl(0, 77%, 26%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}>
                  Learn About Selling
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTop: '1px solid rgba(82, 82, 91, 1)',
        padding: '2rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem'
        }}>
          <div>
            <h3 style={{marginBottom: '1rem'}}>Curio Market</h3>
            <p style={{color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>
              The marketplace for oddities and curiosities
            </p>
          </div>
          <div>
            <h4 style={{marginBottom: '1rem'}}>Shop</h4>
            <p style={{color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>
              Browse categories and find unique items
            </p>
          </div>
          <div>
            <h4 style={{marginBottom: '1rem'}}>Support</h4>
            <p style={{color: 'rgba(161, 161, 170, 1)', fontSize: '0.9rem'}}>
              Get help with your account and orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkingDemo;