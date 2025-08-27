import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Mail, MessageSquare, Shield, Clock, MapPin, Phone, Search, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const [sellerSearch, setSellerSearch] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll respond within 24 hours.",
    });
    
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSellerSearch = () => {
    if (sellerSearch.trim()) {
      // Navigate to browse page with seller search
      window.location.href = `/browse?seller=${encodeURIComponent(sellerSearch.trim())}`;
    } else {
      toast({
        title: "Search Required",
        description: "Please enter a seller or store name to search.",
        variant: "destructive"
      });
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "General inquiries and support",
      contact: "Info@curiosities.market",
      responseTime: "Within 24 hours"
    },
    {
      icon: Shield,
      title: "Safety & Compliance",
      description: "Report prohibited items or safety concerns",
      contact: "Info@curiosities.market",
      responseTime: "Within 12 hours"
    },
    {
      icon: MessageSquare,
      title: "Seller Support",
      description: "Questions about selling and shop management",
      contact: "Info@curiosities.market",
      responseTime: "Within 24 hours"
    }
  ];

  const faqItems = [
    {
      question: "How do I report a prohibited item?",
      answer: "Use our safety contact form or email Info@curiosities.market with details about the listing."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers through our secure Stripe integration."
    },
    {
      question: "How do I become a verified seller?",
      answer: "Subscribe to our seller plan for $10/month and complete the verification process in your shop manager."
    },
    {
      question: "What are your shipping policies?",
      answer: "Shipping policies are set by individual sellers. Review each listing's shipping information before purchasing."
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
              <MessageSquare className="w-12 h-12 text-red-600 mr-4" />
              <h1 className="text-5xl font-serif font-bold text-white">
                Contact Us
              </h1>
            </div>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our team for support, questions, or to report any concerns. 
              We're here to help maintain a safe and thriving community.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-zinc-700 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Send us a message</CardTitle>
                  <p className="text-zinc-400">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-zinc-300">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-zinc-900 border-zinc-600 text-white mt-1"
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-zinc-300">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="bg-zinc-900 border-zinc-600 text-white mt-1"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-zinc-300">Category</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-600 text-white rounded-md px-3 py-2"
                        data-testid="select-category"
                      >
                        <option value="">Select a category</option>
                        <option value="general">General Inquiry</option>
                        <option value="seller">Seller Support</option>
                        <option value="safety">Safety/Compliance</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing Question</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-zinc-300">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="bg-zinc-900 border-zinc-600 text-white mt-1"
                        data-testid="input-subject"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-zinc-300">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="bg-zinc-900 border-zinc-600 text-white mt-1"
                        placeholder="Please provide as much detail as possible..."
                        data-testid="textarea-message"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      data-testid="button-submit"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Methods & Info */}
            <div className="space-y-8">
              {/* Purchase Support - Contact Seller First */}
              <Card className="border-zinc-700 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-red-600" />
                    Purchase Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4">
                    <h4 className="font-medium text-amber-400 mb-2">For Customer Service on Purchases:</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                      Your first point of contact should be the seller directly. Most purchase-related questions, 
                      shipping inquiries, and item concerns can be resolved quickly through direct seller communication.
                    </p>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter seller or store name..."
                          value={sellerSearch}
                          onChange={(e) => setSellerSearch(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSellerSearch()}
                          className="bg-zinc-900 border-zinc-600 text-white"
                          data-testid="input-seller-search"
                        />
                      </div>
                      <Button
                        onClick={handleSellerSearch}
                        variant="outline"
                        className="border-zinc-600 hover:border-red-500 text-zinc-300 hover:text-white"
                        data-testid="button-find-seller"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Find Seller
                      </Button>
                    </div>
                    
                    <p className="text-xs text-zinc-500 mt-2">
                      If you're unable to resolve your issue with the seller, please contact our support team below.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Methods */}
              <Card className="border-zinc-700 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-white">Contact Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <method.icon className="w-6 h-6 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white">{method.title}</h4>
                        <p className="text-sm text-zinc-400 mb-1">{method.description}</p>
                        <p className="text-sm text-red-400 font-medium">{method.contact}</p>
                        <Badge variant="outline" className="text-xs mt-1 border-zinc-600 text-zinc-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {method.responseTime}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card className="border-zinc-700 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-white">Business Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Monday - Friday</span>
                      <span className="text-white">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Saturday</span>
                      <span className="text-white">10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Sunday</span>
                      <span className="text-zinc-500">Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-4">
                    Emergency safety reports are monitored 24/7
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-serif font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <Card key={index} className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 leading-relaxed">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}