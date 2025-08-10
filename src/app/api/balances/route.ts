import { NextResponse } from 'next/server'
import { UserKey } from '@/lib/supabase'
import { getMultipleSOLBalances, BalanceData } from '@/lib/solana'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create service client with admin privileges directly in the route
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Fetch all public keys and user_ids from user_keys table
    const { data: userKeys, error } = await supabase
      .from('user_keys')
      .select('user_id, public_key')
      .returns<UserKey[]>()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user keys from database' },
        { status: 500 }
      )
    }
    
    if (!userKeys || userKeys.length === 0) {
      return NextResponse.json({ balances: [] })
    }
    
    // Extract public keys and user_ids
    const userKeyData = userKeys.map(uk => ({
      publicKey: uk.public_key,
      userId: uk.user_id
    }))
    
    // Fetch SOL balances for all public keys
    const balances = await getMultipleSOLBalances(userKeyData)
    
    return NextResponse.json({ balances })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
