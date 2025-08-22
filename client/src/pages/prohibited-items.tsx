// Prohibited Items page with embedded CSS to avoid React error boundaries
import { Link } from "wouter";

function ProhibitedItemsStandalone() {
  return (
    <div>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:wght@400;500;600;700&display=swap");
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a !important; color: white !important; font-family: Georgia, serif !important; }
        .prohibited-container { min-height: 100vh; background: #0a0a0a; color: white; font-family: Georgia, serif; }
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
        .warning { background: #18181b; border: 2px solid #dc2626; border-radius: 8px; padding: 1rem; display: flex; align-items: flex-start; gap: 0.75rem; margin: 2rem 0; }
        .warning-label { color: #dc2626; font-weight: 500; }
        .warning-text { color: #d4d4d8; }
        .category-box { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }
        .category-box h3 { margin-top: 0; color: hsl(0, 77%, 26%); }
        
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
      
      <div className="prohibited-container">
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
              <h1>Prohibited Items</h1>
              <p>Maintaining ethical standards and legal compliance is essential to preserving the integrity of our marketplace and protecting our community.</p>
            </div>

            <div className="warning">
              <span className="warning-label">Warning:</span>
              <span className="warning-text">Listing prohibited items may result in immediate account suspension, legal action, and reporting to appropriate authorities.</span>
            </div>

            <div className="section">
              <h2>Enforcement Policy</h2>
              <p>Curio Market maintains strict policies regarding prohibited items to ensure legal compliance, ethical standards, and community safety. All listings are subject to review, and violations will result in immediate action including but not limited to:</p>
              <ul>
                <li>Immediate listing removal</li>
                <li>Account suspension or permanent ban</li>
                <li>Forfeiture of seller fees and earnings</li>
                <li>Reporting to law enforcement agencies</li>
                <li>Legal action for damages or violations</li>
              </ul>
            </div>

            <div className="section">
              <h2>Strictly Prohibited Categories</h2>

              <div className="category-box">
                <h3>Human Remains and Artifacts</h3>
                <p><strong>Absolutely prohibited under all circumstances:</strong></p>
                <ul>
                  <li>Human remains, bones, skulls, or any body parts</li>
                  <li>Human hair, teeth, or other bodily materials</li>
                  <li>Funeral artifacts containing human remains</li>
                  <li>Medical specimens derived from human sources</li>
                  <li>Items crafted from human materials</li>
                  <li>Photographs or documentation of human remains</li>
                  <li>Replicas or casts claiming to be from human sources</li>
                </ul>
                <div className="notice">
                  <span className="notice-label">Notice:</span>
                  <span className="notice-text">This includes historical, archaeological, medical, or educational specimens regardless of age or origin.</span>
                </div>
              </div>

              <div className="category-box">
                <h3>Protected and Threatened Species</h3>
                <p><strong>Items from species protected under CITES, ESA, or local wildlife laws:</strong></p>
                <ul>
                  <li>Specimens from endangered or threatened species</li>
                  <li>Parts, products, or derivatives from protected animals</li>
                  <li>Ivory, rhino horn, or other restricted materials</li>
                  <li>Marine mammal parts (whales, dolphins, seals)</li>
                  <li>Birds of prey or migratory bird specimens</li>
                  <li>Big cat parts (tigers, leopards, jaguars)</li>
                  <li>Pangolin scales or other pangolin products</li>
                  <li>Turtle shells from protected species</li>
                  <li>Coral specimens from protected reefs</li>
                </ul>
                <div className="notice">
                  <span className="notice-label">Notice:</span>
                  <span className="notice-text">Valid documentation and permits are required for any wildlife specimens. When in doubt, contact authorities before listing.</span>
                </div>
              </div>

              <div className="category-box">
                <h3>Illegal Wildlife Trade</h3>
                <p><strong>Items supporting illegal poaching or trafficking:</strong></p>
                <ul>
                  <li>Recently poached or illegally obtained specimens</li>
                  <li>Items without proper provenance documentation</li>
                  <li>Specimens from protected habitats or reserves</li>
                  <li>Parts from animals killed illegally</li>
                  <li>Items that encourage harmful collection practices</li>
                </ul>
              </div>

              <div className="category-box">
                <h3>Hazardous and Toxic Materials</h3>
                <p><strong>Items posing health or safety risks:</strong></p>
                <ul>
                  <li>Radioactive materials or specimens</li>
                  <li>Toxic or poisonous substances</li>
                  <li>Biological pathogens or disease vectors</li>
                  <li>Asbestos-containing materials</li>
                  <li>Lead-based paints or toxic chemicals</li>
                  <li>Improperly preserved specimens with bacterial risks</li>
                </ul>
              </div>

              <div className="category-box">
                <h3>Stolen or Misappropriated Items</h3>
                <p><strong>Items obtained through illegal means:</strong></p>
                <ul>
                  <li>Stolen artifacts or specimens</li>
                  <li>Items removed from museums or collections without permission</li>
                  <li>Archaeological artifacts obtained illegally</li>
                  <li>Items violating cultural patrimony laws</li>
                  <li>Specimens taken from protected areas without permits</li>
                </ul>
              </div>

              <div className="category-box">
                <h3>Weapons and Dangerous Items</h3>
                <p><strong>Items that could cause harm:</strong></p>
                <ul>
                  <li>Firearms, ammunition, or weapon components</li>
                  <li>Explosives or incendiary devices</li>
                  <li>Chemical weapons or biological agents</li>
                  <li>Items designed primarily to cause harm</li>
                </ul>
              </div>

              <div className="category-box">
                <h3>Inappropriate Content</h3>
                <p><strong>Items violating community standards:</strong></p>
                <ul>
                  <li>Pornographic or sexually explicit materials</li>
                  <li>Items promoting violence or hatred</li>
                  <li>Offensive or discriminatory content</li>
                  <li>Items violating intellectual property rights</li>
                  <li>Counterfeit or fraudulent specimens</li>
                </ul>
              </div>
            </div>

            <div className="section">
              <h2>Documentation Requirements</h2>
              <p>For items in gray areas or requiring special permits, sellers must provide:</p>
              <ul>
                <li>Certificates of legal acquisition</li>
                <li>CITES permits for protected species</li>
                <li>Provenance documentation showing legal chain of custody</li>
                <li>Import/export permits where applicable</li>
                <li>Laboratory testing results for safety verification</li>
                <li>Authentication certificates from recognized authorities</li>
              </ul>
            </div>

            <div className="section">
              <h2>Reporting Violations</h2>
              <p>If you encounter prohibited items or suspicious listings:</p>
              <ul>
                <li>Report immediately through our reporting system</li>
                <li>Do not purchase or promote questionable items</li>
                <li>Contact law enforcement for serious violations</li>
                <li>Provide detailed information and evidence</li>
              </ul>
            </div>

            <div className="section">
              <h2>Seller Responsibilities</h2>
              <p>All sellers are responsible for:</p>
              <ul>
                <li>Verifying the legality of all listed items</li>
                <li>Obtaining necessary permits and documentation</li>
                <li>Understanding applicable local, national, and international laws</li>
                <li>Maintaining ethical collection and sales practices</li>
                <li>Cooperating with marketplace investigations</li>
              </ul>
            </div>

            <div className="notice">
              <span className="notice-label">Notice:</span>
              <span className="notice-text">This list is not exhaustive. When in doubt, contact our compliance team before listing any questionable items. Ignorance of laws or regulations is not a valid defense.</span>
            </div>

            <div className="contact-info">
              <h3>Compliance Contact</h3>
              <p>For questions about prohibited items or to report violations:</p>
              <ul>
                <li>Email: Info@curiosities.market</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProhibitedItemsStandalone;