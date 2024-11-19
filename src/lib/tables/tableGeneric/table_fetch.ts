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
  columnValuePairs?: ColumnValuePair[]
}

export async function table_fetch({ table, columnValuePairs }: Props): Promise<any[]> {
  const functionName = 'table_fetch'
  noStore()
  //
  //  Connect
  //
  const client = await db.connect()
  //
  // Build the WHERE clause from key pair/values
  //
  let sqlQuery
  if (columnValuePairs) {
    const conditions = columnValuePairs.map(({ column, value }) => {
      return `${column} = '${value}'`
    })
    //
    // "AND" between conditions
    //
    const whereClause = conditions.join(' AND ')
    //
    // Build sql
    //
    sqlQuery = `SELECT * FROM ${table} WHERE ${whereClause}`
  } else {
    sqlQuery = `SELECT * FROM ${table}`
  }
  //
  // Run query
  //
  try {
    const data = await client.query(sqlQuery)
    //
    // Return rows
    //
    if (data.rows.length > 0) {
      return data.rows
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
