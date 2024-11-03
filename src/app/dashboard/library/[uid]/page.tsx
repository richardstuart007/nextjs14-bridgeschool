import Pagination from '@/src/ui/utils/pagination'
import Search from '@/src/ui/utils/search'
import Table from '@/src/app/dashboard/library/[uid]/table'
import { lusitana } from '@/src/ui/fonts'
import { TableSkeleton } from '@/src/app/dashboard/library/[uid]/skeleton'
import { Suspense } from 'react'
import { fetchLibraryUserTotalPages } from '@/src/lib/data/tables/library'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Library'
}
//
//  Interfaces
//
interface SearchParams {
  query?: string
  page?: string
}

interface Params {
  uid: number
}
//
//  Exported Function
//
export default async function Page({
  searchParams,
  params
}: {
  searchParams?: SearchParams
  params: Params
}) {
  //
  //  Destructure Parameters
  //
  const { uid } = params
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  //
  //  Fetch Data
  //
  const totalPages = await fetchLibraryUserTotalPages(query, uid)

  return (
    <div className='w-full md:p-6'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Library</h1>
      </div>
      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <Search placeholder='lid:123  ref:leb desc: leb who:hugger type:youtube  owner:richard  group:leb  gid:123 cnt:' />
      </div>
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <Table query={query} currentPage={currentPage} uid={uid} />
      </Suspense>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  )
}
