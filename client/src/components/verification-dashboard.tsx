import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, CheckCircle, Clock, XCircle, Phone, Mail, MapPin, Building2, FileText, AlertCircle } from "lucide-react";

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  addressVerified: boolean;
  verificationLevel: number;
  pendingRequests: any[];
}

export function VerificationDashboard() {
  const { toast } = useToast();
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressData, setAddressData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  });
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "",
    taxId: "",
    businessLicense: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    documents: []
  });

  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['/api/verification/status'],
    retry: false,
  }) as { data: VerificationStatus | undefined; isLoading: boolean };

  // Email verification mutations
  const initiateEmailVerification = useMutation({
    mutationFn: () => apiRequest('POST', '/api/verification/email/initiate'),
    onSuccess: () => {
      toast({
        title: "Verification Code Sent",
        description: "Check your email for the verification code",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyEmailCode = useMutation({
    mutationFn: () => apiRequest('POST', '/api/verification/email/verify', { code: emailCode }),
    onSuccess: () => {
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
      setEmailCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Phone verification mutations
  const initiatePhoneVerification = useMutation({
    mutationFn: () => apiRequest('POST', '/api/verification/phone/initiate', { phoneNumber }),
    onSuccess: () => {
      toast({
        title: "SMS Sent",
        description: "Check your phone for the verification code",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyPhoneCode = useMutation({
    mutationFn: () => apiRequest('POST', '/api/verification/phone/verify', { code: phoneCode }),
    onSuccess: () => {
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
      setPhoneCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Address verification mutation
  const submitAddressVerification = useMutation({
    mutationFn: () => apiRequest('POST', '/api/verification/address', addressData),
    onSuccess: () => {
      toast({
        title: "Address Submitted",
        description: "Your address has been submitted for verification",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Identity verification mutation
  const initiateIdentityVerification = useMutation({
    mutationFn: () => apiRequest('POST', '/api/verification/identity/initiate'),
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.open(data.sessionUrl, '_blank');
      } else {
        toast({
          title: "Identity Verification",
          description: "Identity verification session created. This feature will be available soon.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Business verification mutation
  const submitBusinessVerification = useMutation({
    mutationFn: () => apiRequest('POST', '/api/verification/seller', businessData),
    onSuccess: () => {
      toast({
        title: "Business Verification Submitted",
        description: "Your business information has been submitted for review",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/verification/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-red-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getVerificationLevelInfo = (level: number) => {
    switch (level) {
      case 0: return { text: "Unverified", color: "bg-gray-500", description: "No verification completed" };
      case 1: return { text: "Basic", color: "bg-yellow-500", description: "Email verified" };
      case 2: return { text: "Enhanced", color: "bg-blue-500", description: "Email + phone verified" };
      case 3: return { text: "Trusted", color: "bg-green-500", description: "Identity verified" };
      case 4: return { text: "Business", color: "bg-purple-500", description: "Business verified seller" };
      case 5: return { text: "Premium", color: "bg-red-600", description: "Full verification complete" };
      default: return { text: "Unknown", color: "bg-gray-500", description: "Unknown verification level" };
    }
  };

  const levelInfo = getVerificationLevelInfo(verificationStatus?.verificationLevel || 0);

  return (
    <div className="space-y-6 p-6 bg-zinc-950 text-white">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold">Account Verification</h1>
        </div>
        <p className="text-zinc-400">
          Verify your account to increase trust and unlock additional features
        </p>
        
        {/* Verification Level Badge */}
        <div className="flex items-center justify-center gap-3">
          <Badge className={`${levelInfo.color} text-white px-4 py-2 text-lg`}>
            Level {verificationStatus?.verificationLevel || 0}: {levelInfo.text}
          </Badge>
          <p className="text-sm text-zinc-400">{levelInfo.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Verification */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Verification
              {verificationStatus?.emailVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription>
              Verify your email address to secure your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verificationStatus?.emailVerified ? (
              <>
                <Button
                  onClick={() => initiateEmailVerification.mutate()}
                  disabled={initiateEmailVerification.isPending}
                  className="w-full bg-red-800 hover:bg-red-700"
                  data-testid="button-initiate-email-verification"
                >
                  {initiateEmailVerification.isPending ? "Sending..." : "Send Verification Code"}
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="emailCode">Verification Code</Label>
                  <Input
                    id="emailCode"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Enter 8-digit code"
                    className="bg-zinc-800 border-zinc-600"
                    data-testid="input-email-code"
                  />
                  <Button
                    onClick={() => verifyEmailCode.mutate()}
                    disabled={!emailCode || verifyEmailCode.isPending}
                    className="w-full"
                    data-testid="button-verify-email-code"
                  >
                    {verifyEmailCode.isPending ? "Verifying..." : "Verify Email"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span>Email verified successfully</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phone Verification */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Phone Verification
              {verificationStatus?.phoneVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription>
              Add an extra layer of security with phone verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verificationStatus?.phoneVerified ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="bg-zinc-800 border-zinc-600"
                    data-testid="input-phone-number"
                  />
                  <Button
                    onClick={() => initiatePhoneVerification.mutate()}
                    disabled={!phoneNumber || initiatePhoneVerification.isPending}
                    className="w-full bg-red-800 hover:bg-red-700"
                    data-testid="button-initiate-phone-verification"
                  >
                    {initiatePhoneVerification.isPending ? "Sending..." : "Send SMS Code"}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneCode">SMS Code</Label>
                  <Input
                    id="phoneCode"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="bg-zinc-800 border-zinc-600"
                    data-testid="input-phone-code"
                  />
                  <Button
                    onClick={() => verifyPhoneCode.mutate()}
                    disabled={!phoneCode || verifyPhoneCode.isPending}
                    className="w-full"
                    data-testid="button-verify-phone-code"
                  >
                    {verifyPhoneCode.isPending ? "Verifying..." : "Verify Phone"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span>Phone verified successfully</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Identity Verification */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Identity Verification
              {verificationStatus?.identityVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription>
              Verify your identity with government-issued ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verificationStatus?.identityVerified ? (
              <>
                <div className="space-y-2 text-sm text-zinc-400">
                  <p>Required documents:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Driver's license or passport</li>
                    <li>Clear photo of your face</li>
                    <li>Address verification document</li>
                  </ul>
                </div>
                <Button
                  onClick={() => initiateIdentityVerification.mutate()}
                  disabled={initiateIdentityVerification.isPending}
                  className="w-full bg-red-800 hover:bg-red-700"
                  data-testid="button-initiate-identity-verification"
                >
                  {initiateIdentityVerification.isPending ? "Creating Session..." : "Start Identity Verification"}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span>Identity verified successfully</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Verification */}
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Verification
              {verificationStatus?.addressVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription>
              Verify your residential address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verificationStatus?.addressVerified ? (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={addressData.address}
                      onChange={(e) => setAddressData({...addressData, address: e.target.value})}
                      placeholder="123 Main Street"
                      className="bg-zinc-800 border-zinc-600"
                      data-testid="input-address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={addressData.city}
                        onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                        placeholder="City"
                        className="bg-zinc-800 border-zinc-600"
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={addressData.state}
                        onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                        placeholder="State"
                        className="bg-zinc-800 border-zinc-600"
                        data-testid="input-state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={addressData.zipCode}
                        onChange={(e) => setAddressData({...addressData, zipCode: e.target.value})}
                        placeholder="12345"
                        className="bg-zinc-800 border-zinc-600"
                        data-testid="input-zip-code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select 
                        value={addressData.country} 
                        onValueChange={(value) => setAddressData({...addressData, country: value})}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-600" data-testid="select-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-600">
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={() => submitAddressVerification.mutate()}
                    disabled={!addressData.address || !addressData.city || !addressData.state || !addressData.zipCode || submitAddressVerification.isPending}
                    className="w-full"
                    data-testid="button-submit-address"
                  >
                    {submitAddressVerification.isPending ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span>Address verified successfully</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Business Verification (for sellers) */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Verification
            <Badge variant="outline" className="text-xs">For Sellers</Badge>
          </CardTitle>
          <CardDescription>
            Verify your business to become a trusted seller on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessData.businessName}
                onChange={(e) => setBusinessData({...businessData, businessName: e.target.value})}
                placeholder="Your Business Name"
                className="bg-zinc-800 border-zinc-600"
                data-testid="input-business-name"
              />
            </div>
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select 
                value={businessData.businessType} 
                onValueChange={(value) => setBusinessData({...businessData, businessType: value})}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-600" data-testid="select-business-type">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={businessData.taxId}
                onChange={(e) => setBusinessData({...businessData, taxId: e.target.value})}
                placeholder="XX-XXXXXXX"
                className="bg-zinc-800 border-zinc-600"
                data-testid="input-tax-id"
              />
            </div>
            <div>
              <Label htmlFor="businessLicense">Business License</Label>
              <Input
                id="businessLicense"
                value={businessData.businessLicense}
                onChange={(e) => setBusinessData({...businessData, businessLicense: e.target.value})}
                placeholder="License number"
                className="bg-zinc-800 border-zinc-600"
                data-testid="input-business-license"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea
              id="businessAddress"
              value={businessData.businessAddress}
              onChange={(e) => setBusinessData({...businessData, businessAddress: e.target.value})}
              placeholder="Full business address"
              className="bg-zinc-800 border-zinc-600"
              data-testid="textarea-business-address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input
                id="businessPhone"
                value={businessData.businessPhone}
                onChange={(e) => setBusinessData({...businessData, businessPhone: e.target.value})}
                placeholder="+1 (555) 123-4567"
                className="bg-zinc-800 border-zinc-600"
                data-testid="input-business-phone"
              />
            </div>
            <div>
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                value={businessData.businessEmail}
                onChange={(e) => setBusinessData({...businessData, businessEmail: e.target.value})}
                placeholder="business@example.com"
                className="bg-zinc-800 border-zinc-600"
                data-testid="input-business-email"
              />
            </div>
          </div>

          <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Business Verification Requirements</p>
                <ul className="mt-2 space-y-1 text-zinc-300">
                  <li>• Valid business registration documents</li>
                  <li>• Tax identification documents</li>
                  <li>• Business license (if applicable)</li>
                  <li>• Proof of business address</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={() => submitBusinessVerification.mutate()}
            disabled={!businessData.businessName || !businessData.businessType || submitBusinessVerification.isPending}
            className="w-full bg-red-800 hover:bg-red-700"
            data-testid="button-submit-business-verification"
          >
            {submitBusinessVerification.isPending ? "Submitting..." : "Submit Business Verification"}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {verificationStatus?.pendingRequests && verificationStatus.pendingRequests.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationStatus.pendingRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{request.type.replace('_', ' ')} Verification</p>
                    <p className="text-sm text-zinc-400">Submitted for review</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-500">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}