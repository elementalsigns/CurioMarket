import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Safety() {
  return (
    <div style={{minHeight: '100vh', backgroundColor: 'hsl(212, 5%, 5%)', display: 'flex', flexDirection: 'column'}}>
      <Header />
      
      <main style={{flex: 1, padding: '3rem 1rem', backgroundColor: 'hsl(212, 5%, 5%)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', color: 'white'}}>
          <div style={{textAlign: 'center', marginBottom: '4rem'}}>
            <h1 style={{fontSize: '3.5rem', fontFamily: 'serif', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
              Safety Guidelines
            </h1>
            <p style={{fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7'}}>
              Essential safety protocols and ethical standards for collectors of oddities, specimens, and historical artifacts.
            </p>
          </div>

          <div style={{marginBottom: '3rem', border: '1px solid #dc2626', backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '2rem'}}>
            <h2 style={{color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>⚠️ Important Notice</h2>
            <p style={{color: '#d4d4d8', lineHeight: '1.7'}}>
              The collection and trade of biological specimens, human remains, and certain artifacts 
              is heavily regulated by local, national, and international laws. These guidelines are 
              educational and do not constitute legal advice. Always consult with relevant authorities 
              and legal experts before acquiring, selling, or importing such items.
            </p>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem'}}>
            <div style={{border: '1px solid #3f3f46', backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '2rem'}}>
              <h3 style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>🛡️ Personal Safety</h3>
              <p style={{color: '#a1a1aa', marginBottom: '1rem'}}>Essential safety measures when handling specimens and oddities</p>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{color: '#d4d4d8', marginBottom: '0.75rem', paddingLeft: '1rem', position: 'relative'}}>
                  <span style={{position: 'absolute', left: 0, color: '#dc2626'}}>•</span>
                  Always wear protective gloves when handling bones, specimens, or preserved materials
                </li>
                <li style={{color: '#d4d4d8', marginBottom: '0.75rem', paddingLeft: '1rem', position: 'relative'}}>
                  <span style={{position: 'absolute', left: 0, color: '#dc2626'}}>•</span>
                  Ensure proper ventilation when working with preserved specimens
                </li>
                <li style={{color: '#d4d4d8', marginBottom: '0.75rem', paddingLeft: '1rem', position: 'relative'}}>
                  <span style={{position: 'absolute', left: 0, color: '#dc2626'}}>•</span>
                  Wash hands thoroughly after handling any biological materials
                </li>
              </ul>
            </div>

            <div style={{border: '1px solid #3f3f46', backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '2rem'}}>
              <h3 style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>⚖️ Legal Compliance</h3>
              <p style={{color: '#a1a1aa', marginBottom: '1rem'}}>Understanding legal requirements and restrictions</p>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{color: '#d4d4d8', marginBottom: '0.75rem', paddingLeft: '1rem', position: 'relative'}}>
                  <span style={{position: 'absolute', left: 0, color: '#dc2626'}}>•</span>
                  Know your local laws regarding specimen ownership
                </li>
                <li style={{color: '#d4d4d8', marginBottom: '0.75rem', paddingLeft: '1rem', position: 'relative'}}>
                  <span style={{position: 'absolute', left: 0, color: '#dc2626'}}>•</span>
                  Understand international trade restrictions (CITES)
                </li>
                <li style={{color: '#d4d4d8', marginBottom: '0.75rem', paddingLeft: '1rem', position: 'relative'}}>
                  <span style={{position: 'absolute', left: 0, color: '#dc2626'}}>•</span>
                  Consult legal experts when in doubt
                </li>
              </ul>
            </div>
          </div>

          <div style={{marginBottom: '3rem', border: '2px solid #dc2626', backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '2rem'}}>
            <h2 style={{color: '#dc2626', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>Strictly Prohibited Items</h2>
            <p style={{color: '#a1a1aa', marginBottom: '2rem'}}>The following items are never permitted on our platform</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem'}}>
              <div>
                <h4 style={{color: 'white', fontWeight: 'bold', marginBottom: '1rem'}}>Human Remains</h4>
                <ul style={{listStyle: 'none', padding: 0, color: '#d4d4d8'}}>
                  <li style={{marginBottom: '0.5rem'}}>• Human bones, skulls, or any body parts (except teeth and hair)</li>
                  <li style={{marginBottom: '0.5rem'}}>• Body parts or preserved tissue (except teeth and hair)</li>
                  <li style={{marginBottom: '0.5rem'}}>• Items crafted from human materials (except teeth and hair)</li>
                </ul>
                <p style={{color: '#a1a1aa', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                  <strong>Permitted:</strong> Human teeth and hair (properly documented and ethically sourced)
                </p>
              </div>
              <div>
                <h4 style={{color: 'white', fontWeight: 'bold', marginBottom: '1rem'}}>Protected Species</h4>
                <ul style={{listStyle: 'none', padding: 0, color: '#d4d4d8'}}>
                  <li style={{marginBottom: '0.5rem'}}>• CITES-protected animal parts</li>
                  <li style={{marginBottom: '0.5rem'}}>• Ivory from any source</li>
                  <li style={{marginBottom: '0.5rem'}}>• Endangered species specimens</li>
                  <li style={{marginBottom: '0.5rem'}}>• Unlawfully obtained wildlife</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{textAlign: 'center', backgroundColor: '#18181b', borderRadius: '0.5rem', padding: '3rem', border: '1px solid #3f3f46'}}>
            <h3 style={{fontSize: '2rem', fontFamily: 'serif', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
              Questions or Concerns?
            </h3>
            <p style={{color: '#a1a1aa', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto'}}>
              If you're unsure about the legality or appropriateness of an item, 
              or if you need to report a violation, please contact our team.
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
              <button style={{backgroundColor: '#dc2626', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '1rem'}}>
                Report an Issue
              </button>
              <button style={{border: '1px solid #3f3f46', color: '#d4d4d8', backgroundColor: 'transparent', padding: '0.75rem 2rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '1rem'}}>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}