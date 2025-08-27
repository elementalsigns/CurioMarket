import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AlertTriangle, Ban, Shield, Gavel, FileText, Clock, Mail, AlertCircle } from "lucide-react";

function ProhibitedItemsStandalone() {
  useEffect(() => {
    document.title = "Prohibited Items Policy - Curiosities Market";
  }, []);

  const sections = [
    {
      id: "strictly-forbidden",
      title: "Strictly Forbidden Items",
      icon: Ban,
      content: "Items that are completely prohibited on our platform under any circumstances."
    },
    {
      id: "regulated",
      title: "Regulated Items", 
      icon: Gavel,
      content: "Items requiring special permits, documentation, or compliance with regulations."
    },
    {
      id: "restricted",
      title: "Restricted Categories",
      icon: Shield,
      content: "Categories with specific limitations and requirements for listing."
    },
    {
      id: "enforcement",
      title: "Policy Enforcement",
      icon: AlertTriangle,
      content: "How we enforce these policies and consequences for violations."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Ban className="w-12 h-12 text-red-600 mr-4" />
              <h1 className="text-5xl font-serif font-bold text-white">
                Prohibited Items Policy
              </h1>
            </div>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              To ensure safety and legal compliance, certain items are prohibited or restricted 
              on Curio Market. Please review these guidelines before listing.
            </p>
          </div>

          {/* Notice Box */}
          <div className="mb-12">
            <Card className="border-red-600/30 bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-red-400 font-medium">Notice: </span>
                    <span className="text-zinc-300">
                      This policy was last updated on August 20, 2025. Sellers are responsible for 
                      ensuring compliance with all applicable laws and regulations.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="border-zinc-700 bg-zinc-950 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Policy Sections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 p-2 rounded-md text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors"
                      data-testid={`nav-${section.id}`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </a>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Strictly Forbidden Items */}
              <section id="strictly-forbidden">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Ban className="w-5 h-5 text-red-600" />
                      Strictly Forbidden Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-zinc-300 leading-relaxed">
                      The following items are completely prohibited and will result in immediate 
                      listing removal and potential account suspension:
                    </p>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Living Animals & Plants</h3>
                      <ul className="text-zinc-300 space-y-1 list-disc list-inside">
                        <li>Live animals of any kind</li>
                        <li>Living plants (including endangered species)</li>
                        <li>Fertilized eggs or embryos</li>
                        <li>Living insects or arthropods</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Human Remains & Body Parts</h3>
                      <ul className="text-zinc-300 space-y-1 list-disc list-inside">
                        <li>Human bones, skulls, or skeletal remains</li>
                        <li>Human organs, tissues, or body parts</li>
                        <li>Human hair or teeth (with exceptions for antique jewelry)</li>
                        <li>Medical specimens containing human material</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Dangerous & Illegal Items</h3>
                      <ul className="text-zinc-300 space-y-1 list-disc list-inside">
                        <li>Weapons of any kind (guns, knives, explosives)</li>
                        <li>Hazardous chemicals or toxic substances</li>
                        <li>Radioactive materials</li>
                        <li>Items made from endangered species (see CITES regulations)</li>
                        <li>Stolen or illegally obtained items</li>
                        <li>Counterfeit or replica items misrepresented as authentic</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Regulated Items */}
              <section id="regulated">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-red-600" />
                      Regulated Items Requiring Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4">
                      <h4 className="font-medium text-amber-400 mb-2">Important:</h4>
                      <p className="text-zinc-300 text-sm">
                        These items may be listed only with proper documentation and compliance 
                        with applicable laws. Sellers are responsible for obtaining all necessary permits.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Antique & Vintage Items</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li><strong>Pre-1900 Animal Specimens:</strong> May require age verification and legal sourcing documentation</li>
                        <li><strong>Antique Medical Equipment:</strong> May need to be clearly marked as non-functional and for display only</li>
                        <li><strong>Historical Artifacts:</strong> May require provenance documentation and export permits if applicable</li>
                        <li><strong>Vintage Taxidermy:</strong> May require species identification and age verification</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Animal Products & Specimens</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li><strong>Modern Taxidermy:</strong> May require hunting licenses or legal acquisition documentation</li>
                        <li><strong>Bones & Skulls:</strong> May need documentation from legally obtained sources</li>
                        <li><strong>Wet Specimens:</strong> May require proper preservation and species identification</li>
                        <li><strong>Insect Collections:</strong> May need to comply with CITES regulations for protected species</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">International Shipping Restrictions</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Items subject to CITES regulations require proper permits</li>
                        <li>Certain countries prohibit import/export of specific materials</li>
                        <li>Sellers must research destination country requirements</li>
                        <li>Customs declarations must be accurate and complete</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Restricted Categories */}
              <section id="restricted">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Restricted Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-zinc-300 leading-relaxed">
                      These categories have specific restrictions and requirements:
                    </p>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Medical & Scientific Items</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li><strong>Vintage Medical Equipment:</strong> Must be clearly non-functional and for display only</li>
                        <li><strong>Scientific Specimens:</strong> Require proper preservation and identification</li>
                        <li><strong>Laboratory Equipment:</strong> Must be cleaned and safe for handling</li>
                        <li><strong>Anatomical Models:</strong> Vintage and antique models only (no modern reproductions)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Occult & Esoteric Items</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li><strong>Ritual Objects:</strong> Vintage and antique items only</li>
                        <li><strong>Divination Tools:</strong> Historical significance preferred</li>
                        <li><strong>Grimoires & Texts:</strong> Genuine antique or reproduction clearly marked</li>
                        <li><strong>Amulets & Talismans:</strong> Must be presented as historical/collectible items</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Religious & Cultural Items</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Items must not be stolen from religious institutions</li>
                        <li>Cultural artifacts require provenance documentation</li>
                        <li>Native American items subject to additional federal regulations</li>
                        <li>Sellers must respect cultural sensitivities in descriptions</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Policy Enforcement */}
              <section id="enforcement">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Policy Enforcement & Consequences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Violation Consequences</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li><strong>First Offense:</strong> Listing removal and warning notification</li>
                        <li><strong>Repeat Violations:</strong> Temporary account suspension (7-30 days)</li>
                        <li><strong>Serious Violations:</strong> Permanent account termination</li>
                        <li><strong>Legal Issues:</strong> Cooperation with law enforcement as required</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Reporting Violations</h3>
                      <p className="text-zinc-300 mb-3">
                        Users can report policy violations through:
                      </p>
                      <ul className="text-zinc-300 space-y-1 list-disc list-inside">
                        <li>Listing report buttons</li>
                        <li>Email to our moderation team</li>
                        <li>Contact form with violation details</li>
                        <li>Anonymous tip system</li>
                      </ul>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Seller Responsibility</h4>
                      <p className="text-zinc-300 text-sm">
                        Sellers are solely responsible for ensuring their items comply with all 
                        applicable laws, regulations, and platform policies. When in doubt, 
                        contact our team before listing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Additional Guidelines Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      Documentation Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                      Required documentation may include:
                    </p>
                    <ul className="text-zinc-300 text-xs space-y-1 list-disc list-inside">
                      <li>Proof of legal acquisition</li>
                      <li>Age verification certificates</li>
                      <li>Import/export permits</li>
                      <li>Species identification documentation</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                      To ensure compliance:
                    </p>
                    <ul className="text-zinc-300 text-xs space-y-1 list-disc list-inside">
                      <li>Research all applicable laws</li>
                      <li>Maintain detailed records</li>
                      <li>Use accurate, honest descriptions</li>
                      <li>Contact support when uncertain</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <Card className="border-zinc-700 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-red-600" />
                    Policy Questions & Clarifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 mb-4">
                    If you have questions about our prohibited items policy or need clarification 
                    on whether an item can be listed:
                  </p>
                  <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-zinc-300">
                        <span className="text-red-400 font-medium">Email:</span> Info@curiosities.market
                      </p>
                      <p className="text-zinc-300">
                        <span className="text-red-400 font-medium">Subject:</span> Prohibited Items Policy Question
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-3 border-zinc-600 text-zinc-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Response within 24 hours
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProhibitedItemsStandalone;