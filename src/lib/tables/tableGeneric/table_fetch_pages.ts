'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

// Define types for joins and filters
type JoinParams = {
  table: string
  on: string
}

type FilterParams = {
  column: string
  operator?: string
  value: string | number
}

// Default items per page
const ITEMS_PER_PAGE = 10
//---------------------------------------------------------------------
// Fetch Filtered Function
//---------------------------------------------------------------------
export async function fetchFiltered({
  table,
  joins = [],
  filters = [],
  orderBy,
  limit,
  offset,
  distinctColumns = []
}: {
  table: string
  joins?: JoinParams[]
  filters?: FilterParams[]
  orderBy?: string
  limit?: number
  offset?: number
  distinctColumns?: string[]
}): Promise<any[]> {
  const functionName = 'fetchFiltered'
  noStore()
  const { sqlQuery, queryValues } = buildSqlQuery({ table, joins, filters })

  try {
    let finalQuery = sqlQuery
    //
    // Apply DISTINCT ON if distinctColumns are provided
    //
    if (distinctColumns.length > 0) {
      finalQuery = finalQuery.replace(
        'SELECT *',
        `SELECT DISTINCT ON (${distinctColumns.join(', ')}) *`
      )
    }
    //
    // Add ORDER BY
    //
    if (orderBy) finalQuery += ` ORDER BY ${orderBy}`
    // Add LIMIT and OFFSET
    if (limit !== undefined) finalQuery += ` LIMIT ${limit}`
    if (offset !== undefined) finalQuery += ` OFFSET ${offset}`
    //
    // Logging
    //
    writeLogging(functionName, `Query: ${finalQuery}, Values: ${JSON.stringify(queryValues)}`, 'I')
    //
    // Execute Query
    //
    const data = await sql.query(finalQuery.replace(/\s+/g, ' ').trim(), queryValues)
    return data.rows.length > 0 ? data.rows : []
  } catch (error) {
    const errorMessage = `Table(${table}) SQL(${sqlQuery}) FAILED`
    console.error(`${functionName}: ${errorMessage}`, error)
    writeLogging(functionName, errorMessage)
    throw new Error(`${functionName}, ${errorMessage}`)
  }
}
//---------------------------------------------------------------------
// Fetch Total Pages Function
//---------------------------------------------------------------------
export async function fetchTotalPages({
  table,
  joins = [],
  filters = [],
  items_per_page = ITEMS_PER_PAGE,
  distinctColumns = []
}: {
  table: string
  joins?: JoinParams[]
  filters?: FilterParams[]
  items_per_page?: number
  distinctColumns?: string[]
}): Promise<number> {
  const functionName = 'fetchTotalPages'
  noStore()
  try {
    const { sqlQuery, queryValues } = buildSqlQuery({ table, joins, filters })
    //
    // Modify query for COUNT
    //
    let countQuery = sqlQuery.replace('SELECT *', 'SELECT COUNT(*)')
    //
    // If distinctColumns are provided, wrap the query in a subquery for counting
    //
    if (distinctColumns.length > 0) {
      countQuery = `SELECT COUNT(*) FROM (${sqlQuery.replace('SELECT *', `SELECT DISTINCT ON (${distinctColumns.join(', ')}) *`)}) AS distinct_records`
    }
    //
    // Logging
    //
    const message = `Query: ${countQuery} Values: ${JSON.stringify(queryValues)}`
    writeLogging(functionName, message, 'I')
    //
    // Execute Query
    //
    const result = await sql.query(countQuery.replace(/\s+/g, ' ').trim(), queryValues)
    //
    // Calculate Total Pages
    //
    const count = result.rows[0].count
    const totalPages = Math.ceil(count / items_per_page)
    return totalPages
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
// Helper to build SQL query and WHERE clause
//---------------------------------------------------------------------
function buildSqlQuery({
  table,
  joins = [],
  filters = []
}: {
  table: string
  joins?: JoinParams[]
  filters?: FilterParams[]
}) {
  //
  //  Default a select query
  //
  let sqlQuery = `SELECT * FROM ${table}`
  const queryValues: (string | number)[] = []
  //
  // Handle JOINs
  //
  if (joins.length) {
    joins.forEach(({ table: joinTable, on }) => {
      sqlQuery += ` LEFT JOIN ${joinTable} ON ${on}`
    })
  }
  //
  // Handle WHERE conditions
  //
  if (filters.length) {
    const whereConditions = filters.map(({ column, operator = '=', value }) => {
      const adjustedColumn = operator === 'LIKE' ? `LOWER(${column})` : column
      const adjustedValue =
        operator === 'LIKE' && typeof value === 'string' ? `%${value.toLowerCase()}%` : value
      queryValues.push(adjustedValue)
      return `${adjustedColumn} ${operator} $${queryValues.length}`
    })
    sqlQuery += ` WHERE ${whereConditions.join(' AND ')}`
  }

  return { sqlQuery, queryValues }
}
