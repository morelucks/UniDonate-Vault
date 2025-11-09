import { WalletConnect } from '../components/ui/WalletConnect'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
            <span className="text-xl font-bold text-slate-900">UniDonate</span>
          </Link>
          <WalletConnect />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-700">Built on Uniswap V4</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Earn Yield,
            <br />
            <span className="text-slate-500">Fund Public Goods</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Deposit once. Your principal stays safe while generated yield automatically supports Ethereum's ecosystem development.
          </p>

          {isConnected ? (
            <Link href="/dashboard">
              <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
                Open Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          ) : (
            <WalletConnect />
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-slate-200">
            <div>
              <p className="text-3xl font-bold text-slate-900">$2.4M</p>
              <p className="text-sm text-slate-600 mt-1">Total Value Locked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">8.5%</p>
              <p className="text-sm text-slate-600 mt-1">Current APY</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">$180K</p>
              <p className="text-sm text-slate-600 mt-1">Donated to Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div>
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl mb-4">
                🛡️
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Principal Protected</h3>
              <p className="text-slate-600">Your initial deposit is always safe. Only yield is donated to verified projects.</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl mb-4">
                ⚡
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Automated Giving</h3>
              <p className="text-slate-600">Set it and forget it. Donations happen automatically as yield is generated.</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Full Transparency</h3>
              <p className="text-slate-600">Track every dollar. See exactly where your donations go and their impact.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}