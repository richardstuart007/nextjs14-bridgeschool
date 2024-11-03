'use server'

import { sql } from '@vercel/postgres'
import { table_Who } from '@/app/lib/definitions'
import { writeLogging } from '@/app/lib/data/writeLogging'
//---------------------------------------------------------------------
//  Fetch who table
//---------------------------------------------------------------------
export async function fetch_who() {
  const functionName = 'fetch_who'
  // noStore()
  try {
    const data = await sql<table_Who>`
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
