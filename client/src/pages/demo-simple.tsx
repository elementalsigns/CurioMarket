export default function DemoSimple() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Curio Market</h1>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-zinc-700 rounded hover:bg-zinc-800">
                Sign up
              </button>
              <button className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Account Manager Demo</h1>
          <p className="text-zinc-400">Preview of your account management interface</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 space-y-4">
            {/* Profile Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center text-xl font-bold">
                  JC
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Jane Collector</h3>
                  <p className="text-zinc-400 text-sm">jane@example.com</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-red-900 text-white text-xs rounded">
                    Buyer
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <div className="bg-red-900 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-3">
                <span>📊</span> Account Overview
              </div>
              <div className="text-zinc-400 hover:text-white px-4 py-3 rounded-lg cursor-pointer flex items-center gap-3">
                <span>🛒</span> Your Purchases
              </div>
              <div className="text-zinc-400 hover:text-white px-4 py-3 rounded-lg cursor-pointer flex items-center gap-3">
                <span>❤️</span> Favorites
              </div>
              <div className="text-zinc-400 hover:text-white px-4 py-3 rounded-lg cursor-pointer flex items-center gap-3">
                <span>👤</span> Profile Settings
              </div>
              <div className="text-zinc-400 hover:text-white px-4 py-3 rounded-lg cursor-pointer flex items-center gap-3">
                <span>💳</span> Payment Methods
              </div>
              <div className="text-zinc-400 hover:text-white px-4 py-3 rounded-lg cursor-pointer flex items-center gap-3">
                <span>🔔</span> Notifications
              </div>

              <div className="mt-6 p-4 border border-zinc-700 rounded-lg">
                <button 
                  className="w-full bg-red-900 hover:bg-red-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                  onClick={() => window.location.href = '/seller/onboarding'}
                >
                  <span>🏪</span> Become a Seller
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Your Account</h2>
                <p className="text-zinc-400 text-lg">Manage your account settings and purchases</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛒</span>
                    <div>
                      <p className="text-zinc-400 text-sm">Orders</p>
                      <p className="text-3xl font-bold">8</p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">❤️</span>
                    <div>
                      <p className="text-zinc-400 text-sm">Favorites</p>
                      <p className="text-3xl font-bold">23</p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-zinc-400 text-sm">Member Since</p>
                      <p className="text-xl font-bold">2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🏪</span> Interested in Selling?
                </h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Turn your passion for oddities into income. Join our community of collectors and sellers.
                </p>
                <button className="bg-red-900 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-bold">
                  Learn About Selling
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-800 bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-3">Curio Market</h3>
              <p className="text-zinc-400 text-sm">The marketplace for oddities and curiosities</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Shop</h4>
              <p className="text-zinc-400 text-sm">Browse categories and find unique items</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <p className="text-zinc-400 text-sm">Get help with your account and orders</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}