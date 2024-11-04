'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_Sessions, structure_SessionsInfo } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/logging'
import { deleteCookie, getCookieSessionId } from '@/src/lib/data-cookie'
//---------------------------------------------------------------------
//  Write User Sessions
//---------------------------------------------------------------------
export async function writeSessions(s_uid: number) {
  const functionName = 'writeSessions'
  try {
    const s_datetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
    const { rows } = await sql`
    INSERT INTO sessions (
      s_datetime,
      s_uid
    ) VALUES (
      ${s_datetime},
      ${s_uid}
    ) RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Update Sessions to signed out
//---------------------------------------------------------------------
export async function SessionsSignout(s_id: number) {
  const functionName = 'SessionsSignout'
  try {
    await sql`
    UPDATE sessions
    SET
      s_signedin = false
    WHERE s_id = ${s_id}
    `
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'SessionsSignout: Failed to Update session.'
    }
  }
}
//---------------------------------------------------------------------
//  Update User Sessions to signed out - ALL
//---------------------------------------------------------------------
export async function SessionsSignoutAll() {
  const functionName = 'SessionsSignoutAll'
  try {
    await sql`
    UPDATE sessions
    SET
      s_signedin = false
    WHERE
      s_signedin = true AND
      s_datetime < NOW() - INTERVAL '3 HOURS'
    `
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'SessionsSignoutAll: Failed to Update ssession.'
    }
  }
}
//---------------------------------------------------------------------
//  sessions data by ID
//---------------------------------------------------------------------
export async function fetchSessionsById(s_id: number) {
  const functionName = 'fetchSessionsById'
  noStore()
  try {
    const data = await sql<table_Sessions>`
      SELECT *
      FROM sessions
      WHERE s_id = ${s_id};
    `
    const row = data.rows[0]
    return row
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Update Sessions to signed out
//---------------------------------------------------------------------
export async function UpdateSessions(
  s_id: number,
  s_dftmaxquestions: number,
  s_sortquestions: boolean,
  s_skipcorrect: boolean
) {
  const functionName = 'UpdateSessions'
  try {
    await sql`
    UPDATE sessions
    SET
      s_dftmaxquestions = ${s_dftmaxquestions},
      s_sortquestions = ${s_sortquestions},
      s_skipcorrect = ${s_skipcorrect}
    WHERE s_id = ${s_id}
    `
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'UpdateSessions: Failed to Update session.'
    }
  }
}
//---------------------------------------------------------------------
//  Fetch structure_SessionsInfo data by ID
//---------------------------------------------------------------------
export async function fetchSessionInfo(sessionId: number) {
  const functionName = 'fetchSessionInfo'
  // noStore()
  try {
    const data = await sql`
      SELECT
        u_uid,
        u_name,
        u_email,
        u_admin,
        s_id,
        s_signedin,
        s_sortquestions,
        s_skipcorrect,
        s_dftmaxquestions
      FROM sessions
      JOIN users
      ON   s_uid = u_uid
      WHERE s_id = ${sessionId};
    `

    const row = data.rows[0]
    const structure_SessionsInfo: structure_SessionsInfo = {
      bsuid: row.u_uid,
      bsname: row.u_name,
      bsemail: row.u_email,
      bsadmin: row.u_admin,
      bsid: row.s_id,
      bssignedin: row.s_signedin,
      bssortquestions: row.s_sortquestions,
      bsskipcorrect: row.s_skipcorrect,
      bsdftmaxquestions: row.s_dftmaxquestions
    }
    return structure_SessionsInfo
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Nav signout
// ----------------------------------------------------------------------
export async function navsignout() {
  const functionName = 'navsignout'
  try {
    //
    //  Get the Bridge School session cookie
    //
    const sessionId = await getCookieSessionId()
    if (!sessionId) return
    //
    //  Update the session to signed out
    //
    const s_id = parseInt(sessionId, 10)
    await SessionsSignout(s_id)
    //
    //  Delete the cookie
    //
    await deleteCookie('SessionId')
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
//  Determine if Admin User
// ----------------------------------------------------------------------
export async function isAdmin() {
  const functionName = 'isAdmin'
  //
  //  Get session id
  //
  const cookie = await getCookieSessionId()
  //
  //  No cookie then not logged in
  //
  if (!cookie) return false
  //
  //  Session ID
  //
  const sessionId = parseInt(cookie, 10)
  //
  //  Session info
  //
  const sessionInfo = await fetchSessionInfo(sessionId)
  //
  //  Return admin flag
  //
  return sessionInfo.bsadmin
}
