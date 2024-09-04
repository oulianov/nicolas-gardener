import './globals.css'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'

const ChatInterface = dynamic(() => import('./components/ChatInterface'), { ssr: false })

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nicolas - Assistant Jardinage',
  description: 'Votre assistant IA pour le jardinage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gradient-to-br from-indigo-50 to-indigo-100 min-h-screen flex flex-col`}>
        <main className="flex-grow flex flex-col h-screen p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-indigo-800">Nicolas - Votre assistant jardinage</h1>
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 flex-grow flex flex-col overflow-hidden">
            <ChatInterface />
          </div>
        </main>
        {children}
      </body>
    </html>
  )
}