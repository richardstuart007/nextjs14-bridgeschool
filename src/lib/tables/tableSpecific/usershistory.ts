'use server'

import { sql } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const HISTORY_ITEMS_PER_PAGE = 10
//---------------------------------------------------------------------
//  History totals
//---------------------------------------------------------------------
export async function fetchHistoryTotalPages(query: string) {
  const functionName = 'fetchHistoryTotalPages'
  noStore()
  try {
    let sqlWhere = await buildWhere_History(query)
    const sqlQueryStatement = `
    SELECT
      COUNT(*)
      FROM usershistory
       ${sqlWhere}`
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${sqlWhere}`
    writeLogging(functionName, message, 'I')
    //
    //  Run sql Query
    //
    const result = await sql.query(sqlQuery)

    const count = result.rows[0].count

    const totalPages = Math.ceil(count / HISTORY_ITEMS_PER_PAGE)
    return totalPages
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
//  History data
//---------------------------------------------------------------------
export async function fetchHistoryFiltered(query: string, currentPage: number) {
  const functionName = 'fetchHistoryFiltered'
  noStore()
  const offset = (currentPage - 1) * HISTORY_ITEMS_PER_PAGE
  try {
    let sqlWhere = await buildWhere_History(query)
    const sqlQueryStatement = `
    SELECT *
    FROM usershistory
    LEFT JOIN ownergroup ON r_gid = oggid
    LEFT JOIN users ON r_uid = u_uid
     ${sqlWhere}
      ORDER BY r_hid DESC
      LIMIT $1 OFFSET $2
     `
    const queryValues = [HISTORY_ITEMS_PER_PAGE, offset]
    //
    // Remove redundant spaces
    //
    const sqlQuery = sqlQueryStatement.replace(/\s+/g, ' ').trim()
    //
    //  Logging
    //
    const message = `${sqlQuery} Values: ${sqlWhere}`
    writeLogging(functionName, message, 'I')
    //
    //  Run sql Query
    //
    const data = await sql.query(sqlQuery, queryValues)
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
//  History where clause
//---------------------------------------------------------------------
export async function buildWhere_History(query: string) {
  const functionName = 'buildWhere_History'
  //
  //  Empty search
  //
  let whereClause = ''
  if (!query) return whereClause
  //
  // Initialize variables
  //
  let hid = 0
  let owner = ''
  let group = ''
  let cnt = 0
  let uid = 0
  let correct = 0
  let gid = 0
  //
  // Split the search query into parts based on spaces
  //
  const parts = query.split(/\s+/).filter(part => part.trim() !== '')
  //
  // Loop through each part to extract values using switch statement
  //
  parts.forEach(part => {
    if (part.includes(':')) {
      const [key, value] = part.split(':')
      //
      //  Check for empty values
      //
      if (value === '') return
      //
      // Process each part
      //
      switch (key) {
        case 'hid':
          if (!isNaN(Number(value))) {
            hid = parseInt(value, 10)
          }
          break
        case 'uid':
          if (!isNaN(Number(value))) {
            uid = parseInt(value, 10)
          }
          break
        case 'correct':
          if (!isNaN(Number(value))) {
            correct = parseInt(value, 10)
          }
          break
        case 'owner':
          owner = value
          break
        case 'group':
          group = value
          break
        case 'gid':
          if (!isNaN(Number(value))) {
            gid = parseInt(value, 10)
          }
          break
        case 'cnt':
          if (!isNaN(Number(value))) {
            cnt = parseInt(value, 10)
          }
          break
        default:
          group = value
          break
      }
    } else {
      // Default to 'group' if no key is provided
      if (group === '') {
        group = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  if (hid !== 0) whereClause += `r_hid = ${hid} AND `
  if (uid !== 0) whereClause += `r_uid = ${uid} AND `
  if (owner !== '') whereClause += `r_owner ILIKE '%${owner}%' AND `
  if (group !== '') whereClause += `r_group ILIKE '%${group}%' AND `
  if (cnt !== 0) whereClause += `ogcntquestions >= ${cnt} AND `
  if (correct !== 0) whereClause += `r_correctpercent >= ${correct} AND `
  if (gid !== 0) whereClause += `r_gid = ${gid} AND `
  //
  // Remove the trailing 'AND' if there are conditions
  //
  if (whereClause !== '') {
    whereClause = `WHERE ${whereClause.slice(0, -5)}`
  }
  return whereClause
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
