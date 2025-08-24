import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, FileText, Shield, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function SellerTerms() {
  const [, setLocation] = useLocation();
  const [agreements, setAgreements] = useState({
    terms: false,
    prohibited: false,
    compliance: false,
    responsibility: false
  });

  const allAgreed = Object.values(agreements).every(Boolean);

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProceed = () => {
    if (allAgreed) {
      setLocation("/seller/onboard");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4" data-testid="page-title">
            Seller Agreement & Terms
          </h1>
          <p className="text-muted-foreground text-lg">
            Please review and agree to the following terms before creating your seller account
          </p>
        </div>

        <Card className="mb-8" data-testid="terms-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Seller Responsibilities & Prohibited Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="space-y-6">
                {/* Prohibited Items Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Prohibited Items
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
                      <h4 className="font-medium text-red-400 mb-2">Strictly Prohibited:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><strong>Human remains or artifacts:</strong> No human bones, organs, or body parts (except teeth and hair when properly documented and ethically sourced)</li>
                        <li><strong>Endangered species:</strong> No items from animals listed under CITES, ESA, or local endangered species laws</li>
                        <li><strong>Threatened species:</strong> No items from animals classified as threatened or vulnerable</li>
                        <li><strong>Illegal wildlife trade:</strong> No items obtained through poaching, illegal hunting, or trafficking</li>
                        <li><strong>Protected native species:</strong> No items from species protected by federal, state, or local laws</li>
                        <li><strong>Marine mammals:</strong> No whale bone, dolphin teeth, seal products, or similar marine mammal items</li>
                        <li><strong>Bird specimens:</strong> No birds, feathers, eggs, nests, or bird parts that fall under the US Migratory Bird Treaty Act</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Legal Compliance Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    Legal Compliance Requirements
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4">
                      <h4 className="font-medium text-amber-400 mb-2">Documentation & Permits:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>If required, you must possess all permits, licenses, and documentation for items you sell</li>
                        <li>CITES permits required for any regulated species (even if legally obtained)</li>
                        <li>State hunting/trapping licenses and tags where applicable</li>
                        <li>Import/export documentation for international specimens</li>
                        <li>Chain of custody documentation proving legal acquisition</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-4">
                      <h4 className="font-medium text-blue-400 mb-2">Verification Process:</h4>
                      <p className="text-muted-foreground">
                        Curio Market reserves the right to request additional documentation, permits, or proof of legal acquisition 
                        for any listing. Failure to provide requested documentation within 7 business days will result in listing 
                        removal and potential account suspension.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Seller Responsibility Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Your Responsibilities as a Seller
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Legal Knowledge:</strong> You are solely responsible for knowing and complying with all applicable laws in your jurisdiction, the buyer's jurisdiction, and any transit jurisdictions.</p>
                      
                      <p><strong>Accurate Descriptions:</strong> All listings must include accurate species identification, collection location (where legally permissible), and collection method.</p>
                      
                      <p><strong>Shipping Compliance:</strong> You must comply with all shipping regulations, including proper packaging, labeling, and declaration of contents.</p>
                      
                      <p><strong>Age Verification:</strong> Some items may only be sold to buyers over 18. You are responsible for age verification where required.</p>
                      
                      <p><strong>Liability:</strong> You assume full liability for any legal issues arising from your listings or sales, including but not limited to fines, seizures, or criminal charges.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Platform Protection Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-3">Platform Protection</h3>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      By agreeing to these terms, you acknowledge that Curio Market operates as a platform connecting buyers and sellers. 
                      The platform does not take possession of items and is not responsible for verifying the legality of individual listings. 
                      All transactions are between buyers and sellers directly, and all legal responsibilities rest with the respective parties.
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Agreement Checkboxes */}
        <Card className="mb-8" data-testid="agreement-card">
          <CardHeader>
            <CardTitle>Required Agreements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreements.terms}
                onCheckedChange={() => handleAgreementChange('terms')}
                data-testid="checkbox-terms"
              />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have read and agree to the Curio Market Terms of Service and Seller Agreement
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="prohibited"
                checked={agreements.prohibited}
                onCheckedChange={() => handleAgreementChange('prohibited')}
                data-testid="checkbox-prohibited"
              />
              <label htmlFor="prohibited" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I understand and agree not to sell any human remains, endangered species, threatened species, or other prohibited items
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="compliance"
                checked={agreements.compliance}
                onCheckedChange={() => handleAgreementChange('compliance')}
                data-testid="checkbox-compliance"
              />
              <label htmlFor="compliance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I certify that I possess all required permits and documentation for items I intend to sell, and will provide such documentation upon request
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="responsibility"
                checked={agreements.responsibility}
                onCheckedChange={() => handleAgreementChange('responsibility')}
                data-testid="checkbox-responsibility"
              />
              <label htmlFor="responsibility" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I acknowledge that I am solely responsible for knowing and complying with all applicable laws, and accept full liability for my listings and sales
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!allAgreed}
            className="bg-red-600 hover:bg-red-700"
            data-testid="button-proceed"
          >
            Agree & Continue to Seller Registration
          </Button>
        </div>
      </div>
    </div>
  );
}