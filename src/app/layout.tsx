import '@/src/ui/global.css'
import { inter } from '@/src/ui/fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/UserContext'

export const metadata: Metadata = {
  title: {
    template: '%s | Bridge School Dashboard',
    default: 'Bridge School Dashboard'
  },
  description: 'Nextjs14 Bridge School.',
  metadataBase: new URL('https://nextjs14-bridgeschool.vercel.app/')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
