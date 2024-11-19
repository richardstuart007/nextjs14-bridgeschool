'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Define the column-value pair interface
//
interface ColumnValuePair {
  column: string
  value: string | number
}
//
// Define the props interface for the insert function
//
interface Props {
  table: string
  columnValuePairs: ColumnValuePair[]
}

export async function table_write({ table, columnValuePairs }: Props): Promise<any[]> {
  const functionName = 'table_write'
  noStore()
  //
  //  Connect
  //
  const client = await db.connect()
  //
  // Prepare the columns and parameterized placeholders for the INSERT statement
  //
  const columns = columnValuePairs.map(({ column }) => column).join(', ')
  const values = columnValuePairs.map(({ value }) => value)
  const placeholders = columnValuePairs.map((_, index) => `$${index + 1}`).join(', ')
  //
  // Build the SQL query
  //
  const sqlQuery = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`
  //
  // Run the query
  //
  try {
    writeLogging(functionName, `Query: ${sqlQuery}, Values: ${JSON.stringify(values)}`)
    const data = await client.query(sqlQuery, values) // Use parameterized query to prevent SQL injection
    //
    // Return the inserted rows
    //
    return data.rows[0]
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
