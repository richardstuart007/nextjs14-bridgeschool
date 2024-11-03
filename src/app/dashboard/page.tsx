import { lusitana } from '@/src/ui/fonts'
import SummaryGraphs from '@/src/app/dashboard/dashboard/summary/summary'
import { SummarySkeleton } from '@/src/app/dashboard/dashboard/summary/skeleton'
import { Suspense } from 'react'

export default async function Page() {
  return (
    <main className='h-screen flex flex-col p-2 md:p-6'>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Dashboard</h1>
      <div className='flex-grow'>
        <Suspense fallback={<SummarySkeleton />}>
          <SummaryGraphs />
        </Suspense>
      </div>
    </main>
  )
}
