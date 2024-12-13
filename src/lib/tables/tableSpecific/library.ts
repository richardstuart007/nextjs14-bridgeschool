'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_LibraryGroup } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

// Constants for pagination
const ITEMS_PER_PAGE = 10
const prefix = 'lr'
//---------------------------------------------------------------------
//  Combined Fetch Library Function
//---------------------------------------------------------------------
type FetchLibraryFilteredParams = {
  query: string
  currentPage: number
  uid?: number
  items_per_page?: number
}
export async function fetchLibraryFiltered({
  query,
  currentPage,
  uid,
  items_per_page = ITEMS_PER_PAGE
}: FetchLibraryFilteredParams) {
  const functionName = 'fetchLibraryFiltered'
  noStore()
  //
  // Calculate the offset for pagination
  //
  const offset = (currentPage - 1) * items_per_page

  try {
    //
    // Build Where clause, include user filter if uid is provided
    //
    const { sqlWhere, queryValues } = await buildWhere_Library(query, uid)
    //
    // If uid specified then limit to uouid = uid, else all library items
    //
    const sqlQueryStatement = uid
      ? `
      SELECT *
      FROM library
      LEFT JOIN usersowner ON lrowner = uoowner
      LEFT JOIN ownergroup ON lrgid = oggid
      ${sqlWhere}
      ORDER BY lrlid
      LIMIT ${items_per_page} OFFSET ${offset}
    `
      : `
      SELECT *
      FROM library
      ${sqlWhere}
      ORDER BY lrlid
      LIMIT ${items_per_page} OFFSET ${offset}
    `
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    // Logging
    //
    const message = `${sqlQuery} Values: ${queryValues}`
    writeLogging(functionName, message, 'I')
    //
    // Execute SQL
    //
    const data = await sql.query<table_LibraryGroup>(sqlQuery, queryValues)
    //
    // Return results
    //
    return data.rows
  } catch (error) {
    // Logging
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}

//---------------------------------------------------------------------
//  Combined Fetch Library Total Pages Function
//---------------------------------------------------------------------
type fetchLibraryTotalPagesParams = {
  query: string
  uid?: number
  items_per_page?: number
}
export async function fetchLibraryTotalPages({
  query,
  uid,
  items_per_page = ITEMS_PER_PAGE
}: fetchLibraryTotalPagesParams) {
  const functionName = 'fetchLibraryTotalPages'
  noStore()
  try {
    //
    // Build Where clause, include user filter if uid is provided
    //
    const { sqlWhere, queryValues } = await buildWhere_Library(query, uid)
    //
    // Build Query Statement to count total records
    //
    const sqlQueryStatement = uid
      ? `
      SELECT COUNT(*)
      FROM library
      LEFT JOIN usersowner ON lrowner = uoowner
      LEFT JOIN ownergroup ON lrgid = oggid
      ${sqlWhere}
    `
      : `
      SELECT COUNT(*)
      FROM library
      ${sqlWhere}
    `
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    // Logging
    //
    const message = `${sqlQuery} Values: ${queryValues}`
    writeLogging(functionName, message, 'I')
    //
    // Run SQL query to get the count of total records
    //
    const result = await sql.query(sqlQuery, queryValues)
    //
    // Calculate total pages
    //
    const count = result.rows[0].count
    const totalPages = Math.ceil(count / items_per_page)
    return totalPages
  } catch (error) {
    // Logging
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}

//---------------------------------------------------------------------
//  Library where clause with optional user filter
//---------------------------------------------------------------------
async function buildWhere_Library(
  query: string,
  uid?: number
): Promise<{ sqlWhere: string; queryValues: (string | number)[] }> {
  //
  // Default to user-specific filter if no query provided
  //
  if (!query) {
    return uid
      ? { sqlWhere: `WHERE uouid = $1`, queryValues: [uid] }
      : { sqlWhere: '', queryValues: [] }
  }
  //
  // Initialize conditions and query values
  //
  const whereParams: string[] = []
  const queryValues: (string | number)[] = []
  //
  // Add user filter if uid is provided
  //
  if (uid) {
    whereParams.push(`uouid = $1`)
    queryValues.push(uid)
  }
  //
  // Parse the query into parts
  //
  query
    .split(/\s+/)
    .filter(Boolean)
    .forEach((part, index) => {
      let key: string, value: string, operator: string
      //
      // Adjust for the $1 for uid
      //
      const paramIndex = index + (uid ? 2 : 1)
      //
      //  Exact match
      //
      if (part.includes('=')) {
        const split = part.split('=')
        key = split[0]
        value = split[1]
        operator = '='
      }
      //
      //  Partial match
      //
      else if (part.includes(':')) {
        const split = part.split(':')
        key = split[0]
        value = split[1]
        operator = 'ILIKE'
      }
      //
      //  Default as desc
      //
      else {
        key = 'desc'
        value = part
        operator = 'ILIKE'
      }
      //
      // Skip if value is empty
      //
      if (!value) return
      //
      // Add the prefix only to the query fields
      //
      key = `${prefix}${key}`
      //
      // For ILIKE, add % around the value
      //
      if (operator === 'ILIKE') value = `%${value}%`
      //
      // Push the condition and value
      //
      whereParams.push(`${key} ${operator} $${paramIndex}`)
      queryValues.push(isNaN(Number(value)) ? value : Number(value))
    })
  //
  // Combine conditions into a WHERE clause
  //
  const sqlWhere = whereParams.length > 0 ? `WHERE ${whereParams.join(' AND ')}` : ''
  //
  //  Return the sqlWhere and the $1 etc values
  //
  return { sqlWhere, queryValues }
}
