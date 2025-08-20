// Terms of Service page with embedded CSS to avoid React error boundaries
function TermsOfServiceStandalone() {
  return (
    <div>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:wght@400;500;600;700&display=swap");
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a !important; color: white !important; font-family: Georgia, serif !important; }
        .terms-container { min-height: 100vh; background: #0a0a0a; color: white; font-family: Georgia, serif; }
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
      
      <div className="terms-container">
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
              <h1>Terms of <span className="accent">Service</span></h1>
              <p>The legal framework governing your use of Curio Market and the responsibilities of all participants in our marketplace.</p>
            </div>

            <div className="notice">
              <span className="notice-label">Notice:</span>
              <span className="notice-text">These Terms of Service were last updated on August 20, 2025. Continued use constitutes acceptance of these terms.</span>
            </div>

            <div className="section">
              <h2>Acceptance of Terms</h2>
              <p>By accessing and using Curio Market, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.</p>
            </div>

            <div className="section">
              <h2>Platform Overview</h2>
              <p>Curio Market is a specialized marketplace for oddities, curios, specimens, and related collectibles. We provide a platform connecting sellers and buyers, but we are not a party to individual transactions.</p>
              
              <h3>Seller Requirements</h3>
              <ul>
                <li>Monthly subscription fee of $10 per seller account</li>
                <li>3% transaction fee on completed sales</li>
                <li>Compliance with all applicable laws and regulations</li>
                <li>Accurate representation of all listed items</li>
                <li>Proper documentation for regulated items</li>
              </ul>
            </div>

            <div className="section">
              <h2>Account Responsibilities</h2>
              <p>Users are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of account credentials</li>
                <li>All activities that occur under their account</li>
                <li>Providing accurate and current information</li>
                <li>Promptly updating account information when necessary</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </div>

            <div className="section">
              <h2>Marketplace Conduct</h2>
              <h3>Prohibited Activities</h3>
              <p>Users may not:</p>
              <ul>
                <li>List items that violate our Prohibited Items policy</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Manipulate reviews, ratings, or search results</li>
                <li>Circumvent platform fees or payment systems</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Violate intellectual property rights</li>
                <li>Use automated systems to access the platform</li>
              </ul>

              <h3>Content Standards</h3>
              <p>All content must be:</p>
              <ul>
                <li>Accurate and not misleading</li>
                <li>Appropriate for the gothic/curiosity marketplace</li>
                <li>Compliant with applicable laws</li>
                <li>Free from harmful or illegal material</li>
                <li>Respectful of other users and the community</li>
              </ul>
            </div>

            <div className="section">
              <h2>Transaction Terms</h2>
              <h3>Seller Obligations</h3>
              <ul>
                <li>Accurate item descriptions and photographs</li>
                <li>Proper packaging and timely shipping</li>
                <li>Compliance with all applicable regulations</li>
                <li>Responsive customer service</li>
                <li>Honoring return policies as stated</li>
              </ul>

              <h3>Buyer Obligations</h3>
              <ul>
                <li>Payment in full upon purchase confirmation</li>
                <li>Compliance with applicable import/export laws</li>
                <li>Reasonable inspection period for returns</li>
                <li>Following seller-specific policies</li>
              </ul>

              <h3>Dispute Resolution</h3>
              <p>Curio Market provides mediation services for transaction disputes. We reserve the right to make final determinations on disputed transactions and may withhold payments or impose penalties as necessary.</p>
            </div>

            <div className="section">
              <h2>Payment and Fees</h2>
              <h3>Seller Subscription</h3>
              <p>All sellers must maintain an active monthly subscription ($10/month) to list items and receive payments. Subscriptions automatically renew unless cancelled.</p>

              <h3>Transaction Fees</h3>
              <p>A 3% transaction fee is deducted from the final sale price of each completed transaction. This fee covers payment processing, fraud protection, and platform maintenance.</p>

              <h3>Refunds and Chargebacks</h3>
              <p>Subscription fees are non-refundable. Transaction fees may be refunded in cases of seller violations or platform errors. Chargebacks may result in account suspension.</p>
            </div>

            <div className="section">
              <h2>Intellectual Property</h2>
              <p>The Curio Market platform, including design, software, and content, is protected by intellectual property laws. Users retain rights to their own content but grant us a license to display and promote listings on our platform.</p>
            </div>

            <div className="section">
              <h2>Privacy and Data</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using our platform, you consent to our data practices as outlined in the Privacy Policy.</p>
            </div>

            <div className="section">
              <h2>Platform Availability</h2>
              <p>While we strive for continuous availability, we do not guarantee uninterrupted access to our platform. We reserve the right to modify, suspend, or discontinue services with reasonable notice to users.</p>
            </div>

            <div className="section">
              <h2>Limitation of Liability</h2>
              <p>Curio Market acts as a marketplace platform and is not liable for:</p>
              <ul>
                <li>Quality, safety, or legality of items listed</li>
                <li>Truth or accuracy of seller representations</li>
                <li>Actions or conduct of marketplace participants</li>
                <li>Shipping delays or damage during transit</li>
                <li>Loss of data or business interruption</li>
              </ul>
              <p>Our total liability shall not exceed the fees paid by the user in the preceding 12 months.</p>
            </div>

            <div className="section">
              <h2>Termination</h2>
              <p>We may terminate or suspend accounts for violations of these terms, illegal activity, or other conduct harmful to our platform or community. Users may close their accounts at any time through account settings.</p>
            </div>

            <div className="section">
              <h2>Governing Law</h2>
              <p>These terms are governed by the laws of Massachusetts, United States. Any disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.</p>
            </div>

            <div className="contact-info">
              <h3>Legal Contact</h3>
              <p>For legal inquiries or terms-related questions:</p>
              <ul>
                <li>Email: legal@curiomarket.com</li>
                <li>Mail: Curio Market Legal Department, 123 Gothic Lane, Salem, MA 01970</li>
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

export default TermsOfServiceStandalone;