import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=3212d845-480e-4b86-af4f-c8150ebb819a'

export const connection = new Connection(HELIUS_RPC_URL, 'confirmed')

export interface BalanceData {
  publicKey: string
  userId: string
  balance: number
  balanceSOL: number
}

export interface UserBalanceData {
  userId: string
  walletCount: number
  totalBalanceSOL: number
  topWalletBalance: number
}

export async function getSOLBalance(publicKey: string, userId: string): Promise<BalanceData> {
  try {
    const pubKey = new PublicKey(publicKey)
    const balance = await connection.getBalance(pubKey)
    const balanceSOL = balance / LAMPORTS_PER_SOL
    
    return {
      publicKey,
      userId,
      balance,
      balanceSOL
    }
  } catch (error) {
    console.error(`Error fetching balance for ${publicKey}:`, error)
    return {
      publicKey,
      userId,
      balance: 0,
      balanceSOL: 0
    }
  }
}

export async function getMultipleSOLBalances(userKeys: {publicKey: string, userId: string}[]): Promise<BalanceData[]> {
  const balancePromises = userKeys.map(uk => getSOLBalance(uk.publicKey, uk.userId))
  const balances = await Promise.all(balancePromises)
  
  // Sort by highest SOL balance first
  return balances.sort((a, b) => b.balanceSOL - a.balanceSOL)
}

export function aggregateBalancesByUser(balances: BalanceData[]): UserBalanceData[] {
  const userMap = new Map<string, UserBalanceData>()
  
  balances.forEach(balance => {
    const existing = userMap.get(balance.userId)
    if (existing) {
      existing.walletCount += 1
      existing.totalBalanceSOL += balance.balanceSOL
      existing.topWalletBalance = Math.max(existing.topWalletBalance, balance.balanceSOL)
    } else {
      userMap.set(balance.userId, {
        userId: balance.userId,
        walletCount: 1,
        totalBalanceSOL: balance.balanceSOL,
        topWalletBalance: balance.balanceSOL
      })
    }
  })
  
  // Sort by total SOL balance first
  return Array.from(userMap.values()).sort((a, b) => b.totalBalanceSOL - a.totalBalanceSOL)
}
