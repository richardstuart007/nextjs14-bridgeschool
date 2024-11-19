'use server'

import { auth } from '@/auth'
import { updateCookieSessionId } from '@/src/lib/data-cookie'
import { writeSessions } from '@/src/lib/tables/tableSpecific/sessions'
import { fetchUserByEmail, writeUser } from '@/src/lib/tables/tableSpecific/users'
import { writeUsersOwner } from '@/src/lib/tables/tableSpecific/usersowner'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
import { table_Users, structure_ProviderSignInParams } from '@/src/lib/tables/definitions'

// ----------------------------------------------------------------------
//  Google Provider
// ----------------------------------------------------------------------
export async function providerSignIn({ provider, email, name }: structure_ProviderSignInParams) {
  const functionName = 'providerSignIn'
  try {
    //
    //  Get user from database
    //
    let userRecord: table_Users | undefined
    userRecord = (await fetchUserByEmail(email)) as table_Users | undefined
    //
    //  Create user if does not exist
    //
    if (!userRecord) {
      userRecord = (await writeUser(provider, email, name)) as table_Users | undefined
      if (!userRecord) {
        throw Error('providerSignIn: Write User Error')
      }
      //
      //  Write the usersowner data
      //
      const userid = userRecord.u_uid
      await writeUsersOwner(userid)
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
