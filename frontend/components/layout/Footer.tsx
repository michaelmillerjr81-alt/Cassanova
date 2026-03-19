import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/games" className="hover:text-yellow-400 transition-colors">Games</Link></li>
              <li><Link href="/promotions" className="hover:text-yellow-400 transition-colors">Promotions</Link></li>
              <li><Link href="/vip" className="hover:text-yellow-400 transition-colors">VIP Program</Link></li>
              <li><Link href="/deposit" className="hover:text-yellow-400 transition-colors">Buy Gold Coins</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-bold mb-4">Help &amp; Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-yellow-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-yellow-400 transition-colors">About Us</Link></li>
              <li><Link href="/kyc" className="hover:text-yellow-400 transition-colors">KYC Verification</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-yellow-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/responsible-gaming" className="hover:text-yellow-400 transition-colors">Responsible Gaming</Link></li>
              <li><Link href="/sweepstakes-rules" className="hover:text-yellow-400 transition-colors">Sweepstakes Rules</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">24/7 Support</h3>
            <p className="mb-4">Get help anytime, anywhere</p>
            <Link
              href="/support"
              className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold hover:from-yellow-500 hover:to-yellow-700 transition-all"
            >
              Live Chat
            </Link>
          </div>
        </div>

        {/* Accepted Crypto */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm mb-2">Accepted Cryptocurrencies:</p>
              <div className="flex space-x-4 text-sm font-mono font-bold text-gray-400">
                <span>BTC</span>
                <span>ETH</span>
                <span>USDT</span>
                <span>USDC</span>
                <span>SOL</span>
                <span>DOGE</span>
                <span>LTC</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-500">&copy; 2026 Cassanova. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Sweepstakes Disclaimer */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 space-y-2">
          <p>
            18+ only (21+ in some jurisdictions). No purchase necessary to obtain Sweep Coins.
            Void where prohibited by law.
          </p>
          <p>
            Gold Coins have no cash value and cannot be redeemed for prizes.
            Sweep Coins are provided FREE and can be redeemed for cryptocurrency prizes.
          </p>
          <p>
            Alternative method of entry available. See official sweepstakes rules for details.
            Please play responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
