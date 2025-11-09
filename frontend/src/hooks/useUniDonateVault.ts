import { useState, useEffect } from 'react'
import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { UNIDONATE_VAULT_ABI, UNIDONATE_VAULT_ADDRESS } from '../utils/contracts'

export function useUniDonateVault() {
  const { address } = useAccount()
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
    watch: true,
  })

  // Deposit function
  const { 
    data: depositData, 
    write: writeDeposit, 
    isLoading: isDepositLoading 
  } = useContractWrite({
    address: UNIDONATE_VAULT_ADDRESS,
    abi: UNIDONATE_VAULT_ABI,
    functionName: 'deposit',
  })

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
    if (!amount || !address) return
    
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
    if (!amount || !address) return
    
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
