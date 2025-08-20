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
        .footer { background: #0a0a0a; border-top: 1px solid rgba(106, 27, 27, 0.2); padding: 4rem 1rem; margin-top: 4rem; flex-shrink: 0; }
        .footer-container { max-width: 80rem; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-bottom: 3rem; }
        .footer-brand { grid-column: span 2; }
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
        .footer-bottom { border-top: 1px solid rgba(106, 27, 27, 0.2); padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
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
            <div className="logo">
              <span className="script-initial">C</span>urio <em><span className="script-initial">M</span>arket</em>
            </div>
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
                      <span className="notice-text">All sellers must subscribe to our $10/month plan plus 3% transaction fees</span>
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
                  <div className="price">3%</div>
                  <div className="price-label">Transaction Fee</div>
                  <div className="price-desc">Applied only to completed sales</div>
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
          <div className="footer-container">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="logo">
                  <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>
                    <span>
                      <span className="script-initial">C</span><span>u</span>r<span>i</span>o
                    </span> <span>
                      <span className="script-initial">M</span>arket
                    </span>
                  </h3>
                </div>
                <p className="footer-description">
                  The independent marketplace for oddities, curios, and specimens. Built by collectors, for collectors.
                </p>
                <div className="social-links">
                  <button className="social-btn">
                    <i className="fab fa-instagram" style={{fontSize: '1.25rem'}}></i>
                  </button>
                  <button className="social-btn">
                    <i className="fab fa-twitter" style={{fontSize: '1.25rem'}}></i>
                  </button>
                  <button className="social-btn">
                    <i className="fab fa-facebook" style={{fontSize: '1.25rem'}}></i>
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
              <p className="footer-copyright">
                © 2024 Curio Market. All rights reserved.
              </p>
              <div className="footer-legal">
                <button className="footer-link" onClick={() => window.location.href = '/privacy'}>Privacy Policy</button>
                <button className="footer-link" onClick={() => window.location.href = '/terms'}>Terms of Service</button>
                <button className="footer-link" onClick={() => window.location.href = '/prohibited'}>Prohibited Items</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default SellerGuideStandalone;