import Pagination from '@/src/ui/utils/pagination'
import Search from '@/src/ui/utils/search/search-URL_simple'
import Table from '@/src/ui/dashboard/history/table'
import { lusitana } from '@/src/fonts'
import { TableSkeleton } from '@/src/ui/dashboard/history/skeleton'
import { Suspense } from 'react'
import { fetchHistoryTotalPages } from '@/src/lib/tables/usershistory'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'History'
}

export default async function Page({
  searchParams
}: {
  searchParams?: {
    query?: string
    page?: string
  }
}) {
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const totalPages = await fetchHistoryTotalPages(query)
  return (
    <div className='w-full md:p-6'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>History</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='hid:123 uid:45 owner:richard  group:leb  gid:123 correct: cnt:' />
      </div>
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  )
}
