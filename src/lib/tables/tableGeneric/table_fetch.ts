'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Column-value pairs
//
interface ColumnValuePair {
  column: string
  value: string | number // Allow both string and numeric values
}
//
// Props
//
interface Props {
  table: string
  whereColumnValuePairs?: ColumnValuePair[]
  orderBy?: string
}
export async function table_fetch({
  table,
  whereColumnValuePairs,
  orderBy
}: Props): Promise<any[]> {
  const functionName = 'table_fetch'
  noStore()
  //
  //  Connect
  //
  const client = await db.connect()
  //
  // Start building the query
  //
  let sqlQuery = `SELECT * FROM ${table}`
  try {
    const values: (string | number)[] = []
    //
    // Add WHERE clause
    //
    if (whereColumnValuePairs) {
      const conditions = whereColumnValuePairs.map(({ column }, index) => {
        values.push(whereColumnValuePairs[index].value) // Add value to array
        return `${column} = $${index + 1}` // Use parameterized placeholders
      })
      const whereClause = conditions.join(' AND ')
      sqlQuery += ` WHERE ${whereClause}`
    }
    //
    // Add ORDER BY clause
    //
    if (orderBy) {
      sqlQuery += ` ORDER BY ${orderBy}`
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
    // Return rows
    //
    return data.rows.length > 0 ? data.rows : []
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
