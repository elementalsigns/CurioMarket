import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Shield, AlertTriangle } from "lucide-react";

export default function SafetyGuidelinesSimple() {
  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-red-600 mr-4" />
              <h1 className="text-5xl font-serif font-bold text-white">
                Safety Guidelines
              </h1>
            </div>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Essential safety protocols and ethical standards for collectors and enthusiasts 
              of oddities, specimens, and historical artifacts.
            </p>
          </div>

          {/* Important Notice */}
          <div className="mb-12 border border-red-600/30 bg-zinc-950 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-red-600 text-xl font-bold">Important Notice</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              The collection and trade of biological specimens, human remains, and certain artifacts 
              is heavily regulated by local, national, and international laws. These guidelines are 
              educational and do not constitute legal advice. Always consult with relevant authorities 
              and legal experts before acquiring, selling, or importing such items.
            </p>
          </div>

          {/* Guidelines Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="border border-zinc-700 bg-zinc-950 rounded-lg p-6 hover:border-red-600/30 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-red-600" />
                <h3 className="text-white text-xl font-bold">Personal Safety</h3>
              </div>
              <p className="text-zinc-400 mb-4">Essential safety measures when handling specimens and oddities</p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">Always wear protective gloves when handling bones, specimens, or preserved materials</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">Ensure proper ventilation when working with preserved specimens</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">Wash hands thoroughly after handling any biological materials</span>
                </li>
              </ul>
            </div>

            <div className="border border-zinc-700 bg-zinc-950 rounded-lg p-6 hover:border-red-600/30 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h3 className="text-white text-xl font-bold">Legal Compliance</h3>
              </div>
              <p className="text-zinc-400 mb-4">Understanding legal requirements and restrictions</p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">Know your local laws regarding specimen ownership</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">Understand international trade restrictions (CITES)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-zinc-300 leading-relaxed">Consult legal experts when in doubt</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Prohibited Items Section */}
          <div className="mb-12 border border-red-600/50 bg-zinc-950 rounded-lg p-8">
            <h2 className="text-red-600 text-2xl font-bold mb-4">Strictly Prohibited Items</h2>
            <p className="text-zinc-400 mb-6">The following items are never permitted on our platform</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-white mb-3">Human Remains</h4>
                <ul className="space-y-2 text-zinc-300">
                  <li>• Modern human remains (post-1600)</li>
                  <li>• Skulls and bones of recent origin</li>
                  <li>• Body parts or preserved tissue</li>
                  <li>• Hair or teeth (except antique jewelry)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Protected Species</h4>
                <ul className="space-y-2 text-zinc-300">
                  <li>• CITES-protected animal parts</li>
                  <li>• Ivory from any source</li>
                  <li>• Endangered species specimens</li>
                  <li>• Unlawfully obtained wildlife</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center bg-zinc-950 rounded-lg p-8 border border-zinc-700">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">
              Questions or Concerns?
            </h3>
            <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
              If you're unsure about the legality or appropriateness of an item, 
              or if you need to report a violation, please contact our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors">
                Report an Issue
              </button>
              <button className="border border-zinc-600 text-zinc-300 hover:bg-zinc-800 px-6 py-2 rounded transition-colors">
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