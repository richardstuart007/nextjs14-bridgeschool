'use server'

import { sql } from '@vercel/postgres'
import { whoTable } from '@/app/lib/definitions'
import { writeLogging } from '@/app/lib/data/writeLogging'
//---------------------------------------------------------------------
//  Fetch who table
//---------------------------------------------------------------------
export async function fetch_who() {
  const functionName = 'fetch_who'
  // noStore()
  try {
    const data = await sql<whoTable>`
      SELECT *
      FROM who
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
