import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, injected, metaMask } from 'wagmi/connectors'

// Get projectId from environment variable
// You need to get a project ID from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Please add it to your .env file.')
}

export const metadata = {
  name: 'UniDonate',
  description: 'Earn Yield, Fund Public Goods',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://unidonate.xyz',
  icons: [],
}

// Create wagmi config
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    // Injected wallets (MetaMask, etc.) - no QR code needed
    injected(),
    metaMask(),
    // WalletConnect as fallback (requires QR code)
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [mainnet.id]: http(), // Use wallet's RPC provider
    [sepolia.id]: http(), // Use wallet's RPC provider
  },
})

