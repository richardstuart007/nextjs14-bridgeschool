'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

interface ColumnValuePair {
  column: string
  value: string | number // Allow numeric values
}

interface TableColumnValuePairs {
  table: string
  whereColumnValuePairs: ColumnValuePair[]
}

export async function table_check(
  tableColumnValuePairs: TableColumnValuePairs[]
): Promise<boolean> {
  const functionName = 'table_check'
  noStore()
  //
  //  Connect to database
  //
  const client = await db.connect()

  try {
    //
    // Loop through each table-column-value pair
    //
    for (const { table, whereColumnValuePairs } of tableColumnValuePairs) {
      //
      // Create WHERE clause with parameterized queries
      //
      const whereClause = whereColumnValuePairs
        .map(({ column }, index) => `${column} = $${index + 1}`)
        .join(' AND ')

      //
      // Gather values for the WHERE clause
      //
      const values = whereColumnValuePairs.map(({ value }) => value)

      //
      // Construct the SQL SELECT query
      //
      const sqlQuery = `SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`

      //
      // Log and execute the query
      //
      writeLogging(functionName, `Query: ${sqlQuery}, Values: ${JSON.stringify(values)}`)
      const data = await client.query(sqlQuery, values)
      //
      // Check if rows exist
      //
      if (data.rows.length > 0) {
        console.log(
          `Keys exist in ${table} with conditions: ${JSON.stringify(whereColumnValuePairs)}`
        )
        return true
      }
    }
    //
    // If no matches were found
    //
    return false
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  } finally {
    //
    //  dis-Connect from database
    //
    client.release()
  }
}
