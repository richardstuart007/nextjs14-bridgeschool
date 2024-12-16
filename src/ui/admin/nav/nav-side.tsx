'use client'
import NavLinks from '@/src/ui/admin/nav/nav-links'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { logout } from '@/src/ui/utils/user-logout'

export default function NavSide() {
  //--------------------------------------------------------------------------------
  return (
    <div className='px-2 py-3 flex h-full flex-row md:flex-col  md:px-3 md:w-28'>
      <SchoolLogo />
      <>
        <div className='flex grow justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2'>
          <NavLinks />
          <div className='grow invisible'></div>
          <form action={logout}>
            <button className='flex h-15 w-full grow items-center justify-center gap-2 rounded-md bg-black text-white p-3 text-xs font-medium hover:bg-gray-800 md:flex-none md:p-2 md:px-3'>
              Sign-Out
            </button>
          </form>
        </div>
      </>
    </div>
  )
}
