import '@/src/global.css'
import { inter } from '@/src/fonts'
import { Metadata } from 'next'
import { UserProvider } from '@/UserContext'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

export const metadata: Metadata = {
  title: {
    template: '%s | Bridge School Dashboard',
    default: 'Bridge School Dashboard'
  },
  description: 'Nextjs14 Bridge School.',
  metadataBase: new URL('https://nextjs14-bridgeschool.vercel.app/')
}
//
//  Cashed database name
//
let cachedDName: string = 'notfetched'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const d_name: string = await getDatabaseName()
  //-----------------------------------------------------------------------------
  //  Get the database
  //-----------------------------------------------------------------------------
  async function getDatabaseName(): Promise<string> {
    //
    //  Once only
    //
    if (cachedDName !== 'notfetched') return cachedDName
    //
    //  Fetch database name
    //
    const rows = await table_fetch({
      table: 'database',
      whereColumnValuePairs: [{ column: 'd_did', value: 1 }]
    })

    const row = rows[0]
    cachedDName = row?.d_name ?? 'Unknown'

    return cachedDName
  }
  //-----------------------------------------------------------------------------
  return (
    <html lang='en'>
      <body
        className={`${inter.className} antialiased ${d_name === 'Dev' ? 'bg-yellow-100' : 'bg-blue-100'}`}
      >
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
