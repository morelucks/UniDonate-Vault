import { useState } from 'react'
import { useUniDonateVault } from '../../hooks/useUniDonateVault'

export function DepositCard() {
  const [amount, setAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const { deposit, withdraw, isLoading } = useUniDonateVault()
  const balance = 1000 // Replace with actual

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'deposit'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'withdraw'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Withdraw
        </button>
      </div>

      <div className="p-6">
        {/* Input Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700">Amount</label>
            <span className="text-xs text-slate-500">
              Balance: {balance.toLocaleString()} USDC
            </span>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 pr-20 text-2xl font-semibold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none transition-colors"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-slate-700">USDC</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mt-3">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => setAmount(((balance * percent) / 100).toString())}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => activeTab === 'deposit' ? deposit(amount) : withdraw(amount)}
          disabled={isLoading || !amount}
          className="w-full py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            activeTab === 'deposit' ? 'Deposit USDC' : 'Withdraw USDC'
          )}
        </button>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex gap-3">
            <div className="text-xl">ℹ️</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 mb-1">
                {activeTab === 'deposit' ? 'Your principal is protected' : 'Instant withdrawals'}
              </p>
              <p className="text-xs text-slate-600">
                {activeTab === 'deposit' 
                  ? 'Only generated yield is donated. Your deposit remains safe and accessible.'
                  : 'Withdraw your full balance anytime with no penalties or lock-up periods.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}