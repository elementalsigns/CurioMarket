export default function SellerGuideMinimal() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header Navigation */}
      <nav className="bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-serif text-white">
                <span className="text-white hover:text-red-500 transition-colors">Curio</span>{" "}
                <em className="text-white hover:text-red-500 transition-colors">Market</em>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                Sign up
              </button>
              <button className="border border-zinc-700 hover:border-zinc-600 text-white px-4 py-2 rounded">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-zinc-950 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-serif font-bold text-white mb-6">
              Seller's <span className="text-red-500">Guide</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Transform your passion for the macabre into a thriving business. Learn everything you need to know about selling on Curio Market.
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded text-lg font-medium">
              Start Selling Today
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center bg-zinc-900 border border-zinc-800 rounded p-8">
              <div className="text-3xl font-bold text-white mb-2">1,200+</div>
              <div className="text-zinc-400">Active Sellers</div>
            </div>
            <div className="text-center bg-zinc-900 border border-zinc-800 rounded p-8">
              <div className="text-3xl font-bold text-white mb-2">$850</div>
              <div className="text-zinc-400">Average Monthly Revenue</div>
            </div>
            <div className="text-center bg-zinc-900 border border-zinc-800 rounded p-8">
              <div className="text-3xl font-bold text-white mb-2">94%</div>
              <div className="text-zinc-400">Seller Satisfaction Rate</div>
            </div>
          </div>

          {/* Getting Started Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-6">Getting Started</h2>
            <p className="text-xl text-zinc-400 text-center mb-12">
              Follow these steps to launch your shop and start earning from your unique collection
            </p>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Create Your Account</h3>
                  <p className="text-zinc-400 mb-6">
                    Sign up and review our seller terms. We maintain high standards to ensure quality and authenticity for all items.
                  </p>
                  <div className="bg-zinc-900 border border-red-600 rounded p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 font-medium">Notice:</span>
                      <span className="text-zinc-300">All sellers must subscribe to our $10/month plan plus 3% transaction fees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Set Up Your Shop</h3>
                  <p className="text-zinc-400 mb-6">
                    Create your seller profile, upload a compelling shop banner, and write your story. This helps build trust with potential buyers.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">List Your Items</h3>
                  <p className="text-zinc-400 mb-6">
                    Add detailed descriptions, high-quality photos, and proper categories. Include provenance and condition details for authenticity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Transparent Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-500 mb-4">$10</div>
                <div className="text-xl text-white mb-2">Monthly Subscription</div>
                <div className="text-zinc-400">Access to seller tools, analytics, and support</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-500 mb-4">3%</div>
                <div className="text-xl text-white mb-2">Transaction Fee</div>
                <div className="text-zinc-400">Applied only to completed sales</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Your Gothic Empire?</h2>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join our community of passionate sellers and turn your unique collection into a profitable business.
            </p>
            <div className="space-x-4">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded text-lg font-medium">
                Begin Seller Application
              </button>
              <button className="border border-zinc-700 hover:border-zinc-600 text-white px-8 py-3 rounded text-lg font-medium">
                Read Seller Terms
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}