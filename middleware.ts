import {
  Routes_App,
  Routes_LoginRegister,
  Routes_Prefix_auth,
  Routes_AfterLogin_redirect,
  Routes_Prefix_admin,
  Routes_Login
} from '@/routes'
import { writeLogging } from '@/src/lib/data/writeLogging'
import { isAdmin } from '@/src/lib/data/tables/sessions'
import { cookies } from 'next/headers'

export default async function middleware(req: any): Promise<any> {
  const functionName = 'middleware'
  const { nextUrl } = req
  //
  //  Requested path name
  //
  const pathnameNew = req.nextUrl.pathname
  //
  //  Current path name
  //
  const pathnameCurrentobj = req.headers.get('referer')
  let pathnameCurrent = '/'
  if (pathnameCurrentobj) {
    const previousUrl = new URL(pathnameCurrentobj)
    pathnameCurrent = previousUrl.pathname
  }
  //
  //  Flags
  //
  const isPrefixApiAuth = pathnameNew.startsWith(Routes_Prefix_auth)
  const isAppRoute = Routes_App.includes(pathnameNew)
  const wasLoginRegisterRoute = Routes_LoginRegister.includes(pathnameCurrent)
  const isPrefixAdminRoute = pathnameNew.startsWith(Routes_Prefix_admin)
  //
  //  Login status (Auth not working yet)
  //
  const cookie = cookies().get('SessionId')
  const isLoggedInCookie = !!cookie
  // console.log('---------------------------pathnameNew:', pathnameNew)
  // console.log('pathnameCurrent:', pathnameCurrent)
  // console.log('isLoggedInCookie:', isLoggedInCookie)
  // console.log('isPrefixApiAuth:', isPrefixApiAuth)
  // console.log('isAppRoute:', isAppRoute)
  // console.log('isPrefixAdminRoute:', isPrefixAdminRoute)
  // console.log('wasLoginRegisterRoute:', wasLoginRegisterRoute)
  //-------------------------------------------------------------------------------------------------
  //  Allow all API routes
  //-------------------------------------------------------------------------------------------------
  if (isPrefixApiAuth) return null
  //-------------------------------------------------------------------------------------------------
  //  Allow App route
  //-------------------------------------------------------------------------------------------------
  if (isAppRoute) return null
  //-------------------------------------------------------------------------------------------------
  //  Login/Register
  //-------------------------------------------------------------------------------------------------
  if (wasLoginRegisterRoute) {
    //
    // If not logged in then do not redirect
    //
    if (!isLoggedInCookie) return null
    //
    // Logged in and already redirected
    //
    if (pathnameNew === Routes_AfterLogin_redirect) return null
    //
    //  Logged in then Redirect to dashboard
    //
    return Response.redirect(new URL(Routes_AfterLogin_redirect, nextUrl))
  }
  //-------------------------------------------------------------------------------------------------
  //  If no change in path, allow
  //-------------------------------------------------------------------------------------------------
  if (pathnameNew === pathnameCurrent) return null
  //-------------------------------------------------------------------------------------------------
  //  Admin route
  //-------------------------------------------------------------------------------------------------
  if (isPrefixAdminRoute) {
    //
    //  Not logged in
    //
    if (!isLoggedInCookie) {
      writeLogging(functionName, `Admin Route not logged in: Redirect ${Routes_Login}`)
      return Response.redirect(new URL(Routes_Login, nextUrl))
    }
    //
    //  Not authorised ()
    //
    const isAdminAuthorised = await isAdmin()
    console.log('isAdminAuthorised', isAdminAuthorised)
    if (!isAdminAuthorised) {
      writeLogging(
        functionName,
        `Admin Route not Authorised: Redirect ${Routes_AfterLogin_redirect}`
      )
      return Response.redirect(new URL(Routes_AfterLogin_redirect, nextUrl))
    }
    //
    //  Authorised
    //
    return null
  }
  //-------------------------------------------------------------------------------------------------
  //  Allow others
  //-------------------------------------------------------------------------------------------------
  return null
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
