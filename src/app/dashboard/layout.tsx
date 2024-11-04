'use client'
import NavSide from '@/src/ui/dashboard/dashboard/nav/nav-side'
import { Suspense } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col md:flex-row '>
      <div className='w-full flex-none md:w-64'>
        <Suspense>
          <NavSide />
        </Suspense>
      </div>
      <div className='flex-grow overflow-hidden whitespace-nowrap'>{children}</div>
    </div>
  )
}
