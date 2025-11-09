import { useState, useEffect } from 'react'
import { useAccount, useChainId, useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { UNIDONATE_VAULT_ABI, UNIDONATE_VAULT_ADDRESS } from '../utils/contracts'

export function useUniDonateVault() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [userBalance, setUserBalance] = useState(0)
  const [totalTVL, setTotalTVL] = useState(0)
  const [userShares, setUserShares] = useState(0)
  const [apy, setApy] = useState(0)
  const [totalDonations, setTotalDonations] = useState(0)

  // Read total assets (TVL)
  const { data: tvlData, refetch: refetchTVL } = useContractRead({
    address: UNIDONATE_VAULT_ADDRESS,
    abi: UNIDONATE_VAULT_ABI,
    functionName: 'totalAssets',
    enabled: !!address || true, // Allow reading TVL even when not connected
    watch: true,
  })

  // Read user shares
  const { data: sharesData, refetch: refetchShares } = useContractRead({
    address: UNIDONATE_VAULT_ADDRESS,
    abi: UNIDONATE_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  })

  // Read user balance (convert shares to assets)
  const { data: balanceData, refetch: refetchBalance } = useContractRead({
    address: UNIDONATE_VAULT_ADDRESS,
    abi: UNIDONATE_VAULT_ABI,
    functionName: 'convertToAssets',
    args: sharesData ? [sharesData] : undefined,
    enabled: !!sharesData,
    watch: true,
  })

  // Read total donations
  const { data: donationsData } = useContractRead({
    address: UNIDONATE_VAULT_ADDRESS,
    abi: UNIDONATE_VAULT_ABI,
    functionName: 'totalYieldDonated',
    enabled: true, // Allow reading donations even when not connected
    watch: true,
  })

  // Deposit function
  const { 
    data: depositData, 
    write: writeDeposit, 
    isLoading: isDepositLoading,
    isError: isDepositError,
    error: depositError,
    isSuccess: isDepositSuccess
  } = useContractWrite({
    address: UNIDONATE_VAULT_ADDRESS,
    abi: UNIDONATE_VAULT_ABI,
    functionName: 'deposit',
  })

  // Debug: Log writeDeposit status
  useEffect(() => {
    if (isConnected && address) {
      console.log('Contract Write Status:', {
        hasWriteDeposit: !!writeDeposit,
        isDepositError,
        depositError,
        chainId,
        address: UNIDONATE_VAULT_ADDRESS
      })
    }
  }, [writeDeposit, isDepositError, depositError, isConnected, address, chainId])

  const { isLoading: isDepositTxLoading } = useWaitForTransactionReceipt({
    hash: depositData?.hash,
    onSuccess: () => {
      refetchTVL()
      refetchShares()
      refetchBalance()
    },
  })

  // Withdraw function
  const { 
    data: withdrawData, 
    write: writeWithdraw, 
    isLoading: isWithdrawLoading 
  } = useContractWrite({
    address: UNIDONATE_VAULT_ADDRESS,
    abi: UNIDONATE_VAULT_ABI,
    functionName: 'withdraw',
  })

  const { isLoading: isWithdrawTxLoading } = useWaitForTransactionReceipt({
    hash: withdrawData?.hash,
    onSuccess: () => {
      refetchTVL()
      refetchShares()
      refetchBalance()
    },
  })

  // Update state when data changes
  useEffect(() => {
    if (tvlData) {
      const tvl = Number(formatUnits(tvlData as bigint, 6)) // USDC has 6 decimals
      setTotalTVL(tvl)
    }
  }, [tvlData])

  useEffect(() => {
    if (balanceData) {
      const balance = Number(formatUnits(balanceData as bigint, 6))
      setUserBalance(balance)
    }
  }, [balanceData])

  useEffect(() => {
    if (sharesData) {
      const shares = Number(formatUnits(sharesData as bigint, 18))
      setUserShares(shares)
    }
  }, [sharesData])

  useEffect(() => {
    if (donationsData) {
      const donations = Number(formatUnits(donationsData as bigint, 6))
      setTotalDonations(donations)
    }
  }, [donationsData])

  // Calculate APY (simplified - replace with actual calculation)
  useEffect(() => {
    // This should fetch from your yield source (Aave, Compound, etc.)
    // For now, using mock data
    setApy(8.5)
  }, [])

  // Deposit handler
  const deposit = (amount: string) => {
    if (!amount || !address || !isConnected) {
      console.error('Cannot deposit: missing amount, address, or wallet not connected')
      return
    }
    
    if (!writeDeposit) {
      console.error('Cannot deposit: writeDeposit is not available.', {
        isConnected,
        chainId,
        address,
        depositError
      })
      return
    }
    
    try {
      const amountInWei = parseUnits(amount, 6) // USDC decimals
      writeDeposit({
        args: [amountInWei, address],
      })
    } catch (error) {
      console.error('Deposit error:', error)
    }
  }

  // Withdraw handler
  const withdraw = (amount: string) => {
    if (!amount || !address) {
      console.error('Cannot withdraw: missing amount or address')
      return
    }
    
    if (!writeWithdraw) {
      console.error('Cannot withdraw: writeWithdraw is not available. Make sure you are connected and on the correct network.')
      return
    }
    
    try {
      const amountInWei = parseUnits(amount, 6)
      writeWithdraw({
        args: [amountInWei, address, address],
      })
    } catch (error) {
      console.error('Withdraw error:', error)
    }
  }

  return {
    // State
    totalTVL,
    userBalance,
    userShares,
    apy,
    totalDonations,
    
    // Actions
    deposit,
    withdraw,
    
    // Loading states
    isLoading: isDepositLoading || isDepositTxLoading || isWithdrawLoading || isWithdrawTxLoading,
    isDepositLoading: isDepositLoading || isDepositTxLoading,
    isWithdrawLoading: isWithdrawLoading || isWithdrawTxLoading,
    
    // Refetch functions
    refetch: () => {
      refetchTVL()
      refetchShares()
      refetchBalance()
    }
  }
}
