'use server'

import { sql } from '@vercel/postgres'
import { table_Reftype } from '@/src/lib/definitions'
import { writeLogging } from '@/src/lib/data/writeLogging'
//---------------------------------------------------------------------
//  Fetch reftype
//---------------------------------------------------------------------
export async function fetch_reftype() {
  const functionName = 'fetch_reftype'
  // noStore()
  try {
    const data = await sql<table_Reftype>`
      SELECT *
      FROM reftype
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
