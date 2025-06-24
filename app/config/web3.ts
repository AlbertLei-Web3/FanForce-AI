// FanForce AI - Web3配置文件 / Web3 Configuration File
// 配置Chiliz Chain连接和钱包集成 / Configure Chiliz Chain connection and wallet integration
// 关联文件：app/components/WalletConnect.tsx, app/context/Web3Context.tsx / Related files: app/components/WalletConnect.tsx, app/context/Web3Context.tsx

// Chiliz Chain配置 / Chiliz Chain Configuration
export const chilizChain = {
  chainId: 88888,
  name: 'Chiliz Chain',
  currency: 'CHZ',
  explorerUrl: 'https://chiliscan.com',
  rpcUrl: 'https://rpc.ankr.com/chiliz'
}

// Chiliz测试网配置 / Chiliz Testnet Configuration  
export const chilizTestnet = {
  chainId: 88882,
  name: 'Chiliz Testnet',
  currency: 'CHZ',
  explorerUrl: 'https://testnet.chiliscan.com',
  rpcUrl: 'https://rpc.ankr.com/chiliz_testnet'
}

// Web3工具函数 / Web3 Utility Functions
export const switchToChiliz = async () => {
  try {
    // 尝试切换到Chiliz主网 / Try to switch to Chiliz mainnet
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chilizChain.chainId.toString(16)}` }],
    })
  } catch (switchError: any) {
    // 如果链不存在，添加链 / If chain doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chilizChain.chainId.toString(16)}`,
              chainName: chilizChain.name,
              nativeCurrency: {
                name: 'CHZ',
                symbol: 'CHZ',
                decimals: 18,
              },
              rpcUrls: [chilizChain.rpcUrl],
              blockExplorerUrls: [chilizChain.explorerUrl],
            },
          ],
        })
      } catch (addError) {
        throw addError
      }
    }
    throw switchError
  }
}

// 获取CHZ余额 / Get CHZ Balance
export const getCHZBalance = async (address: string): Promise<string> => {
  try {
    const balance = await window.ethereum?.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    })
    
    // 转换wei为CHZ / Convert wei to CHZ
    const balanceInCHZ = parseInt(balance, 16) / Math.pow(10, 18)
    return balanceInCHZ.toFixed(4)
  } catch (error) {
    console.error('获取CHZ余额失败 / Failed to get CHZ balance:', error)
    return '0.0000'
  }
} 