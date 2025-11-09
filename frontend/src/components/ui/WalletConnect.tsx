'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)

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

  // Filter out WalletConnect (QR code) and prioritize injected wallets
  const availableConnectors = connectors.filter(
    (c) => c.id !== 'walletConnect' && c.id !== 'walletConnectLegacy'
  )
  const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect' || c.name === 'WalletConnect')

  if (connectors.length === 0) {
    return (
      <button
        disabled
        className="bg-slate-400 text-white px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed"
        title="No wallets available"
      >
        Connect Wallet
      </button>
    )
  }

  const handleConnect = (connector: any) => {
    connect({ connector })
    setShowWalletMenu(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWalletMenu(!showWalletMenu)}
        disabled={isPending}
        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {showWalletMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowWalletMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
            <div className="p-2">
              {availableConnectors.length > 0 ? (
                availableConnectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      {connector.name === 'MetaMask' ? '🦊' : connector.name === 'Coinbase Wallet' ? '🔷' : '💼'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{connector.name}</p>
                      <p className="text-xs text-slate-500">Browser extension</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-slate-500">No wallets detected</p>
              )}
              
              {walletConnectConnector && (
                <>
                  <div className="my-2 border-t border-slate-200" />
                  <button
                    onClick={() => handleConnect(walletConnectConnector)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">WalletConnect</p>
                      <p className="text-xs text-slate-500">Scan QR code</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

