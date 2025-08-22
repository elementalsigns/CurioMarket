import { useAuth } from "@/hooks/useAuth";

export default function CookiesPolicyStandalone() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .page-container { flex: 1; display: flex; flex-direction: column; }
        .header { background: #0a0a0a; border-bottom: 1px solid hsl(0, 77%, 26%); padding: 1rem 0; }
        .header-content { max-width: 80rem; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
        .header-brand { display: flex; align-items: center; }
        .header-logo { font-size: 1.875rem; font-weight: 500; color: white; text-decoration: none; }
        .header-logo:hover { color: hsl(0, 77%, 26%); }
        .header-logo .script-initial { font-family: 'Great Vibes', cursive; font-size: 2.5rem; font-weight: normal; margin-right: 0.25rem; }
        .header-nav { display: flex; gap: 2rem; align-items: center; }
        .header-nav button { background: none; border: none; color: #a1a1aa; font-size: 1rem; cursor: pointer; transition: color 0.3s; }
        .header-nav button:hover { color: white; }

        .main-content { flex: 1; max-width: 4xl; margin: 0 auto; padding: 3rem 2rem; }
        .page-title { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; color: white; text-align: center; }
        .page-title:hover { color: hsl(0, 77%, 26%); transition: color 0.3s; }
        .page-subtitle { color: #a1a1aa; text-align: center; margin-bottom: 3rem; font-size: 1.25rem; }
        
        .content-section { margin-bottom: 2rem; }
        .section-title { font-size: 1.5rem; font-weight: 600; color: white; margin-bottom: 1rem; }
        .section-content { color: #d4d4d8; line-height: 1.7; margin-bottom: 1rem; }
        .section-list { color: #d4d4d8; margin-left: 1.5rem; margin-bottom: 1rem; }
        .section-list li { margin-bottom: 0.5rem; }

        /* Footer Styles - Match home page exactly */
        .footer { background: #0a0a0a; border-top: 3px solid white; padding: 4rem 1rem; margin-top: 4rem; flex-shrink: 0; }
        .footer-container { max-width: 80rem; margin: 0 auto; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
        .footer-brand { grid-column: span 1; }
        .footer-brand .logo { margin-bottom: 1rem; display: flex; align-items: center; }
        .footer-brand .logo .script-initial { font-family: 'Great Vibes', cursive; font-size: 2.5rem; font-weight: normal; margin-right: 0.25rem; color: white; }
        .footer-description { color: #a1a1aa; margin-bottom: 1.5rem; max-width: 28rem; line-height: 1.6; }
        .social-links { display: flex; gap: 1rem; }
        .social-btn { background: transparent; border: none; color: #a1a1aa; padding: 0.5rem; cursor: pointer; transition: color 0.3s; border-radius: 0.375rem; }
        .social-btn:hover { color: white; }
        .footer-section h4 { color: white; margin-bottom: 1rem; font-size: 1.125rem; font-weight: 600; }
        .footer-links { list-style: none; margin: 0; padding: 0; }
        .footer-links li { margin-bottom: 0.75rem; }
        .footer-link {
          background: transparent;
          border: none;
          color: #a1a1aa;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          text-align: left;
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
        `
      }} />

      <div className="page-container">
        <header className="header">
          <div className="header-content">
            <div className="header-brand">
              <button className="header-logo" onClick={() => window.location.href = '/'}>
                <span className="script-initial">C</span>urio <em><span className="script-initial">M</span>arket</em>
              </button>
            </div>
            <nav className="header-nav">
              <button onClick={() => window.location.href = '/browse'}>Browse</button>
              <button onClick={() => window.location.href = '/seller/guide'}>Sell</button>
              <button onClick={() => window.location.href = '/help'}>Help</button>
              {isAuthenticated ? (
                <>
                  <button onClick={() => window.location.href = '/profile'}>Account</button>
                  <button onClick={() => window.location.href = '/api/logout'}>Sign Out</button>
                </>
              ) : (
                <button onClick={() => window.location.href = '/api/login'}>Sign In</button>
              )}
            </nav>
          </div>
        </header>

        <main className="main-content">
          <h1 className="page-title">Cookie Policy</h1>
          <p className="page-subtitle">How we use cookies to enhance your experience on Curio Market</p>

          <div className="content-section">
            <h2 className="section-title">What Are Cookies?</h2>
            <p className="section-content">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </div>

          <div className="content-section">
            <h2 className="section-title">How We Use Cookies</h2>
            <p className="section-content">
              Curio Market uses cookies to enhance your browsing experience and provide personalized services. 
              We use the following types of cookies:
            </p>
            <ul className="section-list">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly, including user authentication and security features.</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors use our website by collecting anonymous information about page visits and user interactions.</li>
              <li><strong>Functionality Cookies:</strong> Remember your preferences and settings to provide a personalized experience.</li>
              <li><strong>Marketing Cookies:</strong> Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.</li>
            </ul>
          </div>

          <div className="content-section">
            <h2 className="section-title">Third-Party Cookies</h2>
            <p className="section-content">
              We may also use third-party cookies from trusted partners, including:
            </p>
            <ul className="section-list">
              <li><strong>Stripe:</strong> For secure payment processing and fraud prevention</li>
              <li><strong>Analytics Services:</strong> To understand website usage and improve our services</li>
              <li><strong>Social Media Platforms:</strong> To enable social sharing features</li>
            </ul>
          </div>

          <div className="content-section">
            <h2 className="section-title">Managing Your Cookie Preferences</h2>
            <p className="section-content">
              You have the right to choose whether or not to accept cookies. You can control and manage cookies through your browser settings:
            </p>
            <ul className="section-list">
              <li>Most browsers allow you to refuse cookies or delete existing cookies</li>
              <li>You can typically find these options in the 'Settings' or 'Privacy' section of your browser</li>
              <li>Please note that disabling certain cookies may affect website functionality</li>
            </ul>
          </div>

          <div className="content-section">
            <h2 className="section-title">Cookie Retention</h2>
            <p className="section-content">
              Different cookies have different retention periods:
            </p>
            <ul className="section-list">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
              <li><strong>Authentication Cookies:</strong> Typically expire after 7 days of inactivity</li>
            </ul>
          </div>

          <div className="content-section">
            <h2 className="section-title">Updates to This Policy</h2>
            <p className="section-content">
              We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any significant changes by posting the updated policy on this page and updating the "Last Updated" date.
            </p>
          </div>

          <div className="content-section">
            <h2 className="section-title">Contact Us</h2>
            <p className="section-content">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
            </p>
            <ul className="section-list">
              <li>Email: Info@curiosities.market</li>
              <li>Contact Form: <button className="footer-link" style={{color: 'hsl(0, 77%, 26%)', textDecoration: 'underline'}} onClick={() => window.location.href = '/contact'}>Contact Us</button></li>
            </ul>
            <p className="section-content">
              <em>Last Updated: August 20, 2025</em>
            </p>
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