'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_UsershistoryGroupUser } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'

// Constants for pagination
const ITEMS_PER_PAGE = 10
const prefix = 'h_'
//---------------------------------------------------------------------
//  Combined Fetch Library Function
//---------------------------------------------------------------------
type FetchFilteredParams = {
  query: string
  currentPage: number
  uid?: number
  items_per_page?: number
}
export async function fetchFiltered({
  query,
  currentPage,
  uid,
  items_per_page = ITEMS_PER_PAGE
}: FetchFilteredParams) {
  const functionName = 'fetchFiltered'
  noStore()
  //
  // Calculate the offset for pagination
  //
  const offset = (currentPage - 1) * items_per_page

  try {
    //
    // Build Where clause, include user filter if uid is provided
    //
    const { sqlWhere, queryValues } = await buildWhere(query, uid)
    //
    // If uid specified then limit to r_uid = uid, else all library items
    //
    const sqlQueryStatement = `SELECT *
    FROM usershistory
      LEFT JOIN ownergroup
        ON r_gid = oggid
      LEFT JOIN users
        ON r_uid = u_uid
      ${sqlWhere}
      ORDER BY
        r_hid DESC
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
    const data = await sql.query<table_UsershistoryGroupUser>(sqlQuery, queryValues)
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
type fetchTotalPagesParams = {
  query: string
  uid?: number
  items_per_page?: number
}
export async function fetchTotalPages({
  query,
  uid,
  items_per_page = ITEMS_PER_PAGE
}: fetchTotalPagesParams) {
  const functionName = 'fetchTotalPages'
  noStore()
  try {
    //
    // Build Where clause, include user filter if uid is provided
    //
    const { sqlWhere, queryValues } = await buildWhere(query, uid)
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
async function buildWhere(
  query: string,
  uid?: number
): Promise<{ sqlWhere: string; queryValues: (string | number)[] }> {
  //
  // Default to user-specific filter if no query provided
  //
  if (!query) {
    return uid
      ? { sqlWhere: `WHERE r_uid = $1`, queryValues: [uid] }
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
    whereParams.push(`r_uid = $1`)
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
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
export async function fetchTopResultsData() {
  const functionName = 'fetchTopResultsData'
  noStore()
  // await new Promise(resolve => setTimeout(resolve, 3000))
  try {
    const sqlQueryStatement = `
    SELECT
        r_uid,
        u_name,
        COUNT(*) AS record_count,
        SUM(r_totalpoints) AS total_points,
        SUM(r_maxpoints) AS total_maxpoints,
        CASE
          WHEN SUM(r_maxpoints) > 0 THEN ROUND((SUM(r_totalpoints) / CAST(SUM(r_maxpoints) AS NUMERIC)) * 100)::INTEGER
          ELSE 0
        END AS percentage
      FROM
        usershistory
      JOIN
        users ON r_uid = u_uid
      GROUP BY
        r_uid, u_name
      HAVING
        COUNT(*) >= 3
      ORDER BY
        percentage DESC
      LIMIT 5
  `
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    writeLogging(functionName, sqlQuery, 'I')
    //
    //  Run sql Query
    //
    const data = await sql.query(sqlQuery)
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Recent result data last
//---------------------------------------------------------------------
export async function fetchRecentResultsData1() {
  const functionName = 'fetchRecentResultsData1'
  noStore()
  // ????????????
  // await new Promise(resolve => setTimeout(resolve, 3000))
  try {
    const sqlQueryStatement = `
    SELECT
      r_hid, r_uid, u_name, r_totalpoints, r_maxpoints, r_correctpercent
      FROM (
              SELECT
                r_hid,
                r_uid,
                u_name,
                r_totalpoints,
                r_maxpoints,
                r_correctpercent,
                ROW_NUMBER()
                OVER (PARTITION BY r_uid ORDER BY r_hid DESC) AS rn
              FROM usershistory
              JOIN users
                ON r_uid = u_uid
            )
      AS ranked
      WHERE rn = 1
      ORDER BY
        r_hid DESC
      LIMIT 5
      `
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    writeLogging(functionName, sqlQuery, 'I')
    //
    //  Run sql Query
    //
    const data = await sql.query(sqlQuery)
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Recent results data
//---------------------------------------------------------------------
export async function fetchRecentResultsData5(userIds: number[]) {
  const functionName = 'fetchRecentResultsData5'
  noStore()
  // ????????????
  // await new Promise(resolve => setTimeout(resolve, 3000))
  try {
    const [id1, id2, id3, id4, id5] = userIds
    const sqlQueryStatement = `
    SELECT
      r_hid,
      r_uid,
      u_name,
      r_totalpoints,
      r_maxpoints,
      r_correctpercent
      FROM (
        SELECT
          r_hid, r_uid, u_name, r_totalpoints, r_maxpoints, r_correctpercent,
          ROW_NUMBER() OVER (PARTITION BY r_uid ORDER BY r_hid DESC) AS rn
        FROM usershistory
        JOIN users ON r_uid = u_uid
          WHERE r_uid IN ($1, $2, $3, $4, $5)
      ) AS ranked
      WHERE rn <= 5
      ORDER BY r_uid;
        `
    const queryValues = [id1, id2, id3, id4, id5]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${queryValues}`
    writeLogging(functionName, message, 'I')
    //
    //  Run sql Query
    //
    const data = await sql.query(sqlQuery, queryValues)
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
    //
    //  Errors
    //
  } catch (error) {
    //
    //  Logging
    //
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
