'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/data/writeLogging'
//---------------------------------------------------------------------
//  Check if a key exists in any of the files
//---------------------------------------------------------------------
//
// Define a type for the table-column pair
//
interface TableColumnPair {
  table: string
  column: string
}
export async function checkKeyInTables(
  keyValue: string,
  tableColumnPairs: TableColumnPair[]
): Promise<boolean> {
  //
  //  Connect to database
  //
  const functionName = 'checkKeyInTables'
  noStore()
  const client = await db.connect()
  //
  //  Run SQL
  //
  try {
    //
    // Loop through each table-column pair
    //
    for (const { table, column } of tableColumnPairs) {
      //
      // Construct and run the query for each table and column
      //
      const sqlQuery = `SELECT 1 FROM ${table} WHERE ${column} = ${keyValue} LIMIT 1`
      const data = await client.query(sqlQuery)
      //
      //  Key exists
      //
      if (data.rows.length > 0) {
        console.log(`Key:${keyValue} EXISTS in ${table}.${column}`)
        return true
      }
      console.log(`Key:${keyValue} DOES NOT EXIST in ${table}.${column}`)
    }
    //
    //  Key does not exist
    //
    console.log(`Key:${keyValue} DOES NOT EXIST as Foreign keys`)
    return false
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  } finally {
    client.release()
  }
}
