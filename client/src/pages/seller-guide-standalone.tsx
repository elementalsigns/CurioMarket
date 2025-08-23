// Ultra-simple standalone seller guide - no external dependencies
function SellerGuideStandalone() {
  return (
    <div>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:wght@400;500;600;700&display=swap");
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a !important; color: white !important; font-family: Georgia, serif !important; }
        .seller-guide-container { min-height: 100vh; background: #0a0a0a; color: white; font-family: Georgia, serif; }
        .nav-bar { background: #0a0a0a; border-bottom: 1px solid #27272a; padding: 1rem 0; }
        .nav-content { max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { 
          font-size: 1.75rem; 
          color: white; 
          font-family: 'EB Garamond', serif;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-variant: small-caps;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.1);
          position: relative;
          transition: all 0.3s ease;
          display: inline-block;
          text-decoration: none;
        }
        .logo:hover {
          color: hsl(0, 77%, 26%);
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.6), 0 0 15px rgba(106, 27, 27, 0.5);
          transform: scale(1.02);
        }
        .logo::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: -10%;
          width: 120%;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, hsl(0, 77%, 26%) 15%, hsl(0, 77%, 26%) 85%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .logo:hover::after {
          opacity: 0.8;
        }
        .script-initial {
          font-family: 'Great Vibes', cursive;
          font-size: 1.3em;
          font-weight: normal;
          position: relative;
          display: inline-block;
          margin-right: -0.05em;
          transform: translateY(-0.05em);
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6), 0 0 12px rgba(106, 27, 27, 0.4);
          transition: all 0.3s ease;
        }
        .logo:hover .script-initial {
          transform: translateY(-0.08em) scale(1.05);
          text-shadow: 0 3px 8px rgba(0, 0, 0, 0.7), 0 0 15px rgba(106, 27, 27, 0.6);
        }
        .nav-buttons { display: flex; gap: 1rem; }
        .btn-primary { background: hsl(0, 77%, 26%); color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
        .btn-secondary { background: transparent; color: white; padding: 0.5rem 1rem; border: 1px solid #52525b; border-radius: 4px; cursor: pointer; }
        .main-content { padding: 3rem 1rem; }
        .content-wrapper { max-width: 1000px; margin: 0 auto; }
        .hero { text-align: center; margin-bottom: 4rem; }
        .hero h1 { font-size: 3.5rem; font-weight: bold; margin: 0 0 1.5rem 0; color: white; }
        .hero .accent { color: hsl(0, 77%, 26%); }
        .hero p { font-size: 1.25rem; color: #a1a1aa; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 4rem; }
        .stat-card { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 2rem; text-align: center; }
        .stat-number { font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem; color: white; }
        .stat-label { color: #a1a1aa; }
        .section-title { font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 1rem; color: white; }
        .section-subtitle { font-size: 1.25rem; color: #a1a1aa; text-align: center; margin-bottom: 3rem; max-width: 700px; margin-left: auto; margin-right: auto; }
        .steps { display: flex; flex-direction: column; gap: 3rem; margin-bottom: 4rem; }
        .step { display: flex; gap: 1.5rem; align-items: flex-start; }
        .step-number { width: 48px; height: 48px; background: hsl(0, 77%, 26%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.25rem; flex-shrink: 0; }
        .step-content h3 { font-size: 1.75rem; font-weight: 600; margin-bottom: 1rem; color: white; }
        .step-content p { color: #a1a1aa; line-height: 1.6; margin-bottom: 1.5rem; }
        .notice { background: #18181b; border: 2px solid hsl(0, 77%, 26%); border-radius: 8px; padding: 1rem; display: flex; align-items: flex-start; gap: 0.75rem; }
        .notice-label { color: hsl(0, 77%, 26%); font-weight: 500; }
        .notice-text { color: #d4d4d8; }
        .pricing-section { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 2.5rem; margin-bottom: 4rem; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .pricing-item { text-align: center; }
        .price { font-size: 3rem; font-weight: bold; color: hsl(0, 77%, 26%); margin-bottom: 1rem; }
        .price-label { font-size: 1.25rem; color: white; margin-bottom: 0.5rem; }
        .price-desc { color: #a1a1aa; }
        .cta-section { text-align: center; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
        .btn-large { padding: 0.75rem 2rem; font-size: 1.125rem; font-weight: 500; border-radius: 6px; cursor: pointer; }
        
        /* Footer Styles - Match home page exactly */
        .footer { background: #0a0a0a; border-top: 3px solid white; padding: 4rem 1rem; margin-top: 4rem; flex-shrink: 0; }
        .footer-container { max-width: 80rem; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
        .footer-brand { grid-column: span 1; }
        .footer-brand .logo { margin-bottom: 1rem; display: flex; align-items: center; }
        .footer-description { color: #a1a1aa; margin-bottom: 1.5rem; max-width: 28rem; line-height: 1.6; }
        .social-links { display: flex; gap: 1rem; }
        .social-btn { background: transparent; border: none; color: #a1a1aa; padding: 0.5rem; cursor: pointer; transition: color 0.3s; border-radius: 0.375rem; }
        .social-btn:hover { color: hsl(0, 77%, 26%); background: transparent; }
        .footer-section h4 { color: white; font-size: 1.125rem; font-family: Georgia, serif; font-weight: bold; margin-bottom: 1rem; }
        .footer-links { list-style: none; }
        .footer-links li { margin-bottom: 0.5rem; }
        .footer-link { 
          color: #a1a1aa; 
          text-decoration: none; 
          transition: color 0.3s, background-color 0.3s; 
          cursor: pointer; 
          padding: 0.25rem 0;
          border-radius: 0.375rem;
          display: inline-block;
          background: transparent;
          border: none;
          font-size: 0.875rem;
          line-height: 1.25rem;
          height: auto;
        }
        .footer-link:hover { color: rgb(220, 38, 38); background: transparent; }
        .footer-bottom { border-top: 2px solid white; padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .footer-copyright { color: rgba(113, 113, 122, 1); font-size: 0.875rem; margin-bottom: 1rem; }
        .footer-legal { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .footer-legal .footer-link { font-size: 0.875rem; margin-bottom: 0; }
        
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-brand { grid-column: span 1; }
          .footer-bottom { flex-direction: column; text-align: center; }
          .footer-legal { justify-content: center; }
          .footer-copyright { margin-bottom: 0; }
        }
      `}</style>
      
      <div className="seller-guide-container">
        <nav className="nav-bar">
          <div className="nav-content">
            <a href="/" className="logo">
              <span className="script-initial">C</span>urio <em><span className="script-initial">M</span>arket</em>
            </a>
            <div className="nav-buttons">
              <button className="btn-primary" onClick={() => window.location.href = '/api/login'}>Sign up</button>
              <button className="btn-secondary" onClick={() => window.location.href = '/api/login'}>Sign in</button>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <div className="content-wrapper">
            <div className="hero">
              <h1>Seller's <span className="accent">Guide</span></h1>
              <p>Transform your passion for the macabre into a thriving business. Learn everything you need to know about selling on Curio Market.</p>
              <button className="btn-primary btn-large" onClick={() => window.location.href = '/seller/terms'}>Start Selling Today</button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">1,200+</div>
                <div className="stat-label">Active Sellers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">$850</div>
                <div className="stat-label">Average Monthly Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">94%</div>
                <div className="stat-label">Seller Satisfaction Rate</div>
              </div>
            </div>

            <div>
              <h2 className="section-title">Getting Started</h2>
              <p className="section-subtitle">Follow these steps to launch your shop and start earning from your unique collection</p>

              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Create Your Account</h3>
                    <p>Sign up and review our seller terms. We maintain high standards to ensure quality and authenticity for all items.</p>
                    <div className="notice">
                      <span className="notice-label">Notice:</span>
                      <span className="notice-text">All sellers must subscribe to our $10/month plan plus 2.6% platform fee (5.5% total with Stripe processing)</span>
                    </div>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Set Up Your Shop</h3>
                    <p>Create your seller profile, upload a compelling shop banner, and write your story. This helps build trust with potential buyers.</p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>List Your Items</h3>
                    <p>Add detailed descriptions, high-quality photos, and proper categories. Include provenance and condition details for authenticity.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pricing-section">
              <h2 className="section-title">Transparent Pricing</h2>
              <div className="pricing-grid">
                <div className="pricing-item">
                  <div className="price">$10</div>
                  <div className="price-label">Monthly Subscription</div>
                  <div className="price-desc">Access to seller tools, analytics, and support</div>
                </div>
                <div className="pricing-item">
                  <div className="price">5.5%</div>
                  <div className="price-label">Total Fees</div>
                  <div className="price-desc">2.6% platform + 2.9% Stripe processing</div>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <h2 className="section-title">Ready to Start Your Gothic Empire?</h2>
              <p className="section-subtitle">Join our community of passionate sellers and turn your unique collection into a profitable business.</p>
              <div className="cta-buttons">
                <button className="btn-primary btn-large" onClick={() => window.location.href = '/seller/terms'}>Begin Seller Application</button>
                <button className="btn-secondary btn-large" onClick={() => window.location.href = '/seller/terms'}>Read Seller Terms</button>
              </div>
            </div>
          </div>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="logo">
                  <span className="script-initial">C</span>urio <em><span className="script-initial">M</span>arket</em>
                </div>
                <p className="footer-description">
                  The premier marketplace for oddities, curios, and specimens. Connecting collectors 
                  and enthusiasts with authentic and unique items from around the world.
                </p>
                <div className="social-links">
                  <button className="social-btn" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </button>
                  <button className="social-btn" aria-label="Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="social-btn" aria-label="Pinterest">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="footer-section">
                <h4>Shop</h4>
                <ul className="footer-links">
                  <li><button className="footer-link" onClick={() => window.location.href = '/browse'}>All Categories</button></li>
                  <li><button className="footer-link" onClick={() => window.location.href = '/browse?category=wet-specimens'}>Wet Specimens</button></li>
                  <li><button className="footer-link" onClick={() => window.location.href = '/browse?category=taxidermy'}>Taxidermy</button></li>
                  <li><button className="footer-link" onClick={() => window.location.href = '/browse?category=bones-skulls'}>Bones & Skulls</button></li>
                  <li><button className="footer-link" onClick={() => window.location.href = '/browse?category=occult-art'}>Occult Art</button></li>
                </ul>
              </div>

              <div className="footer-section">
                <h4>Support</h4>
                <ul className="footer-links">
                  <li><button className="footer-link" onClick={() => window.location.href = '/help'}>Help Center</button></li>
                  <li><button className="footer-link" onClick={() => window.location.href = '/seller/guide'}>Seller Guide</button></li>
                  <li><button className="footer-link" onClick={() => window.location.href = '/safety'}>Safety Guidelines</button></li>
                  <li><button className="footer-link" onClick={() => window.location.href = '/contact'}>Contact Us</button></li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-copyright">
                © 2024 Curio Market. All rights reserved.
              </div>
              <div className="footer-legal">
                <button className="footer-link" onClick={() => window.location.href = '/privacy'}>Privacy Policy</button>
                <button className="footer-link" onClick={() => window.location.href = '/terms'}>Terms of Service</button>
                <button className="footer-link" onClick={() => window.location.href = '/cookies'}>Cookie Policy</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default SellerGuideStandalone;