// Privacy Policy page with embedded CSS to avoid React error boundaries
function PrivacyPolicyStandalone() {
  return (
    <div>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:wght@400;500;600;700&display=swap");
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a !important; color: white !important; font-family: Georgia, serif !important; }
        .privacy-container { min-height: 100vh; background: #0a0a0a; color: white; font-family: Georgia, serif; }
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
        .section { margin-bottom: 3rem; }
        .section h2 { font-size: 2rem; font-weight: 600; margin-bottom: 1.5rem; color: white; }
        .section h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: white; margin-top: 2rem; }
        .section p { color: #d4d4d8; line-height: 1.6; margin-bottom: 1.5rem; }
        .section ul { color: #d4d4d8; line-height: 1.6; margin-bottom: 1.5rem; padding-left: 2rem; }
        .section li { margin-bottom: 0.5rem; }
        .contact-info { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 2rem; margin-top: 2rem; }
        .contact-info h3 { margin-top: 0; }
        .notice { background: #18181b; border: 2px solid hsl(0, 77%, 26%); border-radius: 8px; padding: 1rem; display: flex; align-items: flex-start; gap: 0.75rem; margin: 2rem 0; }
        .notice-label { color: hsl(0, 77%, 26%); font-weight: 500; }
        .notice-text { color: #d4d4d8; }
        
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
      
      <div className="privacy-container">
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
              <h1>Privacy <span className="accent">Policy</span></h1>
              <p>Protecting your personal information and maintaining your privacy is fundamental to our mission at Curio Market.</p>
            </div>

            <div className="notice">
              <span className="notice-label">Notice:</span>
              <span className="notice-text">This Privacy Policy was last updated on August 20, 2025. We will notify users of any material changes.</span>
            </div>

            <div className="section">
              <h2>Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>When you create an account or make purchases on Curio Market, we collect:</p>
              <ul>
                <li>Name, email address, and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Profile information and preferences</li>
                <li>Communication history with our support team</li>
              </ul>

              <h3>Marketplace Activity</h3>
              <p>We collect information about your activity on our platform:</p>
              <ul>
                <li>Listings viewed, searched, and purchased</li>
                <li>Seller performance metrics and sales data</li>
                <li>Reviews and ratings you provide</li>
                <li>Messages exchanged with other users</li>
                <li>Favorites and watchlists</li>
              </ul>

              <h3>Technical Information</h3>
              <p>We automatically collect certain technical data:</p>
              <ul>
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and time spent on our platform</li>
                <li>Referral sources and search terms</li>
              </ul>
            </div>

            <div className="section">
              <h2>How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul>
                <li>Provide and improve our marketplace services</li>
                <li>Process transactions and manage seller subscriptions</li>
                <li>Communicate about orders, account updates, and platform news</li>
                <li>Prevent fraud and ensure marketplace safety</li>
                <li>Personalize your browsing and shopping experience</li>
                <li>Comply with legal obligations and resolve disputes</li>
                <li>Conduct research and analytics to improve our platform</li>
              </ul>
            </div>

            <div className="section">
              <h2>Information Sharing</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul>
                <li><strong>With Sellers:</strong> Purchase information is shared with sellers to fulfill orders</li>
                <li><strong>Service Providers:</strong> Third-party services like Stripe for payment processing</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our platform</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> When you explicitly authorize us to share information</li>
              </ul>
              <p>We never sell your personal information to third parties for marketing purposes.</p>
            </div>

            <div className="section">
              <h2>Data Security</h2>
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul>
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure payment processing through Stripe</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and employee training</li>
                <li>Incident response procedures for data breaches</li>
              </ul>
            </div>

            <div className="section">
              <h2>Your Rights</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a common format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </div>

            <div className="section">
              <h2>Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Remember your login status and preferences</li>
                <li>Analyze site usage and improve performance</li>
                <li>Provide personalized content and recommendations</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
              <p>You can control cookie settings through your browser preferences.</p>
            </div>

            <div className="section">
              <h2>Data Retention</h2>
              <p>We retain your information for as long as necessary to:</p>
              <ul>
                <li>Provide our services and support your account</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Maintain transaction records for tax and audit purposes</li>
              </ul>
              <p>You may request account deletion at any time through your account settings.</p>
            </div>

            <div className="contact-info">
              <h3>Contact Us</h3>
              <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
              <ul>
                <li>Email: privacy@curiomarket.com</li>
                <li>Mail: Curio Market Privacy Team, 123 Gothic Lane, Salem, MA 01970</li>
                <li>Phone: 1-800-CURIOS (1-800-287-4679)</li>
              </ul>
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

export default PrivacyPolicyStandalone;