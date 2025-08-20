export default function SellerGuideSimple() {
  console.log("SellerGuideSimple component is being rendered");
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'hsl(212, 5%, 5%)', 
      color: 'white',
      padding: '40px 20px',
      fontFamily: 'serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: 'white'
          }}>
            Seller's <span style={{ color: '#dc2626' }}>Guide</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#a1a1aa',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Transform your passion for the macabre into a thriving business. Learn everything you need to know about selling on Curio Market.
          </p>
          <button style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 32px',
            fontSize: '1.125rem',
            fontWeight: '500',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Start Selling Today
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '60px' }}>
          <div style={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>1,200+</div>
            <div style={{ color: '#a1a1aa' }}>Active Sellers</div>
          </div>
          <div style={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>$850</div>
            <div style={{ color: '#a1a1aa' }}>Average Monthly Revenue</div>
          </div>
          <div style={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>94%</div>
            <div style={{ color: '#a1a1aa' }}>Seller Satisfaction Rate</div>
          </div>
        </div>

        <div>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'center',
            color: 'white'
          }}>
            Getting Started
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#a1a1aa',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            Follow these steps to launch your shop and start earning from your unique collection
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#dc2626',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: '0'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>1</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px', color: 'white' }}>
                  Create Your Account
                </h3>
                <p style={{ color: '#a1a1aa', marginBottom: '20px' }}>
                  Sign up and review our seller terms. We maintain high standards to ensure quality and authenticity for all items.
                </p>
                <div style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#dc2626', fontWeight: '500' }}>Notice:</span>
                    <span style={{ color: '#d4d4d8' }}>All sellers must subscribe to our $10/month plan plus 3% transaction fees</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#dc2626',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: '0'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>2</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px', color: 'white' }}>
                  Set Up Your Shop
                </h3>
                <p style={{ color: '#a1a1aa', marginBottom: '20px' }}>
                  Create your seller profile, upload a compelling shop banner, and write your story. This helps build trust with potential buyers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}