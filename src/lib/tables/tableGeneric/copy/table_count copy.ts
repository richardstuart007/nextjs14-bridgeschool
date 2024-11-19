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
  whereColumnValuePairs?: ColumnValuePair[]
}

export async function table_count({ table, whereColumnValuePairs }: Props): Promise<any[]> {
  const functionName = 'table_count'
  noStore()
  //
  //  Connect
  //
  const client = await db.connect()
  //
  // Build the WHERE clause from key pair/values
  //
  let sqlQuery = `
  SELECT
    COUNT(*)
    FROM ${table}`
  //
  // Add Where clause
  //
  if (whereColumnValuePairs) {
    const conditions = whereColumnValuePairs.map(({ column, value }) => {
      return `${column} = '${value}'`
    })
    //
    // "AND" between conditions
    //
    const whereClause = conditions.join(' AND ')
    //
    // Build sql
    //
    sqlQuery = sqlQuery + ` WHERE ${whereClause}`
  }
  //
  // Run query
  //
  try {
    const data = await client.query(sqlQuery)
    //
    // Return Count
    //
    const row = data.rows[0]
    const rowCount = row.count
    return rowCount
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`functionName, ${errorMessage}`)
  } finally {
    client.release()
  }
}
