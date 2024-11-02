'use server'

import { auth } from '@/auth'
import { updateCookieSessionId } from '@/app/lib/data/data-cookie'
import { writeSessions } from '@/app/lib/data/tables/sessions'
import { fetchUserByEmail, writeUser } from '@/app/lib/data/tables/users'
import { writeUsersOwner } from '@/app/lib/data/tables/usersowner'
import { writeLogging } from '@/app/lib/data/writeLogging'
import { UsersTable, UsersOwnerTable, ProviderSignInParams } from '@/app/lib/definitions'

// ----------------------------------------------------------------------
//  Google Provider
// ----------------------------------------------------------------------
export async function providerSignIn({ provider, email, name }: ProviderSignInParams) {
  const functionName = 'providerSignIn'
  try {
    //
    //  Get user from database
    //
    let userRecord: UsersTable | undefined
    userRecord = (await fetchUserByEmail(email)) as UsersTable | undefined
    //
    //  Create user if does not exist
    //
    if (!userRecord) {
      userRecord = (await writeUser(provider, email, name)) as UsersTable | undefined
      if (!userRecord) {
        throw Error('providerSignIn: Write User Error')
      }
      //
      //  Write the usersowner data
      //
      const userid = userRecord.u_uid
      ;(await writeUsersOwner(userid)) as UsersOwnerTable
    }
    //
    // Write session information
    //
    const { u_uid } = userRecord
    const sessionsRecord = await writeSessions(u_uid)
    //
    // Write cookie session
    //
    const sessionId = sessionsRecord.s_id
    await updateCookieSessionId(sessionsRecord.s_id)
    //
    //  Return Session ID
    //
    return sessionId
    //
    //  Errors
    //
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Get Auth Session information
// ----------------------------------------------------------------------
export async function getAuthSession() {
  const functionName = 'getAuthSession'
  try {
    const session = await auth()
    return session
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
