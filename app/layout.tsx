import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/UserContext'

export const metadata: Metadata = {
  title: {
    template: '%s | Bridge School Dashboard',
    default: 'Bridge School Dashboard'
  },
  description: 'Bridge School.',
  metadataBase: new URL('https://nextjs-bridgeschool.vercel.app/')
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
