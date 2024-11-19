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
  whereColumnValuePairs: ColumnValuePair[]
}

export async function table_delete({ table, whereColumnValuePairs }: Props): Promise<any[]> {
  const functionName = 'table_delete'
  noStore()
  //
  //  Connect
  //
  const client = await db.connect()

  try {
    //
    // Build the WHERE clause with parameterized values
    //
    const conditions = whereColumnValuePairs.map(({ column }, index) => {
      return `${column} = $${index + 1}` // Use parameterized placeholders
    })
    const whereClause = conditions.join(' AND ')
    //
    //  Collect Values
    //
    const values = whereColumnValuePairs.map(({ value }) => value)
    //
    // Construct the DELETE query
    //
    const sqlQuery = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`
    //
    // Log the query and values
    //
    writeLogging(functionName, `Query: ${sqlQuery}, Values: ${JSON.stringify(values)}`)
    //
    // Execute the query
    //
    const data = await client.query(sqlQuery, values)
    //
    // Check and return the deleted rows
    //
    const rowsNumber = data.rows.length
    if (rowsNumber > 0) {
      writeLogging(functionName, `TABLE(${table}) WHERE(${whereClause}) DELETED(${rowsNumber})`)
      return data.rows
    }
    //
    // No records were deleted
    //
    return []
  } catch (error) {
    const errorMessage = `Table(${table}) DELETE FAILED`
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
