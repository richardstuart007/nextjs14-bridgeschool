'use server'

import { sql } from '@vercel/postgres'
import { getCookieSessionId } from '@/src/lib/data-cookie'
//---------------------------------------------------------------------
//  Write User Logging
//---------------------------------------------------------------------
export async function writeLogging(lgfunctionname: string, lgmsg: string) {
  //
  //  Get session id
  //
  let lgsession = 0
  const cookie = await getCookieSessionId()
  if (cookie) lgsession = parseInt(cookie, 10)

  try {
    const lgdatetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
    const { rows } = await sql`
    INSERT INTO logging (
      lgdatetime,
      lgmsg,
      lgfunctionname,
      lgsession
    ) VALUES (
      ${lgdatetime},
      ${lgmsg},
      ${lgfunctionname},
      ${lgsession}
    ) RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error('writeLogging:', error)
    throw new Error('writeLogging: Failed')
  }
}
