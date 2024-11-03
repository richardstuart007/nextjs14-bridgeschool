'use client'
import { useEffect } from 'react'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { lusitana } from '@/src/ui/fonts'
import { deleteCookie } from '@/src/lib/data/data-cookie'

export default function Page() {
  //
  //  Reset the session
  //
  useEffect(() => {
    deleteCookie()
    // eslint-disable-next-line
  }, [])
  return (
    <main className='flex min-h-screen flex-col p-6'>
      <SchoolLogo showOnSmallScreens={true} />
      <div className='mt-4 flex grow flex-col gap-4 md:flex-row'>
        <div className='flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20'>
          <p
            className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}
          >
            Welcome to <strong>Bridge School</strong> brought to you by{' '}
            <strong>Richard Stuart</strong>
          </p>
          <Link
            href='/login'
            className='flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base'
          >
            <span>Log in</span> <ArrowRightIcon className='w-5 md:w-6' />
          </Link>
        </div>
      </div>
    </main>
  )
}
