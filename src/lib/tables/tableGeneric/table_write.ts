'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
// Define the column-value pair interface
//
interface ColumnValuePair {
  column: string
  value: string
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

  const client = await db.connect()
  //
  // Prepare the columns and values for the INSERT statement
  //
  const columns = columnValuePairs.map(({ column }) => column).join(', ')
  const values = columnValuePairs.map(({ value }) => `'${value}'`).join(', ')
  //
  // Build the SQL query
  //
  const sqlQuery = `
    INSERT
    INTO ${table}
     (${columns})
     VALUES (${values})
     RETURNING *`
  //
  // Run the query
  //
  try {
    const data = await client.query(sqlQuery)
    //
    // Return the inserted rows
    //
    return data.rows[0]
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`functionName, ${errorMessage}`)
  } finally {
    client.release()
  }
}
