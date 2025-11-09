// Contract addresses and ABIs
export const UNIDONATE_VAULT_ADDRESS = 
  (process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`) || 
  '0xC7bC611973d2E7cE41100F3C507ec340182b7377' as const

export const TOKEN_ADDRESS = 
  (process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`) || 
  '0x7560AC196B6C54f427E1d3f48F52274541254F65' as const

// Import the actual ABI from the contract compilation artifact
import vaultABI from './vaultABI.json'

export const UNIDONATE_VAULT_ABI = vaultABI

