'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/logging'
//
// Column-value pairs
//
interface ColumnValuePair {
  column: string
  value: string
}
//
// Props
//
interface Props {
  table: string
  columnValuePairs: ColumnValuePair[]
  whereColumnValuePairs: ColumnValuePair[]
}

export async function table_update({
  table,
  columnValuePairs,
  whereColumnValuePairs
}: Props): Promise<any[]> {
  const functionName = 'table_update'
  noStore()
  //
  // Connect to the database
  //
  const client = await db.connect()

  try {
    //
    // Create the SET clause for the update statement
    //
    const setClause = columnValuePairs
      .map(({ column, value }) => {
        return `${column} = '${value}'`
      })
      .join(', ')
    //
    // Create the WHERE clause from the key-value pairs
    //
    const whereClause = whereColumnValuePairs
      .map(({ column, value }) => {
        return `${column} = '${value}'`
      })
      .join(' AND ')
    //
    // Construct the SQL UPDATE query
    //
    const sqlQuery = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *;
    `
    // console.log('sqlQuery', sqlQuery)
    //
    // Run the query
    //
    const data = await client.query(sqlQuery)
    //
    // Return rows updated
    //
    return data.rows
  } catch (error) {
    console.error(`${functionName}: ${table}`, error)
    writeLogging(functionName, `${table} Function failed`)
    throw new Error(`${functionName}: Function failed`)
  } finally {
    // Release the database connection
    client.release()
  }
}
