// FanForce AI - 根布局组件
// Root Layout Component - 应用的根布局，包含全局上下文和样式
// Root layout of the application with global contexts and styling

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from './context/LanguageContext'
import { Web3Provider } from './context/Web3Context'
import { ContractProvider } from './context/ContractContext'
import { UserProvider } from './context/UserContext'
import { WalletProvider } from './context/WalletContext'
import { ICPProvider } from './context/ICPContext'
import { ClientOnly } from './components/ClientLayout'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FanForce AI - Campus Sports Prediction Platform',
  description: 'AI-powered campus sports prediction platform with Web3 integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientOnly>
          <LanguageProvider>
            <Web3Provider>
              <ContractProvider>
                <UserProvider>
                  <WalletProvider>
                    <ICPProvider>
                      {children}
                      <Toaster 
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: '#1f2937',
                            color: '#fff',
                            border: '1px solid #374151',
                          },
                          success: {
                            style: {
                              background: '#059669',
                              color: '#fff',
                            },
                          },
                          error: {
                            style: {
                              background: '#dc2626',
                              color: '#fff',
                            },
                          },
                        }}
                      />
                    </ICPProvider>
                  </WalletProvider>
                </UserProvider>
              </ContractProvider>
            </Web3Provider>
          </LanguageProvider>
        </ClientOnly>
      </body>
    </html>
  )
} 