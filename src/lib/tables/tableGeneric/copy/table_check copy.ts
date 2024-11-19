'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Define a type for the column-value pair
//
interface ColumnValuePair {
  column: string
  value: string
}
//
// Define a type for the table and its corresponding column-value pairs
//
interface TableColumnValuePairs {
  table: string
  whereColumnValuePairs: ColumnValuePair[]
}

export async function table_check(
  tableColumnValuePairs: TableColumnValuePairs[]
): Promise<boolean> {
  const functionName = 'table_check'
  noStore()
  const client = await db.connect()

  try {
    //
    // Loop through each table-column-value pair
    //
    for (const { table, whereColumnValuePairs } of tableColumnValuePairs) {
      //
      // Construct the WHERE clause by pairing each column with its corresponding value
      //
      const conditions = whereColumnValuePairs.map(({ column, value }) => {
        return `${column} = '${value}'`
      })
      //
      // Build the WHERE clause with "AND" between conditions
      //
      const whereClause = conditions.join(' AND ')
      //
      // Construct and run the query with the dynamically built WHERE clause
      //
      const sqlQuery = `SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`
      const data = await client.query(sqlQuery)
      //
      // Check if the keys exist
      //
      if (data.rows.length > 0) {
        console.log(`Keys exist in ${table} with conditions: ${whereClause}`)
        return true
      }
      // console.log(`Keys do not exist in ${table} with conditions: ${whereClause}`)
    }

    // console.log(`None of the keys exist as foreign keys in any table`)
    return false
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  } finally {
    client.release()
  }
}
