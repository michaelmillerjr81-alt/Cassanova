import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 text-white py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Badge */}
          <div className="inline-block px-6 py-2 bg-yellow-400/20 border-2 border-yellow-400 rounded-full mb-6 animate-bounce">
            <span className="text-yellow-400 font-bold">WELCOME OFFER</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get <span className="text-yellow-400">100,000 GC</span>
            <br />
            + <span className="text-green-400">30 FREE SC</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-4 text-gray-200">
            Buy Gold Coins with crypto &amp; receive{' '}
            <span className="font-bold text-green-400">FREE Sweep Coins</span> redeemable for prizes!
          </p>

          {/* CTA Button */}
          <div className="mb-8">
            <Link
              href="/register"
              className="inline-block px-12 py-4 text-xl font-bold rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-110 shadow-2xl"
            >
              Join Now &amp; Claim FREE SC
            </Link>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">&#x20BF;</span>
              <span>Crypto Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">&#x1F3B0;</span>
              <span>1000+ Games</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">&#x2B50;</span>
              <span>FREE Sweep Coins</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">&#x1F3C6;</span>
              <span>VIP Rewards</span>
            </div>
          </div>

          {/* Sweepstakes Notice */}
          <p className="mt-8 text-xs text-gray-400 max-w-2xl mx-auto">
            No purchase necessary to obtain Sweep Coins. Void where prohibited by law.
            Must be 18+ (21+ in some jurisdictions). See full terms for details.
          </p>
        </div>
      </div>
    </section>
  );
}
