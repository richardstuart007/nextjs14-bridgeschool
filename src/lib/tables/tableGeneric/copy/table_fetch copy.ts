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
  // Build the WHERE clause from key pair/values
  //
  let sqlQuery = `SELECT * FROM ${table}`
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
  // Add Order By clause
  //
  if (orderBy) sqlQuery = sqlQuery + ` ORDER BY ${orderBy}`
  //
  // Run query
  //
  try {
    writeLogging(functionName, sqlQuery)
    const data = await client.query(sqlQuery)
    //
    // Return rows
    //
    const rows = data.rows
    if (rows.length > 0) {
      return rows
    }
    //
    //  No records
    //
    return []
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`functionName, ${errorMessage}`)
  } finally {
    client.release()
  }
}
