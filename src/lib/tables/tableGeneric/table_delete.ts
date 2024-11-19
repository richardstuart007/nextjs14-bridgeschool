'use server'

import { db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
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
  whereColumnValuePairs: ColumnValuePair[]
}

export async function table_delete({ table, whereColumnValuePairs }: Props): Promise<any[]> {
  const functionName = 'table_delete'
  noStore()
  //
  //  Connect
  //
  const client = await db.connect()
  //
  // Build the WHERE clause from key pair/values
  //
  const conditions = whereColumnValuePairs.map(({ column, value }) => {
    return `${column} = '${value}'`
  })
  //
  // "AND" between conditions
  //
  const whereClause = conditions.join(' AND ')
  try {
    //
    // Build sql
    //
    const sqlQuery = `
    DELETE FROM ${table}
    WHERE ${whereClause}
    RETURNING *;`
    //
    // Run query
    //
    const data = await client.query(sqlQuery)
    //
    // Return rows
    //
    const rowsNumber = data.rows.length
    if (rowsNumber > 0) {
      writeLogging(functionName, `TABLE(${table}) WHERE(${whereClause}) DELETED(${rowsNumber})`)
      return data.rows
    }
    //
    //  No records
    //
    return []
  } catch (error) {
    const errorMessage = `Table(${table}) WHERE(${whereClause}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`functionName, ${errorMessage}`)
  } finally {
    client.release()
  }
}
