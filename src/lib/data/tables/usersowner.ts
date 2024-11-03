'use server'

import { sql } from '@vercel/postgres'
import { table_Usersowner } from '@/src/lib/definitions'
import { writeLogging } from '@/src/lib/data/writeLogging'

// ----------------------------------------------------------------------
//  Write UserOwner records
// ----------------------------------------------------------------------
export async function writeUsersOwner(userid: number) {
  const functionName = 'writeUsersOwner'
  //
  // Insert data into the database
  //
  const uouid = userid
  const uoowner = 'Richard'
  try {
    const { rows } = await sql`
    INSERT
      INTO usersowner
       (
        uouid,
        uoowner
        )
    VALUES (
      ${uouid},
      ${uoowner}
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
//  Fetch owners for user table
//---------------------------------------------------------------------
export async function fetch_usersowner(uouid: number) {
  const functionName = 'fetch_usersowner'
  // noStore()
  try {
    const data = await sql<table_Usersowner>`
      SELECT *
      FROM usersowner
      WHERE uouid = ${uouid}
      ;
    `
    const rows = data.rows
    return rows
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
