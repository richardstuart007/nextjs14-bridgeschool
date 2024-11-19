'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Column-value pairs
//
interface ColumnValuePair {
  column: string
  value: string | number // Support both numeric and string values
}
//
// Props
//
interface Props {
  table: string
  whereColumnValuePairs?: ColumnValuePair[]
}

export async function table_count({ table, whereColumnValuePairs }: Props): Promise<number> {
  const functionName = 'table_count'
  noStore()
  //
  //  Connect
  //
  const client = await db.connect()
  //
  // Build the base SQL query
  //
  let sqlQuery = `SELECT COUNT(*) FROM ${table}`
  try {
    const values: (string | number)[] = []
    //
    // Add WHERE clause if conditions are provided
    //
    if (whereColumnValuePairs && whereColumnValuePairs.length > 0) {
      const whereClause = whereColumnValuePairs
        .map(({ column }, index) => {
          values.push(whereColumnValuePairs[index].value) // Add value to the array
          return `${column} = $${index + 1}` // Use parameterized placeholders
        })
        .join(' AND ')
      sqlQuery += ` WHERE ${whereClause}`
    }
    //
    // Log the query and values
    //
    writeLogging(functionName, `Query: ${sqlQuery}, Values: ${JSON.stringify(values)}`)
    //
    // Execute the query
    //
    const data = await client.query(sqlQuery, values)
    //
    // Return the count
    //
    const rowCount = parseInt(data.rows[0].count, 10)
    return rowCount
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  } finally {
    //
    //  Disconnect
    //
    client.release()
  }
}
