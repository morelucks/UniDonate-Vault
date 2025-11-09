'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
        Connect Wallet
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-xs text-slate-500">Connected</p>
          <p className="text-sm font-semibold text-slate-900">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect' || c.name === 'WalletConnect')

  if (connectors.length === 0) {
    return (
      <button
        disabled
        className="bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed"
        title="WalletConnect Project ID not configured"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <button
      onClick={() => {
        if (walletConnectConnector) {
          connect({ connector: walletConnectConnector })
        } else if (connectors.length > 0) {
          connect({ connector: connectors[0] })
        }
      }}
      disabled={isPending}
      className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

