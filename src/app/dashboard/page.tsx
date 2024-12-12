import { lusitana } from '@/src/fonts'
import SummaryGraphs from '@/src/ui/dashboard/dashboard/summary/summary'
import { SummarySkeleton } from '@/src/ui/dashboard/dashboard/summary/skeleton'
import { Suspense } from 'react'

export default async function Page() {
  return (
    <main className='h-screen flex flex-col p-2 md:p-4'>
      <h1 className={`${lusitana.className} mb-1 text-lg md:text-xl`}>Dashboard</h1>
      <div className='flex-grow'>
        <Suspense fallback={<SummarySkeleton />}>
          <SummaryGraphs />
        </Suspense>
      </div>
    </main>
  )
}
