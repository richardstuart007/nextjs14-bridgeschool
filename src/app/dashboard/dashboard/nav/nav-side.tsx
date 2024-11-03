'use client'
import { useEffect, useState } from 'react'
import NavLinks from '@/src/app/dashboard/dashboard/nav/nav-links'
import NavSession from '@/src/app/dashboard/dashboard/nav/nav-session'
import SchoolLogo from '@/src/ui/utils/school-logo'
import { PowerIcon } from '@heroicons/react/24/outline'
import { usePathname, useRouter } from 'next/navigation'
import { useUserContext } from '@/UserContext'
import { getAuthSession } from '@/src/lib/data/data-auth'
import { fetchSessionInfo } from '@/src/lib/data/tables/sessions'
import { structure_SessionsInfo } from '@/src/lib/definitions'
import { logout } from '@/src/lib/actions/user/user-logout'

export default function NavSide() {
  //
  //  Router
  //
  const router = useRouter()
  //
  //  User context
  //
  const { setSessionContext } = useUserContext()
  //
  //  Change of pathname - Get session info
  //
  const pathname = usePathname()
  const [sessionInfo, setSessionInfo] = useState<structure_SessionsInfo | undefined>(undefined)
  useEffect(() => {
    getSessionInfo()
    // eslint-disable-next-line
  }, [pathname])
  //--------------------------------------------------------------------------------
  //  Change of pathname
  //--------------------------------------------------------------------------------
  async function getSessionInfo() {
    //
    //  Auth redirect error - fix ???
    //
    if (!pathname.includes('/dashboard')) {
      console.log('nav-side: Auth redirect but not /dashboard')
      router.push(pathname)
      return
    }
    //
    //  Auth Session
    //
    let sessionId
    const authSession = await getAuthSession()
    sessionId = authSession?.user?.sessionId
    //
    //  Get Session info from database & update Context
    //
    if (sessionId) {
      const bsid = parseInt(sessionId, 10)
      const sessionData = await fetchSessionInfo(bsid)
      const structure_ContextInfo = {
        cxuid: sessionData.bsuid,
        cxid: sessionData.bsid
      }
      setSessionContext(structure_ContextInfo)
      setSessionInfo(sessionData)
    }
  }
  //--------------------------------------------------------------------------------
  return (
    <div className='flex h-full flex-col px-3 py-2 md:px-2'>
      <SchoolLogo />
      {sessionInfo && (
        <>
          <NavSession sessionInfo={sessionInfo} />
          <div className='flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2'>
            <NavLinks sessionInfo={sessionInfo} />
            <div className='hidden h-auto w-full grow rounded-md bg-gray-50 md:block'></div>
            <form action={logout}>
              <button className='flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3'>
                <PowerIcon className='w-6' />
                <div className='hidden md:block'>Sign Out</div>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
