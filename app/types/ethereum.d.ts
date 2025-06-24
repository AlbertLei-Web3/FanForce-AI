// FanForce AI - Ethereum类型定义 / Ethereum Type Definitions
// 定义window.ethereum接口类型 / Define window.ethereum interface types
// 关联文件：app/context/Web3Context.tsx, app/config/web3.ts / Related files: app/context/Web3Context.tsx, app/config/web3.ts

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (...args: any[]) => void) => void
  removeListener: (event: string, callback: (...args: any[]) => void) => void
  isMetaMask?: boolean
  chainId?: string
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
} 