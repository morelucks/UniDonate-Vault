import { VaultStats } from '../components/dashboard/VaultStats'
import { DepositCard } from '../components/dashboard/DepositCard'
import { ImpactTracker } from '../components/dashboard/ImpactTracker'
import { WalletConnect } from '../components/ui/WalletConnect'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const { isConnected, address } = useAccount()
  const router = useRouter()
  const [activeView, setActiveView] = useState<'overview' | 'history'>('overview')
  const [testMode, setTestMode] = useState(false)

  // Allow test mode - don't redirect if in test mode
  useEffect(() => {
    // Check if user wants to test (you can add a query param or localStorage flag)
    const testModeEnabled = localStorage.getItem('unidonate_test_mode') === 'true'
    setTestMode(testModeEnabled)
    
    // Only redirect if not connected AND not in test mode
    if (!isConnected && !testModeEnabled) {
      // Don't auto-redirect, just show a warning
    }
  }, [isConnected, router])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
                <span className="text-xl font-bold text-slate-900">UniDonate</span>
              </Link>
              
              {/* Navigation Tabs */}
              <div className="hidden md:flex gap-1">
                <button
                  onClick={() => setActiveView('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeView === 'overview'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveView('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeView === 'history'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  History
                </button>
                <Link href="/">
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                    Home
                  </button>
                </Link>
              </div>
            </div>

            {/* User Account */}
            <div className="flex items-center gap-3">
              {isConnected && address ? (
                <>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-slate-500">Connected</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-semibold">
                    {address.slice(2, 3).toUpperCase()}
                  </div>
                </>
              ) : (
                <>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-slate-500">Test Mode</p>
                    <p className="text-sm font-semibold text-slate-600">Not Connected</p>
                  </div>
                  <WalletConnect />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Test Mode Banner */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Test Mode Active</p>
                  <p className="text-xs text-amber-700">You're viewing the dashboard in test mode. Connect your wallet to interact with the vault.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('unidonate_test_mode', 'true')
                  setTestMode(true)
                }}
                className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded-lg font-semibold hover:bg-amber-200 transition-colors"
              >
                Enable Test Mode
              </button>
            </div>
          </div>
        )}
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Monitor your deposits, earnings, and impact on Ethereum's ecosystem</p>
        </div>
        
        {/* Stats Overview */}
        <VaultStats />
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Deposit/Withdraw */}
          <div className="lg:col-span-2 space-y-6">
            <DepositCard />
            
            {/* Yield Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Yield Breakdown</h2>
              
              <div className="space-y-4">
                {[
                  { source: 'Uniswap V4 LP Fees', amount: 245.32, percentage: 45, color: 'bg-blue-500' },
                  { source: 'Aave Lending', amount: 189.67, percentage: 35, color: 'bg-emerald-500' },
                  { source: 'Compound Interest', amount: 108.91, percentage: 20, color: 'bg-violet-500' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">{item.source}</span>
                        <span className="text-sm font-semibold text-slate-900">${item.amount}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Total Yield Generated</span>
                  <span className="text-lg font-bold text-slate-900">$543.90</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {[
                  { action: 'Deposited', amount: '+1,000', token: 'USDC', time: '2 hours ago', icon: '📥', color: 'text-emerald-600' },
                  { action: 'Yield Donated', amount: '45.20', token: 'USDC', time: '1 day ago', icon: '🎯', color: 'text-violet-600' },
                  { action: 'Yield Generated', amount: '+23.10', token: 'USDC', time: '2 days ago', icon: '📈', color: 'text-blue-600' },
                  { action: 'Withdrawn', amount: '-500', token: 'USDC', time: '5 days ago', icon: '📤', color: 'text-slate-600' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                        {activity.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${activity.color}`}>
                        {activity.amount} {activity.token}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Impact */}
          <div className="lg:col-span-1">
            <ImpactTracker />
          </div>
        </div>
      </div>
    </div>
  )
}
