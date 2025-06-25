// AdminControls.tsx
// This component provides admin-only functionality for managing matches
// Including reward pool injection, match settlement, and match reset
// Related files:
// - FanForcePredictionDemo.sol: Smart contract with admin functions
// - Web3Context.tsx: Wallet connection context

import { useEffect, useState } from 'react'
import { useWeb3 } from '../context/Web3Context'

const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'

interface AdminControlsProps {
  matchId: number;
}

export default function AdminControls({ matchId }: AdminControlsProps) {
  const { address } = useWeb3()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase())
  }, [address])

  if (!isAdmin) return null

  return (
    <div className="mt-6 space-y-4">
      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-white font-medium mb-4 text-center">Admin Controls</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Add Reward Pool
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Announce Result
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reset Match
          </button>
        </div>
      </div>
    </div>
  )
} 