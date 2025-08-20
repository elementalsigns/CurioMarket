import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AlertTriangle, Shield, Eye, FileText, Users, Scale } from "lucide-react";

export default function SafetyGuidelines() {
  const guidelines = [
    {
      icon: Shield,
      title: "Personal Safety",
      description: "Essential safety measures when handling specimens and oddities",
      items: [
        "Always wear protective gloves when handling bones, specimens, or preserved materials",
        "Ensure proper ventilation when working with preserved specimens",
        "Wash hands thoroughly after handling any biological materials",
        "Keep specimens away from food preparation areas",
        "Store items in appropriate conditions to prevent deterioration"
      ]
    },
    {
      icon: Eye,
      title: "Authentication & Verification",
      description: "How to verify the authenticity and legality of items",
      items: [
        "Request documentation for all specimens and antique medical items",
        "Verify the source and chain of custody for biological specimens",
        "Check local laws regarding ownership of human remains",
        "Ensure taxidermy items comply with wildlife protection laws",
        "Report suspicious or potentially illegal items to administrators"
      ]
    },
    {
      icon: FileText,
      title: "Documentation Requirements",
      description: "Proper documentation for specimens and collectibles",
      items: [
        "Maintain records of item provenance and acquisition",
        "Keep certificates of authenticity when available",
        "Document any restoration or conservation work performed",
        "Preserve historical context and educational information",
        "Include relevant permits or legal documentation"
      ]
    },
    {
      icon: Users,
      title: "Community Standards",
      description: "Maintaining respect and ethical standards",
      items: [
        "Treat all specimens with dignity and respect",
        "Avoid sensationalizing or glorifying death",
        "Focus on educational and historical value",
        "Respect cultural and religious sensitivities",
        "Report inappropriate behavior or listings"
      ]
    },
    {
      icon: Scale,
      title: "Legal Compliance",
      description: "Understanding legal requirements and restrictions",
      items: [
        "Know your local laws regarding specimen ownership",
        "Understand international trade restrictions (CITES)",
        "Comply with human remains legislation in your jurisdiction",
        "Respect indigenous cultural property laws",
        "Consult legal experts when in doubt"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
        <div className="container mx-auto max-w-6xl">
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
          <Card className="mb-12 border-red-600/30 bg-zinc-950">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <CardTitle className="text-red-600">Important Notice</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 leading-relaxed">
                The collection and trade of biological specimens, human remains, and certain artifacts 
                is heavily regulated by local, national, and international laws. These guidelines are 
                educational and do not constitute legal advice. Always consult with relevant authorities 
                and legal experts before acquiring, selling, or importing such items.
              </p>
            </CardContent>
          </Card>

          {/* Guidelines Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {guidelines.map((guideline, index) => (
              <Card key={index} className="border-zinc-700 bg-zinc-950 hover:border-red-600/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <guideline.icon className="w-8 h-8 text-red-600" />
                    <CardTitle className="text-white">{guideline.title}</CardTitle>
                  </div>
                  <CardDescription className="text-zinc-400">
                    {guideline.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {guideline.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-zinc-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Prohibited Items Section */}
          <Card className="mb-12 border-red-600/50 bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-red-600 text-2xl">Strictly Prohibited Items</CardTitle>
              <CardDescription className="text-zinc-400">
                The following items are never permitted on our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

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
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Report an Issue
              </Button>
              <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}