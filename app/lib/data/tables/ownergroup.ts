'use server'

import { ownergroupTable } from '@/app/lib/definitions'
import { sql } from '@vercel/postgres'
import { writeLogging } from '@/app/lib/data/writeLogging'
//---------------------------------------------------------------------
//  Fetch owner group table
//---------------------------------------------------------------------
export async function fetch_ownergroup1(ogowner: string, oggroup: string) {
  const functionName = 'fetch_ownergroup1'
  // noStore()
  try {
    const data = await sql<ownergroupTable>`
      SELECT *
      FROM ownergroup
      WHERE
        ogowner = ${ogowner} AND
        oggroup = ${oggroup}
      ;
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
//  Fetch owner group table
//---------------------------------------------------------------------
export async function fetch_ownergroup(ogowner: string) {
  const functionName = 'fetch_ownergroup'
  // noStore()
  try {
    const data = await sql<ownergroupTable>`
      SELECT *
      FROM ownergroup
      WHERE ogowner = ${ogowner}
      ORDER BY ogowner, oggroup
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
